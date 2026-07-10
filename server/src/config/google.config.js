export const SIGNAL_CATEGORIES = {
  PERSON: "person",
  PROJECT: "project",
  INTERVIEW: "interview",
  MEETING: "meeting",
  DEADLINE: "deadline",
  TRAVEL: "travel",
  SUBSCRIPTION: "subscription",
  PAYMENT: "payment",
  LEARNING: "learning",
  OTHER: "other",
}

export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
export const GOOGLE_REVOKE_URL = 'https://oauth2.googleapis.com/revoke'
export const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'

export const GMAIL_WATCH_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/watch'
export const CALENDAR_WATCH_URL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events/watch'

export const GMAIL_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/youtube.readonly"
]

export const SKIP_LABELS = ['CATEGORY_PROMOTIONS','DRAFT', 'CATEGORY_SOCIAL', 'CATEGORY_FORUMS', 'SPAM', 'TRASH']
