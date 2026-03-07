# AutoSycn

## Overview

Internal SaaS combining **Trello-style kanban**, **design brief/submission** (VistaCreate-like), and **Canva-style dashboards**.

**Stack:** Next.js (App Router), TypeScript, PostgreSQL, Prisma, TanStack Query, dnd-kit, Tailwind + shadcn/ui, NextAuth, S3-compatible storage, DB + polling for notifications.

---

## 1. Project Folder Structure

```
my-app/
├── app/
│   ├── (auth)/                      # Auth route group (login, register)
│   │   ├── layout.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── error/
│   │       └── page.tsx
│   │
│   ├── (dashboard)/                 # Protected app (all roles)
│   │   ├── layout.tsx               # Sidebar + header + providers
│   │   ├── page.tsx                 # Role-based landing
│   │   ├── boards/
│   │   │   ├── page.tsx             # Board list
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [boardId]/
│   │   │       ├── page.tsx        # Kanban board view
│   │   │       ├── settings/
│   │   │       │   └── page.tsx
│   │   │       └── invite/
│   │   │           └── page.tsx
│   │   ├── tasks/
│   │   │   └── [taskId]/
│   │   │       └── page.tsx        # Task detail + submissions
│   │   ├── submissions/            # Designer submission history (optional list)
│   │   ├── points/                 # Designer points & history
│   │   ├── payments/               # Finance: verify & mark completed
│   │   ├── analytics/              # Director dashboards
│   │   └── settings/               # User/account settings
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── boards/
│   │   │   ├── route.ts            # GET list, POST create
│   │   │   └── [boardId]/
│   │   │       ├── route.ts
│   │   │       ├── columns/
│   │   │       │   └── route.ts
│   │   │       ├── members/
│   │   │       │   └── route.ts
│   │   │       └── invite/
│   │   │           └── route.ts
│   │   ├── columns/
│   │   │   └── [columnId]/
│   │   │       └── route.ts        # PATCH reorder, rename; DELETE
│   │   ├── cards/
│   │   │   ├── route.ts
│   │   │   └── [cardId]/
│   │   │       ├── route.ts
│   │   │       ├── move/
│   │   │       │   └── route.ts
│   │   │       └── submissions/
│   │   │           └── route.ts
│   │   ├── submissions/
│   │   │   └── [submissionId]/
│   │   │       ├── route.ts        # approve / request revision
│   │   │       └── revisions/
│   │   │           └── route.ts
│   │   ├── notifications/
│   │   │   ├── route.ts            # GET list, PATCH read
│   │   │   └── poll/
│   │   │       └── route.ts
│   │   ├── points/
│   │   │   └── route.ts            # Designer points summary
│   │   ├── payments/
│   │   │   ├── route.ts
│   │   │   └── [paymentId]/
│   │   │       └── route.ts
│   │   └── upload/
│   │       └── route.ts            # S3 presigned or upload
│   │
│   ├── layout.tsx                  # Root layout, fonts, metadata
│   ├── page.tsx                    # Public landing or redirect
│   └── globals.css
│
├── components/
│   ├── ui/                         # shadcn/ui components
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── notification-bell.tsx
│   │   └── dashboard-shell.tsx
│   ├── kanban/
│   │   ├── board.tsx               # dnd-kit DndContext + columns
│   │   ├── column.tsx
│   │   ├── card.tsx
│   │   ├── column-header.tsx
│   │   └── use-kanban-mutations.ts
│   ├── forms/
│   │   ├── board-form.tsx
│   │   ├── column-form.tsx
│   │   ├── card-form.tsx
│   │   ├── invite-form.tsx
│   │   └── submission-form.tsx
│   ├── dashboard/
│   │   ├── director-dashboard.tsx
│   │   ├── designer-stats.tsx
│   │   └── finance-payments-table.tsx
│   └── shared/
│       ├── role-guard.tsx
│       ├── empty-state.tsx
│       └── loading-skeleton.tsx
│
├── lib/
│   ├── auth.ts                     # NextAuth config, getSession, role helpers
│   ├── db.ts                       # Prisma singleton
│   ├── s3.ts                       # S3 client / presigned URLs
│   ├── permissions.ts              # Board/card permission checks
│   └── utils.ts
│
├── hooks/
│   ├── use-notifications.ts        # Polling + TanStack Query
│   ├── use-board.ts
│   ├── use-columns.ts
│   └── use-cards.ts
│
├── services/                       # Server-side business logic (used by API & actions)
│   ├── board.service.ts
│   ├── column.service.ts
│   ├── card.service.ts
│   ├── submission.service.ts
│   ├── notification.service.ts
│   ├── points.service.ts
│   └── payment.service.ts
│
├── actions/                        # Optional: server actions for forms
│   ├── board.actions.ts
│   ├── card.actions.ts
│   └── notification.actions.ts
│
├── types/
│   ├── index.ts                    # Re-exports
│   ├── api.ts                      # API request/response shapes
│   ├── auth.ts
│   └── models.ts                   # Domain types (align with Prisma)
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── docs/
│   └── ARCHITECTURE.md             # This file
│
├── public/
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 2. Data Model & Relationships (Summary)

| Entity               | Purpose                                                                   |
| -------------------- | ------------------------------------------------------------------------- |
| **User**             | Auth + global role (admin, project_manager, designer, finance, director). |
| **Board**            | Workspace; has many columns, board_members.                               |
| **BoardMember**      | userId, boardId, role (owner, editor, viewer).                            |
| **Column**           | Belongs to board; has position; has many cards.                           |
| **Card**             | Task; belongs to column; has position; assignee (designer).               |
| **CardComment**      | Comment on a card.                                                        |
| **CardAttachment**   | File ref (S3 key) on card.                                                |
| **DesignSubmission** | One per card submission; status: pending, approved, revision_requested.   |
| **SubmissionFile**   | File(s) for a submission (S3 keys).                                       |
| **Revision**         | Revision request on a submission; designer responds with new submission.  |
| **DesignerPoints**   | Ledger: approved design → points (e.g. +5).                               |
| **Payment**          | Period (e.g. month), designer, total points, amount, verified, completed. |
| **Notification**     | userId, type, title, message, link, isRead, createdAt.                    |

Relationships (high level):

- **User** ↔ **Board**: many-to-many via **BoardMember**.
- **Board** → **Column** (one-to-many, ordered by position).
- **Column** → **Card** (one-to-many, ordered by position).
- **Card** → **DesignSubmission** (one-to-many; “current” = latest or by status).
- **DesignSubmission** → **SubmissionFile**, **Revision**.
- **User** (designer) → **DesignerPoints** (accumulated from approved submissions).
- **Payment** references User (designer) and optional period; finance marks verified/completed.
- **Notification** → User (one-to-many).

---

## 3. Authentication

- **NextAuth** with Credentials and/or OAuth (e.g. Google).
- **User** table: id, email, name, image, role (enum: admin, project_manager, designer, finance, director), emailVerified, etc.
- Session: include `user.id`, `user.role` for RBAC.
- Middleware: protect `/(dashboard)/*` and `/api/*` (except auth); redirect unauthenticated to `/login`.
- **lib/auth.ts**: `getServerSession()`, helpers like `requireRole(['admin'])`, `requireBoardRole(boardId, ['owner','editor'])` (using BoardMember).

---

## 4. Base UI Layout

- **app/layout.tsx**: HTML shell, fonts, `<body>`, no sidebar.
- **app/(dashboard)/layout.tsx**:
  - Wraps with **SessionProvider** (NextAuth) and **QueryClientProvider** (TanStack Query).
  - Renders **DashboardShell**: sidebar (nav by role) + main area with **Header** (title, notification bell, user menu).
- **Sidebar**: Links to Boards, Tasks, Points (designer), Payments (finance), Analytics (director), Settings; admin section for user management.
- **Notification bell**: dropdown with list from `/api/notifications` + poll; unread badge; each item links to `link`.

---

## 5. Board & Kanban System

- **Boards**: CRUD via API (or server actions). List at `/boards`, create at `/boards/new`, view at `/boards/[boardId]`.
- **Columns**: CRUD + reorder. **dnd-kit**: sortable list of columns; each column is a droppable container.
- **Cards**: CRUD + move between columns + reorder within column. **dnd-kit**: cards are draggable; columns are droppable; on drop, call API to move card (update columnId + position) and invalidate TanStack Query cache for optimistic UX.
- **Permissions**: Only users with board role **owner** or **editor** can create/rename/delete columns and create/edit/move/delete cards; **viewer** read-only. PM/Admin can manage boards they own or are invited to (by board_members).

---

## 6. Conventions

- **API routes**: Return JSON; use services for business logic; validate with Zod; check auth and permissions in route handlers.
- **TanStack Query**: Keys like `['boards']`, `['board', boardId]`, `['board', boardId, 'columns']`, `['cards', cardId]`; use mutations with `onMutate`/`onError` for optimistic updates where applicable.
- **Server actions**: Optional; use for simple form posts (e.g. invite, comment) and call services; revalidate or invalidate queries as needed.
- **Types**: Keep `types/models.ts` aligned with Prisma; use for API responses and client.
- **Env**: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, S3 vars (`S3_BUCKET`, `S3_REGION`, etc.).

---

## 7. Next Steps (Implementation Order)

1. **Prisma schema** — all models and relations.
2. **Auth** — NextAuth config, User model, middleware, login/register pages.
3. **Base UI** — dashboard layout, sidebar, header, notification bell (mock data).
4. **Board CRUD** — API + services, board list and create.
5. **Kanban** — columns and cards with dnd-kit, move/reorder APIs.
6. Invite system, then design workflow, points, payments, notifications, dashboards.

This document is the single source of truth for folder structure and high-level design. Implement in the order above, one slice at a time.
