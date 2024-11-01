package bbbapiwrapper

import "encoding/xml"

type GetRecordingsReq struct {
	MeetingID string `query:"meetingID"`
	RecordID  string `query:"recordID"`
	Offset    uint64 `query:"offset"`
	Limit     uint64 `query:"limit"`
}

type GetRecordingsRes struct {
	XMLName        xml.Name `xml:"response"`
	ReturnCode     string   `xml:"returncode"`
	RecordingsInfo struct {
		Recordings []*RecordingInfo
	} `xml:"recordings"`
	Pagination *Pagination
}

type RecordingInfo struct {
	XMLName           xml.Name    `xml:"recording"`
	RecordID          string      `xml:"recordID"`
	MeetingID         string      `xml:"meetingID"`
	InternalMeetingID string      `xml:"internalMeetingID"`
	Name              string      `xml:"name"`
	IsBreakout        bool        `xml:"isBreakout"`
	Published         bool        `xml:"published"`
	State             string      `xml:"state"`
	StartTime         int64       `xml:"startTime"`
	EndTime           int64       `xml:"endTime"`
	Participants      uint64      `xml:"participants"`
	RawSize           int64       `xml:"rawSize"`
	Size              int64       `xml:"size"`
	Metadata          MetadataMap `xml:"metadata"`
	Playback          struct {
		PlayBackFormat []PlayBackFormat
	} `xml:"playback"`
}

type PlayBackFormat struct {
	XMLName        xml.Name `xml:"format"`
	Type           string   `xml:"type"`
	URL            string   `xml:"url"`
	ProcessingTime int64    `xml:"processingTime"`
	Length         int64    `xml:"length"`
	Size           int64    `xml:"size"`
	Preview        struct {
		Images struct {
			Image []PlayBackPreviewImage
		} `xml:"images"`
	} `xml:"preview"`
}

type PlayBackPreviewImage struct {
	XMLName xml.Name `xml:"image"`
	Alt     string   `xml:"alt,attr"`
	Height  string   `xml:"height,attr"`
	Width   string   `xml:"width,attr"`
}

type Pagination struct {
	XMLName       xml.Name `xml:"pagination"`
	Pageable      *PaginationPageable
	TotalElements uint64 `xml:"totalElements"`
	Empty         bool   `xml:"empty"`
}

type PaginationPageable struct {
	XMLName xml.Name `xml:"pageable"`
	Offset  uint64   `xml:"offset"`
	Limit   uint64   `xml:"limit"`
	Paged   uint64   `xml:"paged"`
	Unpaged bool     `xml:"unpaged"`
}

type PublishRecordingsReq struct {
	RecordID string `query:"recordID"`
	Publish  bool   `query:"publish"`
}

type PublishRecordingsRes struct {
	XMLName    xml.Name `xml:"response"`
	ReturnCode string   `xml:"returncode"`
	Published  bool     `xml:"published"`
}

type UpdateRecordingsReq struct {
	RecordID string `query:"recordID"`
}

type UpdateRecordingsRes struct {
	XMLName    xml.Name `xml:"response"`
	ReturnCode string   `xml:"returncode"`
	Updated    bool     `xml:"updated"`
}

type DeleteRecordingsReq struct {
	RecordID string `query:"recordID"`
}

type DeleteRecordingsRes struct {
	XMLName    xml.Name `xml:"response"`
	ReturnCode string   `xml:"returncode"`
	Deleted    bool     `xml:"deleted"`
}
