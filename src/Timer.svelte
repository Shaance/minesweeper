<script lang="ts">
  import { isPlayingState } from "./minesweeper/BoardHelper";
  import BoardState from "./minesweeper/BoardState";
  import board from "./store";

  $: state = $board.state;
  $: timeText = formatTime(elapsed, state);

  let interval: number;
  let elapsed = 0;
  let startTime: Date;

  function formatTime(seconds: number, state: BoardState) {
    let s = seconds;
    if (state === BoardState.INITIAL) {
      s = 0;
    }
    if (s > 999) {
      s = 999;
    }
    return s.toString().padStart(3, '0');
  }

  $: {
    if (state === BoardState.PLAYING) {
      startTime = new Date();
      elapsed = 0;
      interval = setInterval(() => {
        elapsed = Math.round((new Date().valueOf() - startTime.valueOf()) / 1000)
      }, 1000);
    } else if (!isPlayingState(state)) {
      clearInterval(interval);
    }
  }

</script>

<main>
    ⏳  {timeText}
</main>

<style>
  main {
    display: inline-block;
    text-align: left;
    font-size: 20px;
    font-weight: 300;
    margin-top: 20px;
    width: 90px;
    max-width: 90px;
  }
</style>
