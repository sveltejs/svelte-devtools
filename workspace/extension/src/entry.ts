import './app.css';
import App from './App.svelte';
import { mount } from 'svelte';

if (chrome.devtools.panels.themeName === 'dark') {
	document.body.classList.add('dark');
} else {
	document.body.classList.remove('dark');
}

export default mount(App, {
	target: document.querySelector('#app')!,
});
