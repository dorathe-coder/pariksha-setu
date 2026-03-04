# ParikshaSetu — Gujarat Competitive Exam Platform

**Live URL:** Deploy to Vercel  
**Tech Stack:** Next.js 14 + Supabase + Tailwind CSS

## Quick Start

### 1. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor, paste contents of `supabase-schema.sql`, and run it
3. Go to Authentication > Settings, enable Email/Password login
4. Copy your project URL and Anon Key

### 2. Local Development

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
npm run dev
```

### 3. Set Admin User

After registering your account, run this in Supabase SQL Editor:
```sql
UPDATE public.users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### 4. Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## Features

- GPSC, Talati, GSSSB, Revenue Talati, Bin Sachivalay, Police & more
- SSC, Banking, Railway exams
- Admin: Upload 200+ questions in 2-4 minutes (CSV/Excel/Paste)
- Auto-generated result with topic-wise analysis
- Daily free quiz system
- Gujarati + English + Hindi support
- Mobile responsive

## Project Structure

```
app/
  page.tsx          — Home page
  auth/             — Login, Register
  exams/            — Browse tests
  dashboard/        — Student dashboard  
  test/[id]/        — Test attempt (Part 2)
  result/[id]/      — Result page (Part 2)
  admin/            — Admin panel (Part 2)
components/
  layout/           — Navbar, Footer
  exam/             — TestCard, ExamFilters
  dashboard/        — Stats, Charts
  admin/            — Upload, Management (Part 2)
lib/
  supabase/         — Client, Server, Middleware
  utils.ts          — Helper functions
types/
  database.ts       — TypeScript interfaces
```

## Part 2 (Next Steps)

After confirming Part 1 works, Part 2 adds:
- Full Test Attempt page (timer, navigation, auto-submit)
- Complete Auto Result page with analytics
- Admin Panel (test creation, management)
- Bulk Question Upload (CSV, Excel, paste)
- PDF result download
