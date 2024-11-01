package models

import (
	"github.com/go-playground/validator/v10"
	"github.com/jackc/pgtype"

	"database/sql/driver"
	"time"
)


type BlogPhoto struct {
    ID        uint64       `gorm:"primaryKey"`
    BlogID    uint64     `gorm:"not null"`
    CreatedAt time.Time  `gorm:"not null"`
    UpdatedAt time.Time  `gorm:"not null"`
    DeletedAt *time.Time `gorm:"index"`
    Files     pgtype.JSONB   `json:"files" gorm:"type:jsonb"`
}

// Scan implements the sql.Scanner interface
func (bp *BlogPhoto) Scan(src interface{}) error {
    return bp.Files.Scan(src)
}

// Value implements the driver.Valuer interface
func (bp BlogPhoto) Value() (driver.Value, error) {
    return bp.Files.Value()
}

func (b *BlogPhoto) Validate() error {
	validate := validator.New()
	return validate.Struct(b)
}