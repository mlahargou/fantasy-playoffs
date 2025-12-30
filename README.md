# Fantasy Playoffs Bracket Challenge

A simple single-page application for running a fantasy NFL playoffs bracket pool.

## How It Works

Players pick any QB, WR, RB, and TE combo (1 of each). Picks stay locked for the entire playoffs (Wild Card through Super Bowl) with standard scoring. If a player's NFL team gets eliminated, that player stops scoring points.

- Up to 5 teams per person ($10 each)
- 1st place: 90% of pot
- 2nd place: 10% of pot

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Neon Postgres (serverless)
- **Styling**: Tailwind CSS
- **Hosting**: Vercel (free tier)
- **Player Data**: ESPN public API

## Setup

### 1. Create a Neon Database

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy your connection string (looks like `postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require`)

### 2. Local Development

```bash
# Install dependencies
npm install

# Create .env.local file with your Neon connection string
echo "DATABASE_URL=your_neon_connection_string_here" > .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### 3. Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add your environment variable:
   - Name: `DATABASE_URL`
   - Value: Your Neon connection string
4. Deploy!

The database table will be automatically created on the first API request.

## API Endpoints

- `GET /api/players?position=QB&search=mahomes` - Search players by position
- `POST /api/entries` - Submit a new team entry
- `GET /api/entries` - List all entries (for admin viewing)

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── entries/route.ts  # Team submission API
│   │   └── players/route.ts  # Player search API
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── EntryForm.tsx        # Main form component
│   └── PlayerSelect.tsx     # Searchable player dropdown
└── lib/
    └── db.ts                # Neon database connection
```

## Playoff Teams (2025-2026)

The app only shows players from playoff-bound teams. Update the `PLAYOFF_TEAMS` array in `src/app/api/players/route.ts` once the playoff field is set.

Current placeholder teams (update when playoffs are finalized):
**AFC**: Bills, Ravens, Chiefs, Texans, Chargers, Steelers, Broncos
**NFC**: Lions, Eagles, Buccaneers, Rams, Vikings, Commanders, Packers

## License

MIT
