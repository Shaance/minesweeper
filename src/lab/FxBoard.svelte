<script lang="ts">
  import { untrack } from 'svelte';
  import FxCell from './FxCell.svelte';
  import StageClearFx from './StageClearFx.svelte';
  import { layout, cheb, ring, initialState, chordTargets, type Scenario } from './scenarios';

  let { scenario, reduced, tick, cell }: {
    scenario: Scenario; reduced: boolean; tick: number; cell: number;
  } = $props();

  const lay = $derived(layout(scenario));
  const base = $derived(initialState(scenario));
  let visited = $state<boolean[][]>([]);
  let flagged = $state<boolean[][]>([]);
  let delays = $state<Record<number, number>>({});
  let hopDelays = $state<Record<number, number>>({});
  let preview = $state<Set<number>>(new Set());
  let lost = $state(false);
  let won = $state(false);
  let detonated = $state(-1);
  let grid: HTMLDivElement | undefined = $state();

  $effect(() => {
    if (!tick) {
      untrack(() => {
        visited = base.visited.map((row) => [...row]);
        flagged = base.flagged.map((row) => [...row]);
      });
      return;
    }
    untrack(() => run());
  });

  function shake() {
    if (reduced || !grid) return;
    grid.animate(
      [0, 8, -8, 6, -4, 2, 0].map((x) => ({ transform: 'translateX(' + x + 'px)' })),
      { duration: 360, easing: 'steps(1, end)' },
    );
  }

  function run() {
    const n = lay.n;
    visited = base.visited.map((row) => [...row]);
    flagged = base.flagged.map((row) => [...row]);
    delays = {};
    hopDelays = {};
    preview = new Set();
    lost = false;
    won = false;
    detonated = -1;
    const o = { r: n >> 1, c: n >> 1 };
    if (scenario === 'chord') {
      const targets = chordTargets(n, o.r, o.c, flagged);
      if (!reduced) preview = new Set(targets);
      const reveal = () => {
        preview = new Set();
        for (const i of targets) {
          visited[Math.floor(i / n)][i % n] = true;
          delays[i] = cheb(Math.floor(i / n), i % n, o.r, o.c) * 25;
        }
      };
      if (reduced) reveal();
      else setTimeout(reveal, 300);
      return;
    }
    if (scenario === 'reveal') {
      visited[o.r][o.c] = true;
    } else if (scenario === 'cascade') {
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
        visited[r][c] = true;
        delays[r * n + c] = cheb(r, c, o.r, o.c) * 25;
      }
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
      shake();
    } else if (scenario === 'win') {
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
        visited[r][c] = true;
        delays[r * n + c] = ring(r, c, n) * 25;
        hopDelays[r * n + c] = ring(r, c, n) * 40;
      }
      won = true;
    }
    // 'deal': cells remount hidden with a staggered deal-in animation.
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
              <FxCell {value} visited={visited[r]?.[c] ?? false} flagged={flagged[r]?.[c] ?? false}
                {lost} {reduced} delay={delays[i] ?? 0} detonated={detonated === i}
                preview={preview.has(i)}
                hopDelay={won ? (hopDelays[i] ?? -1) : -1}
                dealDelay={scenario === 'deal' ? ring(r, c, lay.n) * 25 : -1} />
            </div>
          {/each}
        </div>
      {/each}
    {/key}
  </div>
  {#if won && scenario === 'win'}
    {#key tick}<StageClearFx {reduced} />{/key}
  {/if}
</div>
