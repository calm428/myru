package utils

import (
	"fmt"
	"testing"
)

func TestGenerateRandomStrings(t *testing.T) {
	tests := []struct {
		name string
		args int
		want int
	}{
		{
			"first", 10, 10,
		},
		{
			"seconds", 32, 32,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := GenerateRandomStrings(tt.args)
			fmt.Println(tt.name, got)
			if len(got) != tt.want {
				t.Errorf("GenerateRandomStrings() = %v, want %v", got, tt.want)
			}

		})
	}
}

func TestGenerateSecureRandomStrings(t *testing.T) {
	tests := []struct {
		name string
		args int
		want int
	}{
		{
			"first", 10, 10,
		},
		{
			"seconds", 32, 32,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := GenerateSecureRandomStrings(tt.args)
			if err != nil {
				t.Errorf("GenerateSecureRandomStrings() = %v, want %v", err, tt.want)
			}
			fmt.Println(tt.name, got)
			if len(got) != tt.want {
				t.Errorf("GenerateSecureRandomStrings() = %v, want %v", got, tt.want)
			}
		})
	}
}
