# Data Fetching

## CRITICAL: Server Components Only

**ALL data fetching MUST be done exclusively via Server Components.**

- **DO NOT** fetch data in route handlers (`/app/api/`)
- **DO NOT** fetch data in client components (`"use client"`)
- **DO NOT** use `useEffect` + `fetch` patterns
- **DO NOT** use SWR, React Query, or any client-side data fetching libraries
- **ONLY** fetch data in Server Components by calling helper functions from the `/data` directory

This is a hard rule. There are no exceptions.

## Database Queries via `/data` Directory

All database queries must be implemented as helper functions inside the `/data` directory.

- **DO NOT** write raw SQL anywhere in the codebase
- **ALWAYS** use Drizzle ORM for all database queries
- Each file in `/data` should group related queries (e.g., `data/workouts.ts`, `data/exercises.ts`)
- Helper functions are called directly from Server Components

### Example structure

```
/data
  workouts.ts
  exercises.ts
  sets.ts
```

### Example helper function

```ts
// data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getWorkoutsForUser(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

### Example Server Component usage

```tsx
// app/dashboard/page.tsx
import { getWorkoutsForUser } from "@/data/workouts";
import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();
  const workouts = await getWorkoutsForUser(session.user.id);

  return <div>{/* render workouts */}</div>;
}
```

## Data Authorization — Users Can Only Access Their Own Data

**This is a security requirement, not a suggestion.**

Every helper function in `/data` that queries user-specific data MUST scope the query to the authenticated user's ID. A logged-in user must NEVER be able to access another user's data.

Rules:
- Always obtain the authenticated user's ID inside the helper function, or require it as a parameter and validate it comes from the session in the calling Server Component
- Always include a `WHERE userId = :currentUserId` condition (via Drizzle ORM) on every query for user-owned data
- Never accept a `userId` from user input (URL params, form data, etc.) without verifying it matches the session user
- Never return rows that belong to a different user, even if the caller passes an arbitrary ID

### Example — enforcing ownership

```ts
// data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

export async function getWorkoutsForCurrentUser() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, session.user.id));
}
```

The session is resolved inside the helper, so callers cannot accidentally pass the wrong user ID.
