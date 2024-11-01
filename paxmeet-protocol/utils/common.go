package utils

import (
	"crypto/rand"
	"fmt"
	"github.com/gofiber/fiber/v2"
	"github.com/livekit/protocol/livekit"
	"github.com/mynaparrot/plugnmeet-protocol/plugnmeet"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/proto"
	"io/fs"
	"math/big"
	rd "math/rand"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

func PrepareCommonWebhookNotifyEvent(event *livekit.WebhookEvent) *plugnmeet.CommonNotifyEvent {
	ct := uint64(event.Room.CreationTime)
	return &plugnmeet.CommonNotifyEvent{
		Event: &event.Event,
		Room: &plugnmeet.NotifyEventRoom{
			Sid:             &event.Room.Sid,
			RoomId:          &event.Room.Name,
			EmptyTimeout:    &event.Room.EmptyTimeout,
			MaxParticipants: &event.Room.MaxParticipants,
			CreationTime:    &ct,
			EnabledCodecs:   event.Room.EnabledCodecs,
			Metadata:        &event.Room.Metadata,
			NumParticipants: &event.Room.NumParticipants,
		},
		Participant: event.Participant,
		Track:       event.Track,
		Id:          &event.Id,
		CreatedAt:   &event.CreatedAt,
	}
}

func SendCommonProtobufResponse(c *fiber.Ctx, s bool, m string) error {
	res := &plugnmeet.CommonResponse{
		Status: s,
		Msg:    m,
	}
	marshal, err := proto.Marshal(res)
	if err != nil {
		return err
	}
	c.Set("Content-Type", "application/protobuf")
	return c.Send(marshal)
}

func SendProtobufResponse(c *fiber.Ctx, res proto.Message) error {
	marshal, err := proto.Marshal(res)
	if err != nil {
		return err
	}
	c.Set("Content-Type", "application/protobuf")
	return c.Send(marshal)
}

func SendCommonProtoJsonResponse(c *fiber.Ctx, s bool, m string) error {
	res := &plugnmeet.CommonResponse{
		Status: s,
		Msg:    m,
	}
	op := protojson.MarshalOptions{
		EmitUnpopulated: true,
		UseProtoNames:   true,
	}
	marshal, err := op.Marshal(res)
	if err != nil {
		return err
	}
	c.Set("Content-Type", "application/json")
	return c.Send(marshal)
}

func SendProtoJsonResponse(c *fiber.Ctx, res proto.Message) error {
	op := protojson.MarshalOptions{
		EmitUnpopulated: true,
		UseProtoNames:   true,
	}
	marshal, err := op.Marshal(res)
	if err != nil {
		return err
	}
	c.Set("Content-Type", "application/json")
	return c.Send(marshal)
}

func GetFilesFromDir(path, ext, s string) ([]string, error) {
	var files []string
	err := filepath.WalkDir(path, func(s string, d fs.DirEntry, e error) error {
		if e != nil {
			return e
		}
		if filepath.Ext(d.Name()) == ext && checkIfAllowedFilePrefix(d.Name()) {
			files = append(files, d.Name())
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	if s == "asc" {
		sort.Strings(files)
	} else if s == "des" {
		sort.Sort(sort.Reverse(sort.StringSlice(files)))
	}
	return files, nil
}

func checkIfAllowedFilePrefix(f string) bool {
	allowedPrefix := []string{"main", "runtime", "vendor", "tflite"}
	for _, p := range allowedPrefix {
		if strings.HasPrefix(f, p) {
			return true
		}
	}
	return false
}

func GenerateSecureRandomStrings(n int) (string, error) {
	const letters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
	ret := make([]byte, n)
	for i := 0; i < n; i++ {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(letters))))
		if err != nil {
			return "", err
		}
		ret[i] = letters[num.Int64()]
	}

	return string(ret), nil
}

func GenerateRandomStrings(n int) string {
	r := rd.New(rd.NewSource(time.Now().UnixNano()))
	b := make([]byte, n+2)
	r.Read(b)
	return fmt.Sprintf("%x", b)[2 : n+2]
}
