# WEBSITE WORLDS

An explorable atlas of **39 distinct animated visual worlds**: a cinematic gallery/portal plus 39 directly linkable, full-viewport, interactive scenes. Each world has its own art direction, typography, geometry, layout and motion. Every visual is drawn procedurally with CSS, SVG and Canvas from code in this repository.

- Repository: `gazhenko/website-worlds`
- GitHub Pages base path: `/website-worlds/` (expected URL: `https://gazhenko.github.io/website-worlds/`)
- Deep links: `…/website-worlds/#/world/<id>`, e.g. `#/world/synthwave`

All names, places, products and copy in the worlds are fictional demo content.

## Local commands

Requires Node 22.

```sh
npm ci             # install the committed dependency lockfile
npm run dev        # Vite dev server → http://localhost:5173/website-worlds/
npm test           # Node's built-in test runner (node --test), no browser needed
npm run build      # production build into dist/
npm run preview    # serve dist/ → http://localhost:4173/website-worlds/
```

## Using the site

- **Gallery** (`#/`): hero portal, search box and family filter chips. The search/filter state is kept in the URL (`#/?q=neon&family=retro`) so filtered views are shareable. Each card has representative scene art (an original SVG thumbnail) that animates only while hovered or focused.
- **World pages** (`#/world/<id>`): a slim HUD with *Atlas* (back to the gallery, restoring your filter), *previous* / *next* (wrapping 39 → 1), a permalink counter (`07/39`), *Pause motion* and *Copy link*.
- **Keyboard**: `[` and `]` step to the previous/next world. Interactive canvases (Pixel Art, Particles, Wireframe 3D, Gradient mesh, Glassmorphism's lens) are focusable and take arrow keys; their hint is in their accessible name.
- **Pause motion**: one global control stops every CSS animation/transition and every JavaScript animation loop. The state is visible in the DOM as `html[data-motion="paused"]` and `#app[data-motion="paused"]`, the button label switches between *Pause motion* and *Resume motion*, and the choice is remembered (localStorage).
- **Unknown routes** show an "uncharted" page with links back to the atlas. Label-style slugs and aliases redirect to the canonical id, e.g. `#/world/ascil-art` → `#/world/ascii-art`, `#/world/Neo%20Brutalism` → `#/world/neo-brutalism`.

## The 39 worlds

Every world renders exactly one `<h1>` with its exact manifest label, a caption (`.ww-caption`), at least one `<button type="button" data-world-action="…">` that visibly changes the scene (also while motion is paused), and a `role="status"` indicator (`[data-world-status]`) describing the current state.

> **Label note:** the manifest's literal label `ASCIl art` (with a lowercase **L**) is kept verbatim everywhere it is displayed. It is interpreted as ASCII character art; its route id is `ascii-art`, with `ascil-art` kept as an alias.

### Claymorphism
`#/world/claymorphism` — A soft-touch interface kneaded from pastel clay: puffy cards, squishy switches and bouncing blobs that squash and stretch. Swap the clay colour, inflate the controls and drop pebbles into the tray.
- **Clay colour** (`palette`) — Switches between Bubblegum, Mint and Blueberry clay.
- **Extra puffy** (`puff`) — Inflates every clay surface with deeper, softer shadows.
- **Drop a pebble** (`pebble`) — Drops a squishy pebble into the tray; the eighth press empties it.

### Cybercore
`#/world/cybercore` — The inside of a living machine: a pulsing reactor core wired into circuit traces, biomechanical telemetry and a heartbeat waveform. Change the core mode, reroute the traces or run a diagnostic scan.
- **Core mode** (`mode`) — Cycles Idle, Sync and Overclock — pulse rate, ring speed and colour change.
- **Reroute traces** (`reroute`) — Regenerates the circuit traces from a new seed.
- **Diagnostic scan** (`scan`) — Shows labelled callouts and a sweeping scan across the core.

### Neo-Brutalism
`#/world/neo-brutalism` — Raw blocks, thick black outlines and hard shadows. Drop chunky blocks into the pit and watch them crunch into a stack, shake the pile, or slam a rubber stamp across the poster.
- **Drop block** (`drop`) — Drops a labelled block into the pit, where it lands and stacks.
- **Shake pile** (`shake`) — Kicks the whole pile into the air so it re-stacks.
- **Stamp it** (`stamp`) — Slams the next rubber stamp across the header.

### Scrapbook
`#/world/scrapbook` — A collage of torn paper, washi tape, polaroids and ticket stubs pinned to kraft card. Flip the handwritten note, reshuffle the scraps or change the tape.
- **Flip note** (`flip`) — Turns the index card over to read the other side.
- **Reshuffle** (`shuffle`) — Re-arranges the angle, offset and stacking of every scrap.
- **Change tape** (`tape`) — Switches the washi tape between dots, stripes and grid.

### Surrealism
`#/world/surrealism` — A dream plain where a door hangs in the sky, a staircase climbs into an enormous moon and fish drift through the air. Open the door, swap the scale of things or switch gravity off.
- **Open the door** (`door`) — Opens the floating door onto a daylight sky; fish swim out.
- **Swap scale** (`scale`) — Shrinks the moon to a pebble and grows the chair into a monument.
- **Gravity** (`gravity`) — Turns gravity off so islands, chair and lamp float upwards.

### Y2K Aesthetic
`#/world/y2k-aesthetic` — Millennium optimism in chrome and translucent candy plastic: a bubbly media player, a rainbow disc and liquid-metal stars. Spin the disc, change the player skin and scatter sparkles.
- **Play disc** (`spin`) — Starts or stops the disc, equaliser and progress bar.
- **Player skin** (`skin`) — Cycles Bubblegum, Ice and Lime skins.
- **Sparkle** (`sparkle`) — Scatters a burst of four-point sparkles around the player.

### Pixel Art
`#/world/pixel-art` — A crisp fantasy-console scene drawn on an integer pixel grid: a tiny adventurer hops after coins below a hilltop castle. Jump, change the time of day and spawn bonus coins.
- **Jump** (`jump`) — Makes the adventurer jump (also Space or ↑ when the screen is focused).
- **Time of day** (`time`) — Cycles Day, Dusk and Night palettes.
- **Bonus coins** (`coins`) — Spawns three extra coins to collect.

### Synthwave
`#/world/synthwave` — An endless outrun drive into a striped sunset, with a neon grid rolling under a lone coupe. Shift between cruise and overdrive, change the sky palette and move the sun.
- **Gear** (`speed`) — Switches between Cruise and Overdrive grid speed.
- **Sky palette** (`palette`) — Cycles Sunset, Midnight and Lagoon skies.
- **Sun position** (`sun`) — Raises or lowers the sun on the horizon.

### Glassmorphism
`#/world/glassmorphism` — Frosted, refractive glass panels floating over slow rivers of colour, with a lens you can drag to magnify what lies beneath. Adjust the frost, tint the light and move the lens.
- **Frost** (`frost`) — Cycles Clear, Frosted and Opal blur strengths.
- **Tint** (`tint`) — Changes the colour rivers behind the glass.
- **Move lens** (`lens`) — Moves the magnifying lens to its next spot (or drag it, or use arrow keys).

### Neumorphism
`#/world/neumorphism` — A calm climate console sculpted from one soft surface, lit by a light source that slowly circles the room. Nudge the temperature, press the dial in, fix the light or switch to night.
- **Cooler** (`cooler`) — Lowers the set temperature by half a degree.
- **Warmer** (`warmer`) — Raises the set temperature by half a degree.
- **Press dial** (`press`) — Toggles the dial between raised and pressed-in.
- **Light source** (`light`) — Switches between an orbiting light and a fixed top-left light.
- **Night surface** (`theme`) — Switches the whole surface between day and night.

### Bento Grid
`#/world/bento-grid` — A modular lunchbox of live tiles — clock, weather, chart, route map and more — each with its own small animation. Reshuffle the layout, feature a different tile or flip the theme.
- **Reshuffle** (`shuffle`) — Rearranges tile order and spans with a smooth reflow.
- **Feature tile** (`feature`) — Enlarges the next tile into the featured slot.
- **Theme** (`theme`) — Flips between light and dark trays.

### Editorial Design
`#/world/editorial-design` — A magazine spread with masthead, headline, deck, drop cap, pull quote and an illustrated figure, revealed in a measured reading rhythm. Turn to the next story, change the column count or show the baseline grid.
- **Next story** (`story`) — Turns to the next of three fictional features.
- **Columns** (`columns`) — Cycles the body text through one, two and three columns.
- **Baseline grid** (`grid`) — Overlays the baseline grid the type sits on.

### Swiss Design
`#/world/swiss-design` — An asymmetric poster built on a strict twelve-column grid: red circle, black bars and flush-left grotesque type moving only along the modules. Recompose it, reveal the grid or invert the ground.
- **Recompose** (`compose`) — Moves every element to the next composition on the grid.
- **Show grid** (`grid`) — Reveals the twelve-column, eight-row module grid.
- **Invert ground** (`invert`) — Swaps the white ground for black.

### Minimalism
`#/world/minimalism` — Whitespace and a single kinetic object: one dot tracing one hairline form. Change the form, set the tempo or let the dot leave a trace.
- **Form** (`form`) — Morphs the hairline between circle, square, triangle and line.
- **Tempo** (`tempo`) — Cycles Slow, Slower and Brisk.
- **Trace** (`trace`) — Lets the dot leave a fading trail behind it.

### Maximalism
`#/world/maximalism` — More is more: clashing patterns, spinning blooms, ornate frames, stickers and marquees piled into one exuberant collage. Add layers, rotate the pattern set and clash the palette.
- **More!** (`more`) — Adds another layer of ornament (five in total, then back to one).
- **Pattern set** (`pattern`) — Rotates Damask, Gingham and Leopard-dot pattern sets.
- **Clash palette** (`palette`) — Cycles Jewel, Candy and Tropic palettes.

### Luxury Typography
`#/world/luxury-typography` — A single word in high-contrast Didone type, letters rising into place with couture spacing and gold hairlines. Show the next word, switch roman to italic or loosen the tracking.
- **Next word** (`word`) — Sets the next word of the collection.
- **Italic** (`style`) — Switches the word between roman and italic.
- **Tracking** (`tracking`) — Cycles Tight, Classic and Airy letter-spacing.

### Conceptual Sketch
`#/world/conceptual-sketch` — A designer's sheet where objects are drawn live: blue construction lines first, then graphite, then notes. Sketch the next concept, hide the guides or go over it in ink.
- **Next concept** (`concept`) — Starts sketching the next object: lamp, chair or kettle.
- **Guides** (`guides`) — Shows or hides the blue construction lines.
- **Ink pass** (`ink`) — Goes over the graphite in crisp black ink.

### Ethereal
`#/world/ethereal` — Pale mist, drifting light motes and soft beams in a weightless, slowly breathing sky. Raise the bloom, gather the motes into a halo or change the hour.
- **Bloom** (`bloom`) — Switches between Soft and Radiant glow.
- **Gather** (`gather`) — Draws the motes into a halo, or releases them.
- **Hour** (`hour`) — Cycles Dawn, Dusk and Moonlit skies.

### Bohemian
`#/world/bohemian` — A sunlit arch with an organic sun, rainbow bands, swaying macramé and a woven kilim border. Change the weave, move the sun through the day and set the breeze.
- **Weave** (`weave`) — Cycles Kilim, Zigzag and Medallion textile bands.
- **Time of day** (`sun`) — Moves the sun through Morning, Noon and Golden hour.
- **Breeze** (`breeze`) — Sets the breeze to Still, Soft or Breezy.

### Victorian
`#/world/victorian` — A gilded cabinet plate: an engraved botanical specimen within an ornamental frame, beside brass clockwork that turns when wound. Wind the mainspring, change the specimen or raise the gaslight.
- **Wind** (`wind`) — Winds the mainspring; the gear train runs faster while it unwinds.
- **Next plate** (`plate`) — Engraves the next specimen: fern, rose or thistle.
- **Gaslight** (`lamp`) — Raises or lowers the gaslight.

### Cyberpunk
`#/world/cyberpunk` — A rain-soaked night street lined with neon signage, reflections pooling on wet asphalt and a terminal feed humming below. Change the weather, switch district or open the terminal.
- **Weather** (`rain`) — Cycles Drizzle, Downpour and Dry.
- **District** (`district`) — Switches between Market, Harbour and Uptown signage colours.
- **Terminal** (`terminal`) — Opens or closes the scrolling terminal feed.

### Wabi-Sabi
`#/world/wabi-sabi` — Quiet imperfection: a hand-thrown bowl mended with gold, a brushed ensō and a single leaf letting go. Mend a crack, turn the season or brush a new ensō.
- **Mend** (`mend`) — Fills the next crack with gold; after three, the bowl cracks anew.
- **Season** (`season`) — Cycles Spring, Summer, Autumn and Winter.
- **New ensō** (`enso`) — Brushes a fresh ensō with new imperfections.

### Particles
`#/world/particles` — A living field of hundreds of particles riding an invisible current and reacting to your pointer or keyboard. Switch between attract, repel and swirl, release a burst or change the density.
- **Force** (`mode`) — Cycles Attract, Repel and Swirl.
- **Burst** (`burst`) — Blasts particles outward from the attractor.
- **Density** (`density`) — Cycles Low, Medium and High particle counts.

### Liquid morph
`#/world/liquid-morph` — Glossy liquid blobs that stretch, merge and split, with a droplet that follows your pointer into the pool. Change the viscosity, add drops or split the mass apart.
- **Viscosity** (`viscosity`) — Cycles Water, Syrup and Mercury.
- **Add drop** (`drop`) — Drips a new droplet into the pool.
- **Split** (`split`) — Splits the mass into orbiting satellites, or merges it again.

### Holographic
`#/world/holographic` — An iridescent foil card with shifting interference patterns beside a projector casting translucent layers into the air. Change the spectrum, explode the projection and tilt the card.
- **Spectrum** (`spectrum`) — Cycles Prism, Oil slick and Aurora foils.
- **Explode layers** (`layers`) — Spreads the projected layers apart, or stacks them.
- **Tilt** (`tilt`) — Steps the card through preset tilt angles (pointer tilt also works).

### Neon glow
`#/world/neon-glow` — Hand-bent glass tubes humming on a dark brick wall, with light travelling the frame. Power the sign on and off, change the gas colour and switch the message.
- **Power** (`power`) — Switches the sign on (tubes draw in) or off.
- **Gas** (`gas`) — Cycles Neon pink, Argon blue, Helium amber and Mercury green.
- **Next sign** (`sign`) — Changes the lettering and icon.

### Wireframe 3D
`#/world/wireframe-3d` — A rotating wireframe volume you can inspect by dragging or with the arrow keys, depth-shaded line by line. Change the mesh, toggle auto-rotation and switch projection.
- **Mesh** (`shape`) — Cycles Torus, Geodesic sphere, Terrain and Möbius band.
- **Auto-rotate** (`spin`) — Turns automatic rotation on or off.
- **Projection** (`projection`) — Switches between perspective and orthographic.

### Kinetic type
`#/world/kinetic-type` — Here the letters are the scene: a phrase that waves, orbits, stacks and scatters to its own choreography. Change the choreography, the phrase and the tempo.
- **Choreography** (`choreo`) — Cycles Wave, Orbit, Stack and Scatter.
- **Next phrase** (`phrase`) — Sets a new phrase for the letters to perform.
- **Tempo** (`tempo`) — Switches between Andante and Allegro.

### Isometric
`#/world/isometric` — A floating island town in isometric projection, with cars looping the ring road and boats on the harbour. Build new blocks, rotate the view and switch day to night.
- **Build** (`build`) — Raises a new building on the next empty lot.
- **Rotate view** (`rotate`) — Turns the whole diorama by 90°.
- **Night** (`night`) — Switches between day and night lighting.

### Clay 3D
`#/world/clay-3d` — Sculpted clay characters on a little plasticine set, animated on twelve frames per second like stop-motion. Swap the sculpture, move the key light and make it squash.
- **Next sculpture** (`sculpt`) — Swaps between the Snail, the Cactus pot and the Robot.
- **Key light** (`light`) — Moves the key light left, top or right — highlights and shadows follow.
- **Squash** (`squash`) — Squashes the sculpture flat, then lets it spring back.

### ASCIl art
`#/world/ascii-art` (alias `#/world/ascil-art`) — Illustrations made entirely of typed characters, re-rendered many times a second from light and shape. Change the scene, the character ramp and the ink.
- **Scene** (`scene`) — Cycles Planet, Lighthouse and Bloom.
- **Character ramp** (`ramp`) — Cycles Classic, Dense and Block character sets.
- **Ink** (`ink`) — Switches between ink-on-paper and light-on-dark.

### Gradient mesh
`#/world/gradient-mesh` — A flowing mesh of colour points blending into one silky surface — drag the handles to pull the colour around. Change the palette, show the mesh and switch the flow.
- **Palette** (`palette`) — Cycles Orchard, Lagoon and Ember.
- **Show mesh** (`handles`) — Shows the draggable colour handles and warped mesh lines.
- **Flow** (`flow`) — Switches between Drift and Swirl.

### Comic book
`#/world/comic-book` — A four-panel page of inked art, halftone skies, speech balloons and sound effects starring Juno Kite and Pip the cat. Turn the page, change Juno's expression and fire a sound effect.
- **Next page** (`page`) — Turns to the next page of the story.
- **Expression** (`expression`) — Cycles Juno's face: Determined, Surprised, Laughing.
- **Sound effect** (`sfx`) — Bursts the next lettered sound effect (visual only, no audio).

### Split-flap
`#/world/split-flap` — A mechanical departure board whose characters clatter through every flap to reach the next message. Refresh the board, switch modes and change the flap speed.
- **Refresh board** (`refresh`) — Flips every row to new times, destinations and statuses.
- **Board mode** (`mode`) — Cycles Departures, Arrivals and a Message wall.
- **Flap speed** (`speed`) — Switches between Brisk and Leisurely flaps.

### Retro VHS
`#/world/retro-vhs` — A home-taped broadcast on a CRT set: soft scanlines, a rolling tracking band and an on-screen timecode — no harsh flashing. Change deck mode, adjust tracking or switch channel.
- **Deck** (`deck`) — Cycles PLAY, fast-forward and rewind.
- **Tracking** (`tracking`) — Steps the tracking from clean to wobbly.
- **Channel** (`channel`) — Switches between three taped scenes.

### Halftone
`#/world/halftone` — Shapes printed as dot screens on paper, with angled CMYK rosettes that shift as the subject moves. Change the screen, the dot size and the subject.
- **Screen** (`screen`) — Cycles Mono, Duotone and CMYK screens.
- **Dot size** (`cell`) — Cycles Coarse, Medium and Fine dot cells.
- **Subject** (`subject`) — Cycles Sun, Bloom and Orbit subjects.

### Bauhaus
`#/world/bauhaus` — A geometric ballet in primary colours: circle, square and triangle performing purposeful choreography on a cream stage. Advance the act, change the tempo and remap the colours.
- **Next act** (`act`) — Moves to the next act: Rotation, Balance or Assembly.
- **Tempo** (`tempo`) — Switches between Andante and Allegro.
- **Colour mapping** (`palette`) — Re-deals the primary colours across the shapes.

### Blueprint
`#/world/blueprint` — A technical drawing of a desk orrery traced in white on blueprint blue, with dimensions, callouts and parts that separate on demand. Explode the assembly, toggle dimensions and inspect each part.
- **Exploded view** (`explode`) — Separates the parts along the axis, or reassembles them.
- **Dimensions** (`dims`) — Shows or hides the dimension annotations.
- **Inspect part** (`part`) — Highlights the next part with its callout.

### Art deco
`#/world/art-deco` — Gilded symmetry: a sunburst, stepped arches and fans unfolding around a grand hotel poster. Open the fans, change the central motif and switch the gilding.
- **Fans** (`unfold`) — Opens or folds the corner fans.
- **Motif** (`motif`) — Cycles Sunburst, Peacock and Chevron centrepieces.
- **Gilding** (`gilding`) — Cycles Gold, Silver and Rose gold.

## Architecture

Vanilla JavaScript ES modules + CSS, bundled by Vite (a devDependency only — there are no runtime dependencies).

```
index.html                 entry; CSP meta, skip link, live region, <noscript>
src/main.js                imports global CSS, starts the app
src/app.js                 shell: hash routing, HUD, gallery/world/not-found views, copy link, keyboard
src/router.js              pure route parsing (gallery query, world ids, aliases, redirects, neighbours)
src/runtime/motion.js      global motion controller (manual pause, prefers-reduced-motion, page visibility)
src/runtime/scope.js       per-view lifecycle scope: rAF loops, timers, listeners, observers, actions, canvas sizing
src/gallery/               gallery markup + mounting, pure filter logic, 39 SVG card thumbnails
src/worlds/registry.js     the machine-readable world registry (see below)
src/worlds/<id>.js/.css    one module and one scoped stylesheet per world (39 of each)
src/lib/                   tiny helpers: escaping, maths, seeded RNG, value noise, SVG paths, colours, icons
src/styles/                base (incl. the global motion contract), shell/HUD, gallery
tests/                     node:test suites (no browser, no network)
```

**Registry.** `src/worlds/registry.js` exports `worlds`: frozen entries with `id`, exact `label`, `description`, `tagline`, `family`, `tags`, `accent`, `controls` (`{ action, label, effect }` for every `data-world-action`), `aliases`, and `renderer` — a lazy `import()` of the world module. Vite code-splits each world (JS + CSS) into its own chunk, so the gallery only loads the shell.

**World contract.** Each world module exports:

- `render({ world, index, total })` → an HTML string (pure; no DOM access, so Node tests can call it);
- `mount(root, ctx)` → wires behaviour using only the scope API (`ctx.loop`, `ctx.every`, `ctx.after`, `ctx.on`, `ctx.onResize`, `ctx.onMotion`, `ctx.actions`, `ctx.status`, `ctx.canvas`).

While a route renders, the app root carries a stable `data-route` and `data-world-id="<id>"` (set before the module finishes loading), then `data-world-ready="true"` once mounted. Each world section is `<section class="ww-world w-<id>" data-world="<id>">`, and every world stylesheet is scoped under `.w-<id>` with `w-`-prefixed keyframes so nothing leaks between worlds.

## Motion, accessibility and performance

- **One loop owner.** Worlds never call `requestAnimationFrame`, `setInterval`, `setTimeout` or `addEventListener` directly (a test enforces this). The scope runs a single rAF loop per view and `destroy()` cancels frames, timers, intervals, listeners, ResizeObservers and motion subscriptions on every route change.
- **Pause / reduced motion.** When motion is paused — by the HUD button, by `prefers-reduced-motion: reduce` (the default state for those visitors), or because the tab is hidden — the rAF loop stops completely and `every()` intervals skip. CSS animations and transitions are removed globally via `html[data-motion="paused"]`, so each world rests in a deliberate stationary composition rather than freezing mid-flash. Controls still work while paused: an action triggers exactly one still redraw.
- **No flashing.** Glows "breathe" slowly; there is no strobing, rapid blinking or full-screen flash (the VHS noise is sparse, low-contrast specks; neon never flickers).
- **Bounded work.** Particle counts scale with area and are capped (e.g. Particles ≤ 1400, Cyberpunk rain ≤ 320); canvases cap device-pixel ratio (1–2); heavy canvases throttle (ASCII 15 fps, Halftone 14–22 fps); Clay 3D's stop-motion runs on 12 fps steps.
- **Accessibility.** Semantic headings (one `h1` per view), real links for navigation and real buttons for actions, visible `:focus-visible` outlines tuned per world (`--ww-focus`), a skip link, a polite live region for shell announcements, `role="status"` state indicators, `aria-pressed` on toggles, text alternatives for canvas/SVG scenes, ≥ 44 px touch targets, and layouts from 360 px wide with no horizontal page overflow.
- **Graceful Canvas fallback.** If a 2D context is unavailable, the scope reveals each canvas world's `[data-canvas-fallback]` description instead.

## Assets and provenance

Every visual is original and generated in code in this repository: CSS gradients/shapes, inline SVG built procedurally (gears, engravings, isometric tiles, blobs, ensō, schematics), and Canvas 2D drawing (synthwave, particles, halftone screens, VHS, pixel sprites defined as character grids, a 3×5 bitmap font). Paper/grain textures are SVG `feTurbulence` data URIs authored here. There are no images, icon fonts, web fonts, CDNs, trackers, analytics, paid APIs or third-party brand assets; typography uses locally installed system font stacks. All names and copy (Lumen Bay, Juno Kite, Hotel Aurelian, etc.) are fictional. There is no audio.

## Tests

`npm test` runs `node --test` over `tests/*.test.js` (a Node module hook stubs world CSS imports so real world modules load in Node):

- **registry** — exact 39-label manifest match and order (including the literal `ASCIl art`), unique URL-safe ids and routes, label slugs/aliases resolve, complete metadata and controls.
- **worlds** — for each of the 39 worlds: the module loads; `render()` yields one `h1` with the exact label, the caption, a `role="status"` indicator, and `data-world-action` buttons matching the registry; the source wires every action in `ctx.actions` and uses no raw timers/listeners, network or audio; the stylesheet is fully scoped. Plus a distinctness check (no shared modules/render functions/class vocabularies).
- **router** — gallery queries, canonical redirects, aliases, malformed and unknown routes, neighbour wrap-around.
- **runtime** — motion controller (reduced motion, persisted preference, visibility) and scope lifecycle (frames stop when paused, one still frame on redraw, timers skip, full teardown, no handler accumulation, isolated loop errors).
- **gallery** — search/filter logic, original thumbnails per world with unique ids, gallery markup.
- **static** — no remote URLs in runtime files, CSP/entry point, Vite base, package scripts, Pages workflow, `.gitignore`, README coverage.

These tests run without a browser; visual and interaction checks (e.g. Playwright screenshots at 360 px and desktop) are left to the supervising pipeline.

## Deploying to GitHub Pages

`.github/workflows/pages.yml` deploys on every push to `main` and on manual `workflow_dispatch`:

1. checkout → set up Node 22 (npm cache) → `npm ci` → `npm test` → `npm run build`
2. `actions/configure-pages` → `actions/upload-pages-artifact` (uploads `dist/`) → `actions/deploy-pages`

Permissions are limited to `contents: read`, `pages: write`, `id-token: write`, with a `pages` concurrency group. No secrets are needed. In the repository settings, set **Pages → Source** to **GitHub Actions**. The dependency lockfile is committed; use `npm ci` for reproducible installs. The Vite `base` is `/website-worlds/`; if the repository is renamed, change `base` in `vite.config.js`.
