<script lang="ts">
  import { untrack } from 'svelte';
  import Cell from '../Cell.svelte';
  import StageClear from '../StageClear.svelte';
  import BoardInput from '../minesweeper/BoardInput';
  import { layout, cheb, ring, type Scenario } from './scenarios';

  let { scenario, reduced, tick, cell }: {
    scenario: Scenario; reduced: boolean; tick: number; cell: number;
  } = $props();

  const lay = $derived(layout(scenario));
  let visited = $state<boolean[][]>([]);
  let flagged = $state<boolean[][]>([]);
  let delays = $state<Record<number, number>>({});
  let lost = $state(false);
  let won = $state(false);
  let detonated = $state(-1);
  let grid: HTMLDivElement | undefined = $state();

  const empty = (n: number) => Array.from({ length: n }, () => Array<boolean>(n).fill(false));

  $effect(() => {
    if (!tick) return;
    untrack(() => run());
  });

  function shake(lose: boolean) {
    if (reduced || !grid) return;
    grid.animate(
      lose
        ? [0, 6, -6, 6, -6, 0].map((x) => ({ transform: 'translateX(' + x + 'px)' }))
        : [{ transform: 'translateY(1px)' }, { transform: 'translateY(0)' }],
      { duration: lose ? 300 : 60, easing: lose ? 'steps(6)' : 'steps(1)' },
    );
  }

  function run() {
    const n = lay.n;
    visited = empty(n);
    flagged = empty(n);
    delays = {};
    lost = false;
    won = false;
    detonated = -1;
    const o = { r: n >> 1, c: n >> 1 };
    if (scenario === 'reveal') {
      visited[o.r][o.c] = true;
      shake(false);
    } else if (scenario === 'cascade') {
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
        visited[r][c] = true;
        delays[r * n + c] = cheb(r, c, o.r, o.c) * 25;
      }
      shake(false);
    } else if (scenario === 'flag') {
      flagged[o.r][o.c] = true;
    } else if (scenario === 'boom') {
      lost = true;
      const mines = lay.values.flatMap((row, r) =>
        row.flatMap((v, c) => (v === -1 ? [{ r, c }] : [])))
        .sort((a, b) => cheb(a.r, a.c, o.r, o.c) - cheb(b.r, b.c, o.r, o.c));
      mines.forEach((m, k) => {
        visited[m.r][m.c] = true;
        delays[m.r * n + m.c] = k * 60;
      });
      detonated = o.r * n + o.c;
      shake(true);
    } else if (scenario === 'win') {
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
        visited[r][c] = true;
        delays[r * n + c] = ring(r, c, n) * 25;
      }
      won = true;
      shake(false);
    }
    // 'deal' keeps everything hidden; the keyed remount is the instant appearance.
  }
</script>

<div class="lboard-wrap" style={'--n: ' + lay.n + '; --cell: ' + cell + 'px'}>
  <div class="lboard" bind:this={grid}>
    {#key tick}
      {#each lay.values as row, r}
        <div class="lrow">
          {#each row as value, c}
            {@const i = r * lay.n + c}
            <div class="lcell-wrap">
              <Cell {value} row={r} col={c}
                visited={visited[r]?.[c] ?? false} flagged={flagged[r]?.[c] ?? false}
                {lost} ended={lost} mode={BoardInput.REVEAL} {reduced}
                delay={delays[i] ?? 0} detonated={detonated === i}
                tabindex={-1} onfocus={() => {}} onpress={() => {}} onmove={() => {}} />
            </div>
          {/each}
        </div>
      {/each}
    {/key}
  </div>
  {#if won && scenario === 'win'}
    {#key tick}<StageClear {reduced} />{/key}
  {/if}
</div>
