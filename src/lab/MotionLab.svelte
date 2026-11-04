<script lang="ts">
  import DemoCard from './DemoCard.svelte';
  import type { Scenario } from './scenarios';
  import './lab.css';

  let reduced = $state(false);
  let globalTick = $state(0);

  interface Section {
    id: Scenario; cell: number; title: string;
    current: string; fx: string; specC: string; specF: string;
  }

  const sections: Section[] = [
    {
      id: 'reveal', cell: 56, title: '1 · TILE REVEAL — THE COVER DISAPPEARS',
      current: 'Cell.svelte:75 — the hidden cover swaps to flat in one frame with a single cyan flash; the number pops 1.4→1. The tile never visibly "leaves".',
      fx: 'CRUMBLE — the cover shrinks 1 → ⅔ → ⅓ → gone in three steps while the number pops bigger (1.8→1).',
      specC: '120ms · 1-step flash · steps · reduced: instant swap',
      specF: '140ms crumble + 120ms pop · steps(1)/steps(2) · reduced: instant swap',
    },
    {
      id: 'cascade', cell: 34, title: '2 · FLOOD-FILL WAVE',
      current: 'App.svelte:100 — the wave exists only as setTimeout delays (ring × 25ms); each tile still appears in a single frame, so the wave reads as popping, not travelling.',
      fx: 'Same ring delays, but every arriving tile crumbles — the wave becomes visible motion sweeping out from the click.',
      specC: 'ring × 25ms stagger · per-tile instant',
      specF: 'same stagger + 140ms crumble per tile · steps(1)',
    },
    {
      id: 'flag', cell: 56, title: '3 · FLAG PLANT',
      current: 'Cell.svelte:76 — the flag pops in at scale 1.4→1 in two steps.',
      fx: 'STAB — the flag drops from above, settles 1px down, and kicks up a two-pixel dust puff at its base.',
      specC: '120ms · steps(2)',
      specF: '120ms stab + 160ms puff · steps(1)/steps(2) · reduced: instant',
    },
    {
      id: 'boom', cell: 44, title: '4 · MINE HIT',
      current: 'Board.svelte:17 + Cell.svelte:79 — the detonated cell goes pink instantly, the boom sprite blinks for one frame, mines pop in 60ms apart, the board shakes 6px.',
      fx: 'BLAST — the boom sprite scales 0.4→2.2 in three steps while the cell flashes white→pink, each chained mine pops 1.6→1, and the shake hits 8px with a settle.',
      specC: 'shake 300ms steps(6) · mine chain 60ms · boom 1 frame',
      specF: 'shake 360ms · boom 300ms steps(1) · pop 120ms · reduced: sprite swap only',
    },
    {
      id: 'win', cell: 44, title: '5 · STAGE CLEAR',
      current: 'StageClear.svelte — the banner drops in 6 steps, 40 confetti pixels fall straight down, the LED timer rolls its digits. The board itself does nothing.',
      fx: 'VICTORY WAVE — the banner slams in with a 2px overshoot, confetti tumbles in 90° steps with a short stagger, and every revealed tile hops in radial order from the centre.',
      specC: 'banner 240ms steps(6) · confetti 1.2s steps(12)',
      specF: 'banner 280ms · confetti 1.4s steps(14) + spin · tile hop 200ms, ring × 40ms',
    },
    {
      id: 'chord', cell: 40, title: '7 · CHORD PREVIEW — PRESS A REVEALED NUMBER',
      current: 'Pressing a revealed number gives no hint of what will open; on release the chord just happens (App.svelte move → CHORD).',
      fx: 'ARMED — while you hold a number whose adjacent flags match, the hidden neighbours it will open blink in the hover purple (300ms, steps); release crumbles them.',
      specC: 'no press feedback on revealed numbers',
      specF: '300ms armed blink · steps(1) · then 140ms crumble on release · reduced: no blink',
    },
    {
      id: 'deal', cell: 30, title: '8 · NEW GAME',
      current: 'App.svelte:131 — the {#key game} remount makes every tile appear instantly on restart or level change.',
      fx: 'DEAL-IN — tiles pop in from the centre outward, one ring every 25ms (about 350ms total on a 16×16 board).',
      specC: 'instant',
      specF: '120ms steps(2) per tile · ring × 25ms stagger · reduced: instant',
    },
  ];
</script>

<svelte:head><title>MOTION LAB · MINE SWEEPER</title></svelte:head>

<main class="lab">
  <header class="lab-head">
    <h1>MOTION<br />LAB</h1>
    <div class="lab-tools">
      <button class:active={!reduced} aria-pressed={!reduced} onclick={() => reduced = false}>FULL MOTION</button>
      <button class:active={reduced} aria-pressed={reduced} onclick={() => reduced = true}>REDUCED</button>
      <button class="play-all" onclick={() => globalTick++}>▶ PLAY ALL</button>
      <a class="back" href="/">◀ GAME</a>
    </div>
  </header>
  <p class="intro">
    Every moment of the game side by side. <strong class="c">CURRENT</strong> runs the real
    Cell / StageClear components from the game; <strong class="f">FX</strong> runs proposed stepped
    pixel effects on the same boards. Same timing tokens, same reduced-motion rules — nothing here
    changes the game yet.
  </p>
  {#each sections as s (s.id)}
    <section>
      <h2>{s.title}</h2>
      <div class="pair">
        <DemoCard variant="current" scenario={s.id} cell={s.cell} {reduced} {globalTick}
          label="CURRENT" note={s.current} spec={s.specC} />
        <DemoCard variant="fx" scenario={s.id} cell={s.cell} {reduced} {globalTick}
          label="FX · PROPOSED" note={s.fx} spec={s.specF} />
      </div>
    </section>
  {/each}
  <footer class="lab-foot">
    Lab page only (open <a href="?lab">?lab</a>) — pick the effects you like and they get wired into
    Cell.svelte, Board.svelte and StageClear.svelte.
  </footer>
</main>

<style>
  main.lab { max-width: 1060px; }
  .lab-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
  h1 {
    animation: neon 700ms steps(1) both;
    color: var(--cyan); font-size: 26px; line-height: 1.45; margin: 0; font-weight: 400;
    text-shadow: 4px 4px var(--magenta), 8px 8px var(--lo);
  }
  .lab-tools { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .lab-tools button { font-size: 9px; min-height: 40px; padding: 8px 12px; }
  .play-all { background: var(--magenta); color: var(--bg); border-color: var(--magenta); }
  .back { font-size: 9px; text-decoration: none; padding: 8px 0; }
  .intro { font-size: 9px; line-height: 2.2; color: var(--hi); max-width: 72ch; }
  .intro .c { color: var(--hi); }
  .intro .f { color: var(--cyan); }
  section { margin-top: 40px; }
  h2 { font-size: 12px; font-weight: 400; color: var(--yellow); margin: 0 0 16px; line-height: 1.8; }
  .pair { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; align-items: start; }
  .lab-foot { margin: 48px 0 24px; font-size: 9px; line-height: 2; text-align: center; color: var(--hi); }
</style>
