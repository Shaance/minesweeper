import { mount } from 'svelte';
import App from './App.svelte';
import './app.css';

const target = document.getElementById('app')!;
// The motion lab is dev-only: in production builds import.meta.env.DEV is
// statically false, so this branch (and the whole lab chunk) is dropped.
if (import.meta.env.DEV && new URLSearchParams(window.location.search).has('lab')) {
  import('./lab/MotionLab.svelte').then(({ default: MotionLab }) => mount(MotionLab, { target }));
} else {
  mount(App, { target });
}
