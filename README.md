# Deploying `jack-zj-liu.github.io`  

## Building the `/dist` Directory  
After making edits, build the `/dist` directory by running:  

```sh
npm run build
```

## Deploying to GitHub Pages  
To commit and push changes, follow these steps:  

```sh
git add .
git commit -m "Your commit message here"
git push
```

Then, push the `dist` directory to the `gh-pages` branch:  

```sh
git subtree push --prefix dist origin gh-pages
```
