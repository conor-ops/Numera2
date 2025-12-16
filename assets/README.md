# Numera App Assets

Use this folder with `@capacitor/assets` to generate platform icons and splash screens.

Required source files:
- logo.png — 1024x1024, transparent background, square, centered
- splash.png — 2732x2732, solid background, centered logo, ample safe-area margins

Guidelines:
- Keep important content within the center-safe area (roughly 1200x1200) for splash.
- Avoid text on the splash image; device cutouts can clip.
- Use brand colors consistent with `APP_CONFIG.branding`.

Generate platform assets:
```
npx capacitor-assets generate
```

Common issues:
- If images change, re-run the generator.
- Ensure filenames and extensions match exactly: `assets/logo.png`, `assets/splash.png`.
- For Android/iOS build steps, run `npm run build` then `npx cap sync` before opening IDEs.
