import { mount } from 'svelte';
import App from './App.svelte';
import MotionLab from './lab/MotionLab.svelte';
import './app.css';

const lab = new URLSearchParams(window.location.search).has('lab');
mount(lab ? MotionLab : App, { target: document.getElementById('app')! });
