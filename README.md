# navy9-measures

Admin app for recording tailoring customers, their body measurements and reference photos.

**Stack:** Next.js 15 (App Router + server actions) · Tailwind CSS v4 · Prisma + PostgreSQL · NextAuth (credentials, JWT) · Cloudinary

## Features

- Admin login. Every page except `/login` requires a signed-in admin.
- Customer list with search by name, phone or email
- Create, edit and delete customers
- Measurement records in a grid form (upper and lower body, inches or cm) with history. New records are pre-filled from the latest record.
- Customer photo upload to Cloudinary

## Setup

```bash
npm install
cp .env.example .env      # then fill in values
# Start Postgres, e.g.:
docker run -d --name navy9-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=navy9 -p 5432:5432 postgres:16
npm run db:migrate        # create tables
npm run db:seed           # create admin from ADMIN_EMAIL / ADMIN_PASSWORD
npm run dev               # http://localhost:3000
```

Photo uploads stay disabled until `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` are set.

## Measurement fields

Fields are defined in `src/lib/measurements.ts` and stored as columns on `Measurement` in `prisma/schema.prisma`. To add a field, add it in both places and run `npm run db:migrate`.
