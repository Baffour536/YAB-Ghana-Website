# YAB Ghana official website, three-level administration release

**Read first:** `docs/ADMIN_DEPLOYMENT_AND_ACCESS.md` (delivered separately in the ZIP for reference, not deployed publicly).

This update is built from the site ZIP provided on 31 October 2026 and preserves the user-replaced `assets/img/lit-speaker.webp`. It retains existing pages, Board photographs and historical updates, and introduces invite-only role-controlled editing with Netlify Identity, Functions and Blobs.

The site remains at https://yab-ghana.netlify.app/ and the editor will be at https://yab-ghana.netlify.app/admin/ **after Netlify deploys**.

This ZIP contains no Git history, no RStudio private state and no passwords. The Netlify owner must enable Identity, choose Invite only, invite each editor and set `yab_superadmin`, `yab_secretary` or `yab_media`. The user whose role is changed must sign out and sign in again before the new role takes effect.

The technical guide includes RStudio Console commands. Don't upload any private research archives to the GitHub repository.
