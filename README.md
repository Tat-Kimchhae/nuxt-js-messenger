# Nuxt JS Messenger

A real-time messaging application built with Nuxt and Vue. It includes user authentication, one-to-one and group conversations, friend requests, and messages with image and audio support.

## Demo

[Try the live demo](https://nuxt-js-messenger.vercel.app/login).

## Technology and tools

### Application

- **Nuxt 4** — application framework, routing, server rendering, and server API routes.
- **Vue 3** — component-based user interface.
- **TypeScript** — type checking and typed project configuration.
- **Vite** — development and build tooling used by Nuxt.
- **Tailwind CSS 4** — utility-first styling, integrated through `@tailwindcss/vite`.
- **Vue Router** — client-side routing, provided by Nuxt/Vue.

### Server, data, and integrations

- **Nuxt/Nitro server API** — backend endpoints and server utilities.
- **PostgreSQL** — relational database.
- **Prisma 7** — database schema, migrations, and ORM; `@prisma/adapter-pg` connects Prisma to PostgreSQL.
- **nuxt-auth-utils** — session-based authentication utilities.
- **Pusher** and **pusher-js** — server and browser clients for real-time messaging.
- **Cloudinary** — image and media upload/storage integration.

### Interface and validation

- **@vee-validate/nuxt** — form validation integration.
- **Zod** — schema-based input validation.
- **@nuxtjs/color-mode** — light/dark theme preference handling.
- **emoji-picker-element** — emoji picker web component.
- **vue-sonner** — toast notifications.
- **Iconify Lucide icon set** — available project icons.

### Development tools

- **Node.js and npm** — JavaScript runtime and package management (`package-lock.json` is checked in).
- **Prisma CLI** — database migration and seed commands.
- **tsx** — running the TypeScript seed script.
- **@faker-js/faker** — generating sample seed data.
- **Nuxt DevTools** — enabled during development.

## Requirements

- Node.js compatible with the installed Nuxt version.
- PostgreSQL database.
- Pusher app credentials.
- Cloudinary credentials for media uploads.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in the values:

   ```dotenv
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
   CLOUDINARY_API_KEY=""
   CLOUDINARY_API_SECRET=""
   CLOUDINARY_CLOUD_NAME=""
   PUSHER_APP_ID=""
   PUSHER_KEY=""
   PUSHER_SECRET=""
   PUSHER_CLUSTER=""
   ```

3. Apply database migrations:

   ```bash
   npx prisma migrate dev
   ```

4. (Optional) Seed the database with sample data:

   ```bash
   npx prisma db seed
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server. |
| `npm run build` | Build the production application. |
| `npm run preview` | Preview the production build locally. |
| `npm run generate` | Generate a static version of the application. |

## Database

The Prisma schema is in `prisma/schema.prisma`; migrations are in `prisma/migrations`. The schema models users, OAuth accounts, conversations, messages, and friend requests. `prisma/seed.ts` is configured as the seed script.

## Configuration notes

- Keep real credentials in `.env`; it is excluded from Git. `.env.example` documents the required variable names.
- The Pusher key and cluster are exposed to the client through Nuxt's public runtime config. The Pusher app ID and secret remain server-side.
- Cloudinary credentials are used by the server-side media integration.
