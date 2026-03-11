# UI Coding Standards

## Component Library

**Only shadcn/ui components must be used throughout this project.**

- Do NOT create custom UI components
- Do NOT use other component libraries (MUI, Chakra, Ant Design, etc.)
- Do NOT build bespoke styled elements when a shadcn/ui component exists
- All UI must be composed exclusively from shadcn/ui primitives

If a needed component is not yet installed, add it via:

```bash
npx shadcn@latest add <component-name>
```

## Date Formatting

All date formatting must use [date-fns](https://date-fns.org/).

Dates must be displayed in the following format:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

Use the `do MMM yyyy` format token with `date-fns/format`:

```ts
import { format } from "date-fns";

format(new Date("2025-09-01"), "do MMM yyyy"); // "1st Sep 2025"
format(new Date("2025-08-02"), "do MMM yyyy"); // "2nd Aug 2025"
```

Do NOT use `toLocaleDateString`, `Intl.DateTimeFormat`, or any other date formatting approach.
