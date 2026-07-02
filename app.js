(() => {
  const app = document.getElementById("app");
  const dateEl = document.getElementById("fact-date");
  const factEl = document.getElementById("fact-text");
  const sourceEl = document.getElementById("fact-source");

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let loading = false;

  function formatDate(iso) {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" }).toUpperCase();
  }

  function render(data) {
    dateEl.textContent = formatDate(data.date);
    factEl.textContent = data.fact;
    if (data.source_url) {
      sourceEl.href = data.source_url;
      sourceEl.textContent = new URL(data.source_url).hostname.replace(/^www\./, "");
      sourceEl.style.visibility = "visible";
    } else {
      sourceEl.style.visibility = "hidden";
    }
  }

  async function load(url) {
    if (loading) return;
    loading = true;
    try {
      const res = await fetch(url);
      const data = await res.json();

      if (prefersReducedMotion || !factEl.textContent) {
        render(data);
      } else {
        factEl.classList.add("transitioning");
        await new Promise((r) => setTimeout(r, 220));
        render(data);
        factEl.classList.remove("transitioning");
      }
    } catch (err) {
      factEl.textContent = "Couldn't load a fact right now — try again in a moment.";
    } finally {
      loading = false;
    }
  }

  function next() {
    load("/api/random");
  }

  app.addEventListener("click", (e) => {
    if (e.target === sourceEl) return;
    next();
  });

  app.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.code === "Enter") {
      e.preventDefault();
      next();
    }
  });

  load("/api/today");
})();
