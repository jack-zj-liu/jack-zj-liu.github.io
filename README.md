# Deploying `jack-zj-liu.github.io`  

## To Test Locally
Run the following command:  

```sh
npm run dev
```

## Build the `/dist` Directory and Deploy to GitHub Pages  
After making edits, build the `/dist` directory by running:  

```sh
npm run build
```

To commit and push changes, follow these steps:  

```sh
git add *
git commit -m "Your commit message here"
git push
```

Then, push the `dist` directory to the `gh-pages` branch:  

```sh
git subtree push --prefix dist origin gh-pages
```
