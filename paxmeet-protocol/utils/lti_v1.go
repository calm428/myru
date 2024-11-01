package utils

import (
	"github.com/mynaparrot/plugnmeet-protocol/plugnmeet"
	"net/url"
	"strconv"
)

func AssignLTIV1CustomParams(params *url.Values, claims *plugnmeet.LtiClaims) {
	b := new(bool)
	customPara := new(plugnmeet.LtiCustomParameters)

	if params.Get("custom_room_duration") != "" {
		duration, _ := strconv.Atoi(params.Get("custom_room_duration"))
		d := uint64(duration)
		customPara.RoomDuration = &d
	}
	if params.Get("custom_allow_polls") == "false" {
		customPara.AllowPolls = b
	}
	if params.Get("custom_allow_shared_note_pad") == "false" {
		customPara.AllowSharedNotePad = b
	}
	if params.Get("custom_allow_breakout_room") == "false" {
		customPara.AllowBreakoutRoom = b
	}
	if params.Get("custom_allow_recording") == "false" {
		customPara.AllowRecording = b
	}
	if params.Get("custom_allow_rtmp") == "false" {
		customPara.AllowRtmp = b
	}
	if params.Get("custom_allow_view_other_webcams") == "false" {
		customPara.AllowViewOtherWebcams = b
	}
	if params.Get("custom_allow_view_other_users_list") == "false" {
		customPara.AllowViewOtherUsersList = b
	}
	// this should be last bool
	if params.Get("custom_mute_on_start") == "true" {
		*b = true
		customPara.MuteOnStart = b
	}

	// custom design
	customDesign := new(plugnmeet.LtiCustomDesign)
	if params.Get("custom_primary_color") != "" {
		pc := params.Get("custom_primary_color")
		customDesign.PrimaryColor = &pc
	}
	if params.Get("custom_secondary_color") != "" {
		sc := params.Get("custom_secondary_color")
		customDesign.SecondaryColor = &sc
	}
	if params.Get("custom_background_color") != "" {
		bc := params.Get("custom_background_color")
		customDesign.BackgroundColor = &bc
	}
	if params.Get("custom_custom_logo") != "" {
		cl := params.Get("custom_custom_logo")
		customDesign.CustomLogo = &cl
	}

	claims.LtiCustomParameters = customPara
	claims.LtiCustomParameters.LtiCustomDesign = customDesign
}

func PrepareLTIV1RoomCreateReq(c *plugnmeet.LtiClaims) *plugnmeet.CreateRoomReq {
	req := &plugnmeet.CreateRoomReq{
		RoomId: c.RoomId,
		Metadata: &plugnmeet.RoomMetadata{
			RoomTitle: c.RoomTitle,
			RoomFeatures: &plugnmeet.RoomCreateFeatures{
				AllowWebcams:            true,
				AllowScreenShare:        true,
				AllowRtmp:               true,
				AllowViewOtherWebcams:   true,
				AllowViewOtherUsersList: true,
				AllowPolls:              true,
				RecordingFeatures: &plugnmeet.RecordingFeatures{
					IsAllow:                  true,
					IsAllowCloud:             true,
					IsAllowLocal:             true,
					EnableAutoCloudRecording: false,
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
			},
		},
	}

	if c.LtiCustomParameters != nil {
		p := c.LtiCustomParameters
		f := req.Metadata.RoomFeatures

		if p.RoomDuration != nil && *p.RoomDuration > 0 {
			f.RoomDuration = p.RoomDuration
		}
		if p.MuteOnStart != nil {
			f.MuteOnStart = *p.MuteOnStart
		}
		if p.AllowSharedNotePad != nil {
			f.SharedNotePadFeatures.AllowedSharedNotePad = *p.AllowSharedNotePad
		}
		if p.AllowBreakoutRoom != nil {
			f.BreakoutRoomFeatures.IsAllow = *p.AllowBreakoutRoom
		}
		if p.AllowPolls != nil {
			f.AllowPolls = *p.AllowPolls
		}
		if p.AllowRecording != nil {
			f.RecordingFeatures.IsAllow = *p.AllowRecording
		}
		if p.AllowRtmp != nil {
			f.AllowRtmp = *p.AllowRtmp
		}
		if p.AllowViewOtherWebcams != nil {
			f.AllowViewOtherWebcams = *p.AllowViewOtherWebcams
		}
		if p.AllowViewOtherUsersList != nil {
			f.AllowViewOtherUsersList = *p.AllowViewOtherUsersList
		}

		req.Metadata.RoomFeatures = f
	}

	return req
}
