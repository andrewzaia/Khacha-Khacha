/* Shared light and dark theme behavior for the language learning sites. */
(function () {
  'use strict';
  const key = 'learn-languages-theme-v1';
  const colorMeta = document.querySelector('meta[name="theme-color"]');
  const lightBrowserColor = colorMeta ? colorMeta.getAttribute('content') : '#f5f7fb';
  const darkBrowserColor = '#101827';
  const preference = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  let saved = null;

  try {
    const value = window.localStorage.getItem(key);
    if (value === 'light' || value === 'dark') saved = value;
  } catch (_) {
    // The switch still works if the browser blocks storage.
  }

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (colorMeta) colorMeta.setAttribute('content', theme === 'dark' ? darkBrowserColor : lightBrowserColor);
    const button = document.getElementById('theme-toggle');
    if (!button) return;
    const action = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    button.setAttribute('aria-label', action);
    button.setAttribute('title', action);
    button.setAttribute('aria-pressed', String(theme === 'dark'));
  }

  // Apply before the stylesheets load to avoid flashing the wrong theme.
  apply(saved || (preference && preference.matches ? 'dark' : 'light'));

  document.addEventListener('DOMContentLoaded', function () {
    const button = document.getElementById('theme-toggle');
    if (!button) return;
    apply(document.documentElement.getAttribute('data-theme'));
    button.addEventListener('click', function () {
      saved = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      try { window.localStorage.setItem(key, saved); } catch (_) {}
      apply(saved);
    });
  });

  // Follow operating system changes until the visitor chooses a theme.
  if (preference) {
    const onChange = function (event) {
      if (!saved) apply(event.matches ? 'dark' : 'light');
    };
    if (preference.addEventListener) preference.addEventListener('change', onChange);
    else if (preference.addListener) preference.addListener(onChange);
  }
})();
