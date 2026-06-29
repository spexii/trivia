# Trivia

A self-hostable, IRC-style trivia game for the browser. Players join a room, answer questions in a shared chat, and compete on a live leaderboard. Nicks, streaks, speed records, and season standings are all tracked.

## The Story

Back in the early 2000s, the Finnish IRC channel **#visa** on QuakeNet hosted a trivia bot that ran 24/7. Players would race to type the correct answer first, chasing streaks and WPM records in a scrolling wall of text. It was simple, social, and oddly addictive.

This project is a modern reimagining of that experience — same feel, but running in your browser with persistent stats, seasons, and a proper UI. The name *visa* was Finnish slang for a trivia quiz.

## Features

- Real-time multiplayer trivia over WebSockets
- IRC-style chat with answer checking built in
- Points, streaks, WPM (words per minute), and speed records per player
- Season-based leaderboards and all-time Hall of Fame
- Guest play (no registration required to collect stats)
- Nick registration to protect your name
- Hint system (two progressive hints before timeout)
- Commands: `!stats`, `!season`, `!hof`, `!next`, `!pause`, `!reset`
- Finnish and English UI (easily extensible to other languages)
- Mobile-friendly layout
- Docker-based — easy to self-host

## Quick Start (Docker)

**Prerequisites:** Docker and Docker Compose.

```bash
git clone https://github.com/your-username/trivia.git
cd trivia

# Copy and fill in secrets
cp .env.example .env
# Edit .env: set a strong POSTGRES_PASSWORD and JWT_SECRET
# Generate JWT_SECRET with: openssl rand -hex 32

# Start everything (database, bot, web)
docker compose up -d
```

Open `http://localhost:3000` in your browser.

### Development

```bash
# Start with live reload
docker compose -f docker-compose.dev.yml up
```

Changes to `bot/` and `web/` are reflected immediately without rebuilding.

## Configuration

### Root `.env`

| Variable | Description |
|---|---|
| `POSTGRES_PASSWORD` | PostgreSQL password used by Docker |
| `JWT_SECRET` | Secret for signing auth tokens — use `openssl rand -hex 32` |

### Bot (`bot/.env`)

| Variable | Default | Description |
|---|---|---|
| `BOT_PORT` | `3001` | WebSocket server port |
| `BOT_LANG` | `en` | Question language (`en` or `fi`, matches a file in `bot/questions/`) |

### Web (`web/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_WS_URL` | WebSocket URL the browser connects to (e.g. `ws://localhost:3001`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Must match the root `.env` value |

## Question Files

Questions live in `bot/questions/<lang>.txt`. The format is one question per line:

```
Question text*correct answer*alternative answer*another alternative
```

- The first field is the question shown to players.
- The second field is the canonical answer (also shown on timeout).
- Additional fields (separated by `*`) are accepted as correct but don't affect stats display.
- Lines starting with `#` are comments and are ignored.

**Example:**

```
What is the capital of France?*Paris
How many days are in a leap year?*366
Who wrote Romeo and Juliet?*Shakespeare*William Shakespeare
```

To add a new language, create `bot/questions/<lang>.txt`, add translations to `web/messages/<lang>.json`, and set `BOT_LANG=<lang>` in your bot config.

## Adding a Language

1. Add question file: `bot/questions/<lang>.txt`
2. Add UI translations: `web/messages/<lang>.json` (copy `en.json` as a starting point)
3. Add the locale to `web/i18n/routing.ts`
4. Set `BOT_LANG=<lang>` in `bot/.env`

## Architecture

Two processes, one database:

```
Browser ──WebSocket──▶ Bot (Node.js / ws)
   │                        │
   └──HTTP──▶ Next.js        └── PostgreSQL (via Prisma)
                 │
                 └── PostgreSQL (auth + stats)
```

- **Bot** (`bot/`): WebSocket server, trivia loop, answer checking, stats, commands
- **Web** (`web/`): Next.js app, authentication (login/register/guest), chat UI
- **Database**: PostgreSQL with Prisma — users, seasons, per-nick stats

Auth uses signed JWTs in httpOnly cookies. The bot verifies the token on WebSocket connection.

## Commands

| Command | Who | Description |
|---|---|---|
| `!help` | everyone | Show available commands |
| `!stats` | everyone | Your personal stats for the current season |
| `!season` | everyone | Season leaderboard |
| `!hof` | everyone | All-time Hall of Fame |
| `!next` | moderator+ | Skip the current question |
| `!pause` | moderator+ | Pause/resume the trivia loop |
| `!reset` | owner | Start a new season |

## License

MIT — see [LICENSE](LICENSE).
