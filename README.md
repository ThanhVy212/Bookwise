<div align="center">

  <img src="public/images/logo.png" alt="BookWise Logo" width="100" />

  #  BookWise
  ### *The Modern University Library & Reading Management Platform*

  <p align="center">
    <strong>A high-performance, real-time library management system crafted with Next.js, TypeScript, Drizzle ORM, Neon PostgreSQL, Socket.IO, Upstash, and Resend.</strong>
  </p>

  <p align="center">
    <a href="#-short-description">Short Description</a> •
    <a href="#-key-features">Key Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-system-architecture">Architecture</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-cron--automated-jobs">Cron & Automation</a> •
    <a href="#-project-structure">Project Structure</a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Drizzle_ORM-PostgreSQL-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black" alt="Drizzle ORM" />
    <img src="https://img.shields.io/badge/Neon-Serverless_Postgres-00E599?style=for-the-badge&logo=neon&logoColor=black" alt="Neon" />
    <img src="https://img.shields.io/badge/Socket.io-Real--Time-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO" />
    <img src="https://img.shields.io/badge/Upstash-Redis_%26_QStash-00E699?style=for-the-badge&logo=upstash&logoColor=white" alt="Upstash" />
  </p>
</div>

---

## 📌 Short Description

> **BookWise** is a full-stack, enterprise-grade university library management application designed to streamline student borrowing, digital receipts, book discovery, account verification, and physical counter check-in/out via dynamic QR codes. Powered by real-time Socket.IO alerts and automated background overdue scanning with email notices, BookWise brings an elegant luxury dark-mode experience to academic reading communities.

---

## ✨ Key Features

### 📖 Student Experience
- 🔍 **Book Catalog & Smart Search**: Real-time full-text search across titles, authors, genres, and descriptions with instant filtering and multi-criteria sorting (latest, highest rated, available copies).
- 🎬 **Video Book Trailers & Rich Summaries**: Embedded book previews and dynamic color-themed book covers powered by ImageKit CDN.
- 📥 **1-Click Borrow & Renewal**: Atomic copy reservation with race-condition protection. Seamless online book renewals (up to 2 times before due date).
- 🧾 **Digital QR Receipt**: Automatically generated borrow receipt containing dynamic QR codes for swift check-out / check-in at the library counter.
- 💖 **Saved Reading List (Wishlist)**: Quick-save books for future reading and bookmark favorites.
- ⭐ **Reviews & Rating System**: Verified student reviews with interactive 5-star ratings and community feedback.

### 🔔 Real-Time & Automated Notifications
- ⚡ **Socket.IO Real-Time Push**: Instant live toast alerts and in-app badge updates for account approvals, return confirmations, and broadcasts.
- 📧 **Automated Overdue Email & In-App Alert System**:
  - Daily automated background scan for overdue records (`dueDate < Today`).
  - Dispatches dark-themed urgent email notices via Resend/QStash with fine estimation (5,000 VND / day).
  - **Redis Deduplication Engine**: Guarantees students receive at most 1 reminder per day to prevent spamming.
- 📬 **Email Lifecycle Suite**: Welcome emails, account approval/rejection notices, borrow confirmations, return receipts, and inactive user re-engagement.

### 🛡️ Admin & Staff Dashboard
- 📊 **Live Library Analytics**: Total books, active borrows, pending student requests, and top-wishlisted books.
- 🆔 **Account Verification Portal**: Review student registration requests with full-size university ID card inspect modal.
- 📱 **QR Counter Scanner (`/scan/[recordId]`)**: Fast physical counter check-out and check-in confirmation for librarians.
- 📢 **Custom Notification Broadcaster**: Push targeted or broadcast announcements to all students via Socket.IO.
- ⏰ **Overdue Scanner Hub**: Real-time counter of overdue books with single-click manual scan & force re-dispatch controls.
- 👥 **User & Role Management**: Promote/demote user roles and inspect individual borrowing histories.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/), Radix UI / Shadcn primitives, Lucide Icons, Sonner |
| **Database** | [Neon Serverless PostgreSQL](https://neon.tech/) |
| **ORM & Migrations** | [Drizzle ORM](https://orm.drizzle.team/) & Drizzle Kit |
| **Authentication** | [NextAuth.js (Auth.js v5 Beta)](https://authjs.dev/) with bcryptjs |
| **Real-Time Layer** | [Socket.IO](https://socket.io/) (Custom HTTP server integration) |
| **Cache & Rate Limiting** | [Upstash Redis](https://upstash.com/docs/redis/overall/getstarted) & `@upstash/ratelimit` |
| **Workflows & Background Jobs** | [Upstash Workflow](https://upstash.com/docs/workflow/getstarted) & QStash |
| **Email Delivery** | [Resend](https://resend.com/) via QStash Email Provider |
| **Media & CDN** | [ImageKit.io](https://imagekit.io/) |
| **QR Code Engine** | `qrcode` |


---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v20.x` or higher
- **Package Manager**: `npm`, `pnpm`, or `yarn`
- **Accounts & API Keys**:
  - [Neon PostgreSQL](https://neon.tech/) (Database connection string)
  - [Upstash](https://upstash.com/) (Redis & QStash tokens)
  - [ImageKit.io](https://imagekit.io/) (Public key, private key, endpoint URL)
  - [Resend](https://resend.com/) (API Key for transactional emails)

### 2. Clone and Install Dependencies

```bash
git clone https://github.com/ThanhVy212/Bookwise.git
cd Bookwise

npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory and populate the required keys:

```env
# Application URLs
NEXT_PUBLIC_API_ENDPOINT=http://localhost:3000
NEXT_PUBLIC_PROD_API_ENDPOINT=https://your-domain.vercel.app

# NextAuth / Auth.js
AUTH_SECRET=your_super_secret_auth_key
BETTER_AUTH_SECRET=your_super_secret_auth_key

# Neon PostgreSQL Database
DATABASE_URL=postgresql://user:password@ep-sample.us-east-2.aws.neon.tech/bookwise?sslmode=require

# ImageKit Media Storage
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key

# Upstash Redis & QStash
UPSTASH_REDIS_URL=https://your-redis.upstash.io
UPSTASH_REDIS_TOKEN=your_upstash_redis_token
QSTASH_URL=https://qstash.upstash.io/v2
QSTASH_TOKEN=your_qstash_token

# Resend Email Service
RESEND_TOKEN=re_your_resend_api_key

# Optional: Security key for automated cron endpoint
CRON_SECRET=your_custom_cron_secret
```

### 4. Database Setup & Migration

Generate migrations and push schema to Neon Database:

```bash
# Push schema migrations
npm run db:migrate

# (Optional) Seed sample books and data
npm run seed

# (Optional) Launch Drizzle Studio GUI
npm run db:studio
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⏰ Cron & Automated Jobs

### Automated Overdue Notices
BookWise includes an automated overdue scanner that scans for overdue active borrows and sends emails + real-time in-app alerts.

- **API Route**: `GET /api/cron/overdue` or `POST /api/cron/overdue`
- **Security**: Include header `Authorization: Bearer <CRON_SECRET>`
- **Upstash QStash Schedule Example**:
  ```bash
  curl -X POST https://qstash.upstash.io/v2/schedules/https://your-domain.vercel.app/api/cron/overdue \
    -H "Authorization: Bearer <QSTASH_TOKEN>" \
    -H "Upstash-Cron: 0 0 * * *" \
    -H "Upstash-Forward-Authorization: Bearer <CRON_SECRET>"
  ```
- **Vercel Cron (`vercel.json`)**:
  ```json
  {
    "crons": [
      {
        "path": "/api/cron/overdue",
        "schedule": "0 0 * * *"
      }
    ]
  }
  ```
---
<div align="center">
  <sub>Built with ❤️ for passionate readers and modern academic libraries</sub>
</div>
