# Authentication Coding Standards

## Provider: Clerk

**This app uses [Clerk](https://clerk.com/) for all authentication.**

- Do NOT use NextAuth, Auth.js, Supabase Auth, or any other auth library
- Do NOT implement custom authentication logic
- Do NOT store passwords or manage sessions manually
- All auth must go through Clerk's SDK and APIs exclusively

## Installation

Clerk is configured via the `@clerk/nextjs` package:

```bash
npm install @clerk/nextjs
```

## Environment Variables

The following environment variables must be set:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

Do NOT hardcode these values anywhere in the codebase.

## Middleware

Route protection is handled via Clerk middleware in `middleware.ts` at the project root:

```ts
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

- Public routes (sign-in, sign-up, landing page) must be explicitly listed in the matcher
- All other routes are protected by default

## Getting the Current User

### In Server Components and `/data` helper functions

Use `auth()` from `@clerk/nextjs/server`:

```ts
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();

if (!userId) {
  throw new Error("Unauthorized");
}
```

### In Client Components

Use the `useAuth` or `useUser` hooks from `@clerk/nextjs`:

```tsx
"use client";
import { useUser } from "@clerk/nextjs";

export function ProfileButton() {
  const { user } = useUser();
  return <span>{user?.firstName}</span>;
}
```

- Do NOT use `useUser` or `useAuth` in Server Components
- Do NOT call `auth()` in Client Components

## Sign In / Sign Up Pages

Use Clerk's hosted or embedded components. Do NOT build custom sign-in/sign-up forms.

```tsx
// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return <SignIn />;
}
```

```tsx
// app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return <SignUp />;
}
```

## User ID in Data Queries

When querying user-specific data, always resolve the authenticated `userId` via `auth()` inside the `/data` helper function. Never trust a `userId` passed from URL params or form data without verifying it matches the session.

See `docs/data-fetching.md` for full data authorization rules.

## ClerkProvider

The root layout must wrap the app in `<ClerkProvider>`:

```tsx
// app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```
