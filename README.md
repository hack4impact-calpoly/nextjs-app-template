# VolunteerFinder

VolunteerFinder is a web app for finding local and remote volunteer opportunities. Users can browse listings and filter them by category, location, and whether they can be done remotely. Each listing shows the organization, date, time commitment, and how many spots are left. It's built with Next.js (App Router) and TypeScript, and the data lives in MongoDB.

## Getting Started

### Prerequisites

- Node.js 20 or newer
- A MongoDB connection string (ask the TL, don't create your own cluster)

### Install and run

```bash
git clone https://github.com/shreev2703/Team2-app.git
cd Team2-app
npm install
cp .env.local.example .env.local   # then fill in MONGODB_URI
npm run dev
```

The app runs at http://localhost:3000.

### Environment variables

| Variable      | Description                               | Where to get it |
| ------------- | ----------------------------------------- | --------------- |
| `MONGODB_URI` | Connection string for the MongoDB cluster | Ask the TL      |

`.env.local` is gitignored. Never commit it, and never paste the connection string into an issue, PR, or the team channel.

### Seeding the database

To check your connection and load the mock data into the `volunteerfinder` database, run:

```bash
npx tsx scripts/seed.ts
```

This **clears** the `opportunities` collection and re-inserts everything from `src/data/mockOpportunities.ts`. If it prints `inserted N opportunities`, your connection works.

## Folder Structure

```
src/
  app/                 Pages and API routes (Next.js App Router)
    api/opportunities/ Opportunities API (GET with filters, POST), see issues #9 and #10
  components/          Shared React components
  types/               TypeScript types (VolunteerOpportunity)
  data/                Mock data used by the frontend until we hook up the API
  lib/                 Server helpers, e.g. the shared MongoDB client
scripts/               One-off scripts like seed.ts
docs/                  Setup and contributing guides
```

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) for branch naming, commit format, and the PR process. There's more setup detail in [docs/getting-started.md](docs/getting-started.md).
