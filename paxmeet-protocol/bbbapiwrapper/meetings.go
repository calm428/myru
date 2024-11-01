package bbbapiwrapper

import (
	"encoding/json"
	"encoding/xml"
	"github.com/livekit/protocol/livekit"
	"github.com/mynaparrot/plugnmeet-protocol/plugnmeet"
	"google.golang.org/protobuf/encoding/protojson"
	"time"
)

type MeetingReq struct {
	MeetingID string `query:"meetingID"`
}

type IsMeetingRunningRes struct {
	XMLName    xml.Name `xml:"response"`
	ReturnCode string   `xml:"returncode"`
	Running    bool     `xml:"running"`
}

type MeetingInfo struct {
	XMLName               xml.Name `xml:"meeting"`
	MeetingName           string   `xml:"meetingName"`
	MeetingID             string   `xml:"meetingID"`
	InternalMeetingID     string   `xml:"internalMeetingID"`
	CreateTime            int64    `xml:"createTime"`
	CreateDate            string   `xml:"createDate"`
	AttendeePW            string   `xml:"attendeePW"`  // Deprecated
	ModeratorPW           string   `xml:"moderatorPW"` // Deprecated
	Running               bool     `xml:"running"`
	Duration              uint32   `xml:"duration"`
	HasUserJoined         bool     `xml:"hasUserJoined"`
	Recording             bool     `xml:"recording"`
	HasBeenForciblyEnded  bool     `xml:"hasBeenForciblyEnded"`
	StartTime             int64    `xml:"startTime"`
	EndTime               int64    `xml:"endTime"`
	ParticipantCount      int64    `xml:"participantCount"`
	ListenerCount         int64    `xml:"listenerCount"`
	VoiceParticipantCount int64    `xml:"voiceParticipantCount"`
	VideoCount            int64    `xml:"videoCount"`
	MaxUsers              int64    `xml:"maxUsers"`
	ModeratorCount        int64    `xml:"moderatorCount"`
	AttendeesInfo         struct {
		Attendees []Attendee `xml:"attendee"`
	} `xml:"attendees"`
	IsBreakout bool        `xml:"isBreakout"`
	Metadata   MetadataMap `xml:"metadata"`
}

type Attendee struct {
	XMLName         xml.Name `xml:"attendee"`
	UserID          string   `xml:"userID"`
	FullName        string   `xml:"fullName"`
	Role            string   `xml:"role"`
	IsPresenter     bool     `xml:"isPresenter"`
	IsListeningOnly bool     `xml:"isListeningOnly"`
	HasJoinedVoice  bool     `xml:"hasJoinedVoice"`
	HasVideo        bool     `xml:"hasVideo"`
	ClientType      string   `xml:"clientType"`
}

type MeetingInfoRes struct {
	XMLName     xml.Name     `xml:"response"`
	ReturnCode  string       `xml:"returncode"`
	MeetingInfo *MeetingInfo `xml:",chardata"`
}

type GetMeetingsRes struct {
	XMLName      xml.Name `xml:"response"`
	ReturnCode   string   `xml:"returncode"`
	MeetingsInfo struct {
		Meetings []*MeetingInfo `xml:"meeting"`
	} `xml:"meetings"`
}

func ConvertActiveRoomInfoToBBBMeetingInfo(r *plugnmeet.ActiveRoomWithParticipant) *MeetingInfo {
	rInfo := r.RoomInfo

	res := MeetingInfo{
		MeetingName:           rInfo.RoomTitle,
		MeetingID:             rInfo.RoomId,
		InternalMeetingID:     rInfo.Sid,
		CreateTime:            rInfo.CreationTime * 1000,
		CreateDate:            time.Unix(rInfo.CreationTime, 0).Format(time.RFC1123),
		Running:               true,
		StartTime:             rInfo.CreationTime * 1000,
		ParticipantCount:      int64(len(r.ParticipantsInfo)),
		Duration:              uint32(time.Now().UTC().Unix() - rInfo.CreationTime),
		ListenerCount:         0,
		VideoCount:            0,
		ModeratorCount:        0,
		VoiceParticipantCount: 0,
	}

	if rInfo.IsRecording > 0 {
		res.Recording = true
	}

	if res.ParticipantCount > 0 {
		res.HasUserJoined = true
	}

	// we'll need to
	rm := new(plugnmeet.RoomMetadata)
	err := protojson.Unmarshal([]byte(rInfo.Metadata), rm)
	if err == nil {
		if rm.ExtraData != nil {
			ex := new(CreateMeetingDefaultExtraData)
			err = json.Unmarshal([]byte(*rm.ExtraData), ex)
			if err == nil {
				res.MeetingID = ex.OriginalMeetingId
				res.ModeratorPW = ex.ModeratorPW
				res.AttendeePW = ex.AttendeePW
				res.Metadata = ex.Meta
			}
		}
	}

	var attendees []Attendee
	for _, p := range r.ParticipantsInfo {
		a := Attendee{
			UserID:   p.Identity,
			FullName: p.Name,
			Role:     "VIEWER",
		}
		m := new(plugnmeet.UserMetadata)
		err := protojson.Unmarshal([]byte(p.Metadata), m)
		if err != nil {
			attendees = append(attendees, a)
			continue
		}
		a.IsPresenter = m.IsPresenter
		if m.IsAdmin {
			a.Role = "MODERATOR"
			res.ModeratorCount++
		}

		if len(p.GetTracks()) > 0 {
			for _, t := range p.GetTracks() {
				if t.Source == livekit.TrackSource_CAMERA {
					a.HasVideo = true
					res.VideoCount++
				} else if t.Source == livekit.TrackSource_MICROPHONE {
					a.HasJoinedVoice = true
					res.VoiceParticipantCount++
				}
			}
		} else {
			a.IsListeningOnly = true
			res.ListenerCount++
		}

		attendees = append(attendees, a)
	}

	if len(attendees) > 0 {
		res.AttendeesInfo.Attendees = attendees
	}

	return &res
}
