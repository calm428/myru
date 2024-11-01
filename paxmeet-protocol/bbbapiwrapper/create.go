package bbbapiwrapper

import (
	"encoding/json"
	"encoding/xml"
	"github.com/mynaparrot/plugnmeet-protocol/plugnmeet"
	"github.com/mynaparrot/plugnmeet-protocol/utils"
	"net/url"
	"strings"
)

type CreateMeetingReq struct {
	Name                    string `query:"name"`
	MeetingID               string `query:"meetingID"`
	AttendeePW              string `query:"attendeePW"`  // Deprecated
	ModeratorPW             string `query:"moderatorPW"` // Deprecated
	Welcome                 string `query:"welcome"`
	MaxParticipants         uint32 `query:"maxParticipants"`
	LogoutURL               string `query:"logoutURL"`
	Duration                uint64 `query:"duration"`
	Record                  bool   `query:"record"`
	AutoStartRecording      bool   `query:"autoStartRecording"`
	WebcamsOnlyForModerator bool   `query:"webcamsOnlyForModerator"`
	MuteOnStart             bool   `query:"muteOnStart"`
	GuestPolicy             string `query:"guestPolicy"` // ALWAYS_ACCEPT, ASK_MODERATOR
	MeetingKeepEvents       bool   `query:"meetingKeepEvents"`
	Logo                    string `query:"logo"`
	DisabledFeatures        string `query:"disabledFeatures"` //breakoutRooms,chat,externalVideos,polls,screenshare,sharedNotes,virtualBackgrounds,liveTranscription,presentation,virtualBackgrounds,raiseHand
	PreUploadedPresentation string `query:"preUploadedPresentation"`

	// few locks
	LockSettingsDisableCam         bool `query:"lockSettingsDisableCam"`
	LockSettingsDisableMic         bool `query:"lockSettingsDisableMic"`
	LockSettingsDisablePrivateChat bool `query:"lockSettingsDisablePrivateChat"`
	LockSettingsDisablePublicChat  bool `query:"lockSettingsDisablePublicChat"`
	LockSettingsDisableNotes       bool `query:"lockSettingsDisableNotes"`
	LockSettingsHideUserList       bool `query:"lockSettingsHideUserList"`

	// to avoid incompatibility
	VoiceBridge string `query:"voiceBridge"`
	DialNumber  string `query:"dialNumber"`
}

type CreateMeetingDefaultExtraData struct {
	AttendeePW        string            `json:"attendeePW"`
	ModeratorPW       string            `json:"moderatorPW"`
	Logo              string            `json:"logo"`
	OriginalMeetingId string            `json:"originalMeetingId"`
	Meta              map[string]string `json:"meta"`
}

type CreateMeetingResp struct {
	XMLName              xml.Name `xml:"response"`
	ReturnCode           string   `xml:"returncode"`
	MessageKey           string   `xml:"messageKey"`
	Message              string   `xml:"message"`
	MeetingID            string   `xml:"meetingID"`
	InternalMeetingID    string   `xml:"internalMeetingID"`
	ParentMeetingID      string   `xml:"parentMeetingID"`
	AttendeePW           string   `xml:"attendeePW"`  // Deprecated
	ModeratorPW          string   `xml:"moderatorPW"` // Deprecated
	CreateTime           int64    `xml:"createTime"`
	CreateDate           string   `xml:"createDate"`
	HasUserJoined        bool     `xml:"hasUserJoined"`
	Duration             int64    `xml:"duration"`
	VoiceBridge          string   `xml:"voiceBridge"`
	DialNumber           string   `xml:"dialNumber"`
	HasBeenForciblyEnded bool     `xml:"hasBeenForciblyEnded"`
}

type PreUploadWhiteboardPostFile struct {
	XMLName xml.Name `xml:"modules"`
	Module  struct {
		Name      string `xml:"name,attr"`
		Documents []struct {
			URL      string `xml:"url,attr"`
			Filename string `xml:"filename,attr"`
			Name     string `xml:"name,attr"`
		} `xml:"document"`
	} `xml:"module"`
}

func ConvertCreateRequest(r *CreateMeetingReq, rawQueries map[string]string) (*plugnmeet.CreateRoomReq, error) {
	b := true
	req := plugnmeet.CreateRoomReq{
		RoomId: CheckMeetingIdToMatchFormat(r.MeetingID),
		Metadata: &plugnmeet.RoomMetadata{
			RoomTitle: r.Name,
			RoomFeatures: &plugnmeet.RoomCreateFeatures{
				AllowWebcams:     true,
				AdminOnlyWebcams: r.WebcamsOnlyForModerator,
				EnableAnalytics:  true,
				MuteOnStart:      r.MuteOnStart,
				AllowRtmp:        true,
				AllowPolls:       true,
				AllowScreenShare: true,
				AllowRaiseHand:   &b,
				AllowVirtualBg:   &b,
				RecordingFeatures: &plugnmeet.RecordingFeatures{
					IsAllow:                  r.Record,
					IsAllowCloud:             r.Record,
					EnableAutoCloudRecording: r.AutoStartRecording,
				},
				ChatFeatures: &plugnmeet.ChatFeatures{
					AllowChat:       true,
					AllowFileUpload: true,
				},
				SharedNotePadFeatures: &plugnmeet.SharedNotePadFeatures{
					AllowedSharedNotePad: true,
				},
				WhiteboardFeatures: &plugnmeet.WhiteboardFeatures{
					AllowedWhiteboard: true,
				},
				ExternalMediaPlayerFeatures: &plugnmeet.ExternalMediaPlayerFeatures{
					AllowedExternalMediaPlayer: true,
				},
				BreakoutRoomFeatures: &plugnmeet.BreakoutRoomFeatures{
					IsAllow: true,
				},
				DisplayExternalLinkFeatures: &plugnmeet.DisplayExternalLinkFeatures{
					IsAllow: true,
				},
				IngressFeatures: &plugnmeet.IngressFeatures{
					IsAllow: true,
				},
				SpeechToTextTranslationFeatures: &plugnmeet.SpeechToTextTranslationFeatures{
					IsAllow:            true,
					IsAllowTranslation: true,
				},
			},
			DefaultLockSettings: &plugnmeet.LockSettings{},
		},
	}

	if r.MaxParticipants > 0 {
		req.MaxParticipants = &r.MaxParticipants
	}
	if r.Duration > 0 {
		req.Metadata.RoomFeatures.RoomDuration = &r.Duration
	}
	if r.LogoutURL != "" {
		req.Metadata.LogoutUrl = &r.LogoutURL
	}

	if r.Welcome != "" {
		req.Metadata.WelcomeMessage = &r.Welcome
	}

	if r.GuestPolicy != "" {
		if r.GuestPolicy == "ASK_MODERATOR" {
			req.Metadata.RoomFeatures.WaitingRoomFeatures = &plugnmeet.WaitingRoomFeatures{
				IsActive: true,
			}
		}
	}

	if r.DisabledFeatures != "" {
		setDifferentFeatures(req.Metadata.RoomFeatures, r.DisabledFeatures)
	}

	if r.PreUploadedPresentation != "" && req.Metadata.RoomFeatures.WhiteboardFeatures.AllowedWhiteboard {
		req.Metadata.RoomFeatures.WhiteboardFeatures.PreloadFile = &r.PreUploadedPresentation
	}

	// we'll only consider if some value was sent
	if rawQueries["meetingKeepEvents"] != "" {
		req.Metadata.RoomFeatures.EnableAnalytics = r.MeetingKeepEvents
	}

	// lock settings
	if r.LockSettingsHideUserList {
		req.Metadata.RoomFeatures.AllowViewOtherUsersList = false
	}
	// first let's set default
	utils.SetRoomDefaultLockSettings(&req)
	// now from the request
	setLockSettings(req.Metadata.DefaultLockSettings, r)

	meta := map[string]string{}
	for k, qq := range rawQueries {
		if strings.Contains(k, "meta_") {
			val := qq
			unescape, err := url.QueryUnescape(qq)
			if err == nil {
				val = unescape
			}
			meta[strings.Replace(k, "meta_", "", 1)] = val
		}
	}

	marshal, err := json.Marshal(CreateMeetingDefaultExtraData{
		ModeratorPW:       r.ModeratorPW,
		AttendeePW:        r.AttendeePW,
		OriginalMeetingId: r.MeetingID,
		Logo:              r.Logo,
		Meta:              meta,
	})
	if err != nil {
		return nil, err
	}
	extraData := string(marshal)
	req.Metadata.ExtraData = &extraData

	return &req, nil
}

func setDifferentFeatures(f *plugnmeet.RoomCreateFeatures, disabledFeatures string) {
	features := strings.Split(disabledFeatures, ",")
	fVal := false

	for _, ff := range features {
		switch ff {
		case "breakoutRooms":
			f.BreakoutRoomFeatures.IsAllow = fVal
		case "chat":
			f.ChatFeatures.AllowChat = fVal
		case "externalVideos":
			f.ExternalMediaPlayerFeatures.AllowedExternalMediaPlayer = fVal
		case "polls":
			f.AllowPolls = fVal
		case "screenshare":
			f.AllowScreenShare = fVal
		case "sharedNotes":
			f.SharedNotePadFeatures.AllowedSharedNotePad = fVal
		case "liveTranscription":
			f.SpeechToTextTranslationFeatures.IsAllow = fVal
		case "presentation":
			f.WhiteboardFeatures.AllowedWhiteboard = fVal
		case "virtualBackgrounds":
			f.AllowVirtualBg = &fVal
		case "raiseHand":
			f.AllowRaiseHand = &fVal
		}
	}
}

func setLockSettings(f *plugnmeet.LockSettings, r *CreateMeetingReq) {
	l := true

	if r.LockSettingsDisableCam {
		f.LockWebcam = &l
	}

	if r.LockSettingsDisableMic {
		f.LockMicrophone = &l
	}

	if r.LockSettingsDisablePublicChat {
		f.LockChatSendMessage = &l
	}

	if r.LockSettingsDisablePrivateChat {
		f.LockPrivateChat = &l
	}

	if r.LockSettingsDisableNotes {
		f.LockSharedNotepad = &l
	}
}
