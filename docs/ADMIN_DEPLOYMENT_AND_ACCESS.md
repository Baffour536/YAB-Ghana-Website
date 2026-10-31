# YAB Ghana | Final administration deployment and access setup

## What this release provides

A secure three-level editorial workflow for the existing public YAB site. The updated website uses Netlify Identity for invite-only sign-in, Netlify Functions for enforced role checks, and Netlify Blobs for drafts, published records, images and editorial action records. The existing static pages and eleven portraits are retained. The image `assets/img/lit-speaker.webp` is preserved exactly from the ZIP uploaded on 31 October 2026.

**This ZIP contains the implementation, not pre-created live accounts.** For security, administrator accounts cannot be activated without taking the following actions within the YAB Netlify project. No passwords, identity tokens or account credentials are included.

## Step 1. Update the existing RStudio Project

1. Download the file `YAB_Ghana_FINAL_ADMIN_3_LEVELS_2026.zip`.
2. Open your existing RStudio Project named `YAB_Ghana_Website`.
3. In the RStudio Console, run:

```r
stopifnot(dir.exists('.git'), file.exists('index.html'))
old_picture <- unname(tools::md5sum('assets/img/lit-speaker.webp'))
zip_file <- file.choose()
unzip(zip_file, exdir = getwd(), overwrite = TRUE)
new_picture <- unname(tools::md5sum('assets/img/lit-speaker.webp'))
stopifnot(identical(old_picture, new_picture)) # Same user-supplied replacement
system('git status')
```

The ZIP has files at its root. Do not extract it into a new nested folder and do not unzip the confidential archives into the public project.

4. Review the changes and publish from the Console:

```r
system('git add -A')
system('git commit -m "Add secure YAB three-level editorial administration"')
system('git push origin main')
system('git status')
```

Netlify must show **Published** for the new commit before proceeding. The new build uses `npm run build` with Node 22 and publishes the generated `dist` directory. Netlify automatically installs npm dependencies from `package.json` during its Git-based build.

## Step 2. Enable Netlify Identity

In Netlify, select the existing project **yab-ghana**, then **Identity**, then **Enable Identity**. Under **Identity > Registration > Registration preferences**, choose **Invite only**. This is mandatory: no public self-registration. Leave the website itself Public. Identity users are not automatically Netlify team members.

Site administration URL: `https://yab-ghana.netlify.app/admin/`

## Step 3. Invite the approved editorial users

Go to **Identity > Users > Invite users**. Send individual invitations to approved Board-controlled email addresses. The invitation acceptance link should take the recipient to the public domain and then to `/admin/`, where they choose their own secure password. Do **not** reuse or share accounts.

Assign **exactly one** of the following role strings in each user's **Identity > Users > selected user > Edit settings > Roles** field:

| Level | People | Identity role string |
|---|---|---|
| 1 | Chairperson and Deputy Chairperson | `yab_superadmin` |
| 2 | Secretary | `yab_secretary` |
| 3 | Authorised Social Media Team members | `yab_media` |

Role changes take effect at the next login or token refresh, **not immediately**. Ask a newly assigned user to sign out and sign back in. No user will be recognised as an editor until a Netlify site owner assigns an editorial role.

The owner of the Netlify project remains the **technical account administrator** responsible for account invitation, role assignment and operational security. Level 1 users have the highest *editorial* authority; they are not automatically granted access to the Netlify project’s billing or deployment credentials. This separation protects YAB.

## Step 4. Test the complete approval chain on Netlify

1. A Level 3 member signs in at `/admin/`, creates a **News / activity report**, saves as draft, then **Submits to Secretary**.
2. A Level 2 Secretary opens the entry, reviews it and selects **Mark as reviewed** (or **Return for corrections**).
3. A Level 1 leader opens the reviewed entry and selects **Approve & publish**.
4. The new article appears on `/updates.html`, as a recent approved item on `/index.html`, and as a full article at `/story.html?id=...`.
5. For gallery uploads, select a JPG, PNG or WebP image under 2 MB and confirm permission and safeguarding; the image remains unpublished until the story or gallery item is approved.
6. Level 1 can create new Board biography or institutional page updates. Published Board revisions override the on-page summary and full biography modal.
7. To change a published item, click **Create new draft revision**, edit and pass it through review again. The published version stays live until the replacement is approved.
8. Verify a Level 3 user cannot approve, publish or edit Board profiles; verify the website remains publicly viewable when signed out.

## What can be updated through the dashboard

- News / activity reports and announcements
- Gallery photographs and captions
- Programmes and official resources
- Board member biographies (Level 1)
- Additional institutionally approved notes on About, Programmes, Values and Resources (Level 1)

The *existing static page structure and navigation* remain under RStudio/GitHub technical control. The admin dashboard adds approved content and updates individual Board biographies; it is not a full visual website builder. Some structural redesigns still require code changes and GitHub deployment.

## Security and limitations

- All permission checks are performed by server functions; hiding buttons does not grant access.
- Authentication and role assignments are controlled by Netlify Identity. Use **Invite only**.
- Published CMS content lives in Netlify Blobs. Editorial publication does **not** make a Git commit and does **not** trigger a Netlify site rebuild.
- Site-wide Blobs persist across redeployments. Keep backups using Netlify's Blobs interface. Do not use Deploy Previews to experiment with live production content, since site-wide stores are shared across deploys.
- App-maintained action history is available to Level 1. Netlify's separate Identity sign-in audit log requires a higher plan.
- Publishing student images requires appropriate permission and safeguarding review. Do not publish private Board records, unreleased minutes, contact details or personal banking information.
- Do not assume the new system works until Netlify's build and all three roles pass live tests. Identity does **not** run under `netlify dev`.
- Because the repository is public, never store passwords, personal access tokens or private materials in the site directory.

## Troubleshooting

- **Build failed**: Open **Netlify > Deploys > failed deploy > Deploy log**. Check Node 22 and npm dependency installation. The repository includes `package.json` and `scripts/build-admin.mjs`.
- **No invitation email**: Check `Identity > Users`, invite-only settings and spam folder.
- **Signed in, access denied**: Set the exact Identity role and sign out/sign in. Never use Netlify team role names instead of Identity roles.
- **Admin page loads, no results**: Check Netlify Functions logs for `cms`, `public-content` or `media`. The data store is empty until editors create content; that is normal.
- **A photograph fails**: Convert HEIC files to JPG or WebP. Uploaded files must be <= 2 MB. Preview only becomes public after an approved item references it.

## Verification references

Netlify Identity: https://docs.netlify.com/manage/security/secure-access-to-sites/identity/get-started/

Identity user roles: https://docs.netlify.com/manage/security/secure-access-to-sites/identity/manage-existing-users/

Netlify Functions: https://docs.netlify.com/build/functions/api/

Netlify Blobs: https://docs.netlify.com/build/data-and-storage/netlify-blobs/
