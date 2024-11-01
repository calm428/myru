package webhook

import (
	"context"
	"github.com/mynaparrot/plugnmeet-protocol/plugnmeet"
	"github.com/sirupsen/logrus"
	"sync"
	"time"
)

const maxDurationWaitBeforeCleanRoom = 1 // minutes

type WebhookNotifier struct {
	sync.RWMutex
	ctx                   context.Context
	webhookQueuedNotifier map[string]webhookQueuedNotifier

	apiKey    string
	apiSecret string
	urls      []string
	logger    *logrus.Logger
}

type webhookQueuedNotifier struct {
	deleteQueuedNotifier bool
	queuedNotifier       QueuedNotifier
}

func NewWebhookNotifier(apiKey, apiSecret string, logger *logrus.Logger) *WebhookNotifier {
	return &WebhookNotifier{
		ctx:                   context.Background(),
		webhookQueuedNotifier: make(map[string]webhookQueuedNotifier),
		apiKey:                apiKey,
		apiSecret:             apiSecret,
		logger:                logger,
	}
}

func (a *WebhookNotifier) AddToWebhookQueuedNotifier(roomId string, urls []string) {
	if a == nil || len(urls) == 0 || roomId == "" {
		return
	}

	a.Lock()
	defer a.Unlock()
	if _, ok := a.webhookQueuedNotifier[roomId]; !ok {
		a.webhookQueuedNotifier[roomId] = webhookQueuedNotifier{
			queuedNotifier: NewDefaultNotifier(a.apiKey, a.apiSecret, urls, a.logger),
		}
	}
}

func (a *WebhookNotifier) RoomExist(roomId string) bool {
	if a == nil || roomId == "" {
		return false
	}

	a.Lock()
	defer a.Unlock()
	_, ok := a.webhookQueuedNotifier[roomId]
	return ok
}

func (a *WebhookNotifier) SendWebhook(event *plugnmeet.CommonNotifyEvent, roomId *string) error {
	if a == nil || event == nil || event.GetRoom().GetRoomId() == "" {
		return nil
	}
	a.Lock()
	defer a.Unlock()

	checkRoom := event.GetRoom().GetRoomId()
	if roomId != nil && *roomId != "" {
		checkRoom = *roomId
	}
	if queued, ok := a.webhookQueuedNotifier[checkRoom]; ok {
		err := queued.queuedNotifier.QueueNotify(a.ctx, event)
		if err != nil {
			return err
		}
		// it may happen that the room was created again before we delete the queue
		// in DeleteWebhookQueuedNotifier
		// if we delete then no further events will send even the room is active,
		// so here we'll reset the deleted status
		if event.GetEvent() == "room_started" && queued.deleteQueuedNotifier {
			queued.deleteQueuedNotifier = false
			a.webhookQueuedNotifier[checkRoom] = queued
		} else if event.GetEvent() == "room_finished" && !queued.deleteQueuedNotifier {
			// if we got room_finished then we'll set for deleting
			queued.deleteQueuedNotifier = true
			a.webhookQueuedNotifier[checkRoom] = queued
		}
	}
	return nil
}

func (a *WebhookNotifier) DeleteWebhookQueuedNotifier(roomId string) {
	if a == nil || roomId == "" {
		return
	}
	// we'll wait long time before delete WebhookQueued
	// to make sure that we've completed everything else
	time.Sleep(time.Minute * maxDurationWaitBeforeCleanRoom)
	a.Lock()
	defer a.Unlock()
	if queued, ok := a.webhookQueuedNotifier[roomId]; ok {
		if queued.deleteQueuedNotifier {
			delete(a.webhookQueuedNotifier, roomId)
		}
	}
}
