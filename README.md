# 🧱 SaaS Starter App (Next.js 13+ App Router + Supabase)

This is a lightweight SaaS starter template built with **Next.js App Router** and **Supabase**, supporting user registration, login, and authentication. It is designed to be extended with Stripe for subscriptions and payments.

---

## 🚀 Features

- ✨ User signup (with custom `username`)
- ✨ User login
- ✨ Redirect to `/dashboard` after login
- ✨ Authentication via Supabase Auth (Email + Password)
- ✨ Auto-write user info to `profiles` table (via Trigger)
- ✨ Client-side only communication using `createClientComponentClient()`

---

## 🛠 Tech Stack

| Technology      | Purpose                        |
|------------------|--------------------------------|
| **Next.js**      | Frontend framework (App Router) |
| **Supabase**     | BaaS with Auth & Database       |
| **PostgreSQL**   | Database                        |
| **Stripe**       | 💳 (Planned) Payments & Subscriptions |
| **Tailwind CSS / shadcn/ui** | 🌈 UI Design (optional) |

---

## 📁 Project Structure

```bash
/app
  /login
    page.tsx         # Login page
  /signup
    page.tsx         # Signup page
  /dashboard
    page.tsx         # Protected dashboard (WIP)

/utils
  supabaseClient.ts  # Supabase client initialization
```

---

## 🗃️ Supabase Database Schema

### profiles Table

> User information will be automatically inserted into this table upon registration

```sql
id          UUID (Primary Key, references auth.users.id)
username    TEXT
email       TEXT
created_at  TIMESTAMP
```

### Trigger: `handle_new_user`

Automatically copies metadata from `auth.users` to `profiles` table upon new user signup.

---

## 🔐 Auth Logic

- Signup: `username` stored in `user_metadata` → Trigger inserts into `profiles`
- Login: Redirects to `/dashboard`
- Auth state managed via Supabase SDK (`createClientComponentClient`)

---

## 🛠 Development & Deployment

### Local Development

```bash
git clone <your-repo-url>
cd your-project
npm install
```

Set environment variables in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Start development server:

```bash
npm run dev
```

### Deployment

Recommended: [Vercel](https://vercel.com/)

- GitHub integration
- Supports environment variables
- Optimized for App Router and Edge Functions

---

## ✅ Next Steps

- [ ] Build `/dashboard` to display user info
- [ ] Add `middleware.ts` for route protection
- [ ] Use `onAuthStateChange()` to track auth state
- [ ] Integrate Stripe subscriptions
- [ ] Add user profile edit page
- [ ] Improve UI/UX with shadcn/ui or Tailwind CSS

---

## 📄 License

MIT License
