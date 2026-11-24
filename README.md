# navy9-measures

Admin app for a tailoring shop: customers, orders, garment measurements, payments and customer photos.

**Stack:** Next.js 15 (App Router + server actions) · Tailwind CSS v4 · Prisma + PostgreSQL · NextAuth (credentials, JWT) · Cloudinary

## Features

- Admin login. Every page except `/login` requires a signed-in admin.
- Customers with a unique mobile number, email, date of birth, height, weight and one photo. Search by name, mobile or email.
- Single-page order form: customer details (search loads an existing customer), photo drag-and-drop, Blazer/Trouser/Shirt measurement cards side by side, and billing, each in a collapsible section.
- Orders with an editable, auto-suggested order number, entry date and items (product, rate, quantity, amount).
- Total defaults to the sum of item amounts. Balance is calculated as total minus advance.
- Blazer/Waistcoat, Trouser and Shirt measurements per order. New orders are pre-filled from the customer's most recent measurements.
- Order search by order number, customer name or mobile, and a printable order page.
- Deleting a customer deletes their orders, measurements and items.
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

Garment fields are defined in `GARMENTS` in `src/lib/measurements.ts` and stored as columns on `Measurement` in `prisma/schema.prisma`. To add a field, add it in both places and run `npm run db:migrate`.
