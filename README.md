# Nashwin Mendonca Portfolio

A personal portfolio website built with plain HTML, CSS and JavaScript. It has no server, no Node.js and no build step, so it can be hosted for free on GitHub Pages.

## What's in this folder

- `index.html`: the whole page. Text, links and image captions are edited here.
- `css/styles.css`: the compiled stylesheet (Tailwind CSS, already built).
- `js/main.js`: animations, the image viewer and the light/dark theme switch.
- `assets/images/`: the photos used on the page.
- `Nashwin Portfolio.pdf`: the PDF behind the "Download PDF" button.
- `favicon.svg`: the icon shown in the browser tab.

## Host it on GitHub Pages

1. On github.com, create a new **public** repository (for example `portfolio`).
2. Unzip this file, then drag everything inside the folder onto the repository's **Add file → Upload files** page. Click **Commit changes**.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to **Deploy from a branch**, set **Branch** to **main** and the folder to **/ (root)**, then click **Save**.
5. After a minute or two the site is live at `https://<your-username>.github.io/<repository-name>/`.

If the repository is named `<your-username>.github.io`, the site is live at `https://<your-username>.github.io/` instead.

## Making changes

Open `index.html` in any text editor, make your edits, save, and upload the changed file to the repository. Text, links and images need no rebuild. Styling comes from the precompiled stylesheet, so new Tailwind class names will not take effect until the stylesheet is rebuilt.
