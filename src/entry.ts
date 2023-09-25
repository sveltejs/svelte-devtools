import './app.css';
import App from './routes/+layout.svelte';

if (chrome.devtools.panels.themeName === 'dark') {
	document.body.classList.add('dark');
} else {
	document.body.classList.remove('dark');
}

export default new App({
	target: document.querySelector('#app')!,
});
