# Deploying `jack-zj-liu.github.io`

## To Test Locally

```sh
npm run dev
```

## Deploy to GitHub Pages (gh-pages branch)

**One-time:** In the repo on GitHub, go to **Settings** → **Pages**. Set **Source** to **Deploy from a branch**, branch **gh-pages**, folder **/ (root)**. Save.

After making edits, commit and push your code to `main` (or `master`), then deploy the built site to the `gh-pages` branch:

```sh
git add .
git commit -m "Your commit message here"
git push
npm run deploy
```

`npm run deploy` runs `npm run build` and then pushes the contents of `dist` to the `gh-pages` branch. GitHub Pages will deploy from that branch automatically.

**Why not `git subtree push`?**  
`git subtree push --prefix dist` only works if `dist` is committed to the repo. Vite projects usually have `dist` in `.gitignore`, so the subtree is empty and the push does nothing. The `gh-pages` package pushes the built `dist` folder from your machine to the `gh-pages` branch instead.
