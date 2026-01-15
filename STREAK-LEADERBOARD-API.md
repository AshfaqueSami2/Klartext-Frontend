# Streak & Leaderboard API

## New Endpoints

### Vocabulary
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `DELETE` | `/api/vocab/:vocabId` | Student | Delete a saved word |

### Streak
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/streak/record` | Student | Manually record daily activity |
| `GET` | `/api/streak/my-streak` | Student | Get user's streak stats |
| `GET` | `/api/streak/leaderboard?limit=10` | Student | Current streak leaderboard |
| `GET` | `/api/streak/leaderboard/all-time?limit=10` | Student | All-time best streaks |

---

## Response Examples

### GET `/api/streak/my-streak`
```json
{
  "success": true,
  "message": "Streak stats fetched successfully",
  "data": {
    "currentStreak": 5,
    "longestStreak": 12,
    "lastActivityDate": "2026-01-15T00:00:00.000Z",
    "totalActiveDays": 45,
    "isActiveToday": true
  }
}
```

### GET `/api/streak/leaderboard`
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "user": { "_id": "...", "name": "John", "profileImage": "..." },
      "currentStreak": 30,
      "longestStreak": 30,
      "totalActiveDays": 60
    }
  ]
}
```

---

## Auto-Streak Triggers
Streak is **automatically recorded** when user:
- Completes a lesson
- Saves a vocabulary word

No frontend action needed for these — streak updates in background.

---

## Notes
- Streak resets if user misses a day
- Leaderboard only shows users with active streaks (active today/yesterday)
- `isActiveToday` helps show fire 🔥 icon in UI
