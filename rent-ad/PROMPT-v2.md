# Rental Contracts Platform: Launch Film v2 (prompt)

- **Category:** Motion graphics
- **Built with:** HTML · CSS · SVG · closed-form springs, rendered with Playwright + ffmpeg at 1920x1080, 60 fps, 30 s
- **Prompts combined from this repo:** `twoclipping-496100` (Apple-keynote launch film, one continuous take), `morse-369333` (Dribbble-level UI motion, cursor-driven springs), `moritzkremb-466494` (SaaS product launch video)

## Prompt

```text
<direction>
A premium SaaS launch film for "Rental Contracts", the rent-contract management platform of SWAG, LA ROCHE
and LA ROCHE GOLD (Saudi Arabia). Apple-keynote feel, 2D only, ONE continuous take: nothing crossfades or
blurs in. Scenes are made out of each other: text rises out of a mask line, cards pop from zero on a spring,
bars and rings draw themselves, and one black circle floods the frame and contracts into the next scene.
A real cursor drives every change with clicks, hovers and typing. The camera zooms Screen-Studio style so each
moment fills the frame, and the cursor scales with it.
Warm off-white canvas (#F3F0EA), black UI (#0B0F0E), ONE accent: brand green #009969 (teal #4CC2BF only on the
dark map scene). Type: IBM Plex Sans Arabic 500/700, tight tracking, so Arabic and English share one family.
Use the platform's real logo (circular S mark), real section names and the real 13-region Saudi map paths.
Banned: crossfades, particles, glows, neon, bouncy easing, stock footage, holds longer than 1 s, templates,
real contract numbers / lessor names / amounts (illustrative numbers only).
</direction>

<structure>
0-3     OPEN. The wordmark "Rental." squeezes into its own period, the dot grows into a black pill, "Contracts"
        rises inside it from a mask. Cursor clicks, the pill floods the screen black.
3-7.5   01 OVERVIEW. The flood contracts into a window; a bento grid unfolds tile by tile on springs:
        128 active contracts (counting up + sparkline), 72% paid ring, 7 overdue (pulsing red dot),
        5 pending approvals, monthly collection bars, mini region map. Camera pushes in, cursor clicks "Overdue".
7.5-11.9 02 CONTRACTS. Rows slide in with progress bars filling. The cursor types "jed" into search, rows collapse
        to the matches, click a row: a detail panel opens with the lease-term bar, today marker, quarterly chips.
11.9-16.3 03 PAYMENTS. March calendar, status dots pop (green paid / amber due / red late). Click the red day:
        dark popover "Installment overdue · 4 days late" → click "Mark as paid": dot turns green, 72% → 78%,
        overdue 3 → 2, toast "Payment recorded · accounting notified".
16.3-20.9 04 BRANCHES MAP (dark). The 13 real region outlines draw on, then fill by contract count. Counter 0 → 13.
        Cursor hovers Riyadh: it lifts and a tooltip shows "Riyadh · 9 contracts".
20.9-24.7 05 APPROVALS. Renewal request with a 5-stage stepper (Request, Accounting, HR, Finance, Approved).
        Each click on "Approve" fills a connector line and pops the next node; the last one turns green and a
        "FULLY APPROVED" stamp slams in.
24.7-27.9 06 REPORTS & ACCESS. Monthly report bars grow. Click "Export PDF": the button squeezes into a spinner pill
        and grows back as "✓ Exported". Click EN | عربي: the whole window flips to RTL Arabic in place
        (title, labels, values, bar order and role chips mirror).
27.9-30 FINALE. Flood contracts into the logo (spring + rotation), "Every contract / under control" rises from masks,
        three company chips, "Rental Contracts Platform".
</structure>

<build>
1. One HTML file, 1920x1080. Every style is computed from time inside render(t): no CSS transitions, no timers,
   no state between frames.
2. Springs are closed-form step responses; a value with many targets is the sum of one spring per change.
3. Cursor and camera are keyframe tracks (ease in-out); clicks draw an expanding ring and a 0.86 press scale.
4. Flood transition: one black circle grows from the click point, scene swaps at its midpoint, it contracts
   from the centre.
5. Embed the fonts and the logo as base64 so the file is fully self-contained.
6. Render with Playwright, one screenshot per 1/60 s, encode with ffmpeg (libx264, CRF 17). Check one still
   per scene before the full render; fix clipped text, overlaps and anything off-centre.
</build>
```

## Files

- `v2.html`: the animation (self-contained, loops every 30 s in a browser)
- `rent-ad-v2-30s.mp4`: exported 1920x1080 / 60 fps video
- `PROMPT.md`: the v1 prompt and `rent-ad-30s.mp4`, the first version
