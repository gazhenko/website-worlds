// The world registry: one entry per label in styles.requested.json, in the same order.
//
//   id          – canonical route slug: #/world/<id>
//   label       – the exact manifest label (never edited; note the literal "ASCIl art")
//   description – the caption shown in the world and in the README
//   tagline     – short line for gallery cards
//   family      – gallery filter group
//   tags        – extra search terms
//   accent      – representative colour used by the gallery portal
//   controls    – every [data-world-action] the world renders, with what it does
//   aliases     – extra slugs that redirect to the canonical id
//   renderer    – lazy loader returning the world module { render(), mount() }

export const families = Object.freeze([
  Object.freeze({ id: 'interface', label: 'Interface' }),
  Object.freeze({ id: 'print', label: 'Print & type' }),
  Object.freeze({ id: 'retro', label: 'Retro-future' }),
  Object.freeze({ id: 'mood', label: 'Art & mood' }),
  Object.freeze({ id: 'dimension', label: 'Dimension & motion' }),
]);

const c = (action, label, effect) => Object.freeze({ action, label, effect });

const entries = [
  {
    id: 'claymorphism',
    label: 'Claymorphism',
    family: 'interface',
    accent: '#ff9ec7',
    tagline: 'Puffy pastel UI that squashes and stretches.',
    description:
      'A soft-touch interface kneaded from pastel clay: puffy cards, squishy switches and bouncing blobs that squash and stretch. Swap the clay colour, inflate the controls and drop pebbles into the tray.',
    tags: ['soft', 'pastel', 'tactile', 'bounce', 'ui', 'clay'],
    controls: [
      c('palette', 'Clay colour', 'Switches between Bubblegum, Mint and Blueberry clay.'),
      c('puff', 'Extra puffy', 'Inflates every clay surface with deeper, softer shadows.'),
      c('pebble', 'Drop a pebble', 'Drops a squishy pebble into the tray; the eighth press empties it.'),
    ],
    renderer: () => import('./claymorphism.js'),
  },
  {
    id: 'cybercore',
    label: 'Cybercore',
    family: 'retro',
    accent: '#c8ff3d',
    tagline: 'A living reactor core wired to telemetry.',
    description:
      'The inside of a living machine: a pulsing reactor core wired into circuit traces, biomechanical telemetry and a heartbeat waveform. Change the core mode, reroute the traces or run a diagnostic scan.',
    tags: ['circuit', 'telemetry', 'biomechanical', 'tech', 'lime', 'data'],
    controls: [
      c('mode', 'Core mode', 'Cycles Idle, Sync and Overclock — pulse rate, ring speed and colour change.'),
      c('reroute', 'Reroute traces', 'Regenerates the circuit traces from a new seed.'),
      c('scan', 'Diagnostic scan', 'Shows labelled callouts and a sweeping scan across the core.'),
    ],
    renderer: () => import('./cybercore.js'),
  },
  {
    id: 'neo-brutalism',
    label: 'Neo-Brutalism',
    family: 'interface',
    accent: '#ffd23f',
    tagline: 'Thick outlines, hard shadows, crunchy physics.',
    description:
      'Raw blocks, thick black outlines and hard shadows. Drop chunky blocks into the pit and watch them crunch into a stack, shake the pile, or slam a rubber stamp across the poster.',
    tags: ['bold', 'outline', 'blocks', 'physics', 'loud', 'brutalist'],
    controls: [
      c('drop', 'Drop block', 'Drops a labelled block into the pit, where it lands and stacks.'),
      c('shake', 'Shake pile', 'Kicks the whole pile into the air so it re-stacks.'),
      c('stamp', 'Stamp it', 'Slams the next rubber stamp across the header.'),
    ],
    renderer: () => import('./neo-brutalism.js'),
  },
  {
    id: 'scrapbook',
    label: 'Scrapbook',
    family: 'print',
    accent: '#d9a066',
    tagline: 'Torn paper, washi tape and flipping notes.',
    description:
      'A collage of torn paper, washi tape, polaroids and ticket stubs pinned to kraft card. Flip the handwritten note, reshuffle the scraps or change the tape.',
    tags: ['paper', 'collage', 'tape', 'handmade', 'polaroid', 'notes'],
    controls: [
      c('flip', 'Flip note', 'Turns the index card over to read the other side.'),
      c('shuffle', 'Reshuffle', 'Re-arranges the angle, offset and stacking of every scrap.'),
      c('tape', 'Change tape', 'Switches the washi tape between dots, stripes and grid.'),
    ],
    renderer: () => import('./scrapbook.js'),
  },
  {
    id: 'surrealism',
    label: 'Surrealism',
    family: 'mood',
    accent: '#f2c79b',
    tagline: 'A door in the sky and a moon you can climb.',
    description:
      'A dream plain where a door hangs in the sky, a staircase climbs into an enormous moon and fish drift through the air. Open the door, swap the scale of things or switch gravity off.',
    tags: ['dream', 'moon', 'door', 'impossible', 'scale', 'fish'],
    controls: [
      c('door', 'Open the door', 'Opens the floating door onto a daylight sky; fish swim out.'),
      c('scale', 'Swap scale', 'Shrinks the moon to a pebble and grows the chair into a monument.'),
      c('gravity', 'Gravity', 'Turns gravity off so islands, chair and lamp float upwards.'),
    ],
    renderer: () => import('./surrealism.js'),
  },
  {
    id: 'y2k-aesthetic',
    label: 'Y2K Aesthetic',
    family: 'interface',
    accent: '#9fe7ff',
    tagline: 'Chrome candy and a translucent rainbow disc.',
    description:
      'Millennium optimism in chrome and translucent candy plastic: a bubbly media player, a rainbow disc and liquid-metal stars. Spin the disc, change the player skin and scatter sparkles.',
    tags: ['chrome', 'millennium', 'translucent', 'disc', 'bubbly', 'candy'],
    controls: [
      c('spin', 'Play disc', 'Starts or stops the disc, equaliser and progress bar.'),
      c('skin', 'Player skin', 'Cycles Bubblegum, Ice and Lime skins.'),
      c('sparkle', 'Sparkle', 'Scatters a burst of four-point sparkles around the player.'),
    ],
    renderer: () => import('./y2k-aesthetic.js'),
  },
  {
    id: 'pixel-art',
    label: 'Pixel Art',
    family: 'retro',
    accent: '#4cc3ff',
    tagline: 'A crisp fantasy-console island.',
    description:
      'A crisp fantasy-console scene drawn on an integer pixel grid: a tiny adventurer hops after coins below a hilltop castle. Jump, change the time of day and spawn bonus coins.',
    tags: ['8-bit', 'sprite', 'arcade', 'game', 'retro', 'pixels'],
    controls: [
      c('jump', 'Jump', 'Makes the adventurer jump (also Space or ↑ when the screen is focused).'),
      c('time', 'Time of day', 'Cycles Day, Dusk and Night palettes.'),
      c('coins', 'Bonus coins', 'Spawns three extra coins to collect.'),
    ],
    renderer: () => import('./pixel-art.js'),
  },
  {
    id: 'synthwave',
    label: 'Synthwave',
    family: 'retro',
    accent: '#ff3fa4',
    tagline: 'Striped sunset over an endless neon grid.',
    description:
      'An endless outrun drive into a striped sunset, with a neon grid rolling under a lone coupe. Shift between cruise and overdrive, change the sky palette and move the sun.',
    tags: ['outrun', 'sunset', 'grid', '80s', 'neon', 'drive'],
    controls: [
      c('speed', 'Gear', 'Switches between Cruise and Overdrive grid speed.'),
      c('palette', 'Sky palette', 'Cycles Sunset, Midnight and Lagoon skies.'),
      c('sun', 'Sun position', 'Raises or lowers the sun on the horizon.'),
    ],
    renderer: () => import('./synthwave.js'),
  },
  {
    id: 'glassmorphism',
    label: 'Glassmorphism',
    family: 'interface',
    accent: '#8a7dff',
    tagline: 'Frosted panes and a magnifying lens.',
    description:
      'Frosted, refractive glass panels floating over slow rivers of colour, with a lens you can drag to magnify what lies beneath. Adjust the frost, tint the light and move the lens.',
    tags: ['glass', 'frosted', 'blur', 'translucent', 'lens', 'colour'],
    controls: [
      c('frost', 'Frost', 'Cycles Clear, Frosted and Opal blur strengths.'),
      c('tint', 'Tint', 'Changes the colour rivers behind the glass.'),
      c('lens', 'Move lens', 'Moves the magnifying lens to its next spot (or drag it, or use arrow keys).'),
    ],
    renderer: () => import('./glassmorphism.js'),
  },
  {
    id: 'neumorphism',
    label: 'Neumorphism',
    family: 'interface',
    accent: '#c9d3e0',
    tagline: 'Soft sculpted controls under a moving light.',
    description:
      'A calm climate console sculpted from one soft surface, lit by a light source that slowly circles the room. Nudge the temperature, press the dial in, fix the light or switch to night.',
    tags: ['soft ui', 'shadow', 'sculpted', 'monochrome', 'dial', 'calm'],
    controls: [
      c('cooler', 'Cooler', 'Lowers the set temperature by half a degree.'),
      c('warmer', 'Warmer', 'Raises the set temperature by half a degree.'),
      c('press', 'Press dial', 'Toggles the dial between raised and pressed-in.'),
      c('light', 'Light source', 'Switches between an orbiting light and a fixed top-left light.'),
      c('theme', 'Night surface', 'Switches the whole surface between day and night.'),
    ],
    renderer: () => import('./neumorphism.js'),
  },
  {
    id: 'bento-grid',
    label: 'Bento Grid',
    family: 'interface',
    accent: '#ff8a3d',
    tagline: 'A lunchbox of live, animated tiles.',
    description:
      'A modular lunchbox of live tiles — clock, weather, chart, route map and more — each with its own small animation. Reshuffle the layout, feature a different tile or flip the theme.',
    tags: ['grid', 'tiles', 'dashboard', 'modular', 'widgets', 'layout'],
    controls: [
      c('shuffle', 'Reshuffle', 'Rearranges tile order and spans with a smooth reflow.'),
      c('feature', 'Feature tile', 'Enlarges the next tile into the featured slot.'),
      c('theme', 'Theme', 'Flips between light and dark trays.'),
    ],
    renderer: () => import('./bento-grid.js'),
  },
  {
    id: 'editorial-design',
    label: 'Editorial Design',
    family: 'print',
    accent: '#c8321e',
    tagline: 'A magazine spread with measured rhythm.',
    description:
      'A magazine spread with masthead, headline, deck, drop cap, pull quote and an illustrated figure, revealed in a measured reading rhythm. Turn to the next story, change the column count or show the baseline grid.',
    tags: ['magazine', 'serif', 'layout', 'columns', 'story', 'print'],
    controls: [
      c('story', 'Next story', 'Turns to the next of three fictional features.'),
      c('columns', 'Columns', 'Cycles the body text through one, two and three columns.'),
      c('grid', 'Baseline grid', 'Overlays the baseline grid the type sits on.'),
    ],
    renderer: () => import('./editorial-design.js'),
  },
  {
    id: 'swiss-design',
    label: 'Swiss Design',
    family: 'print',
    accent: '#e2231a',
    tagline: 'Red, black and a strict twelve-column grid.',
    description:
      'An asymmetric poster built on a strict twelve-column grid: red circle, black bars and flush-left grotesque type moving only along the modules. Recompose it, reveal the grid or invert the ground.',
    tags: ['grid', 'helvetica', 'poster', 'red', 'modernist', 'typography'],
    controls: [
      c('compose', 'Recompose', 'Moves every element to the next composition on the grid.'),
      c('grid', 'Show grid', 'Reveals the twelve-column, eight-row module grid.'),
      c('invert', 'Invert ground', 'Swaps the white ground for black.'),
    ],
    renderer: () => import('./swiss-design.js'),
  },
  {
    id: 'minimalism',
    label: 'Minimalism',
    family: 'mood',
    accent: '#e9e6df',
    tagline: 'One dot, one line, a lot of white.',
    description:
      'Whitespace and a single kinetic object: one dot tracing one hairline form. Change the form, set the tempo or let the dot leave a trace.',
    tags: ['white', 'simple', 'calm', 'line', 'dot', 'space'],
    controls: [
      c('form', 'Form', 'Morphs the hairline between circle, square, triangle and line.'),
      c('tempo', 'Tempo', 'Cycles Slow, Slower and Brisk.'),
      c('trace', 'Trace', 'Lets the dot leave a fading trail behind it.'),
    ],
    renderer: () => import('./minimalism.js'),
  },
  {
    id: 'maximalism',
    label: 'Maximalism',
    family: 'mood',
    accent: '#ff3d7f',
    tagline: 'Every pattern, every colour, all at once.',
    description:
      'More is more: clashing patterns, spinning blooms, ornate frames, stickers and marquees piled into one exuberant collage. Add layers, rotate the pattern set and clash the palette.',
    tags: ['pattern', 'eclectic', 'colour', 'layers', 'collage', 'loud'],
    controls: [
      c('more', 'More!', 'Adds another layer of ornament (five in total, then back to one).'),
      c('pattern', 'Pattern set', 'Rotates Damask, Gingham and Leopard-dot pattern sets.'),
      c('palette', 'Clash palette', 'Cycles Jewel, Candy and Tropic palettes.'),
    ],
    renderer: () => import('./maximalism.js'),
  },
  {
    id: 'luxury-typography',
    label: 'Luxury Typography',
    family: 'print',
    accent: '#c9a45c',
    tagline: 'Didone letters with couture spacing.',
    description:
      'A single word in high-contrast Didone type, letters rising into place with couture spacing and gold hairlines. Show the next word, switch roman to italic or loosen the tracking.',
    tags: ['serif', 'didone', 'gold', 'fashion', 'elegant', 'type'],
    controls: [
      c('word', 'Next word', 'Sets the next word of the collection.'),
      c('style', 'Italic', 'Switches the word between roman and italic.'),
      c('tracking', 'Tracking', 'Cycles Tight, Classic and Airy letter-spacing.'),
    ],
    renderer: () => import('./luxury-typography.js'),
  },
  {
    id: 'conceptual-sketch',
    label: 'Conceptual Sketch',
    family: 'mood',
    accent: '#7aa7d6',
    tagline: 'Objects drawn live, guide line by guide line.',
    description:
      "A designer's sheet where objects are drawn live: blue construction lines first, then graphite, then notes. Sketch the next concept, hide the guides or go over it in ink.",
    tags: ['drawing', 'pencil', 'design', 'lines', 'paper', 'concept'],
    controls: [
      c('concept', 'Next concept', 'Starts sketching the next object: lamp, chair or kettle.'),
      c('guides', 'Guides', 'Shows or hides the blue construction lines.'),
      c('ink', 'Ink pass', 'Goes over the graphite in crisp black ink.'),
    ],
    renderer: () => import('./conceptual-sketch.js'),
  },
  {
    id: 'ethereal',
    label: 'Ethereal',
    family: 'mood',
    accent: '#d9ccff',
    tagline: 'Mist, bloom and weightless light.',
    description:
      'Pale mist, drifting light motes and soft beams in a weightless, slowly breathing sky. Raise the bloom, gather the motes into a halo or change the hour.',
    tags: ['mist', 'light', 'soft', 'dream', 'glow', 'pastel'],
    controls: [
      c('bloom', 'Bloom', 'Switches between Soft and Radiant glow.'),
      c('gather', 'Gather', 'Draws the motes into a halo, or releases them.'),
      c('hour', 'Hour', 'Cycles Dawn, Dusk and Moonlit skies.'),
    ],
    renderer: () => import('./ethereal.js'),
  },
  {
    id: 'bohemian',
    label: 'Bohemian',
    family: 'mood',
    accent: '#c2643c',
    tagline: 'Organic sun, kilim weave, swaying fringe.',
    description:
      'A sunlit arch with an organic sun, rainbow bands, swaying macramé and a woven kilim border. Change the weave, move the sun through the day and set the breeze.',
    tags: ['boho', 'textile', 'earthy', 'sun', 'macrame', 'organic'],
    controls: [
      c('weave', 'Weave', 'Cycles Kilim, Zigzag and Medallion textile bands.'),
      c('sun', 'Time of day', 'Moves the sun through Morning, Noon and Golden hour.'),
      c('breeze', 'Breeze', 'Sets the breeze to Still, Soft or Breezy.'),
    ],
    renderer: () => import('./bohemian.js'),
  },
  {
    id: 'victorian',
    label: 'Victorian',
    family: 'mood',
    accent: '#2f5d46',
    tagline: 'Engraved botany, gilt frames and clockwork.',
    description:
      'A gilded cabinet plate: an engraved botanical specimen within an ornamental frame, beside brass clockwork that turns when wound. Wind the mainspring, change the specimen or raise the gaslight.',
    tags: ['ornament', 'botanical', 'engraving', 'clockwork', 'gold', 'antique'],
    controls: [
      c('wind', 'Wind', 'Winds the mainspring; the gear train runs faster while it unwinds.'),
      c('plate', 'Next plate', 'Engraves the next specimen: fern, rose or thistle.'),
      c('lamp', 'Gaslight', 'Raises or lowers the gaslight.'),
    ],
    renderer: () => import('./victorian.js'),
  },
  {
    id: 'cyberpunk',
    label: 'Cyberpunk',
    family: 'retro',
    accent: '#ff2bd6',
    tagline: 'Neon rain on a wet night street.',
    description:
      'A rain-soaked night street lined with neon signage, reflections pooling on wet asphalt and a terminal feed humming below. Change the weather, switch district or open the terminal.',
    tags: ['neon', 'rain', 'city', 'night', 'terminal', 'future'],
    controls: [
      c('rain', 'Weather', 'Cycles Drizzle, Downpour and Dry.'),
      c('district', 'District', 'Switches between Market, Harbour and Uptown signage colours.'),
      c('terminal', 'Terminal', 'Opens or closes the scrolling terminal feed.'),
    ],
    renderer: () => import('./cyberpunk.js'),
  },
  {
    id: 'wabi-sabi',
    label: 'Wabi-Sabi',
    family: 'mood',
    accent: '#a39a86',
    tagline: 'Gold-mended bowl, brushed ensō, falling leaf.',
    description:
      'Quiet imperfection: a hand-thrown bowl mended with gold, a brushed ensō and a single leaf letting go. Mend a crack, turn the season or brush a new ensō.',
    tags: ['kintsugi', 'enso', 'earthy', 'calm', 'imperfect', 'nature'],
    controls: [
      c('mend', 'Mend', 'Fills the next crack with gold; after three, the bowl cracks anew.'),
      c('season', 'Season', 'Cycles Spring, Summer, Autumn and Winter.'),
      c('enso', 'New ensō', 'Brushes a fresh ensō with new imperfections.'),
    ],
    renderer: () => import('./wabi-sabi.js'),
  },
  {
    id: 'particles',
    label: 'Particles',
    family: 'dimension',
    accent: '#57d0ff',
    tagline: 'Hundreds of particles riding your pointer.',
    description:
      'A living field of hundreds of particles riding an invisible current and reacting to your pointer or keyboard. Switch between attract, repel and swirl, release a burst or change the density.',
    tags: ['interactive', 'field', 'flow', 'dots', 'pointer', 'generative'],
    controls: [
      c('mode', 'Force', 'Cycles Attract, Repel and Swirl.'),
      c('burst', 'Burst', 'Blasts particles outward from the attractor.'),
      c('density', 'Density', 'Cycles Low, Medium and High particle counts.'),
    ],
    renderer: () => import('./particles.js'),
  },
  {
    id: 'liquid-morph',
    label: 'Liquid morph',
    family: 'dimension',
    accent: '#2ee6c0',
    tagline: 'Gooey blobs that merge, stretch and split.',
    description:
      'Glossy liquid blobs that stretch, merge and split, with a droplet that follows your pointer into the pool. Change the viscosity, add drops or split the mass apart.',
    tags: ['blob', 'goo', 'fluid', 'morph', 'organic', 'metaball'],
    controls: [
      c('viscosity', 'Viscosity', 'Cycles Water, Syrup and Mercury.'),
      c('drop', 'Add drop', 'Drips a new droplet into the pool.'),
      c('split', 'Split', 'Splits the mass into orbiting satellites, or merges it again.'),
    ],
    renderer: () => import('./liquid-morph.js'),
  },
  {
    id: 'holographic',
    label: 'Holographic',
    family: 'dimension',
    accent: '#b5a4ff',
    tagline: 'Iridescent foil and projected layers.',
    description:
      'An iridescent foil card with shifting interference patterns beside a projector casting translucent layers into the air. Change the spectrum, explode the projection and tilt the card.',
    tags: ['iridescent', 'rainbow', 'foil', 'projection', '3d', 'interference'],
    controls: [
      c('spectrum', 'Spectrum', 'Cycles Prism, Oil slick and Aurora foils.'),
      c('layers', 'Explode layers', 'Spreads the projected layers apart, or stacks them.'),
      c('tilt', 'Tilt', 'Steps the card through preset tilt angles (pointer tilt also works).'),
    ],
    renderer: () => import('./holographic.js'),
  },
  {
    id: 'neon-glow',
    label: 'Neon glow',
    family: 'retro',
    accent: '#ff4fa3',
    tagline: 'Glass tubes humming on a brick wall.',
    description:
      'Hand-bent glass tubes humming on a dark brick wall, with light travelling the frame. Power the sign on and off, change the gas colour and switch the message.',
    tags: ['neon', 'sign', 'glow', 'night', 'tube', 'light'],
    controls: [
      c('power', 'Power', 'Switches the sign on (tubes draw in) or off.'),
      c('gas', 'Gas', 'Cycles Neon pink, Argon blue, Helium amber and Mercury green.'),
      c('sign', 'Next sign', 'Changes the lettering and icon.'),
    ],
    renderer: () => import('./neon-glow.js'),
  },
  {
    id: 'wireframe-3d',
    label: 'Wireframe 3D',
    family: 'dimension',
    accent: '#5cf2ff',
    tagline: 'Inspect a rotating depth-shaded mesh.',
    description:
      'A rotating wireframe volume you can inspect by dragging or with the arrow keys, depth-shaded line by line. Change the mesh, toggle auto-rotation and switch projection.',
    tags: ['3d', 'mesh', 'wireframe', 'geometry', 'rotate', 'vector'],
    controls: [
      c('shape', 'Mesh', 'Cycles Torus, Geodesic sphere, Terrain and Möbius band.'),
      c('spin', 'Auto-rotate', 'Turns automatic rotation on or off.'),
      c('projection', 'Projection', 'Switches between perspective and orthographic.'),
    ],
    renderer: () => import('./wireframe-3d.js'),
  },
  {
    id: 'kinetic-type',
    label: 'Kinetic type',
    family: 'print',
    accent: '#ff4f1f',
    tagline: 'Letters that dance as the whole scene.',
    description:
      'Here the letters are the scene: a phrase that waves, orbits, stacks and scatters to its own choreography. Change the choreography, the phrase and the tempo.',
    tags: ['type', 'letters', 'animation', 'motion', 'words', 'dance'],
    controls: [
      c('choreo', 'Choreography', 'Cycles Wave, Orbit, Stack and Scatter.'),
      c('phrase', 'Next phrase', 'Sets a new phrase for the letters to perform.'),
      c('tempo', 'Tempo', 'Switches between Andante and Allegro.'),
    ],
    renderer: () => import('./kinetic-type.js'),
  },
  {
    id: 'isometric',
    label: 'Isometric',
    family: 'dimension',
    accent: '#7bd389',
    tagline: 'A floating island town in iso projection.',
    description:
      'A floating island town in isometric projection, with cars looping the ring road and boats on the harbour. Build new blocks, rotate the view and switch day to night.',
    tags: ['iso', 'city', 'diorama', 'town', 'blocks', 'map'],
    controls: [
      c('build', 'Build', 'Raises a new building on the next empty lot.'),
      c('rotate', 'Rotate view', 'Turns the whole diorama by 90°.'),
      c('night', 'Night', 'Switches between day and night lighting.'),
    ],
    renderer: () => import('./isometric.js'),
  },
  {
    id: 'clay-3d',
    label: 'Clay 3D',
    family: 'dimension',
    accent: '#e88b5a',
    tagline: 'Plasticine sculptures at twelve frames a second.',
    description:
      'Sculpted clay characters on a little plasticine set, animated on twelve frames per second like stop-motion. Swap the sculpture, move the key light and make it squash.',
    tags: ['plasticine', 'stop motion', 'sculpture', '3d', 'character', 'claymation'],
    controls: [
      c('sculpt', 'Next sculpture', 'Swaps between the Snail, the Cactus pot and the Robot.'),
      c('light', 'Key light', 'Moves the key light left, top or right — highlights and shadows follow.'),
      c('squash', 'Squash', 'Squashes the sculpture flat, then lets it spring back.'),
    ],
    renderer: () => import('./clay-3d.js'),
  },
  {
    id: 'ascii-art',
    label: 'ASCIl art',
    aliases: ['ascil-art'],
    family: 'retro',
    accent: '#e6dcc6',
    tagline: 'Pictures typed from characters, live.',
    description:
      'Illustrations made entirely of typed characters, re-rendered many times a second from light and shape. Change the scene, the character ramp and the ink.',
    tags: ['ascii', 'text', 'characters', 'monospace', 'typewriter', 'terminal'],
    controls: [
      c('scene', 'Scene', 'Cycles Planet, Lighthouse and Bloom.'),
      c('ramp', 'Character ramp', 'Cycles Classic, Dense and Block character sets.'),
      c('ink', 'Ink', 'Switches between ink-on-paper and light-on-dark.'),
    ],
    renderer: () => import('./ascii-art.js'),
  },
  {
    id: 'gradient-mesh',
    label: 'Gradient mesh',
    family: 'dimension',
    accent: '#ff9f7a',
    tagline: 'Silky colour pulled around by handles.',
    description:
      'A flowing mesh of colour points blending into one silky surface — drag the handles to pull the colour around. Change the palette, show the mesh and switch the flow.',
    tags: ['gradient', 'colour', 'mesh', 'smooth', 'blend', 'handles'],
    controls: [
      c('palette', 'Palette', 'Cycles Orchard, Lagoon and Ember.'),
      c('handles', 'Show mesh', 'Shows the draggable colour handles and warped mesh lines.'),
      c('flow', 'Flow', 'Switches between Drift and Swirl.'),
    ],
    renderer: () => import('./gradient-mesh.js'),
  },
  {
    id: 'comic-book',
    label: 'Comic book',
    family: 'print',
    accent: '#ffd400',
    tagline: 'Inked panels, balloons and sound effects.',
    description:
      "A four-panel page of inked art, halftone skies, speech balloons and sound effects starring Juno Kite and Pip the cat. Turn the page, change Juno's expression and fire a sound effect.",
    tags: ['comic', 'panels', 'speech', 'ink', 'hero', 'halftone'],
    controls: [
      c('page', 'Next page', 'Turns to the next page of the story.'),
      c('expression', 'Expression', "Cycles Juno's face: Determined, Surprised, Laughing."),
      c('sfx', 'Sound effect', 'Bursts the next lettered sound effect (visual only, no audio).'),
    ],
    renderer: () => import('./comic-book.js'),
  },
  {
    id: 'split-flap',
    label: 'Split-flap',
    family: 'print',
    accent: '#f2f2f2',
    tagline: 'A mechanical board that clatters to life.',
    description:
      'A mechanical departure board whose characters clatter through every flap to reach the next message. Refresh the board, switch modes and change the flap speed.',
    tags: ['board', 'departures', 'mechanical', 'flip', 'station', 'letters'],
    controls: [
      c('refresh', 'Refresh board', 'Flips every row to new times, destinations and statuses.'),
      c('mode', 'Board mode', 'Cycles Departures, Arrivals and a Message wall.'),
      c('speed', 'Flap speed', 'Switches between Brisk and Leisurely flaps.'),
    ],
    renderer: () => import('./split-flap.js'),
  },
  {
    id: 'retro-vhs',
    label: 'Retro VHS',
    family: 'retro',
    accent: '#4f7cff',
    tagline: 'Soft scanlines, tracking and timecode.',
    description:
      'A home-taped broadcast on a CRT set: soft scanlines, a rolling tracking band and an on-screen timecode — no harsh flashing. Change deck mode, adjust tracking or switch channel.',
    tags: ['vhs', 'tape', 'crt', 'analog', 'video', '90s'],
    controls: [
      c('deck', 'Deck', 'Cycles PLAY, fast-forward and rewind.'),
      c('tracking', 'Tracking', 'Steps the tracking from clean to wobbly.'),
      c('channel', 'Channel', 'Switches between three taped scenes.'),
    ],
    renderer: () => import('./retro-vhs.js'),
  },
  {
    id: 'halftone',
    label: 'Halftone',
    family: 'print',
    accent: '#00a3d9',
    tagline: 'Angled dot screens and CMYK rosettes.',
    description:
      'Shapes printed as dot screens on paper, with angled CMYK rosettes that shift as the subject moves. Change the screen, the dot size and the subject.',
    tags: ['print', 'dots', 'cmyk', 'screen', 'pop art', 'newsprint'],
    controls: [
      c('screen', 'Screen', 'Cycles Mono, Duotone and CMYK screens.'),
      c('cell', 'Dot size', 'Cycles Coarse, Medium and Fine dot cells.'),
      c('subject', 'Subject', 'Cycles Sun, Bloom and Orbit subjects.'),
    ],
    renderer: () => import('./halftone.js'),
  },
  {
    id: 'bauhaus',
    label: 'Bauhaus',
    family: 'print',
    accent: '#d62828',
    tagline: 'A primary-colour geometric ballet.',
    description:
      'A geometric ballet in primary colours: circle, square and triangle performing purposeful choreography on a cream stage. Advance the act, change the tempo and remap the colours.',
    tags: ['geometry', 'primary', 'modernist', 'shapes', 'ballet', 'poster'],
    controls: [
      c('act', 'Next act', 'Moves to the next act: Rotation, Balance or Assembly.'),
      c('tempo', 'Tempo', 'Switches between Andante and Allegro.'),
      c('palette', 'Colour mapping', 'Re-deals the primary colours across the shapes.'),
    ],
    renderer: () => import('./bauhaus.js'),
  },
  {
    id: 'blueprint',
    label: 'Blueprint',
    family: 'dimension',
    accent: '#1e5aa8',
    tagline: 'A schematic that separates into parts.',
    description:
      'A technical drawing of a desk orrery traced in white on blueprint blue, with dimensions, callouts and parts that separate on demand. Explode the assembly, toggle dimensions and inspect each part.',
    tags: ['schematic', 'technical', 'drawing', 'engineering', 'plan', 'diagram'],
    controls: [
      c('explode', 'Exploded view', 'Separates the parts along the axis, or reassembles them.'),
      c('dims', 'Dimensions', 'Shows or hides the dimension annotations.'),
      c('part', 'Inspect part', 'Highlights the next part with its callout.'),
    ],
    renderer: () => import('./blueprint.js'),
  },
  {
    id: 'art-deco',
    label: 'Art deco',
    family: 'retro',
    accent: '#d4af37',
    tagline: 'Gilded fans, sunbursts and symmetry.',
    description:
      'Gilded symmetry: a sunburst, stepped arches and fans unfolding around a grand hotel poster. Open the fans, change the central motif and switch the gilding.',
    tags: ['gold', 'symmetry', '1920s', 'fan', 'sunburst', 'poster'],
    controls: [
      c('unfold', 'Fans', 'Opens or folds the corner fans.'),
      c('motif', 'Motif', 'Cycles Sunburst, Peacock and Chevron centrepieces.'),
      c('gilding', 'Gilding', 'Cycles Gold, Silver and Rose gold.'),
    ],
    renderer: () => import('./art-deco.js'),
  },
];

export const worlds = Object.freeze(
  entries.map((entry) =>
    Object.freeze({
      ...entry,
      tags: Object.freeze([...entry.tags]),
      controls: Object.freeze([...entry.controls]),
      aliases: Object.freeze([...(entry.aliases ?? [])]),
    }),
  ),
);

export const worldIds = Object.freeze(worlds.map((w) => w.id));

export function getWorld(id) {
  return worlds.find((w) => w.id === id) ?? null;
}

export function familyLabel(id) {
  return families.find((f) => f.id === id)?.label ?? id;
}
