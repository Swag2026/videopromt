# Rental Contracts Platform: 30s Ad Prompt

- **Category:** Motion graphics
- **Built with:** HTML · CSS · SVG · vanilla JS timeline (deterministic `render(t)`), exported to MP4 with Playwright + ffmpeg
- **Style source:** the "professional SaaS product launch video" prompt (@moritzkremb) from this repo's `prompts/`

## Prompt

```text
You are a world-class motion designer. Create a highly professional 30-second SaaS product launch ad
for "Rental Contracts Platform", the internal rent-contract management system used by three companies:
SWAG, LA ROCHE and LA ROCHE GOLD (Saudi Arabia). Make it look like the polished, motion-graphics
product-launch videos people post on X: clean, confident, fast, feature by feature, benefit first.

FORMAT
- 1920x1080, 30 fps, exactly 30 seconds, English text, no audio.
- Build it as a single self-contained HTML file driven by one deterministic function render(t),
  where t is the time in seconds. Every element's state must be computed from t only (no CSS transitions,
  no timers), so every frame can be captured exactly and exported to MP4.

BRAND (use the real brand assets, do not invent a new look)
- Colors: deep green #00463E, ink green #00594F, brand green #009969, teal #4CC2BF, mint #BFE9E7,
  light sage background #EEF1F0, white cards. Alert red #E5484D, amber #F5A524.
- Font: IBM Plex Sans Arabic / Segoe UI fallback, bold headlines with tight letter-spacing.
- Logo: the circular green "S" mark. Company chips: SWAG (green), LA ROCHE (ink), LA ROCHE GOLD (teal).
- Cards: white, 28px radius, soft green shadow. Alternate light and dark-green scenes for rhythm.

STORY AND TIMELINE
0-4s    HOOK (dark green). Translucent contract papers float chaotically. Headlines pop in one by one:
        "Rent contracts everywhere." / "Payments slipping." (struck through in red) / "Deadlines missed."
        Then all papers get sucked into the center and the scene cuts.
4-8s    LOGO REVEAL (light). A circle draws itself around the S logo, the logo scales in with a slight
        overshoot. Title "Rental Contracts", subtitle "One platform for every lease, payment & approval",
        then the three company chips slide up.
8-12s   01 CONTRACTS. Headline "Every lease. One place." Four contract cards slide in from the right
        (e.g. Warehouse Jeddah, Warehouse Riyadh, Branch Makkah, Branch Dammam) with status pills
        (Active / Paid / Due) and a paid-progress bar that fills.
12-16s  02 PAYMENTS. Headline "Never miss a due date." A payments calendar appears; green / amber / red
        dots pop onto the days. An "Installment overdue" alert card with a red edge slides up and pulses.
16-20s  03 BRANCHES MAP (dark). "Every branch, every region." Draw the real 13 administrative regions of
        Saudi Arabia (the platform's own MAP_PATHS), each region fading in and colored by contract count
        (more contracts = brighter green). Big counters: 13 regions, 3 companies.
20-25s  04 APPROVALS & REPORTS. "Approve in 5 stages." A 5-step flow (Request, Accounting, HR, Finance,
        Approved) lights up step by step with a small bounce, and a monthly-report bar chart grows
        beneath it with an "Export PDF" button.
25-28s  05 SECURE & BILINGUAL (dark). Four role cards slide in (Admin, Accountant, HR, Viewer) with lock
        icons. A language card switches from "Rental Contracts" to "عقود الإيجارات" (RTL) as the
        EN | عربي button pulses.
28-30s  CTA (light). Logo pops in, then "Every contract. Under control." with the three company chips.

MOTION RULES
- Ease everything: cubic ease-out for entrances, back-ease for pops, ease-in-out for the paper suction.
- Stagger lists by 0.3-0.4s. Cross-fade scenes in 0.4s. Nothing sits static for more than a second:
  progress bars fill, dots pop, the alert pulses, bars grow.
- One idea per scene, large type (84-120px headlines), generous margins, text on the left and the
  UI mockup on the right, mirrored for rhythm only where it helps.

DATA RULES
- Use illustrative numbers only. Never show real contract numbers, lessor names, CR numbers or amounts
  from the live system.

DELIVERABLES
- index.html (the animation, also playable in a browser), rent-ad-30s.mp4, and a short note of what each
  scene shows. Verify by rendering still frames at ~3s, 6.5s, 10.5s, 15.8s, 18.5s, 23s, 26.5s and 29.5s
  and fixing any overlap or clipped text before exporting.
```

## How it was produced

1. Read the platform's HTML (`عقود الإيجارات`) for the features, section names, English dictionary, brand colors, logo and the 13-region map.
2. Built `index.html` with a `render(t)` timeline.
3. Captured 900 frames with Playwright (Chromium) and encoded them with ffmpeg (`libx264`, CRF 18).

## Files

- `index.html`: the animation (open in a browser, loops every 30s)
- `rent-ad-30s.mp4`: the exported video
- `swag-logo.png`: logo used in the ad
