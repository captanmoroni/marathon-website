# Codebase Audit — marathon-endgame-guide.html
**Date:** 2026-06-10 · **Auditor:** Claude (Fable 5)

## 1. Current state

A single 1,100-line HTML file containing a React 18 SPA transpiled in-browser by Babel
standalone, styled with the Tailwind Play CDN, with icons rendered via a hand-rolled shim
over the vanilla `lucide` UMD bundle. All content is hardcoded inside component code.

## 2. Technical debt

| # | Debt | Severity | Notes |
|---|------|----------|-------|
| T1 | In-browser Babel transpilation | High | ~60 KB JSX parsed/compiled on every page load; blocks first paint; production-banned by React docs |
| T2 | Tailwind Play CDN | High | Generates CSS at runtime in a `<script>`; not for production; FOUC risk |
| T3 | No routing | High | Single `activeTab` state → no deep links, no shareable URLs, no SEO-indexable pages |
| T4 | Data embedded in component file | High | Game data, UI, and logic interleaved; no schema, no source attribution, unmaintainable at guide-site scale |
| T5 | No build system / dependency manifest | High | CDN `<script>` tags; the lucide-react CDN bundle already broke once (empty UMD export) |
| T6 | No persistence | Med | Raid checklist + planner state lost on refresh |
| T7 | No tests, no linting | Med | Zero safety net |
| T8 | No code splitting | Med | Everything ships on first load |
| T9 | Icon shim fragility | Med | Depends on undocumented internal lucide UMD data format `["svg", attrs, children]` |
| T10 | No metadata | Med | One `<title>`; no description, OG tags, sitemap, robots.txt |

## 3. Fake / placeholder content inventory

Verified against sources listed in `docs/SOURCES.md` (June 2026).

### Fabricated (must be removed or replaced)
- **Shell roster**: file shows 3 shells; the real game has 8 (Vandal, Destroyer, Recon, Assassin, Triage, Thief, Rook + S2 Sentinel).
- **All ability names/cooldowns**: "Super-Dash Overdrive", "Phase Slide", "Stasis Lock Field",
  "Tremor Ping", "Ghost Protocol", "Scrap Sense" — none exist. Real examples: Vandal = Amplify
  (Prime) + Disruptor arm cannon (Tactical); Sentinel = Defender System (Prime) + Snare Mine (Tactical).
- **Faction upgrade trees**: all 7-rank trees were invented. Real upgrades documented for
  CyberAcme/NuCaloric/Traxus (e.g. *CyberAcme Expansion, Rank 1: +8 vault rows*); MIDA/Arachne/
  Sekiguchi trees not yet publicly documented.
- **"Cryo Archive 6-wing raid"**: fabricated structure. Real Cryo Archive: hub-and-spoke endgame
  zone (Control + Panopticon center; Cargo, Steerage, Biostock, Preservation, Revival, Index wings),
  30-minute runs, Security Clearance Level 3 needed to exfil (Security Tags ×1 / Terminal hacks ×3,
  ≈18 tags), The Compiler boss, lockdown trap rooms.
- **Weapons**: "Ares RG railgun", "Overrun AR", "Kessler SMG-7" — invented. Verified: V95 Lookout
  (NuCaloric R3 unlock), Longshot MIPS sniper (Traxus R3 unlock).
- **Patch notes "2.1.0 / 2.0.2"** and the entire tier list: invented.
- **"Live status" map rotation ticker**: invented rotation data.

### Accidentally correct (keep, with sources)
- Six faction names + broad specializations; Rook scavenger rules (solo, randomized gear, no
  faction contract progress); map names Dire Marsh / Outpost / Night Marsh / Cryo Archive;
  Sentinel as the S2 defensive shell; stats Heat Capacity & Loot Speed; Tau Ceti IV setting.

### Missing real content
- Perimeter (the actual starter map), Season 2 "Nightfall" specifics (The Cradle, Frost Mine /
  Vector Grenade, recovery cap 100%→70%), ranked mode, Silk/Lux economy, seasonal wipe rules.

## 4. Functional audit
All tabs/buttons work (verified in live preview 2026-06-10). No broken links — but the content
behind them fails the accuracy bar of an Icy-Veins-class site.
