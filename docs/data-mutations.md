# Data Mutations Coding Standards

## CRITICAL: Server Actions Only

**ALL data mutations MUST be done exclusively via Server Actions.**

- Do NOT mutate data in route handlers (`/app/api/`)
- Do NOT mutate data directly in Client or Server Components
- Do NOT use `fetch` with POST/PUT/DELETE from the client
- ONLY mutate data through Server Actions defined in colocated `actions.ts` files

This is a hard rule. There are no exceptions.

## Server Action File Conventions

Server Actions must be defined in colocated `actions.ts` files, placed alongside the route or component that uses them:

```
app/
  dashboard/
    actions.ts       <- server actions for the dashboard route
    page.tsx
  workouts/
    [id]/
      actions.ts     <- server actions for the workout detail route
      page.tsx
```

- Do NOT define Server Actions inside page or component files
- Do NOT create a single global `actions.ts` file for unrelated mutations
- Each `actions.ts` must include `"use server"` at the top of the file

```ts
// app/dashboard/actions.ts
"use server";
```

## Typed Parameters — No FormData

All Server Action parameters MUST be explicitly typed with TypeScript types or interfaces.

- Do NOT use `FormData` as a parameter type
- Do NOT use untyped or `any` parameters
- Define a dedicated input type or derive it from the Zod schema

```ts
// CORRECT
export async function createWorkout(input: CreateWorkoutInput) { ... }

// WRONG
export async function createWorkout(formData: FormData) { ... }
export async function createWorkout(data: any) { ... }
```

## Validation with Zod

**ALL Server Actions MUST validate their arguments using Zod before doing anything else.**

- Do NOT trust input from the client without parsing it through a Zod schema first
- Define the Zod schema at the top of the `actions.ts` file, or in a colocated `schemas.ts` file
- Use `schema.parse()` (throws on failure) or `schema.safeParse()` (returns a result object)
- Derive the TypeScript input type from the schema using `z.infer`

```ts
// app/workouts/actions.ts
"use server";

import { z } from "zod";

const createWorkoutSchema = z.object({
  title: z.string().min(1),
  date: z.string().date(),
  type: z.enum(["strength", "cardio", "flexibility"]),
});

type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

export async function createWorkout(input: CreateWorkoutInput) {
  const validated = createWorkoutSchema.parse(input);
  await insertWorkout(validated);
}
```

## Data Mutations via `/data` Helper Functions

All database mutation calls MUST be wrapped in helper functions inside the `/data` directory.

- Do NOT write raw Drizzle ORM calls directly inside Server Actions
- Do NOT write raw SQL anywhere in the codebase
- ALWAYS use Drizzle ORM for all database mutations
- Helper functions in `/data` handle the actual `db.insert()`, `db.update()`, `db.delete()` calls

```
/data
  workouts.ts    <- insert, update, delete helpers for workouts
  exercises.ts
  sets.ts
```

### Example `/data` mutation helper

```ts
// data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function insertWorkout(input: {
  title: string;
  date: string;
  type: string;
}) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  await db.insert(workouts).values({
    ...input,
    userId,
  });
}

export async function deleteWorkout(workoutId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  await db
    .delete(workouts)
    .where(eq(workouts.id, workoutId) && eq(workouts.userId, userId));
}
```

### Example Server Action calling a `/data` helper

```ts
// app/workouts/actions.ts
"use server";

import { z } from "zod";
import { insertWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  title: z.string().min(1),
  date: z.string().date(),
  type: z.enum(["strength", "cardio", "flexibility"]),
});

type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

export async function createWorkout(input: CreateWorkoutInput) {
  const validated = createWorkoutSchema.parse(input);
  await insertWorkout(validated);
}
```

## Data Authorization

Every `/data` mutation helper MUST scope the operation to the authenticated user.

- Always resolve `userId` via `auth()` from Clerk inside the helper function
- Always include a `WHERE userId = :currentUserId` condition on updates and deletes
- Never allow a user to mutate data that belongs to another user

See `docs/auth.md` for Clerk usage and `docs/data-fetching.md` for the full authorization rules.

## No Redirects in Server Actions

**Do NOT call `redirect()` inside Server Actions.**

- Server Actions must return data or throw errors — they must not redirect
- After a Server Action resolves on the client, use `router.push()` or `router.replace()` to navigate

```ts
// WRONG
export async function createWorkout(input: CreateWorkoutInput) {
  await insertWorkout(input);
  redirect("/dashboard"); // ❌ do not do this
}

// CORRECT
export async function createWorkout(input: CreateWorkoutInput) {
  await insertWorkout(input); // ✅ just return, no redirect
}
```

```tsx
// In the Client Component:
await createWorkout(input);
router.push("/dashboard"); // ✅ redirect happens client-side
```
