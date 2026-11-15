# Kai Plunkett — GitHub Pages portfolio starter

A responsive, multi-section portfolio built in plain **HTML, CSS and JavaScript**, with a dedicated case study. No frameworks, subscriptions or build steps required.

## Publish it on GitHub Pages

1. In the **KaiPlunkett** account, create a **public** repo named **`kaiplunkett.github.io`** (GitHub treats the username as case-insensitive).
2. Upload **the contents of this folder**, not the containing `kai-portfolio-starter` folder, to the root of the repository. Commit to `main`.
3. Go to **Settings → Pages → Build and deployment**, choose **Deploy from a branch**. Select `main` and `/(root)`, then save.
4. Wait for the deployment to finish and visit **`https://kaiplunkett.github.io/`**. This URL is a target URL, not a live site verified during creation.
5. Check every button, audio player and link on desktop and mobile.

## Publish the game as a separate project site

The existing `twine-campus-life-the-case-of-the-missing-locket` repository already contains `index.html` and `resources/`.

1. In **that** repository, navigate to **Settings → Pages** and select `main` / `/(root)` as the publishing source.
2. Once deployed, verify the game URL is `https://kaiplunkett.github.io/twine-campus-life-the-case-of-the-missing-locket/`.
3. Test it on another device and browser. **Make sure its image and audio references are relative to the game location**, e.g. `resources/image.webp`, rather than local machine paths or root-relative `/resources/image.webp`. Check names and capitalisation match exactly.
4. The original README contains tutor evaluation and mentions broken external image paths. Replace that README's lead with a concise *project overview*, setup instructions, screenshots, Kai's individual contribution, tools and credits; the academic evaluation can be archived under documentation if he wants to retain it.
5. Remove the "Setup reminder" paragraph on `projects/campus-life.html` when the demo is verified.

## Where are the artefacts?

- **Game**: project site hosted from the game repository; linked from the portfolio case study.
- **Music**: four embedded MP3 previews pointing to existing files in `custom-created-music-tracks` (using the `raw.githubusercontent.com` URL), including the level success and level failure cues.
- **Sound effects**: three M4A previews pointing to existing files in `sound-effects-library` (using the raw file URL).
- **Header branding**: the site header now uses Kai's GitHub avatar (`https://github.com/KaiPlunkett.png`) as the top-left brand icon.
- **Personal statement**: the About section now opens a Safari-compatible modal styled like the rest of the website. It fetches the **latest** `README.md` from `KaiPlunkett/personal-statement` on `main` whenever opened (rather than embedding a copy), formats headings, paragraphs, lists and basic emphasis safely, and links to the source if the fetch fails. The trigger is a real button, not an external link; with JavaScript disabled, a separate fallback GitHub link appears.
- **CV**: no direct link on the website; the Contact section asks visitors to email Kai to request a copy.

The audio links are real paths based on the repository filenames, **but runtime playback has not been verified**. For reliable media playback, copy selected files to `assets/audio/`, change each `<source src="...">` to the local path, then test Safari, Firefox and Chrome. Converting preview files to optimised MP3 may be helpful for compatibility. Keep the source repositories as the authoritative complete libraries and link to them from each media section. Do not upload huge uncompressed masters to the portfolio.

## Improve the site before showing it to universities or employers

- Replace the styled mock game art on the homepage and case study with **actual gameplay captures**. Use 16:9 WEBP thumbnails (where suitable) and descriptive alt text.
- Add a **30–60 second gameplay video** and a **short game-audio showreel** once produced. YouTube/Vimeo embeds reduce hosting bandwidth.
- Rewrite the case study's placeholder reflection **in Kai's own words**. Make it clear what he personally made, especially if it was a group project. The README was used as an information source, not treated as independent evidence of all claims.
- The CV link has been removed from the homepage, but the existing public CV repository may still be discoverable directly through GitHub. If the CV is intended to be shared only on request, review its repository visibility. Add a suitable contact email to the website before publishing; no email address has been assumed or added. Never publicly expose a home address or personal phone number.
- Verify copyright permissions for music, samples, game screenshots and external assets; credit teammates and sources appropriately.
- If targeting **Audio Programmer** roles, add a future project showing a small audio system in Unity/Unreal with FMOD or Wwise, an annotated code snippet and a short video. Don't claim those skills until demonstrated.
- Edit `index.html`, `projects/campus-life.html`, and `assets/css/styles.css` to personalise copy, layout and colour.
- Add appropriate accessible focus styles, subtitles/captions on video, and user-controlled audio (this starter has no auto-play).

## Files

```text
index.html                 Main landing page
projects/campus-life.html  Twine game case study
assets/css/styles.css      Responsive visual theme
assets/js/main.js          Filter controls + copyright year + GitHub README modal
.nojekyll                  Prevent unintended Jekyll processing
```

## Sources

- GitHub profile: https://github.com/KaiPlunkett
- GitHub Pages guide: https://docs.github.com/en/pages/quickstart
- GitHub Pages project/user sites: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages

## Live personal statement pop-up

- Clicking **Read personal statement** in **About Me** opens the matching dark-themed dialog and fetches `https://raw.githubusercontent.com/KaiPlunkett/personal-statement/main/README.md` in the browser.
- Changes committed to that README on `main` become visible the next time the pop-up opens; the portfolio itself does not need a new deployment.
- The README must remain publicly accessible. If the repository, branch, or filename changes, update `statementSource` in `assets/js/main.js` and the source links in `index.html`.
- The modal supports keyboard focus trapping, Escape and backdrop-click to close, and restoring focus to the opener. The overlay does not rely on native Safari `<dialog>.showModal()` support. Its contents are created with safe DOM text nodes, not raw HTML injection.
- GitHub may temporarily rate-limit or fail; the modal displays an error message with a link to the original README. A network connection is needed to load the content.
- For local preview, use a local web server rather than opening `file://` directly; test the remote README in Safari as well as Chrome.

## V5: Safari modal and hero artwork cleanup

- Replaced the external `Read personal statement` hyperlink with a `<button type="button">`. Safari can no longer navigate to the README when that control is clicked. The original GitHub link remains in the modal footer for manual use.
- Replaced the native `<dialog>` dependency with a matching fixed-position accessible overlay that works without browser-specific `showModal()` support. Background scrolling stops while open; the modal supports Escape, backdrop click, focus trapping and focus restoration.
- Fetches the current public `README.md` live from GitHub; if the raw source is inaccessible, it attempts the GitHub REST API. The text is rendered safely without injecting GitHub Markdown as HTML.
- Changed stylesheet and script URL references to `?v=5` on both pages, which helps Safari refresh its cached code after deployment.
- Removed `01 / 04`, `MAKE IT INTERACTIVE` and the arrow caption below the hero audio waveform, preserving the waveform artwork and the text at its top. The waveform is made with HTML/CSS, not a separate raster image.
- **To install:** Replace the contents of the Pages repository with everything from this ZIP's root (do not nest in a new directory), commit changes, and allow GitHub Pages to deploy. In Safari use **Option–Command–R** to reload without cache if an earlier version persists.

## V6: waveform caption / caching verification

The original minimalist homepage is unchanged, except for stronger protection against
older, cached versions of the waveform caption. `index.html` contains no caption
markup or text (`01 / 04`, `MAKE IT INTERACTIVE` or the bottom-right arrow).
`styles.css` additionally hides any old `.art-caption` element if a browser loads
a mismatched older HTML file. Assets now use `?v=6` to refresh Safari's cache.
The Safari-compatible Personal Statement modal has **not** been changed.

**Important:** Downloading or opening the new ZIP does not update files already
published to GitHub Pages. Extract and upload its **contents** into the root of
the portfolio GitHub Pages repository, replacing all files, and commit. If the
text is still visible, use Safari View Source (`Option` + `Command` + `U`) and
search for `MAKE IT INTERACTIVE` and `styles.css?v=6`. If the caption is in View
Source or `v=6` is missing, the browser is opening an old page or the wrong
published location. Check your GitHub Pages publishing branch and folder.
Try a private browsing window or a forced reload after redeploying.
