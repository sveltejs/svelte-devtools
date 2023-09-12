import './app.css';
import App from './routes/App.svelte';

if (chrome.devtools.panels.themeName === 'dark') {
	document.body.classList.add('dark');
} else {
	document.body.classList.remove('dark');
}

export default new App({
	target: document.querySelector('#app')!,
});
