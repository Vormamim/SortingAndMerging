# Arrays, Lists & Sorting — Desk Check Site

A static, dependency-free site (plain HTML/CSS/JS) for desk-checking Bubble, Selection,
Insertion and Merge sort, plus a theory comparison of arrays vs lists.

Each algorithm page includes:

- the variables/data structures and control structures it uses
- a flowchart and matching pseudocode
- a Python implementation
- an interactive desk check: type or randomise an array, step through it, and watch a
  trace table fill in exactly like a paper desk check

## Running locally

No build step — just open [index.html](index.html) directly in a browser, or serve the
folder with any static file server, e.g.:

```
python -m http.server 8000
```

then visit `http://localhost:8000`.

## Deploying to GitHub Pages

1. Push this repository to GitHub.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to "Deploy from a branch".
4. Set **Branch** to `main` and the folder to `/ (root)`, then **Save**.
5. GitHub will publish the site at `https://<username>.github.io/<repo-name>/` within a
   few minutes.

## Structure

```
index.html               Home page: theory overview + navigation
arrays-vs-lists.html     Arrays vs Lists theory comparison
sorts/
  bubble-sort.html
  selection-sort.html
  insertion-sort.html
  merge-sort.html
css/styles.css            Shared styling (light/dark aware)
js/visualizer.js          Shared desk-check engine (renders array, controls, trace table)
js/algorithms/*.js        One step-generator per algorithm, each mirroring its page's Python code
```
