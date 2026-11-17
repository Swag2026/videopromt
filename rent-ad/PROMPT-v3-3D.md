# Rental Contracts Platform: 3D Launch Film v3 (prompt)

- **Category:** 3D scene + motion graphics
- **Built with:** Three.js (extruded geometry, additive particles, UnrealBloom), HTML/CSS glass overlays, Playwright + ffmpeg. 1920x1080, 30 fps, 30 s
- **Ideas taken from this repo's prompts:**
  - `howdevelop-733090`: "every transition should visually demonstrate a feature" and "a signal expands into a network"
  - `lukasersil-726495`: depth, particles, lighting and seamless camera movement as one art-directed reel
  - `brainextends-606193`: premium stage, one accent colour, compact product-ad typography
  - `twoclipping-496100`: spring-driven, masked type rises, no crossfades

## Prompt

```text
<direction>
A cinematic 30-second launch film for "Rental Contracts", the rent-contract platform of SWAG, LA ROCHE and
LA ROCHE GOLD in Saudi Arabia. The product story is told INSIDE one continuous 3D world: the Kingdom's real
13 administrative regions become a glowing extruded map, and every product feature is a camera move or a
change in that world, never a title card.
Look: near-black emerald void, one accent (brand green #009969 / mint #7DF5C5), red only for danger
(overdue). Soft bloom on light sources only; the scene must never wash out to flat green. Frosted-glass UI
chips (backdrop blur, 1.5px light border) float above the 3D. Type: IBM Plex Sans Arabic 500/700 with tight
tracking; captions rise out of mask lines.
Banned: lens flares, RGB split, camera shake, stock footage, spinning logos, real contract numbers or amounts.
</direction>

<structure>
0-3.6   THE PROBLEM. ~9,000 light particles swirl chaotically in the dark. Text: "Rent contracts everywhere."
        and "Payments slipping · Deadlines missed". The swarm pulls into the exact silhouette of the 13 regions.
3.6-8.6 THE NETWORK. Regions rise out of the ground one by one on springs, height = number of contracts.
        Edges light up. Camera sweeps low from left to right. Glass counters: 13 regions · 3 companies ·
        128 active contracts (count up).
8.6-13.6 PAYMENTS. Glowing arcs draw from every region to the Riyadh hub; light sparks travel along them.
        Three regions turn red and pulse; their sparks travel the opposite way (overdue). Glass chips:
        72% collected ring and "7 overdue".
13.6-19.4 CONTRACTS. The camera dives to the Riyadh block. Three real contract cards (title, total, paid bar,
        Q1-Q4 chips, status pill) spring up from the surface with parallax; one is selected and enlarges.
19.4-24.2 APPROVALS. Camera pulls back and up. A glass stepper (Request, Accounting, HR, Finance, Approved)
        fills step by step with a spring pop; a "FULLY APPROVED" stamp slams in.
24.2-27.6 REPORTS & ACCESS. Top-down view of the whole network. A glass card flips from "Rental Contracts" to
        "عقود الإيجارات" in place (RTL) when the EN | عربي button pulses.
27.6-30 FINALE. The world dims behind a soft vignette; the white S-logo spins in, "Every contract / under
        control" rises from masks, then the three company chips.
</structure>

<build>
1. One self-contained HTML file: Three.js bundled with esbuild, fonts/logo/map inlined as base64.
2. Everything is a pure function of time: render(t) sets camera, geometry scale, particle positions, arc
   draw ranges and every overlay style. No clock, no accumulated state. Use a seeded PRNG so every run
   is identical.
3. Map: parse the region path data (M/L/Z only) into THREE.Shape, ExtrudeGeometry per region, scale the
   extrusion axis with a spring. EdgesGeometry lines (additive) light up as each region lands.
4. Particles: rasterize each region onto a 2D canvas, sample random filled pixels as targets, then morph
   each particle from a swirling orbit to its target with a per-particle delay, and ride the top surface
   as the region rises.
5. Arcs: QuadraticBezierCurve3 from each region centre to the hub, draw range grows; 3 spark points per arc
   move along getPoint(); late payments reverse direction and turn red.
6. Cards: canvas-drawn textures on planes, springs for rise/scale, slight handheld sway on the camera.
7. Camera: keyframe track [t, position, look-at, fov] with ease-in-out, one continuous move.
8. Bloom: UnrealBloom threshold ~0.78, strength ~0.5, otherwise the green scene blows out.
9. Render with Playwright + SwiftShader (headless, no GPU): 3 parallel workers, one JPEG per frame, then
   ffmpeg libx264. Check one still per scene first.
</build>

<gotchas>
Additive particles stack: keep size ~0.09 and per-particle brightness <0.6 or the map turns white.
Tone-mapped background colour is brighter than it looks, keep it near black.
Dark logos vanish on dark scenes: recolour the PNG to white with canvas source-in compositing.
</gotchas>
```

## Files

- `v3-3d.html`: the film (self-contained, plays and loops in a browser with WebGL)
- `v3-src/`: `main.js` (scene), `shell.html` (overlay UI), `build3.py` (bundles everything)
- `rent-ad-v3-3D-30s.mp4`: exported video
