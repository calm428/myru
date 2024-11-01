// Original licence
// Copyright 2023 LiveKit, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package webhook

import (
	"bytes"
	"crypto/sha256"
	"encoding/base64"
	"github.com/mynaparrot/plugnmeet-protocol/plugnmeet"
	"sync"
	"time"

	"github.com/frostbyte73/core"
	"github.com/hashicorp/go-retryablehttp"
	"go.uber.org/atomic"
	"google.golang.org/protobuf/encoding/protojson"

	"github.com/livekit/protocol/auth"
	"github.com/sirupsen/logrus"
)

type URLNotifierParams struct {
	Logger     *logrus.Logger
	QueueSize  int
	URL        string
	APIKey     string
	APISecret  string
	NumDropped int32
}

const (
	defaultQueueSize = 100
	authHeader       = "Authorization"
	hashToken        = "Hash-Token" // in various Apache modules will strip the Authorization header,
	// so we'll use additional one
)

// URLNotifier is a QueuedNotifier that sends a POST request to a Webhook URL.
// It will retry on failure, and will drop events if notification fall too far behind
type URLNotifier struct {
	mu      sync.RWMutex
	params  URLNotifierParams
	client  *retryablehttp.Client
	dropped atomic.Int32
	worker  core.QueueWorker
}

func NewURLNotifier(params URLNotifierParams) *URLNotifier {
	if params.QueueSize == 0 {
		params.QueueSize = defaultQueueSize
	}

	n := &URLNotifier{
		params: params,
		client: retryablehttp.NewClient(),
	}
	n.client.Logger = &logAdapter{}
	n.worker = core.NewQueueWorker(core.QueueWorkerParams{
		QueueSize:    params.QueueSize,
		DropWhenFull: true,
		OnDropped:    func() { n.dropped.Inc() },
	})
	return n
}

func (n *URLNotifier) SetKeys(apiKey, apiSecret string) {
	n.mu.Lock()
	defer n.mu.Unlock()
	n.params.APIKey = apiKey
	n.params.APISecret = apiSecret
}

func (n *URLNotifier) QueueNotify(event *plugnmeet.CommonNotifyEvent) error {
	n.worker.Submit(func() {
		if err := n.send(event); err != nil {
			n.params.Logger.Errorln("failed to send webhook,", "url:", n.params.URL, "event:", event.GetEvent(), "roomId:", event.GetRoom().GetRoomId(), "error:", err)
			n.mu.Lock()
			n.dropped.Add(n.params.NumDropped + 1)
			n.mu.Unlock()
		}
	})
	return nil
}

func (n *URLNotifier) Stop(force bool) {
	if force {
		n.worker.Kill()
	} else {
		n.worker.Drain()
	}
}

func (n *URLNotifier) send(event *plugnmeet.CommonNotifyEvent) error {
	// set dropped count
	n.mu.Lock()
	n.params.NumDropped = n.dropped.Swap(0)
	n.mu.Unlock()

	op := protojson.MarshalOptions{
		EmitUnpopulated: false,
		UseProtoNames:   true,
	}
	encoded, err := op.Marshal(event)
	if err != nil {
		return err
	}
	// sign payload
	sum := sha256.Sum256(encoded)
	b64 := base64.StdEncoding.EncodeToString(sum[:])

	n.mu.RLock()
	apiKey := n.params.APIKey
	apiSecret := n.params.APISecret
	n.mu.RUnlock()

	at := auth.NewAccessToken(apiKey, apiSecret).
		SetValidFor(5 * time.Minute).
		SetSha256(b64)
	token, err := at.ToJWT()
	if err != nil {
		return err
	}
	r, err := retryablehttp.NewRequest("POST", n.params.URL, bytes.NewReader(encoded))
	if err != nil {
		// ignore and continue
		return err
	}
	r.Header.Set(authHeader, token)
	// in various Apache modules will strip the Authorization header,
	// so we'll use additional one for easy use
	r.Header.Set(hashToken, token)
	// use a custom mime type to ensure the signature is checked prior to parsing
	r.Header.Set("content-type", "application/webhook+json")
	res, err := n.client.Do(r)
	if err != nil {
		return err
	}
	_ = res.Body.Close()
	return nil
}

type logAdapter struct{}

func (l *logAdapter) Printf(string, ...interface{}) {}
