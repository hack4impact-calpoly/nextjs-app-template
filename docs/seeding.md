# Seeding the Database

The menu drinks live in the `drinks` collection of the `team3` database. The starting data is in [`docs/seed/drinks.json`](./seed/drinks.json) (the same 6 drinks as `src/data/mockDrinks.ts`, without ids so MongoDB creates them).

Each drink's `imageUrl` points to a photo in `public/drinks/` (for example `/drinks/mocha.jpg`). If you add a drink, add its photo there too (800 x 600, JPEG).

Only reload the data if the drinks got deleted or messed up. **Reloading replaces every drink for the whole team**, and every drink gets a new id, so old links to `/menu/<id>` and existing orders that point to the old ids will stop working.

## Option 1: mongosh

Run this from the root of the repo, with your connection string in quotes:

```
mongosh "<your MONGO_URI>" --eval 'db.drinks.deleteMany({}); db.drinks.insertMany(JSON.parse(require("fs").readFileSync("docs/seed/drinks.json", "utf8")))'
```

You should see `insertedIds` with 6 ids.

## Option 2: MongoDB Compass

1. Connect with your `MONGO_URI`
2. Open **team3** → **drinks**
3. Delete the existing documents (select all → delete)
4. Click **Add Data** → **Import JSON or CSV file** and pick `docs/seed/drinks.json`

## Check it worked

Open `/menu` with `npm run dev`. You should see all 6 drinks.
