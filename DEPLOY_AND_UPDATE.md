# YAB Ghana website: final About and Board update (31 October 2026)

## What is included

- Expanded `about.html`: institutional history, Board composition, mission, vision, three principles, governance, leadership portraits, four programme priorities, partner relationships and an activity timeline.
- `board.html`: eleven locally hosted, member-identified photographs and eleven existing detailed biographies. LinkedIn profiles remain available where confirmed.
- `css/site.css`: image framing that constrains photographs to their cards on desktop and mobile, plus responsive About layouts. Originals are unchanged and retained.
- `assets/img/`: member-supplied photographs for Dina, Stephen, Confidence and Davis.
- `assets/img/portraits/`: standardised, carefully fitted display copies of all eleven portraits, with consistent fitted crops that keep faces and subjects inside the frames. The original member images are retained in `assets/img/`.

## RStudio: update the deployed site

**Important: The GitHub repository is already linked to Netlify.** Do not create another repository or Netlify project.

1. Open your existing `YAB_Ghana_Website.Rproj` in RStudio.
2. Download this ZIP and keep its location available. It contains the site's website files at the ZIP root.
3. Run the separate `YAB_RStudio_Update.R` script supplied alongside the ZIP or copy its code into the RStudio Console. The script requires you to select the ZIP and overwrites *only* website files present in the ZIP, preserving `.git`, `.gitignore`, the `.Rproj` file and any untracked local files.
4. Preview `about.html` and `board.html` in a browser; check all eleven photos, the mobile view and biographies.
5. When satisfied, commit and push to `main`: GitHub → Netlify will automatically publish the changes.

## Notes

- The names of the four newly provided photographs are taken from the captions and ordering in the user-supplied `additional pictures.docx` file.
- The current website is static. It does not yet offer an online content-management dashboard.
- The live contact form requires a real test submission to verify Netlify Forms.
- The external photography image hosts are no longer needed on the Board page; all eleven images are local.
- The original institutional photograph remains in the About page; the new leadership portraits are also local.
- Names, committee titles and roles should be reviewed periodically by the Board as responsibilities evolve.
