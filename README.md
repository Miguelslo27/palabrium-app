# 📚 Palabrium

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)

[![Tests](https://img.shields.io/badge/tests-502%20passing-brightgreen?style=flat-square)](https://github.com/Miguelslo27/palabrium-app)
[![Coverage](https://img.shields.io/badge/coverage-83%25-yellow?style=flat-square)](https://github.com/Miguelslo27/palabrium-app)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

**A modern storytelling platform where writers create, share, and engage with readers.**

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Testing](#-testing)

</div>

---

## ✨ Features

### 📝 Story Management
- **Create & Publish Stories** — Write multi-chapter stories with a rich editor
- **Draft Mode** — Save work-in-progress before publishing
- **Chapter Organization** — Organize content into sequential chapters

### 👥 User Engagement
- **Bravo System** — Readers can applaud stories they enjoy
- **Comments** — Threaded discussions on stories and chapters
- **User Profiles** — Personalized author pages with story listings

### 🔐 Authentication
- **Clerk Integration** — Secure SSO authentication
- **User Management** — Sign up, sign in, and profile management
- **Webhook Sync** — Real-time user data synchronization

### 🧪 Quality Assurance
- **502 Automated Tests** — Unit + Integration test coverage
- **Pre-push Validation** — Automated linting, testing, and build checks
- **CI/CD Ready** — GitHub Actions compatible

---

## 🛠 Tech Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes, MongoDB + Mongoose, Zod, Server Actions |
| **Auth** | Clerk, Svix (webhooks), SSO Support |
| **Testing** | Jest, React Testing Library, MongoDB Memory Server |
| **DX** | Husky, ESLint, pnpm |

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (REST endpoints)
│   ├── stories/           # Stories listing page
│   ├── story/             # Individual story pages
│   ├── sign-in/           # Auth pages
│   └── sign-up/
├── components/            # React components
│   ├── Common/            # Shared UI components
│   ├── Stories/           # Story list components
│   ├── Story/             # Story detail components
│   └── Editor/            # Rich text editor
├── lib/                   # Utilities & helpers
├── models/                # Mongoose schemas
└── types/                 # TypeScript definitions
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- MongoDB (local or Atlas)
- Clerk account (for auth)

### Installation

```bash
# Clone the repository
git clone https://github.com/Miguelslo27/palabrium-app.git
cd palabrium-app

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/palabrium

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run unit tests (434 tests) |
| `pnpm test:integration` | Run integration tests (68 tests) |
| `pnpm test:coverage:all` | Run all tests with coverage |
| `pnpm validate` | Lint + Build (pre-push check) |

---

## 🧪 Testing

This project has comprehensive test coverage:

| Suite | Tests | Coverage |
|-------|-------|----------|
| Unit Tests | 434 | Components, hooks, utilities |
| Integration Tests | 68 | API routes with MongoDB Memory Server |
| **Total** | **502** | ~83% overall |

```bash
# Run all tests
pnpm test:all

# Run with coverage report
pnpm test:coverage:all

# Watch mode for development
pnpm test:watch
```

### Pre-push Hooks

Every `git push` automatically runs:
1. ✅ ESLint validation
2. ✅ All tests (502)
3. ✅ Production build check

---

## 🏗 Architecture Highlights

### React Server Components (RSC)
The app leverages Next.js 15's RSC for optimal performance:
- Server-side data fetching
- Reduced client bundle size
- SEO-friendly rendering

### API Design
RESTful API routes with:
- Zod schema validation
- Proper error handling
- MongoDB transactions where needed

### State Management
- React Context for global UI state
- Server state via React Query patterns
- Form state with controlled components

---

## 📚 Documentation

- [Testing Plan](TESTING_PLAN.md) — Testing strategy & guidelines
- [Integration Tests Summary](INTEGRATION_TESTS_SUMMARY.md) — API test coverage
- [RSC Migration Plan](RSC_MIGRATION_PLAN.md) — Server Components architecture
- [Refactoring Summary](REFACTORING_SUMMARY.md) — Code quality improvements

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ using Next.js 15**

[⬆ Back to top](#-palabrium)

</div>
