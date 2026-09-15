<script lang="ts">
  import BoardInput from './minesweeper/BoardInput';
  let { mode, crt, sound, onmode, ontoggle }: {
    mode: BoardInput; crt: boolean; sound: boolean;
    onmode: (mode: BoardInput) => void; ontoggle: (setting: 'crt' | 'sound') => void;
  } = $props();
</script>

<div class="controls">
  <div class="mode" role="group" aria-label="Pointer mode">
    {#each [BoardInput.REVEAL, BoardInput.FLAG] as option}
      <button class:active={mode === option} aria-pressed={mode === option} onclick={() => onmode(option)}>
        {option}
      </button>
    {/each}
  </div>
  <button class:active={crt} aria-pressed={crt} onclick={() => ontoggle('crt')}>CRT</button>
  <button class:active={sound} aria-pressed={sound} onclick={() => ontoggle('sound')}>SOUND</button>
</div>
<p class="hints pointer-hints"><span>CLICK · REVEAL</span><span>RIGHT-CLICK / HOLD · FLAG</span></p>
<p class="hints touch-hints">TAP · REVEAL / FLAG<br />HOLD · FLAG</p>
<p class="visually-hidden" id="keyboard-help">Arrow keys move. Enter or Space reveals or chords. F flags.</p>

<style>
  .controls { display: flex; gap: 8px; margin-top: 28px; }
  .controls > button { flex: 1; }
  .mode { display: flex; flex: 2; }
  .mode button { flex: 1; }
  .mode button + button { border-left: 0; }
  button { font-size: 9px; min-height: 44px; padding: 8px; }
  .hints { text-align: center; font-size: 9px; line-height: 2; margin: 16px 0 0; }
  .pointer-hints { display: flex; flex-wrap: wrap; justify-content: center; gap: 0 24px; }
  .touch-hints { display: none; }
  @media (pointer: coarse) {
    .pointer-hints { display: none; }
    .touch-hints { display: block; }
  }
</style>
