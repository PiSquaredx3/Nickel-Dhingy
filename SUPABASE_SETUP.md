# Supabase setup

The site is static and can stay on GitHub Pages. Supabase provides email/password accounts and stores the boards, topics, and replies.

1. Create a Supabase project.
2. In the Supabase SQL Editor, run [`supabase/schema.sql`](./supabase/schema.sql). It creates game and community boards, account profiles, topics, replies, image buckets, post voting and medal awards, moderator pinning permissions, and row-level security policies. It does not add sample posts or members. The existing account with forum name `pi_` is granted moderator status when the SQL runs; make sure that account exists first. Re-run the script on an existing project to apply updates.
3. In **Project Settings → API**, copy the Project URL and the **anon / publishable** key into [`supabase-config.js`](./supabase-config.js):

   ```js
   export const supabaseUrl = "https://YOUR_PROJECT.supabase.co";
   export const supabaseAnonKey = "YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY";
   ```

   Never put a `service_role` or secret key in this website.
4. In **Authentication → URL Configuration**, set the Site URL to the published site URL and add the published site URL (including its path, if applicable) to the allowed redirect URLs. For local testing, add `http://localhost:8000/**` as well. Password-reset emails return to the current page, where the user can choose a new password.
5. In **Authentication → Providers → Email**, choose whether new members must confirm their email. With confirmation enabled, sign-up sends a confirmation email before the member can log in.
6. Publish the site, then register an account and create a topic to verify the setup. Signed-in members can attach a JPG, GIF, WebP, or PNG image (up to 2 MB) to a new topic. They can also click their account name to add a profile picture URL or upload a JPG, GIF, WebP, or PNG (up to 2 MB), signature, and optional link; these appear alongside their messages. Moderators can pin or unpin topics from a board; pinned topics appear above unpinned topics. Signed-in members can vote once on each topic or reply that they did not write, with a limit of 3 votes per UTC calendar day. The schema starts a one-time 14-day voting grace period when first applied: all accounts can vote during the grace period, and accounts created during it remain eligible while they are younger than 14 days. Afterward, new accounts must be at least 14 days old. Re-running the schema does not restart the grace period. Ten community votes award the post's author Bronze; a moderator vote awards Bronze and Silver, and a vote from `pi_` awards Gold. Awards accumulate per qualifying post and are shown in the author's medal case and beside their posts. Votes cannot be edited or removed, and medal progress cannot be changed by users. Moderators can delete topics and replies.

The public key is expected to be visible in a static website. Row-level security in the SQL schema restricts writes to signed-in members and ties each topic and reply to its author. Public visitors can read boards, topics, replies, and forum usernames. Email addresses are not exposed.
