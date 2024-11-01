package bbbapiwrapper

import (
	"crypto/md5"
	"crypto/sha1"
	"encoding/hex"
	"encoding/xml"
	"github.com/google/uuid"
	"regexp"
)

type CommonResponse struct {
	XMLName    xml.Name `xml:"response"`
	ReturnCode string   `xml:"returncode"` // SUCCESS or FAILED
	MessageKey string   `xml:"messageKey"`
	Message    string   `xml:"message"`
}

type CommonApiVersion struct {
	XMLName    xml.Name `xml:"response"`
	ReturnCode string   `xml:"returncode"` // SUCCESS or FAILED
	Version    float64  `xml:"version"`
}

func CommonResponseMsg(returncode, messageKey, message string) *CommonResponse {
	return &CommonResponse{
		ReturnCode: returncode,
		MessageKey: messageKey,
		Message:    message,
	}
}

func CalculateCheckSum(apiSecret, method, queries string) string {
	toByte := []byte(method + queries + apiSecret)
	checkSumString := sha1.Sum(toByte)
	return hex.EncodeToString(checkSumString[:])
}

// CheckMeetingIdToMatchFormat will check the meeting ID format
// if don't match with our allowed format then it will make convert it to md5
func CheckMeetingIdToMatchFormat(meetingID string) string {
	valid, _ := regexp.MatchString("^[a-zA-Z0-9-_.:]+$", meetingID)
	if !valid {
		// if not valid then we'll convert it
		// otherwise plugNmeet will complain
		h := md5.Sum([]byte(meetingID))
		return hex.EncodeToString(h[:])
	}

	return meetingID
}

// CheckForUserId will check if user id was set in proper format
// in BBB userId isn't compulsory but for our PNM required
func CheckForUserId(userId string) string {
	if userId == "" {
		return uuid.NewString()
	}

	return userId
}
