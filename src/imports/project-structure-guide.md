Do NOT migrate the project to Next.js.

Keep the current stack exactly as it is:
- Vite
- React
- React Router

I do NOT want a framework migration.

The goal is ONLY to improve the project structure and organize the code better.

Please keep the current application working and do not break the existing functionality.

What I want:

1. Keep Vite and React Router.
2. Reorganize the code into a clearer architecture using folders like:

src/
  features/
  components/
  lib/
  types/
  api/

3. Move business logic out of large files and split it into feature modules.

For example:

features/
  orders/
  tables/
  menu/
  reservations/
  staff/
  subscription/

components/
  ui/
  layout/

lib/
  supabase/
  telegram/
  utils/

types/
  order.ts
  user.ts
  shop.ts

The goal is to keep the same functionality but make the project easier to scale and maintain.

Please reorganize gradually and do not introduce breaking changes.
