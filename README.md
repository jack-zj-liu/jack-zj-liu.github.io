# Deploying `jack-zj-liu.github.io`

## To Test Locally

```sh
npm run dev
```

## Deploy with GitHub Actions (recommended)

A workflow deploys the site when you push to `main` or `master`.

1. **Use GitHub Actions as the Pages source** (one-time setup)  
   - Repo **Settings** → **Pages**  
   - Under **Build and deployment**, set **Source** to **GitHub Actions**.

2. **Push to trigger a deployment**

   ```sh
   git add .
   git commit -m "Your commit message"
   git push
   ```

   The workflow builds the app and deploys the `dist` folder. Check the **Actions** tab for status.

If the workflow doesn’t run or the deployment fails, confirm:
- **Settings** → **Pages** → **Source** is **GitHub Actions** (not “Deploy from a branch”).
- Your default branch is `main` or `master` (the workflow triggers on those).

---

## Manual deploy (optional)

Build and push the built site to the `gh-pages` branch yourself:

```sh
npm run build
git add .
git commit -m "Your commit message"
git push
git subtree push --prefix dist origin gh-pages
```

If you use this method, set **Settings** → **Pages** → **Source** to **Deploy from a branch** and choose the `gh-pages` branch. You can’t use both “GitHub Actions” and “Deploy from a branch” at the same time for the same repo.
