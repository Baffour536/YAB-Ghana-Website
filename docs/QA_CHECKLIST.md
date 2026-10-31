# YAB public and administrative QA checklist

- [ ] GitHub deploy from `main` succeeds on Netlify with `npm run build`, `dist` publish directory and generated Functions.
- [ ] All public pages (home, about, board, programmes, values, updates, gallery, resources, contact) render.
- [ ] Existing 11 Board member images display and remain inside cards on mobile.
- [ ] Replaced `assets/img/lit-speaker.webp` remains identical to user's uploaded version.
- [ ] `/admin/` displays login form, no signup option.
- [ ] Identity invite-only registration is enabled.
- [ ] Correct role strings assigned to invited users; sign out / sign in after changes.
- [ ] Level 3 creates a draft but cannot publish.
- [ ] Level 2 can review / return but cannot publish.
- [ ] Level 1 can publish and archive, update Board biographies and view audit history.
- [ ] New news story appears on `/updates.html` and on its `/story.html?id=...` page.
- [ ] Approved gallery image appears after publication; unapproved image returns 403 to visitors.
- [ ] Edits to published articles use draft revision, with original remaining visible until replacement is approved.
- [ ] Contact form submission is tested on the deployed Netlify site.
- [ ] Source documents and confidential notes are excluded from the published `dist/` directory.
