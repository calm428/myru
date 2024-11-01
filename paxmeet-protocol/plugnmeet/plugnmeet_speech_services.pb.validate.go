// Code generated by protoc-gen-validate. DO NOT EDIT.
// source: plugnmeet_speech_services.proto

package plugnmeet

import (
	"bytes"
	"errors"
	"fmt"
	"net"
	"net/mail"
	"net/url"
	"regexp"
	"sort"
	"strings"
	"time"
	"unicode/utf8"

	"google.golang.org/protobuf/types/known/anypb"
)

// ensure the imports are used
var (
	_ = bytes.MinRead
	_ = errors.New("")
	_ = fmt.Print
	_ = utf8.UTFMax
	_ = (*regexp.Regexp)(nil)
	_ = (*strings.Reader)(nil)
	_ = net.IPv4len
	_ = time.Duration(0)
	_ = (*url.URL)(nil)
	_ = (*mail.Address)(nil)
	_ = anypb.Any{}
	_ = sort.Sort
)

// Validate checks the field values on SpeechToTextTranslationReq with the
// rules defined in the proto definition for this message. If any rules are
// violated, the first error encountered is returned, or nil if there are no violations.
func (m *SpeechToTextTranslationReq) Validate() error {
	return m.validate(false)
}

// ValidateAll checks the field values on SpeechToTextTranslationReq with the
// rules defined in the proto definition for this message. If any rules are
// violated, the result is a list of violation errors wrapped in
// SpeechToTextTranslationReqMultiError, or nil if none found.
func (m *SpeechToTextTranslationReq) ValidateAll() error {
	return m.validate(true)
}

func (m *SpeechToTextTranslationReq) validate(all bool) error {
	if m == nil {
		return nil
	}

	var errors []error

	// no validation rules for RoomId

	// no validation rules for IsEnabled

	// no validation rules for IsEnabledTranslation

	if m.DefaultSubtitleLang != nil {
		// no validation rules for DefaultSubtitleLang
	}

	if len(errors) > 0 {
		return SpeechToTextTranslationReqMultiError(errors)
	}

	return nil
}

// SpeechToTextTranslationReqMultiError is an error wrapping multiple
// validation errors returned by SpeechToTextTranslationReq.ValidateAll() if
// the designated constraints aren't met.
type SpeechToTextTranslationReqMultiError []error

// Error returns a concatenation of all the error messages it wraps.
func (m SpeechToTextTranslationReqMultiError) Error() string {
	var msgs []string
	for _, err := range m {
		msgs = append(msgs, err.Error())
	}
	return strings.Join(msgs, "; ")
}

// AllErrors returns a list of validation violation errors.
func (m SpeechToTextTranslationReqMultiError) AllErrors() []error { return m }

// SpeechToTextTranslationReqValidationError is the validation error returned
// by SpeechToTextTranslationReq.Validate if the designated constraints aren't met.
type SpeechToTextTranslationReqValidationError struct {
	field  string
	reason string
	cause  error
	key    bool
}

// Field function returns field value.
func (e SpeechToTextTranslationReqValidationError) Field() string { return e.field }

// Reason function returns reason value.
func (e SpeechToTextTranslationReqValidationError) Reason() string { return e.reason }

// Cause function returns cause value.
func (e SpeechToTextTranslationReqValidationError) Cause() error { return e.cause }

// Key function returns key value.
func (e SpeechToTextTranslationReqValidationError) Key() bool { return e.key }

// ErrorName returns error name.
func (e SpeechToTextTranslationReqValidationError) ErrorName() string {
	return "SpeechToTextTranslationReqValidationError"
}

// Error satisfies the builtin error interface
func (e SpeechToTextTranslationReqValidationError) Error() string {
	cause := ""
	if e.cause != nil {
		cause = fmt.Sprintf(" | caused by: %v", e.cause)
	}

	key := ""
	if e.key {
		key = "key for "
	}

	return fmt.Sprintf(
		"invalid %sSpeechToTextTranslationReq.%s: %s%s",
		key,
		e.field,
		e.reason,
		cause)
}

var _ error = SpeechToTextTranslationReqValidationError{}

var _ interface {
	Field() string
	Reason() string
	Key() bool
	Cause() error
	ErrorName() string
} = SpeechToTextTranslationReqValidationError{}

// Validate checks the field values on GenerateAzureTokenReq with the rules
// defined in the proto definition for this message. If any rules are
// violated, the first error encountered is returned, or nil if there are no violations.
func (m *GenerateAzureTokenReq) Validate() error {
	return m.validate(false)
}

// ValidateAll checks the field values on GenerateAzureTokenReq with the rules
// defined in the proto definition for this message. If any rules are
// violated, the result is a list of violation errors wrapped in
// GenerateAzureTokenReqMultiError, or nil if none found.
func (m *GenerateAzureTokenReq) ValidateAll() error {
	return m.validate(true)
}

func (m *GenerateAzureTokenReq) validate(all bool) error {
	if m == nil {
		return nil
	}

	var errors []error

	// no validation rules for RoomId

	// no validation rules for UserSid

	if len(errors) > 0 {
		return GenerateAzureTokenReqMultiError(errors)
	}

	return nil
}

// GenerateAzureTokenReqMultiError is an error wrapping multiple validation
// errors returned by GenerateAzureTokenReq.ValidateAll() if the designated
// constraints aren't met.
type GenerateAzureTokenReqMultiError []error

// Error returns a concatenation of all the error messages it wraps.
func (m GenerateAzureTokenReqMultiError) Error() string {
	var msgs []string
	for _, err := range m {
		msgs = append(msgs, err.Error())
	}
	return strings.Join(msgs, "; ")
}

// AllErrors returns a list of validation violation errors.
func (m GenerateAzureTokenReqMultiError) AllErrors() []error { return m }

// GenerateAzureTokenReqValidationError is the validation error returned by
// GenerateAzureTokenReq.Validate if the designated constraints aren't met.
type GenerateAzureTokenReqValidationError struct {
	field  string
	reason string
	cause  error
	key    bool
}

// Field function returns field value.
func (e GenerateAzureTokenReqValidationError) Field() string { return e.field }

// Reason function returns reason value.
func (e GenerateAzureTokenReqValidationError) Reason() string { return e.reason }

// Cause function returns cause value.
func (e GenerateAzureTokenReqValidationError) Cause() error { return e.cause }

// Key function returns key value.
func (e GenerateAzureTokenReqValidationError) Key() bool { return e.key }

// ErrorName returns error name.
func (e GenerateAzureTokenReqValidationError) ErrorName() string {
	return "GenerateAzureTokenReqValidationError"
}

// Error satisfies the builtin error interface
func (e GenerateAzureTokenReqValidationError) Error() string {
	cause := ""
	if e.cause != nil {
		cause = fmt.Sprintf(" | caused by: %v", e.cause)
	}

	key := ""
	if e.key {
		key = "key for "
	}

	return fmt.Sprintf(
		"invalid %sGenerateAzureTokenReq.%s: %s%s",
		key,
		e.field,
		e.reason,
		cause)
}

var _ error = GenerateAzureTokenReqValidationError{}

var _ interface {
	Field() string
	Reason() string
	Key() bool
	Cause() error
	ErrorName() string
} = GenerateAzureTokenReqValidationError{}

// Validate checks the field values on GenerateAzureTokenRes with the rules
// defined in the proto definition for this message. If any rules are
// violated, the first error encountered is returned, or nil if there are no violations.
func (m *GenerateAzureTokenRes) Validate() error {
	return m.validate(false)
}

// ValidateAll checks the field values on GenerateAzureTokenRes with the rules
// defined in the proto definition for this message. If any rules are
// violated, the result is a list of violation errors wrapped in
// GenerateAzureTokenResMultiError, or nil if none found.
func (m *GenerateAzureTokenRes) ValidateAll() error {
	return m.validate(true)
}

func (m *GenerateAzureTokenRes) validate(all bool) error {
	if m == nil {
		return nil
	}

	var errors []error

	// no validation rules for Status

	// no validation rules for Msg

	// no validation rules for Renew

	if m.Token != nil {
		// no validation rules for Token
	}

	if m.ServiceRegion != nil {
		// no validation rules for ServiceRegion
	}

	if m.KeyId != nil {
		// no validation rules for KeyId
	}

	if len(errors) > 0 {
		return GenerateAzureTokenResMultiError(errors)
	}

	return nil
}

// GenerateAzureTokenResMultiError is an error wrapping multiple validation
// errors returned by GenerateAzureTokenRes.ValidateAll() if the designated
// constraints aren't met.
type GenerateAzureTokenResMultiError []error

// Error returns a concatenation of all the error messages it wraps.
func (m GenerateAzureTokenResMultiError) Error() string {
	var msgs []string
	for _, err := range m {
		msgs = append(msgs, err.Error())
	}
	return strings.Join(msgs, "; ")
}

// AllErrors returns a list of validation violation errors.
func (m GenerateAzureTokenResMultiError) AllErrors() []error { return m }

// GenerateAzureTokenResValidationError is the validation error returned by
// GenerateAzureTokenRes.Validate if the designated constraints aren't met.
type GenerateAzureTokenResValidationError struct {
	field  string
	reason string
	cause  error
	key    bool
}

// Field function returns field value.
func (e GenerateAzureTokenResValidationError) Field() string { return e.field }

// Reason function returns reason value.
func (e GenerateAzureTokenResValidationError) Reason() string { return e.reason }

// Cause function returns cause value.
func (e GenerateAzureTokenResValidationError) Cause() error { return e.cause }

// Key function returns key value.
func (e GenerateAzureTokenResValidationError) Key() bool { return e.key }

// ErrorName returns error name.
func (e GenerateAzureTokenResValidationError) ErrorName() string {
	return "GenerateAzureTokenResValidationError"
}

// Error satisfies the builtin error interface
func (e GenerateAzureTokenResValidationError) Error() string {
	cause := ""
	if e.cause != nil {
		cause = fmt.Sprintf(" | caused by: %v", e.cause)
	}

	key := ""
	if e.key {
		key = "key for "
	}

	return fmt.Sprintf(
		"invalid %sGenerateAzureTokenRes.%s: %s%s",
		key,
		e.field,
		e.reason,
		cause)
}

var _ error = GenerateAzureTokenResValidationError{}

var _ interface {
	Field() string
	Reason() string
	Key() bool
	Cause() error
	ErrorName() string
} = GenerateAzureTokenResValidationError{}

// Validate checks the field values on AzureTokenRenewReq with the rules
// defined in the proto definition for this message. If any rules are
// violated, the first error encountered is returned, or nil if there are no violations.
func (m *AzureTokenRenewReq) Validate() error {
	return m.validate(false)
}

// ValidateAll checks the field values on AzureTokenRenewReq with the rules
// defined in the proto definition for this message. If any rules are
// violated, the result is a list of violation errors wrapped in
// AzureTokenRenewReqMultiError, or nil if none found.
func (m *AzureTokenRenewReq) ValidateAll() error {
	return m.validate(true)
}

func (m *AzureTokenRenewReq) validate(all bool) error {
	if m == nil {
		return nil
	}

	var errors []error

	// no validation rules for RoomId

	// no validation rules for UserSid

	// no validation rules for ServiceRegion

	// no validation rules for KeyId

	if len(errors) > 0 {
		return AzureTokenRenewReqMultiError(errors)
	}

	return nil
}

// AzureTokenRenewReqMultiError is an error wrapping multiple validation errors
// returned by AzureTokenRenewReq.ValidateAll() if the designated constraints
// aren't met.
type AzureTokenRenewReqMultiError []error

// Error returns a concatenation of all the error messages it wraps.
func (m AzureTokenRenewReqMultiError) Error() string {
	var msgs []string
	for _, err := range m {
		msgs = append(msgs, err.Error())
	}
	return strings.Join(msgs, "; ")
}

// AllErrors returns a list of validation violation errors.
func (m AzureTokenRenewReqMultiError) AllErrors() []error { return m }

// AzureTokenRenewReqValidationError is the validation error returned by
// AzureTokenRenewReq.Validate if the designated constraints aren't met.
type AzureTokenRenewReqValidationError struct {
	field  string
	reason string
	cause  error
	key    bool
}

// Field function returns field value.
func (e AzureTokenRenewReqValidationError) Field() string { return e.field }

// Reason function returns reason value.
func (e AzureTokenRenewReqValidationError) Reason() string { return e.reason }

// Cause function returns cause value.
func (e AzureTokenRenewReqValidationError) Cause() error { return e.cause }

// Key function returns key value.
func (e AzureTokenRenewReqValidationError) Key() bool { return e.key }

// ErrorName returns error name.
func (e AzureTokenRenewReqValidationError) ErrorName() string {
	return "AzureTokenRenewReqValidationError"
}

// Error satisfies the builtin error interface
func (e AzureTokenRenewReqValidationError) Error() string {
	cause := ""
	if e.cause != nil {
		cause = fmt.Sprintf(" | caused by: %v", e.cause)
	}

	key := ""
	if e.key {
		key = "key for "
	}

	return fmt.Sprintf(
		"invalid %sAzureTokenRenewReq.%s: %s%s",
		key,
		e.field,
		e.reason,
		cause)
}

var _ error = AzureTokenRenewReqValidationError{}

var _ interface {
	Field() string
	Reason() string
	Key() bool
	Cause() error
	ErrorName() string
} = AzureTokenRenewReqValidationError{}

// Validate checks the field values on SpeechServiceUserStatusReq with the
// rules defined in the proto definition for this message. If any rules are
// violated, the first error encountered is returned, or nil if there are no violations.
func (m *SpeechServiceUserStatusReq) Validate() error {
	return m.validate(false)
}

// ValidateAll checks the field values on SpeechServiceUserStatusReq with the
// rules defined in the proto definition for this message. If any rules are
// violated, the result is a list of violation errors wrapped in
// SpeechServiceUserStatusReqMultiError, or nil if none found.
func (m *SpeechServiceUserStatusReq) ValidateAll() error {
	return m.validate(true)
}

func (m *SpeechServiceUserStatusReq) validate(all bool) error {
	if m == nil {
		return nil
	}

	var errors []error

	// no validation rules for RoomId

	// no validation rules for RoomSid

	// no validation rules for UserId

	// no validation rules for KeyId

	// no validation rules for Task

	if len(errors) > 0 {
		return SpeechServiceUserStatusReqMultiError(errors)
	}

	return nil
}

// SpeechServiceUserStatusReqMultiError is an error wrapping multiple
// validation errors returned by SpeechServiceUserStatusReq.ValidateAll() if
// the designated constraints aren't met.
type SpeechServiceUserStatusReqMultiError []error

// Error returns a concatenation of all the error messages it wraps.
func (m SpeechServiceUserStatusReqMultiError) Error() string {
	var msgs []string
	for _, err := range m {
		msgs = append(msgs, err.Error())
	}
	return strings.Join(msgs, "; ")
}

// AllErrors returns a list of validation violation errors.
func (m SpeechServiceUserStatusReqMultiError) AllErrors() []error { return m }

// SpeechServiceUserStatusReqValidationError is the validation error returned
// by SpeechServiceUserStatusReq.Validate if the designated constraints aren't met.
type SpeechServiceUserStatusReqValidationError struct {
	field  string
	reason string
	cause  error
	key    bool
}

// Field function returns field value.
func (e SpeechServiceUserStatusReqValidationError) Field() string { return e.field }

// Reason function returns reason value.
func (e SpeechServiceUserStatusReqValidationError) Reason() string { return e.reason }

// Cause function returns cause value.
func (e SpeechServiceUserStatusReqValidationError) Cause() error { return e.cause }

// Key function returns key value.
func (e SpeechServiceUserStatusReqValidationError) Key() bool { return e.key }

// ErrorName returns error name.
func (e SpeechServiceUserStatusReqValidationError) ErrorName() string {
	return "SpeechServiceUserStatusReqValidationError"
}

// Error satisfies the builtin error interface
func (e SpeechServiceUserStatusReqValidationError) Error() string {
	cause := ""
	if e.cause != nil {
		cause = fmt.Sprintf(" | caused by: %v", e.cause)
	}

	key := ""
	if e.key {
		key = "key for "
	}

	return fmt.Sprintf(
		"invalid %sSpeechServiceUserStatusReq.%s: %s%s",
		key,
		e.field,
		e.reason,
		cause)
}

var _ error = SpeechServiceUserStatusReqValidationError{}

var _ interface {
	Field() string
	Reason() string
	Key() bool
	Cause() error
	ErrorName() string
} = SpeechServiceUserStatusReqValidationError{}