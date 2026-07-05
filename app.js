(() => {
  const fontStylesheet = document.getElementById("font-stylesheet");
  if (fontStylesheet) fontStylesheet.media = "all";

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    });
  }

  const app = document.getElementById("app");
  const dateEl = document.getElementById("fact-date");
  const factEl = document.getElementById("fact-text");
  const sourceEl = document.getElementById("fact-source");
  const hintEl = document.getElementById("hint");
  const favoriteBtn = document.getElementById("favorite-btn");
  const shareBtn = document.getElementById("share-btn");
  const savedBtn = document.getElementById("saved-btn");
  const savedPanel = document.getElementById("saved-panel");
  const savedClose = document.getElementById("saved-close");
  const savedList = document.getElementById("saved-list");
  const savedEmpty = document.getElementById("saved-empty");
  const toastEl = document.getElementById("toast");
  const aboutBtn = document.getElementById("about-btn");
  const aboutPanel = document.getElementById("about-panel");
  const aboutClose = document.getElementById("about-close");
  const bgMesh = document.querySelector(".bg-mesh");

  let openPanelCount = 0;
  function pauseBgMesh() {
    openPanelCount++;
    if (bgMesh) bgMesh.classList.add("bg-mesh-paused");
  }
  function resumeBgMesh() {
    openPanelCount = Math.max(0, openPanelCount - 1);
    if (bgMesh && openPanelCount === 0) bgMesh.classList.remove("bg-mesh-paused");
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SAVED_KEY = "huh_saved_facts";

  let loading = false;
  let current = null;
  let toastTimer = null;
  let isTodayFact = true;

  function isSafeUrl(url) {
    try {
      return ["http:", "https:"].includes(new URL(url).protocol);
    } catch (err) {
      return false;
    }
  }

  function formatDate(iso) {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" }).toUpperCase();
  }

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("toast-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("toast-visible"), 1800);
  }

  function getSaved() {
    try {
      return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
    } catch (err) {
      return [];
    }
  }

  function setSaved(list) {
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(list));
    } catch (err) {
      // localStorage unavailable — favorites just won't persist
    }
  }

  function isSaved(fact) {
    return getSaved().some((f) => f.fact === fact);
  }

  function updateFavoriteButton() {
    if (!favoriteBtn || !current) return;
    const saved = isSaved(current.fact);
    favoriteBtn.classList.toggle("active", saved);
    favoriteBtn.setAttribute("aria-pressed", String(saved));
    favoriteBtn.setAttribute("aria-label", saved ? "Remove from saved" : "Save this fact");
  }

  function toggleFavorite() {
    if (!current) return;
    const list = getSaved();
    const idx = list.findIndex((f) => f.fact === current.fact);
    if (idx >= 0) {
      list.splice(idx, 1);
      showToast("removed");
    } else {
      list.unshift({ fact: current.fact, source_url: current.source_url, date: current.date });
      showToast("saved");
    }
    setSaved(list);
    updateFavoriteButton();
  }

  async function copyCurrent() {
    if (!current) return;
    const text = current.source_url ? `Huh. Did you know — ${current.fact}\n${current.source_url}` : `Huh. Did you know — ${current.fact}`;
    try {
      await navigator.clipboard.writeText(text);
      showToast("copied");
    } catch (err) {
      showToast("couldn't copy");
    }
  }

  function renderSavedList() {
    const list = getSaved();
    savedList.innerHTML = "";
    savedEmpty.style.display = list.length ? "none" : "block";
    for (const item of list) {
      const li = document.createElement("li");
      li.className = "saved-item";

      const p = document.createElement("p");
      p.className = "saved-item-fact";
      p.textContent = item.fact;
      li.appendChild(p);

      const row = document.createElement("div");
      row.className = "saved-item-row";

      if (item.source_url && isSafeUrl(item.source_url)) {
        const a = document.createElement("a");
        a.className = "mono dim source-link";
        a.href = item.source_url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        try {
          a.textContent = new URL(item.source_url).hostname.replace(/^www\./, "");
        } catch (err) {
          a.textContent = item.source_url;
        }
        row.appendChild(a);
      }

      const removeBtn = document.createElement("button");
      removeBtn.className = "action-btn saved-item-remove";
      removeBtn.type = "button";
      removeBtn.setAttribute("aria-label", "Remove from saved");
      removeBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-.8 12.1a1 1 0 0 1-1 .9H7.8a1 1 0 0 1-1-.9L6 7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      removeBtn.addEventListener("click", () => {
        const next = getSaved().filter((f) => f.fact !== item.fact);
        setSaved(next);
        renderSavedList();
        updateFavoriteButton();
      });
      row.appendChild(removeBtn);

      li.appendChild(row);
      savedList.appendChild(li);
    }
  }

  function openSaved() {
    renderSavedList();
    pauseBgMesh();
    savedPanel.hidden = false;
    requestAnimationFrame(() => savedPanel.classList.add("saved-panel-open"));
  }

  function closeSaved() {
    savedPanel.classList.remove("saved-panel-open");
    resumeBgMesh();
    setTimeout(() => {
      savedPanel.hidden = true;
    }, 200);
  }

  function render(data) {
    current = data;
    dateEl.textContent = formatDate(data.date);
    factEl.textContent = data.fact;
    document.title = isTodayFact ? "huh. · fact of the day" : "huh. · random fact";
    if (data.source_url && isSafeUrl(data.source_url)) {
      sourceEl.href = data.source_url;
      sourceEl.textContent = new URL(data.source_url).hostname.replace(/^www\./, "");
      sourceEl.style.visibility = "visible";
    } else {
      sourceEl.style.visibility = "hidden";
    }
    updateFavoriteButton();
  }

  function setLoadingState() {
    factEl.classList.add("skeleton");
    factEl.textContent = "";
  }

  function setErrorState() {
    factEl.classList.remove("skeleton");
    factEl.textContent = "couldn't load a fact — tap or press space to retry.";
    sourceEl.style.visibility = "hidden";
    current = null;
  }

  async function fetchFact(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("bad response");
    return res.json();
  }

  async function load(url) {
    if (loading) return;
    loading = true;
    isTodayFact = url === "/api/today";

    const isFirstLoad = !factEl.dataset.loadedOnce;
    if (isFirstLoad) setLoadingState();

    try {
      const applyRender = async () => {
        const data = await fetchFact(url);
        factEl.classList.remove("skeleton");
        render(data);
        factEl.dataset.loadedOnce = "1";
      };

      if (prefersReducedMotion || isFirstLoad) {
        await applyRender();
      } else if (document.startViewTransition) {
        await document.startViewTransition(applyRender).finished;
      } else {
        factEl.classList.add("transitioning");
        await new Promise((r) => setTimeout(r, 220));
        await applyRender();
        factEl.classList.remove("transitioning");
      }
    } catch (err) {
      setErrorState();
    } finally {
      loading = false;
    }
  }

  function next() {
    load("/api/random");
  }

  function dismissHint() {
    if (!hintEl) return;
    hintEl.classList.remove("hint-first");
    try {
      localStorage.setItem("df_seen_hint", "1");
    } catch (err) {
      // localStorage unavailable (private browsing, etc) — hint just won't persist
    }
  }

  function isInteractive(target) {
    return target.closest(".action-row") || target.closest(".saved-panel") || target.closest("#about-panel") || target.closest("#about-btn") || target.closest("#install-banner");
  }

  // Stop touch events on interactive controls from ever reaching #app's
  // touchstart/touchend swipe handlers. Without this, iOS Safari treats the
  // tap as ambiguous between "tap the button" and "start a swipe on #app"
  // and only resolves it (firing the button's click) once a later swipe
  // settles the gesture — so buttons appear dead until you swipe.
  document.querySelectorAll(".action-row, .saved-panel, #about-panel, #about-btn, #install-banner").forEach((el) => {
    el.addEventListener("touchstart", (e) => e.stopPropagation(), { passive: true });
    el.addEventListener("touchend", (e) => e.stopPropagation(), { passive: true });
  });

  app.addEventListener("click", (e) => {
    if (isInteractive(e.target)) return;
    dismissHint();
    next();
  });

  app.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.code === "Enter") {
      e.preventDefault();
      dismissHint();
      next();
    }
  });

  // Swipe support (mobile): swipe left/up to load another fact.
  let touchStartX = 0;
  let touchStartY = 0;
  app.addEventListener(
    "touchstart",
    (e) => {
      if (isInteractive(e.target)) return;
      const t = e.changedTouches[0];
      touchStartX = t.clientX;
      touchStartY = t.clientY;
    },
    { passive: true }
  );

  app.addEventListener(
    "touchend",
    (e) => {
      if (isInteractive(e.target)) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStartX;
      const dy = t.clientY - touchStartY;
      const THRESHOLD = 40;
      if (Math.abs(dx) > THRESHOLD || Math.abs(dy) > THRESHOLD) {
        dismissHint();
        next();
      }
    },
    { passive: true }
  );

  if (favoriteBtn) {
    favoriteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite();
      app.focus();
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      copyCurrent();
      app.focus();
    });
  }

  if (savedBtn) {
    savedBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openSaved();
      app.focus();
    });
  }

  if (savedClose) {
    savedClose.addEventListener("click", (e) => {
      e.stopPropagation();
      closeSaved();
      app.focus();
    });
  }

  if (savedPanel) {
    savedPanel.addEventListener("click", (e) => {
      if (e.target === savedPanel) {
        closeSaved();
        app.focus();
      }
    });
  }

  // About panel
  function openAbout() {
    pauseBgMesh();
    aboutPanel.hidden = false;
    requestAnimationFrame(() => aboutPanel.classList.add("saved-panel-open"));
  }

  function closeAbout() {
    aboutPanel.classList.remove("saved-panel-open");
    resumeBgMesh();
    setTimeout(() => {
      aboutPanel.hidden = true;
    }, 200);
  }

  if (aboutBtn) {
    aboutBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openAbout();
    });
  }

  if (aboutClose) {
    aboutClose.addEventListener("click", (e) => {
      e.stopPropagation();
      closeAbout();
      app.focus();
    });
  }

  if (aboutPanel) {
    aboutPanel.addEventListener("click", (e) => {
      if (e.target === aboutPanel) {
        closeAbout();
        app.focus();
      }
    });
  }

  // ---- iOS install banner ----
  function isIOS() {
    return /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
  }

  function isStandalone() {
    return "standalone" in navigator && navigator.standalone;
  }

  function isVisitCountMet() {
    try {
      const visits = parseInt(localStorage.getItem("huh_visits") || "0", 10) + 1;
      localStorage.setItem("huh_visits", String(visits));
      return visits >= 2;
    } catch (err) {
      return false;
    }
  }

  function isInstallBannerDismissed() {
    try {
      return localStorage.getItem("huh_install_dismissed") === "1";
    } catch (err) {
      return false;
    }
  }

  const installBanner = document.getElementById("install-banner");
  const installBannerClose = document.getElementById("install-banner-close");

  if (installBanner && isIOS() && !isStandalone() && isVisitCountMet() && !isInstallBannerDismissed()) {
    installBanner.hidden = false;
    app.classList.add("has-install-banner");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => installBanner.classList.add("install-banner-visible"));
    });
  }

  if (installBannerClose) {
    installBannerClose.addEventListener("click", () => {
      installBanner.classList.remove("install-banner-visible");
      app.classList.remove("has-install-banner");
      setTimeout(() => {
        installBanner.hidden = true;
      }, 300);
      try {
        localStorage.setItem("huh_install_dismissed", "1");
      } catch (err) {}
    });
  }

  // ---- Hint — different messages for mobile vs desktop, shown once ----
  if (hintEl) {
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    let seenHint = false;
    try {
      seenHint = localStorage.getItem("df_seen_hint") === "1";
    } catch (err) {
      // localStorage unavailable — treat as first visit every time
    }
    if (!seenHint) {
      if (!isTouchDevice) {
        hintEl.textContent = "curious? spacebar / click";
      } else {
        hintEl.textContent = "swipe or tap for another";
      }
      hintEl.classList.add("hint-first");
      setTimeout(dismissHint, 6000);
    }
  }

  load("/api/today");
})();
