(function () {
  const STORAGE_KEY = "dealer_theme";

  function readStoredTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === "light" || saved === "dark" ? saved : null;
    } catch {
      return null;
    }
  }

  function writeStoredTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Ignore storage failures; the toggle still applies for this page view.
    }
  }

  function preferredTheme() {
    const saved = readStoredTheme();
    if (saved) {
      return saved;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
    const toggle = document.getElementById("theme-toggle");
    if (toggle) {
      toggle.textContent = theme === "dark" ? "Light mode" : "Dark mode";
      toggle.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
      toggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || preferredTheme();
    const next = current === "dark" ? "light" : "dark";
    writeStoredTheme(next);
    applyTheme(next);
  }

  function initThemeToggle() {
    applyTheme(preferredTheme());
    const toggle = document.getElementById("theme-toggle");
    if (toggle) {
      toggle.addEventListener("click", toggleTheme);
    }

    // Keep multiple tabs/windows in sync when theme changes elsewhere.
    window.addEventListener("storage", function (event) {
      if (event.key === STORAGE_KEY && (event.newValue === "light" || event.newValue === "dark")) {
        applyTheme(event.newValue);
      }
    });
  }

  // Apply as early as possible to avoid a stale theme state.
  applyTheme(preferredTheme());

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initThemeToggle);
  } else {
    initThemeToggle();
  }
})();
