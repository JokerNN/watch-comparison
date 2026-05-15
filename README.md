# watch-comparison

This project is configured for static deployment with **GitHub Pages**.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## GitHub Pages deployment

Deployment is automated with a GitHub Actions workflow at `.github/workflows/deploy.yml`.

1. Push to the `main` branch.
2. In GitHub repo settings, go to **Settings → Pages**.
3. Set **Source** to **GitHub Actions**.
4. Wait for the workflow **Deploy to GitHub Pages** to complete.

The site will be published at:

`https://<your-username>.github.io/watch-comparison/`
