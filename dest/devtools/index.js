chrome.devtools.panels.create(
  'Svelte',
  '/devtools/svelte-logo-black.svg',
  '/devtools/panel.html',
  panel =>
    panel.onShown.addListener(() =>
      chrome.devtools.inspectedWindow.eval(
        '__svelte_devtools_select_element($0)',
        (result, err) => err && console.error(err)
      )
    )
)
