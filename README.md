# Grounds — Coffee Field Guide ☕

A field guide for the curious coffee drinker. **Grounds** combines educational content about coffee — its history, origins, processing methods, brewing techniques, water chemistry, hardware, and roast levels — with a personal **Coffee Journal** for logging coffees and brews, a **Taste Quiz** to discover your flavor profile, and **Mr. Beanie**, an AI chatbot assistant that answers coffee questions and helps fill in your journal.

## Tech Stack

- **[Next.js 16](https://nextjs.org/)** (App Router) + **React 18** — full-stack framework
- **MySQL** via [`mysql2`](https://www.npmjs.com/package/mysql2) — data persistence (raw SQL, no ORM)
- **Custom authentication** — [`bcryptjs`](https://www.npmjs.com/package/bcryptjs) password hashing + [`jose`](https://www.npmjs.com/package/jose) JWT session cookies
- **Google Gemini** via [`@google/genai`](https://www.npmjs.com/package/@google/genai) — AI chatbot with streaming responses and function calling
- **[`zod`](https://www.npmjs.com/package/zod)** — schema validation · **[`react-markdown`](https://www.npmjs.com/package/react-markdown)** — chatbot reply rendering
- Plain CSS (no framework), organized under `app/styles/`

## Prerequisites

- **Node.js** 18.18 or later (20+ recommended)
- **npm** (ships with Node.js)
- A running **MySQL** server (local or remote)
- A **Google Gemini API key** — free to create at [Google AI Studio](https://aistudio.google.com/apikey)

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/TimacDev/Projeto-Final.git
   cd Projeto-Final
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create the database**

   The full schema and sample data live in [`bd.txt`](bd.txt). Run it against your MySQL server:

   ```bash
   mysql -u root -p < bd.txt
   ```

   This creates the `coffee_db` database with five tables (`users`, `coffees`, `comments`, `coffee_ratings`, `brew_logs`) and seeds it with sample coffees, brew logs, and ratings.

4. **Configure environment variables**

   Create a `.env` file in the project root — see [Environment Variables](#environment-variables) below.

5. **Run the app**

   ```bash
   npm run dev
   ```

   The app is now available at [http://localhost:3000](http://localhost:3000).

   For a production build:

   ```bash
   npm run build
   npm start
   ```

## Environment Variables

All variables go in a `.env` file at the project root (gitignored).

| Variable | Description | Example |
| --- | --- | --- |
| `DB_HOST` | MySQL server host | `localhost` |
| `DB_PORT` | MySQL server port | `3306` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | `your_mysql_password` |
| `DB_NAME` | Database name — must match the schema in `bd.txt` | `coffee_db` |
| `AUTH_SECRET` | Secret used to sign session JWTs. **Required** — the app throws an error without it. Generate one with `openssl rand -base64 32` | `a-long-random-string` |
| `GEMINI_API_KEY` | Google Gemini API key, used by the chatbot | `AIza...` |

Example `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=coffee_db
AUTH_SECRET=paste-a-long-random-string-here
GEMINI_API_KEY=your-gemini-api-key
```

## Functional Overview & How to Test

Grounds is a single-page app: the landing screen leads into a tabbed shell where each tab is a feature. Below is what each area does and how to try it.

### Landing page
Open [http://localhost:3000](http://localhost:3000) and click through the landing screen to enter the app (with sound 🔊).

### Guide sections
The **History**, **Origins**, **Processing**, **Brew**, **Water**, **Hardware**, and **Roast** tabs contain browsable educational content — origin profiles by region, step-by-step brew method instructions (pour-over, espresso, French press, AeroPress, cold brew…), water chemistry, equipment, and roast levels.

> **Test:** click through each tab and expand the content cards. On a narrow window (or mobile), the navigation collapses into a hamburger menu — resize the browser to verify.

### Taste Quiz
A short quiz that maps your preferences to a coffee flavor profile.

> **Test:** open the **Quiz** tab, answer the questions, and check that a profile recommendation is produced at the end.

### Accounts (sign up / login)
Custom email + password authentication. Sessions are kept in an httpOnly cookie and stay valid for 7 days.

> **Test:** open the **Login** tab, create a new account via the sign-up form, log in, then refresh the page — you should stay logged in. Log out and confirm the journal becomes inaccessible again.

### My Coffee Journal *(requires login)*
Your personal log: register coffees (roaster, origin, process, roast level…), rate them, comment on them, and record brew logs (method, dose, grind, tasting notes) linked to your coffees. Entries can be edited and deleted. The database seed already includes sample coffees and brews to browse.

> **Test:** while logged in, open the **Journal** tab — add a coffee, give it a rating, leave a comment, then create a brew log for it. Edit and delete an entry to confirm the full CRUD cycle.

### Mr. Beanie chatbot 🤖
A floating AI assistant (bottom corner) powered by Google Gemini. Replies stream in with a typewriter effect and render Markdown. Through function calling, the bot can also pre-fill journal forms for you.

> **Test:** click the Mr. Beanie button and ask a coffee question (e.g. *"What's the difference between washed and natural process?"*) — the answer should stream in progressively. While logged in, try *"log a coffee for me: Ethiopian natural from roaster X"* and watch it pre-fill the coffee form.


## Project Structure

```
├── app/
│   ├── api/          # API routes: auth, coffees, brew-logs, chat (streaming), bot logic
│   ├── styles/       # All CSS (imported in layout.js — no inline styles)
│   ├── layout.js     # Root layout, fonts, global styles
│   └── page.js       # Landing screen + tabbed app shell
├── components/       # UI components (guides, quiz, journal, chatbot, auth…)
├── data/             # Static content (origins, brew methods)
├── lib/              # Server helpers: db pool, auth/session, validation
├── public/           # Static assets (mascot, icons, sounds)
└── bd.txt            # MySQL schema + seed data
```

## Authors

**Group** — Danilo Quintal & Tiago Machado

Repository: [https://github.com/TimacDev/Projeto-Final](https://github.com/TimacDev/Projeto-Final)
