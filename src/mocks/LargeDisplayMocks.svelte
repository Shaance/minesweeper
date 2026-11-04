<script lang="ts">
  import MockScreen from './MockScreen.svelte';
</script>

<div class="page">
  <h1 class="title">LARGE-DISPLAY MOCKS</h1>
  <p class="intro">
    BEFORE frames show the app as shipped today; AFTER frames are placement options for large
    displays, rendered with the real components and a live board. Click cells to play, toggle
    CRT/SOUND, and press <kbd>M</kbd> — every frame switches REVEAL/FLAG mode (the new keyboard
    shortcut, also live in the game). Frames render at real pixel size; scroll a frame sideways
    if your window is narrower than it.
  </p>

  <section>
    <h2><span class="chip before">BEFORE</span> as shipped today</h2>
    <figure>
      <figcaption>390 × 844 phone — the single 480px column, unchanged</figcaption>
      <div class="viewport"><MockScreen layout="before-phone" width={390} height={844} /></div>
    </figure>
    <figure>
      <figcaption>1440 × 900 large display — same 480px column centred, dead space on both sides</figcaption>
      <div class="viewport"><MockScreen layout="before-wide" width={1440} height={900} /></div>
      <ul class="notes">
        <li>Board stays at 44px cells (~456px wide max) no matter how big the window gets.</li>
        <li>HUD, level picker and controls stay crammed into the same narrow column.</li>
      </ul>
    </figure>
  </section>

  <section>
    <h2><span class="chip after">AFTER</span> side-cabinet variants · 1440 × 900</h2>
    <figure>
      <figcaption>A1 · SIDE CABINET, RAIL RIGHT — board left at 56px cells; title, HUD, levels, controls in a 320px rail on the right</figcaption>
      <div class="viewport"><MockScreen layout="side" width={1440} height={900} cell={56} rail="right" railWidth={320} /></div>
      <ul class="notes">
        <li>Board takes the free width: 56px cells instead of 44px.</li>
        <li>Right side is a control panel exactly as tall as the board; board + panel centre in the frame as one cabinet, sections spread evenly inside.</li>
      </ul>
    </figure>
    <figure>
      <figcaption>A2 · MIRROR — same cabinet with the rail on the left, board on the right</figcaption>
      <div class="viewport"><MockScreen layout="side" width={1440} height={900} cell={56} rail="left" railWidth={320} /></div>
      <ul class="notes">
        <li>Identical pieces, mirrored: rail left keeps the board near the dominant reading edge on LTR screens.</li>
      </ul>
    </figure>
    <figure>
      <figcaption>A3 · WIDE RAIL — 400px rail on the right, board at 64px cells; rail blocks spread down the full 900px height</figcaption>
      <div class="viewport"><MockScreen layout="side" width={1440} height={900} cell={64} rail="right" railWidth={400} /></div>
      <ul class="notes">
        <li>Same panel as A1 but 400px wide: title + HI-SCORE on one row, bigger LEDs/face, roomier buttons.</li>
        <li>Levels, mode toggle and hints stay glued as one deck — spacing rhythm lives between the four groups, not between loose rows.</li>
      </ul>
    </figure>
  </section>

  <p class="intro"><a href="/">← Back to the game</a></p>
</div>

<style>
  .page { max-width: 1560px; margin: 0 auto; padding: 32px 24px 64px; }
  .title {
    color: var(--cyan); font-size: 20px; font-weight: 400; margin: 0 0 16px;
    text-shadow: 3px 3px var(--magenta), 6px 6px var(--lo);
  }
  .intro { font-size: 9px; line-height: 2; max-width: 720px; margin: 0 0 8px; }
  kbd { border: 1px solid var(--mid); padding: 2px 4px; color: var(--cyan); }
  section { margin-top: 32px; }
  h2 { font-size: 12px; font-weight: 400; color: var(--hi); margin: 0 0 16px; display: flex; align-items: center; gap: 12px; }
  .chip { font-size: 8px; padding: 4px 6px; border: 2px solid; }
  .chip.before { color: var(--yellow); border-color: var(--yellow); }
  .chip.after { color: var(--cyan); border-color: var(--cyan); }
  figure { margin: 0 0 32px; }
  figcaption { font-size: 9px; line-height: 1.8; margin-bottom: 8px; color: var(--hi); }
  .viewport {
    max-width: 100%; overflow: auto; border: 4px solid var(--hi);
    box-shadow: 0 0 0 4px var(--bg), 0 0 0 8px var(--magenta), 0 0 40px #e879f966;
    background: var(--bg); line-height: 0;
  }
  .notes { margin: 8px 0 0; padding-left: 16px; font-size: 9px; line-height: 2; color: var(--hi); }
</style>
