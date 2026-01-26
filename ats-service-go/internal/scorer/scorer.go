package scorer

import (
	"strings"
	"unicode"
)

type Result struct {
	Score           int32
	MissingKeywords []string
	Feedback        []string
}

// Calculate checks the resume against the job description.
// It extracts keywords from the JD and checks if they exist in the resume text.
func Calculate(resumeText string, jobDescription string) Result {
	// Simple keyword extraction (for MVP: split by space, filter small words)
	targetKeywords := extractKeywords(jobDescription)
	resumeWords := normalize(resumeText)

	matchedCount := 0
	var missing []string

	scanMap := make(map[string]bool)
	for _, word := range resumeWords {
		scanMap[word] = true
	}

	for _, kw := range targetKeywords {
		if scanMap[kw] {
			matchedCount++
		} else {
			missing = append(missing, kw)
		}
	}

	// Calculate Score (Percentage of matched keywords)
	score := int32(0)
	if len(targetKeywords) > 0 {
		score = int32((float64(matchedCount) / float64(len(targetKeywords))) * 100)
	}

	var feedback []string
	if score < 50 {
		feedback = append(feedback, "Resume is missing many critical keywords. Consider rewriting.")
	} else if score < 80 {
		feedback = append(feedback, "Good match, but could be improved by adding specific technical terms.")
	} else {
		feedback = append(feedback, "Excellent match! High probability of passing ATS.")
	}

	return Result{
		Score:           score,
		MissingKeywords: missing,
		Feedback:        feedback,
	}
}

func extractKeywords(text string) []string {
	words := normalize(text)
	var keywords []string
	stopWords := map[string]bool{"and": true, "the": true, "for": true, "with": true, "this": true, "that": true}

	for _, w := range words {
		if len(w) > 3 && !stopWords[w] {
			keywords = append(keywords, w)
		}
	}
	// Deduplicate
	unique := make(map[string]bool)
	var final []string
	for _, k := range keywords {
		if !unique[k] {
			unique[k] = true
			final = append(final, k)
		}
	}
	return final
}

func normalize(text string) []string {
	f := func(c rune) bool {
		return !unicode.IsLetter(c) && !unicode.IsNumber(c)
	}
	return strings.Fields(strings.ToLower(strings.Join(strings.FieldsFunc(text, f), " ")))
}
