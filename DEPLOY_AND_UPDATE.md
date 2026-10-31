# YAB Ghana website: Netlify deployment and content changes

This archive is ready to deploy: `index.html` is at the ZIP root. You can place the unzipped files in the root of your GitHub repository and connect it to Netlify. Build command: leave blank. Publish directory: `.` (repository root).

**Board profiles:** `board.html` provides the visible cards; `js/site.js` contains full biographies in the `members` array. Keep the display names identical in both places. After editing, commit to GitHub and Netlify will redeploy automatically.

**Images:** Seven supplied images are stored in `assets/img/`. Davis Effah Kaufmann’s image on `board.html` is currently referenced directly from the official Lead For Ghana team website, with a fallback. To make the site fully self-contained, replace it with an approved local image file and change the `src` to `assets/img/davis.webp`. The remaining placeholders for Dina, Stephen and Confidence should be replaced only with verified individual photos.

**Verification:** See `BOARD_PROFILE_RESEARCH_NOTES.md` for the identity/role checks and supporting public sources. All external profile links are displayed when a member’s full biography is opened. Names and committee assignments should receive a final administrative check before official launch.

**Contact form:** Netlify Forms will function once the site is deployed with form processing enabled in the Netlify project; test a submission on the live site. This local website ZIP does not include a database or a CMS dashboard.

**Privacy:** This site does not publish internal finance documents, bank details, or private contact information. The member-supplied biographies and original photos are used with Board-authorised permission.

## Latest three-profile update (31 October 2026)
The Board page has verified LinkedIn links and expanded biographies for Dina Mintah, Stephen Opoku Yeboah and Confidence Mawusi. Content is stored in `board.html` (member cards) and `js/site.js` (`members` array, full biographies and source links). Remember to update **both** when editing a member.

The photograph for Confidence is an external image from UEW, with a fallback. Dina and Stephen have initials until local images can be supplied. Upload e.g. `assets/img/dina.webp` or `assets/img/stephen.webp`, then edit the `<div class="person-photo">` in their card to use `<img ... src="assets/img/dina.webp">`.
