import { mount } from 'svelte';
import App from './App.svelte';
import './app.css';

const target = document.getElementById('app')!;
// The large-display mocks page is dev-only: in production builds
// import.meta.env.DEV is statically false, so this branch (and its chunk)
// is dropped.
const params = new URLSearchParams(window.location.search);
if (import.meta.env.DEV && params.has('mocks')) {
  import('./mocks/LargeDisplayMocks.svelte').then(({ default: Mocks }) => mount(Mocks, { target }));
} else {
  mount(App, { target });
}
