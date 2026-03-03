# Jack's Portfolio (Next.js + TypeScript)

## To Test Locally

```sh
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to GitHub Pages

**One-time:** In the repo on GitHub, go to **Settings** → **Pages**. Set **Source** to **GitHub Actions**.

Deployment is automatic. When you push to `main` (or `master`), the workflow runs `next build` (static export), uploads the `out` folder, and deploys.

```sh
git add .
git commit -m "Your commit message"
git push
```

---

## Optional: Manual deploy (gh-pages branch)

If you switch **Settings** → **Pages** to **Deploy from a branch** and choose **gh-pages**, you can deploy manually:

```sh
npm run build
npm run deploy
```

`npm run deploy` pushes the `out` directory to the `gh-pages` branch.
