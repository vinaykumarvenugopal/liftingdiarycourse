# Routing Coding Standards

## Route Structure

All application routes must be nested under `/dashboard`:

```
/dashboard          → main dashboard page
/dashboard/[...]    → all sub-pages
```

There are no public-facing application pages. The root `/` route should redirect to `/dashboard`.

## Protected Routes

All `/dashboard` routes are protected and only accessible by authenticated users.

Route protection is implemented via **Next.js Middleware** (`src/middleware.ts`), NOT via per-page checks or layout-level redirects.

### Middleware Rules

- The middleware must run on `/dashboard` and all sub-paths (`/dashboard/:path*`)
- If the user is not authenticated, redirect them to the sign-in page
- If the user is authenticated, allow the request to proceed

### Example Middleware

```ts
// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const isAuthenticated = // check session/token from cookies or headers

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

## Rules

- Do NOT protect routes inside page components or layouts — use middleware only
- Do NOT create application pages outside of `/dashboard`
- All new features must be added as sub-routes under `/dashboard`
- Route segments must use kebab-case (e.g., `/dashboard/my-workouts`)
- Dynamic segments must use descriptive names (e.g., `[workoutId]`, not `[id]`)
