# YAB Ghana website, 31 October 2026: deployment notes

This ZIP contains deployable website files at its root. It is NOT a copy of every YAB file from Drive. The separately provided private audit contains a linked discovery catalogue and publication controls.

## Review highlights
- Founding year 2024; 2025 Values Handbook pilots; 2026 education engagements.
- Two verified adult-training images from the YAB 2025 southern-belt gallery and existing 2026 gallery assets.
- All eleven member portraits remain local to the site. The image card containment rules have been reinforced.
- Private finance, unreleased minutes, school-learner records and draft internal proposals have not been included.

## RStudio import into the existing website project
```r
stopifnot(dir.exists('.git'), file.exists('index.html'))
zip_file <- file.choose()
unzip(zip_file, exdir=getwd(), overwrite=TRUE)
system('git status')
# Inspect locally before committing
browseURL(paste0('file:///', normalizePath('about.html', winslash='/')))
browseURL(paste0('file:///', normalizePath('gallery.html', winslash='/')))
# Commit only after review
system('git add -A')
system('git commit -m "Deep YAB Drive review: 2024 to 2026 history and photos"')
system('git push origin main')
```

Check the updated HTML on mobile and desktop after Netlify deploys. Existing Git history and settings are preserved; do not unzip a second project inside your existing project.
