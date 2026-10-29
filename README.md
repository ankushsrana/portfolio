# Ankush Rana, portfolio

A Figma-canvas style portfolio. Plain HTML, CSS and JavaScript: no build step, no frameworks, no external services. Fonts, icons and images all live in this repo.

## Publish on GitHub Pages

1. Create a repository (for a root URL, name it `YOUR-USERNAME.github.io`).
2. Upload everything in this folder, keeping the structure exactly as is:
   ```
   index.html
   style.css
   script.js
   assets/
     favicon.svg
     fonts/
     img/
       projects/
   ```
3. Go to **Settings → Pages**, set **Source** to *Deploy from a branch*, choose `main` and `/ (root)`, then **Save**.
4. After a minute or two the site is live at `https://YOUR-USERNAME.github.io/` (or `/REPO-NAME/` for any other repo name).

## After it's live

- **LinkedIn previews:** in `index.html`, change `og:image` to the full URL, for example `https://YOUR-USERNAME.github.io/assets/img/og-cover.jpg`. Then paste your link into the [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) to refresh the preview.

## Easy edits

| What | Where |
| --- | --- |
| Pet names | `index.html`, search for `chief-napping-officer` and `head-of-brand` |
| Sticky note numbers and positions | `index.html`, the `.sticky` blocks (`--x`, `--y` and `--r` set position and tilt) |
| Email, LinkedIn, book links | `index.html`, plus the three constants at the top of `script.js` |
| Colours | `style.css`, the `:root` block at the top |
| Real book cover | Add `assets/img/book-cover.webp` and swap the `.book__cover` contents for an `<img>` |
| Real event photos | Replace any file in `assets/img/projects/` with your own (keep the same name, ideally 1600 × 1000) |

To convert new photos to WebP, any free converter works (for example squoosh.app).

## Keyboard shortcuts on the site

`V` intro, `J` journey, `L` channels, `F` projects, `H` experience, `P` author, `O` off duty, `C` contact, `Ctrl/⌘ K` or `/` command menu.

## Credits

- Typefaces: Bricolage Grotesque and Newsreader, SIL Open Font License (licences in `assets/fonts/`)
- Icons: Phosphor Icons, MIT licence
- Project background art generated for this site
