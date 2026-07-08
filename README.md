# ASCII 3D forms playground

A standalone portfolio artifact for experimenting with interactive 3D models
rendered as ASCII. Switch the model, color, background, or randomize the whole
scene.

## Features

- Interactive GLB models rendered through a custom ASCII postprocessing shader
- Drag-to-rotate and optional auto-spin
- Model, glyph color, and black/white background controls
- Randomize button for quick combinations
- URL state for shareable configurations
- Responsive layout for desktop, tablet, and mobile

## Stack

- Next.js App Router
- React and TypeScript
- Three.js
- React Three Fiber
- React Three Drei
- Postprocessing

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deployment

This project is ready for Vercel's default Next.js flow.

1. Push the repo to GitHub.
2. Import the repo in Vercel.
3. Keep the default build command: `npm run build`.
4. Keep the default output handling for Next.js.

## Add Models

1. Add optimized `.glb` files to `public/models`.
2. Register each model in `app/components/AsciiScene.tsx`.
3. Add the source and license details to `MODEL_CREDITS.md`.

For public forks, keep model files reasonably small. Large GLBs can slow down
first interaction, especially on mobile.

## Credits

This project was inspired by Egor Shesternin's tutorial,
[How to Add a Cool ASCII Animated Hero Section to Your Website: Step-by-Step Guide](https://medium.com/@egorshesternin/how-to-add-a-cool-ascii-animated-hero-section-to-your-website-step-by-step-guide-d4070e45e2c8),
and the accompanying GitHub repo,
[egorshest/webgl-ascii-hero](https://github.com/egorshest/webgl-ascii-hero).

The implementation here has been adapted into a standalone portfolio playground
with multiple models, theming, randomization, responsive layout, and a custom
control surface.

## Model Licenses

The bundled GLB model assets are CC0 assets sourced from Sketchfab. See
`MODEL_CREDITS.md` for the model list and source-link checklist.

## License

The code is released under the MIT License. The bundled model assets are CC0.
