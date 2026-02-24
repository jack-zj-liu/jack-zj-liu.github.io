# Deploying `jack-zj-liu.github.io`

## To Test Locally

```sh
npm run dev
```

## Deploy to GitHub Pages

**One-time:** In the repo on GitHub, go to **Settings** → **Pages**. Set **Source** to **GitHub Actions**.

After that, deployment is automatic. When you push to `main` (or `master`), the workflow builds the site and deploys it. No need to run anything else.

```sh
git add .
git commit -m "Your commit message"
git push
```
