import { mount } from 'svelte';
import App from './App.svelte';
import './app.css';

const target = document.getElementById('app')!;
// The motion lab and the large-display mocks are dev-only: in production builds
// import.meta.env.DEV is statically false, so these branches (and their chunks)
// are dropped.
const params = new URLSearchParams(window.location.search);
if (import.meta.env.DEV && params.has('mocks')) {
  import('./mocks/LargeDisplayMocks.svelte').then(({ default: Mocks }) => mount(Mocks, { target }));
} else if (import.meta.env.DEV && params.has('lab')) {
  import('./lab/MotionLab.svelte').then(({ default: MotionLab }) => mount(MotionLab, { target }));
} else {
  mount(App, { target });
}
