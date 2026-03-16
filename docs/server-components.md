# Server Components Coding Standards

## Async Server Components

All Server Component page files must be `async` functions. This allows direct use of `await` for data fetching and parameter access.

```tsx
export default async function MyPage() {
  // ...
}
```

## Accessing Params and SearchParams — MUST Be Awaited

This project uses **Next.js 15+**, where `params` and `searchParams` are **Promises**. They MUST be awaited before accessing any values.

- Do NOT destructure `params` or `searchParams` directly from the props without awaiting
- Always `await` the `params`/`searchParams` prop before reading its properties
- Always type `params` and `searchParams` as `Promise<...>`

### Correct usage

```tsx
interface MyPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string }>;
}

export default async function MyPage({ params, searchParams }: MyPageProps) {
  const { id } = await params;
  const { q } = await searchParams;

  // ...
}
```

### Wrong usage

```tsx
// WRONG — params is a Promise in Next.js 15+, not a plain object
export default async function MyPage({ params }: { params: { id: string } }) {
  const { id } = params; // ❌ not awaited
}
```

## Data Fetching in Server Components

All data fetching must happen inside Server Components by calling helper functions from the `/data` directory. See `docs/data-fetching.md` for full rules.

```tsx
import { getWorkoutById } from "@/data/workouts";

export default async function WorkoutPage({ params }: WorkoutPageProps) {
  const { workoutId } = await params;
  const workout = await getWorkoutById(Number(workoutId));
  // ...
}
```

## Handling Not Found

Use Next.js's built-in `notFound()` function from `next/navigation` when a resource does not exist or the user is not authorized to view it.

```tsx
import { notFound } from "next/navigation";

export default async function WorkoutPage({ params }: WorkoutPageProps) {
  const { workoutId } = await params;
  const id = Number(workoutId);

  if (isNaN(id)) {
    notFound();
  }

  const workout = await getWorkoutById(id);

  if (!workout) {
    notFound();
  }

  return <div>{workout.name}</div>;
}
```

## Client Components in Server Component Pages

When a page needs interactivity (forms, state, event handlers), split it into:

- A **Server Component** page that fetches data and passes it as props
- A **Client Component** (marked `"use client"`) that handles the interactive UI

Colocate client components in a `_components/` directory next to the page:

```
app/
  dashboard/
    workout/
      [workoutId]/
        page.tsx                        <- server component, fetches data
        actions.ts                      <- server actions
        _components/
          EditWorkoutForm.tsx           <- "use client" interactive form
```

The Server Component page fetches data and passes it down:

```tsx
// page.tsx (Server Component)
import EditWorkoutForm from "./_components/EditWorkoutForm";
import { getWorkoutById } from "@/data/workouts";

export default async function EditWorkoutPage({ params }: EditWorkoutPageProps) {
  const { workoutId } = await params;
  const workout = await getWorkoutById(Number(workoutId));

  if (!workout) notFound();

  return <EditWorkoutForm workoutId={workout.id} defaultName={workout.name ?? ""} />;
}
```
