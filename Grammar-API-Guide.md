# German Grammar Module - API Guide

## Overview

The Grammar Module provides a comprehensive system for teaching German grammar with:
- **Topics**: Main grammar categories (Cases, Verb Conjugation, etc.)
- **Lessons**: Detailed explanations with examples, tips, and practice sentences
- **Exercise Sets**: Various exercise types for interactive practice
- **Progress Tracking**: Automatic mastery tracking per lesson and topic

## API Endpoints

### Base URL
```
{{baseUrl}}/api/v1/grammar
```

---

## 📚 Grammar Topics

### Get All Topics
```http
GET /topics
Authorization: Bearer {{token}}  (optional - for progress tracking)
```

Query Parameters:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `difficulty` (string): Filter by level (A1, A2, B1, B2, C1)
- `showAll` (boolean): Admin only - show unpublished topics

### Get Topic by ID or Slug
```http
GET /topics/:topicId
```

### Create Topic (Admin)
```http
POST /topics
Authorization: Bearer {{adminToken}}
Content-Type: application/json
```

```json
{
  "title": "German Cases (Die Fälle)",
  "titleDe": "Die deutschen Fälle",
  "slug": "german-cases",
  "description": "Learn the four German cases: Nominative, Accusative, Dative, and Genitive.",
  "descriptionDe": "Lernen Sie die vier deutschen Fälle: Nominativ, Akkusativ, Dativ und Genitiv.",
  "icon": "book-open",
  "difficulty": "A1",
  "order": 1,
  "coverImage": "https://example.com/image.jpg",
  "isPublished": true
}
```

### Update Topic (Admin)
```http
PUT /topics/:topicId
Authorization: Bearer {{adminToken}}
```

### Delete Topic (Admin)
```http
DELETE /topics/:topicId
Authorization: Bearer {{adminToken}}
```

---

## 📖 Grammar Lessons

### Get Lessons by Topic
```http
GET /topics/:topicId/lessons
```

### Get Lesson by ID or Slug
```http
GET /lessons/:lessonId
Authorization: Bearer {{token}}  (optional - tracks visit)
```

Returns lesson with:
- Full content (introduction, explanations, examples)
- User progress (if authenticated)
- Available exercise sets

### Create Lesson (Admin)
```http
POST /lessons
Authorization: Bearer {{adminToken}}
Content-Type: application/json
```

```json
{
  "topic": "{{topicId}}",
  "title": "The Nominative Case",
  "titleDe": "Der Nominativ",
  "slug": "nominative-case",
  "difficulty": "A1",
  "order": 1,
  "introduction": "The Nominative case is the base case in German...",
  "introductionDe": "Der Nominativ ist der Grundfall im Deutschen...",
  "explanationBlocks": [
    {
      "type": "text",
      "title": "What is the Nominative?",
      "titleDe": "Was ist der Nominativ?",
      "content": "The nominative case identifies the subject...",
      "contentDe": "Der Nominativ identifiziert das Subjekt..."
    },
    {
      "type": "table",
      "title": "Nominative Articles",
      "titleDe": "Nominativ-Artikel",
      "content": "Here are the articles:",
      "contentDe": "Hier sind die Artikel:",
      "tableData": {
        "headers": ["Gender", "Definite", "Indefinite"],
        "rows": [
          ["Masculine", "der", "ein"],
          ["Feminine", "die", "eine"],
          ["Neuter", "das", "ein"]
        ]
      }
    },
    {
      "type": "example",
      "content": "Examples:",
      "contentDe": "Beispiele:",
      "examples": [
        {
          "german": "Der Hund schläft.",
          "english": "The dog is sleeping.",
          "breakdown": "Der Hund (subject) + schläft (verb)"
        }
      ]
    },
    {
      "type": "tip",
      "content": "Ask 'Wer?' to find the subject.",
      "contentDe": "Fragen Sie 'Wer?' um das Subjekt zu finden."
    }
  ],
  "keyPoints": [
    {
      "point": "Nominative = subject of the sentence",
      "pointDe": "Nominativ = Subjekt des Satzes"
    }
  ],
  "commonMistakes": [
    {
      "mistake": "Using 'den' for masculine subjects",
      "correction": "Der Mann geht. (NOT: Den Mann geht.)",
      "explanation": "'Den' is accusative, not nominative."
    }
  ],
  "practiceExamples": [
    {
      "german": "Der Lehrer erklärt die Grammatik.",
      "english": "The teacher explains the grammar."
    }
  ],
  "estimatedTime": 15,
  "isPublished": true
}
```

#### Explanation Block Types:
- `text` - Regular text content
- `table` - Data table with headers and rows
- `example` - German/English example sentences with breakdown
- `tip` - Helpful learning tips (green highlight)
- `warning` - Common mistakes warning (orange highlight)
- `comparison` - Compare different forms

### Update Lesson (Admin)
```http
PUT /lessons/:lessonId
Authorization: Bearer {{adminToken}}
```

### Delete Lesson (Admin)
```http
DELETE /lessons/:lessonId
Authorization: Bearer {{adminToken}}
```

### Mark Lesson Complete (Student)
```http
POST /lessons/:lessonId/complete
Authorization: Bearer {{studentToken}}
Content-Type: application/json
```

```json
{
  "timeSpent": 900
}
```
*timeSpent in seconds*

---

## 📝 Grammar Exercises

### Get Exercise Sets for Lesson
```http
GET /lessons/:lessonId/exercises
```

### Get Exercise Set by ID
```http
GET /exercises/:exerciseSetId
Authorization: Bearer {{token}}  (optional - includes progress)
```

### Create Exercise Set (Admin)
```http
POST /exercises
Authorization: Bearer {{adminToken}}
Content-Type: application/json
```

```json
{
  "lesson": "{{lessonId}}",
  "title": "Nominative Case Practice",
  "titleDe": "Nominativ Übungen",
  "slug": "nominative-practice",
  "difficulty": "A1",
  "passingScore": 70,
  "timeLimit": 15,
  "order": 1,
  "exercises": [
    // See exercise types below
  ],
  "isPublished": true
}
```

### Exercise Types

#### 1. Fill-in-Blank
```json
{
  "type": "fill-blank",
  "instruction": "Fill in the correct article",
  "instructionDe": "Setzen Sie den richtigen Artikel ein",
  "difficulty": "A1",
  "points": 10,
  "sentence": "___ Mann arbeitet.",
  "sentenceTranslation": "The man works.",
  "correctAnswer": "Der",
  "acceptableAnswers": ["der"],
  "explanation": "Mann is masculine, nominative = der",
  "explanationDe": "Mann ist maskulin, Nominativ = der"
}
```

#### 2. Multiple Choice
```json
{
  "type": "multiple-choice",
  "instruction": "Choose the correct answer",
  "instructionDe": "Wählen Sie die richtige Antwort",
  "difficulty": "A1",
  "points": 10,
  "question": "Which article: ___ Kind spielt?",
  "questionTranslation": "Which article: The child plays?",
  "options": [
    { "text": "Der", "isCorrect": false },
    { "text": "Die", "isCorrect": false },
    { "text": "Das", "isCorrect": true },
    { "text": "Den", "isCorrect": false }
  ],
  "explanation": "Kind is neuter = das",
  "explanationDe": "Kind ist sächlich = das"
}
```

#### 3. Matching
```json
{
  "type": "matching",
  "instruction": "Match nouns with their articles",
  "instructionDe": "Ordnen Sie Substantive ihren Artikeln zu",
  "difficulty": "A1",
  "points": 20,
  "pairs": [
    { "left": "Tisch", "right": "der" },
    { "left": "Lampe", "right": "die" },
    { "left": "Buch", "right": "das" }
  ],
  "explanation": "Match based on grammatical gender",
  "explanationDe": "Zuordnung basierend auf grammatischem Geschlecht"
}
```

#### 4. Word Order
```json
{
  "type": "word-order",
  "instruction": "Arrange words to form a correct sentence",
  "instructionDe": "Ordnen Sie die Wörter zu einem korrekten Satz",
  "difficulty": "A1",
  "points": 15,
  "words": ["geht", "Der", "Schule", "zur", "Junge"],
  "correctOrder": ["Der", "Junge", "geht", "zur", "Schule"],
  "translation": "The boy goes to school.",
  "explanation": "German uses V2 word order",
  "explanationDe": "Deutsch verwendet V2-Wortstellung"
}
```

#### 5. Conjugation
```json
{
  "type": "conjugation",
  "instruction": "Conjugate the verb",
  "instructionDe": "Konjugieren Sie das Verb",
  "difficulty": "A1",
  "points": 10,
  "verb": "spielen",
  "tense": "Präsens",
  "pronoun": "ich",
  "correctAnswer": "spiele",
  "verbTranslation": "to play",
  "explanation": "ich + spielen = spiele",
  "explanationDe": "ich + spielen = spiele"
}
```

#### 6. Case Selection
```json
{
  "type": "case-selection",
  "instruction": "Identify the case of the highlighted word",
  "instructionDe": "Identifizieren Sie den Fall des markierten Wortes",
  "difficulty": "A1",
  "points": 10,
  "sentence": "Die Katze fängt die Maus.",
  "sentenceTranslation": "The cat catches the mouse.",
  "targetWord": "Die Katze",
  "correctCase": "Nominativ",
  "explanation": "Subject = Nominative",
  "explanationDe": "Subjekt = Nominativ"
}
```

#### 7. Article Selection
```json
{
  "type": "article-selection",
  "instruction": "Select the correct article",
  "instructionDe": "Wählen Sie den richtigen Artikel",
  "difficulty": "A1",
  "points": 10,
  "sentence": "___ Hund bellt.",
  "sentenceTranslation": "The dog barks.",
  "options": ["der", "die", "das", "den", "dem"],
  "correctAnswer": "der",
  "noun": "Hund",
  "nounGender": "masculine",
  "caseUsed": "Nominativ",
  "explanation": "Masculine + Nominative = der",
  "explanationDe": "Maskulin + Nominativ = der"
}
```

#### 8. Translation
```json
{
  "type": "translation",
  "instruction": "Translate to German",
  "instructionDe": "Übersetzen Sie ins Deutsche",
  "difficulty": "A2",
  "points": 15,
  "sourceLanguage": "en",
  "sourceText": "The man reads a book.",
  "correctTranslations": [
    "Der Mann liest ein Buch.",
    "Der Mann liest ein Buch"
  ],
  "keyWords": ["Mann", "liest", "Buch"],
  "explanation": "Key vocabulary and word order matter",
  "explanationDe": "Wichtiger Wortschatz und Wortstellung"
}
```

#### 9. Error Correction
```json
{
  "type": "error-correction",
  "instruction": "Find and correct the error",
  "instructionDe": "Finden und korrigieren Sie den Fehler",
  "difficulty": "A2",
  "points": 15,
  "incorrectSentence": "Den Mann liest die Zeitung.",
  "correctSentence": "Der Mann liest die Zeitung.",
  "errorType": "article",
  "translation": "The man reads the newspaper.",
  "explanation": "Subject must be nominative (der, not den)",
  "explanationDe": "Subjekt muss im Nominativ stehen (der, nicht den)"
}
```

### Submit Exercise Answers (Student)
```http
POST /exercises/:exerciseSetId/submit
Authorization: Bearer {{studentToken}}
Content-Type: application/json
```

```json
{
  "answers": [
    { "exerciseIndex": 0, "userAnswer": "Der" },
    { "exerciseIndex": 1, "userAnswer": "das" },
    { "exerciseIndex": 2, "userAnswer": ["der", "die", "das", "die"] }
  ],
  "timeSpent": 300
}
```

Response includes:
- Score percentage
- Correct/total answers
- Pass/fail status
- Graded answers with explanations
- Mastery level update

### Update Exercise Set (Admin)
```http
PUT /exercises/:exerciseSetId
Authorization: Bearer {{adminToken}}
```

### Delete Exercise Set (Admin)
```http
DELETE /exercises/:exerciseSetId
Authorization: Bearer {{adminToken}}
```

---

## 📊 Progress Tracking

### Get User's Grammar Progress
```http
GET /progress
Authorization: Bearer {{studentToken}}
```

Response:
```json
{
  "overview": {
    "totalLessonsCompleted": 5,
    "totalExercisesPassed": 8,
    "totalTimeSpent": 3600,
    "averageExerciseScore": 85
  },
  "topicMasteries": [
    {
      "topic": { "title": "German Cases", ... },
      "lessonsCompleted": 2,
      "totalLessons": 4,
      "exercisesPassed": 3,
      "totalExercises": 4,
      "averageScore": 82,
      "masteryLevel": "intermediate"
    }
  ],
  "recentActivity": [...]
}
```

Mastery Levels:
- `not-started` - No activity
- `beginner` - < 30% completion
- `intermediate` - 30-60% completion
- `advanced` - 60-90% completion
- `mastered` - 90%+ completion with 90%+ average score

### Get Recommended Lesson
```http
GET /recommended?difficulty=A1
Authorization: Bearer {{studentToken}}
```

Returns the next uncompleted lesson based on difficulty and order.

---

## Quick Start for Admins

### 1. Create a Topic
```bash
POST /grammar/topics
{
  "title": "German Cases",
  "titleDe": "Die deutschen Fälle",
  "slug": "german-cases",
  "description": "Learn the four German cases",
  "descriptionDe": "Lernen Sie die vier deutschen Fälle",
  "difficulty": "A1",
  "isPublished": true
}
```

### 2. Create Lessons Under Topic
```bash
POST /grammar/lessons
{
  "topic": "{{topicId}}",
  "title": "Nominative Case",
  ...
}
```

### 3. Create Exercises for Each Lesson
```bash
POST /grammar/exercises
{
  "lesson": "{{lessonId}}",
  "exercises": [...],
  ...
}
```

### 4. Publish Content
All content has `isPublished` flag - set to `true` when ready for students.

---

## Best Practices for Creating Content

1. **Bilingual Content**: Always provide both English and German (De) versions
2. **Multiple Explanation Types**: Mix text, tables, examples, and tips
3. **Progressive Difficulty**: Start simple, build complexity
4. **Varied Exercise Types**: Use different exercise types to engage learners
5. **Meaningful Feedback**: Write helpful explanations for each exercise
6. **Practical Examples**: Use real-world sentences students will encounter
7. **Common Mistakes**: Document mistakes German learners typically make
