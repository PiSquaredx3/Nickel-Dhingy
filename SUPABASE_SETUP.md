# Supabase setup

The site is static and can stay on GitHub Pages. Supabase provides email/password accounts and stores the boards, topics, and replies.

1. Create a Supabase project.
2. In the Supabase SQL Editor, run [`supabase/schema.sql`](./supabase/schema.sql). It creates general classic-PC, retro-console, and modern-game boards, account profiles, topics, replies, and row-level security policies. It does not add sample posts or members. Re-run it on an existing project to update the seeded board names and remove the unused board-description column.
3. In **Project Settings → API**, copy the Project URL and the **anon / publishable** key into [`supabase-config.js`](./supabase-config.js):

   ```js
   export const supabaseUrl = "https://YOUR_PROJECT.supabase.co";
   export const supabaseAnonKey = "YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY";
   ```

   Never put a `service_role` or secret key in this website.
4. In **Authentication → URL Configuration**, set the Site URL to the published site URL and add that URL to the allowed redirect URLs. For local testing, add `http://localhost:8000/**` as well.
5. In **Authentication → Providers → Email**, choose whether new members must confirm their email. With confirmation enabled, sign-up sends a confirmation email before the member can log in.
6. Publish the site, then register an account and create a topic to verify the setup.

The public key is expected to be visible in a static website. Row-level security in the SQL schema restricts writes to signed-in members and ties each topic and reply to its author. Public visitors can read boards, topics, replies, and forum usernames. Email addresses are not exposed.
