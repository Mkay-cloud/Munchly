# Munchly

Can't decide what to eat? Spin for it.

Munchly is a meal-decision app that starts with a simple mood-based "spin the wheel" picker and grows over time into a full recipe library, ingredient-based search, weekly meal planner, and shopping list generator.

## Tech stack

- **Next.js** (App Router, TypeScript, Tailwind) — the site itself
- **Sanity** — the CMS where recipes are added/edited (no code needed to add a new recipe once this is fully wired up)
- **Supabase** — auth (user accounts) and database (saved favorites, meal plans, shopping lists)
- **Vercel** — hosting; every pull request gets its own preview link automatically

## Running it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

You'll need a `.env.local` file with real Sanity and Supabase keys — copy `.env.example` to `.env.local` and fill in the values from your Sanity and Supabase project dashboards. `.env.local` is gitignored and should never be committed.

The Sanity Studio (where recipes get added through a dashboard, once this is wired in) lives at `/studio` when running locally or deployed.

## What's built

- The homepage, including a fully working spin-the-wheel picker (pick a mood, spin, get a real dish suggestion with cuisine/time/note)
- A "browse by mood or cuisine" section (currently showing placeholder cards — real ones come from Sanity once recipes are added)
- A "Munchly grows with you" section previewing what's coming next
- Sanity and Supabase are both connected (env vars + client setup), but not yet used to drive real content or accounts

## What's next

Roughly in this order, per the project plan:

1. Populate Sanity with real recipes and connect the spin wheel + browse grid to that data instead of the hardcoded dish list currently in `src/app/page.tsx`
2. User accounts via Supabase (sign up / sign in), wired into the "Sign in" and "Create an account" buttons already in the design
3. Saved favorites
4. Weekly meal planner
5. Shopping list generator
6. Ingredient-based "what can I make with what I have" search

## Notes

- Full public launch is being held until the fuller vision above is built, rather than shipping features one at a time — see the homepage design, which already represents the full vision so later sections slot in without a redesign.
- Standing workflow: every change goes through a fresh pull request (never assume a previous one is still open), and gets tested on its real Vercel preview link before merging.
