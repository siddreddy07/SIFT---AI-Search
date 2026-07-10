# AI Search Engine

A chat interface that actually finds you answers instead of making them up.

Ask about live sports scores, and it searches the web, finds photos, and pulls up YouTube highlights — then lays it all out in a clean, styled response with scoreboards, image galleries, and video cards.

Ask about your emails, and it checks your Gmail. Ask about your day, and it looks at your calendar. Ask for a product comparison, and it researches the web, grabs images of each item, and shows you a side-by-side with prices and ratings.

The whole point: one chat box that can reach into live data sources — web, images, videos, your Google accounts — and give you answers that are actually current, actually visual, and actually useful.

Not a chatbot. A search engine you talk to.

## Cookie Security Attributes

| Attribute | What it does | Why use it | Example |
|-----------|-------------|------------|---------|
| `httpOnly: true` | JavaScript in the browser **cannot** read this cookie | Stops XSS attacks — even if a hacker injects a script, they can't steal the token | A malicious `<script>` on the site tries `document.cookie` → gets nothing |
| `secure: true` | Browser only sends the cookie over **HTTPS** (not HTTP) | Prevents token theft on insecure networks (WiFi, etc.) | Someone on public WiFi snoops your traffic → cookie never sent over plain HTTP |
| `sameSite: 'strict'` | Cookie is **not sent** when the user clicks a link from another site | Prevents CSRF attacks — a fake site can't make the browser send your auth cookie | User clicks a phishing link `bad-site.com` → browser does NOT include the cookie in the request |
| `sameSite: 'lax'` | Cookie is sent for **top-level GET** navigations from other sites, but not for POST/form submissions | Balances security and convenience — lets users stay logged in when coming from Google/email links | User clicks Google search result → cookie sent (GET navigation). A fake form POST → cookie blocked |
| `sameSite: 'none'` | Cookie is sent on **all requests** from any site (requires `secure: true`) | Needed when your frontend and backend are on different domains | `frontend.com` calls API at `api.backend.com` → cookie sent cross-origin |
