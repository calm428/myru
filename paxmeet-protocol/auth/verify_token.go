package auth

import (
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"errors"
	"time"

	"github.com/go-jose/go-jose/v3/jwt"
	"github.com/livekit/protocol/auth"
	"github.com/mynaparrot/plugnmeet-protocol/plugnmeet"
)

// VerifyPlugNmeetAccessToken can be use to verify plugNmeet access token
func VerifyPlugNmeetAccessToken(apiKey, secret, token string) (*plugnmeet.PlugNmeetTokenClaims, error) {
	tok, err := jwt.ParseSigned(token)
	if err != nil {
		return nil, err
	}

	out := jwt.Claims{}
	claims := plugnmeet.PlugNmeetTokenClaims{}
	if err = tok.Claims([]byte(secret), &out, &claims); err != nil {
		return nil, err
	}

	if err = out.Validate(jwt.Expected{Issuer: apiKey, Time: time.Now().UTC()}); err != nil {
		return nil, err
	}
	claims.UserId = out.Subject

	return &claims, nil
}

// ValidateLivekitWebhookToken can be use to validate both livekit token
func ValidateLivekitWebhookToken(secret, token string) (string, error) {
	grant, err := auth.ParseAPIToken(token)
	if err != nil {
		return "", err
	}

	claims, err := grant.Verify(secret)
	if err != nil {
		return "", err
	}

	return claims.Sha256, nil
}

// VerifyWebhookRequest will verify webhook request both for livekit & plugNmeet
// in plugNmeet we're following the same token system as livekit is using
// in this method we'll verify the provided body request
func VerifyWebhookRequest(body []byte, apiKey, secret, token string) (bool, error) {
	tok, err := jwt.ParseSigned(token)
	if err != nil {
		return false, err
	}

	out := jwt.Claims{}
	claims := auth.ClaimGrants{}
	if err := tok.Claims([]byte(secret), &out, &claims); err != nil {
		return false, err
	}

	if err := out.Validate(jwt.Expected{Issuer: apiKey, Time: time.Now()}); err != nil {
		return false, err
	}

	sha := sha256.Sum256(body)
	hash := base64.StdEncoding.EncodeToString(sha[:])

	if subtle.ConstantTimeCompare([]byte(claims.Sha256), []byte(hash)) != 1 {
		return false, errors.New("authorization token didn't match")
	}

	return true, nil
}
