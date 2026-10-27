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

## Make it yours

You don't need to be a developer to fork this. I'm not one. Most of my changes
were made by describing what I wanted to an AI coding agent and reviewing what
it did.

### Try it without code

Every combination has its own link, so you can share a look before you change
anything. For example:

```
https://ascii-3dforms-playground.vercel.app/?model=skull&color=lime-cream&background=black
```

Models: `bust`, `dancer`, `starfish`, `rose`, `helmet`, `orchid`, `fish`,
`skull`, `teapot`, `ladybug`. Colors: `medium-slate-blue`, `mauve-magic`,
`mauve`, `cyan-glow`, `lime-cream`. Backgrounds: `white`, `black`.

### Swap in your own model

1. Find a `.glb` model you're allowed to redistribute. On Sketchfab, filter
   search results to downloadable models with a CC0 or CC BY license, and keep
   the file small (a few MB at most) so it loads quickly on phones.
2. Put the file in `public/models`.
3. Register it in `app/components/AsciiScene.tsx`. It goes in four places:
   the `ModelKey` type, `MODEL_OPTIONS` (the label in the menu), `MODELS`
   (file path, size and position), and the `useGLTF.preload` list at the
   bottom.
4. Add its source and license to `MODEL_CREDITS.md`.

If you're using Claude Code, this prompt covers steps 2 to 4:

```
I've added public/models/my-model.glb. Register it as a new model called
"My model" in app/components/AsciiScene.tsx (type, menu option, MODELS entry
and preload), start it at a similar size to the bust, run the dev server, and
tell me what to adjust if it looks too big, too small or off-center.
```

Then tune `target` (how big it renders) and `y` (how high it sits) in its
`MODELS` entry until it looks right. `orient` rotates it if it loads sideways.

### Change the colors

Glyph colors live in `COLOR_OPTIONS` in `app/components/Artifact.tsx`. Replace
the hex values with your own brand colors and the swatches update with them.

### Use it as a hero on your own site

The scene itself is `app/components/AsciiScene.tsx` plus the shader in
`app/components/ascii/`. To move it into another Next.js site, ask Claude Code
to copy those files across, install the same three.js packages, and render the
scene behind your headline with one fixed model and color. Keep a static image
fallback for browsers without WebGL, and keep the reduced-motion handling in
`app/hooks/usePrefersReducedMotion.ts` so the animation stops for people who
turn motion off.

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
