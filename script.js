/* Ankush Rana, portfolio interactions. No dependencies. */
(() => {
  "use strict";

  const EMAIL = "iankushrana@gmail.com";
  const LINKEDIN = "https://www.linkedin.com/in/ankushsrana/";
  const BOOK = "https://www.amazon.in/Zehan-Aatish-Ankush-Rana/dp/9356284075";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)");
  const desktop = window.matchMedia("(min-width: 900px)");
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

  /* ---------- small helpers ---------- */
  $$("[data-mod-key]").forEach((k) => (k.textContent = isMac ? "⌘K" : "Ctrl K"));
  $$("[data-year]").forEach((y) => (y.textContent = new Date().getFullYear()));

  const toastEl = $(".toast");
  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-on"), 2200);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
      document.body.append(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch { ok = false; }
      ta.remove();
      return ok;
    }
  }

  /* ---------- session log: everything tracked, nothing stored ---------- */
  const logList = $("[data-log-list]");
  const startedAt = Date.now();
  function log(message) {
    if (!logList) return;
    const secs = Math.round((Date.now() - startedAt) / 1000);
    const li = document.createElement("li");
    const time = document.createElement("time");
    time.textContent = secs < 60 ? `${secs}s` : `${Math.floor(secs / 60)}m ${secs % 60}s`;
    li.append(document.createTextNode(message), time);
    logList.prepend(li);
    while (logList.children.length > 7) logList.lastElementChild.remove();
  }

  /* ---------- actions ---------- */
  async function copyEmail() {
    const ok = await copyText(EMAIL);
    toast(ok ? "Email copied" : `Copy failed. The address is ${EMAIL}`);
    if (ok) log("Copied the email");
  }

  async function sharePage() {
    const data = { title: document.title, url: location.href.split("#")[0] };
    if (navigator.share && !finePointer.matches) {
      try { await navigator.share(data); log("Shared the page"); } catch { /* user closed the sheet */ }
      return;
    }
    const ok = await copyText(data.url);
    toast(ok ? "Link copied" : "Copy failed. Use the address bar instead");
    if (ok) log("Copied the page link");
  }

  function openExternal(url, label) {
    window.open(url, "_blank", "noopener");
    log(label);
  }

  $$("[data-copy-email]").forEach((b) => b.addEventListener("click", copyEmail));
  $$("[data-share]").forEach((b) => b.addEventListener("click", sharePage));

  /* ---------- navigation + scrollspy ---------- */
  const tools = $$(".tool[href^='#']");
  const sectionName = {};
  tools.forEach((t) => (sectionName[t.getAttribute("href").slice(1)] = t.querySelector(".tool__tip").firstChild.textContent.trim()));

  function go(hash) {
    const el = document.querySelector(hash);
    if (!el) return;
    el.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
    el.focus({ preventScroll: true });
    history.replaceState(null, "", hash === "#top" ? location.pathname + location.search : hash);
  }

  tools.forEach((t) =>
    t.addEventListener("click", (e) => {
      e.preventDefault();
      go(t.getAttribute("href"));
    })
  );

  const visited = new Set();
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        tools.forEach((t) => {
          if (t.getAttribute("href") === `#${id}`) t.setAttribute("aria-current", "true");
          else t.removeAttribute("aria-current");
        });
        if (id !== "top" && sectionName[id] && !visited.has(id)) {
          visited.add(id);
          log(`Scrolled to ${sectionName[id]}`);
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  $$("main > section[id]").forEach((s) => spy.observe(s));

  /* ---------- keyboard shortcuts ---------- */
  const typingTarget = (el) => el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable);

  document.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    if ((e.metaKey || e.ctrlKey) && key === "k") {
      e.preventDefault();
      palette.open ? closePalette() : openPalette();
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey || typingTarget(e.target) || palette.open) return;
    if (key === "/") { e.preventDefault(); openPalette(); return; }
    // let arrow keys and letters work inside tabs/stickies without jumping sections
    if (e.target.closest && e.target.closest(".sticky")) return;
    const tool = tools.find((t) => t.dataset.key === key);
    if (tool) {
      e.preventDefault();
      go(tool.getAttribute("href"));
      log(`Pressed ${key.toUpperCase()} for ${sectionName[tool.getAttribute("href").slice(1)]}`);
    }
  });

  /* ---------- command menu ---------- */
  const palette = $(".cmdk");
  const pInput = $("input", palette);
  const pList = $(".cmdk__list", palette);
  // extra words people might type for each section
  const synonyms = {
    top: "home intro start about",
    journey: "product engineering gtm go-to-market market pipeline process",
    channels: "linkedin google ads paid pr seo abm events performance",
    projects: "work case studies trade shows campaigns portfolio",
    experience: "career jobs cv resume roles version history",
    author: "book poetry poet writing zehan aatish",
    "off-duty": "pets dog cat play fun hobbies",
    contact: "email hire talk reach",
  };
  const commands = [
    ...tools.map((t) => {
      const id = t.getAttribute("href").slice(1);
      return {
        label: `Go to ${sectionName[id].toLowerCase()}`,
        words: synonyms[id] || "",
        icon: t.querySelector("use").getAttribute("href").slice(1),
        key: t.dataset.key.toUpperCase(),
        run: () => go(`#${id}`),
      };
    }),
    { label: "Go to toolkit and education", words: "tools skills stack mba degree certifications languages", icon: "i-plug", run: () => go("#toolkit") },
    { label: "Copy email address", words: "contact clipboard", icon: "i-copy", run: copyEmail },
    { label: "Write me an email", words: "contact mail hire", icon: "i-envelope-simple", run: () => { location.href = `mailto:${EMAIL}`; log("Started an email"); } },
    { label: "Open LinkedIn profile", words: "social cv resume", icon: "i-linkedin-logo", run: () => openExternal(LINKEDIN, "Opened LinkedIn") },
    { label: "Get Zehan-e-Aatish on Amazon", words: "book poetry buy author", icon: "i-amazon-logo", run: () => openExternal(BOOK, "Opened the book on Amazon") },
    { label: "Share this page", words: "link copy url", icon: "i-share-network", run: sharePage },
  ];
  let filtered = commands;
  let active = 0;

  function renderPalette() {
    const q = pInput.value.trim().toLowerCase();
    filtered = commands.filter((c) => `${c.label} ${c.words}`.toLowerCase().includes(q));
    active = Math.min(active, Math.max(filtered.length - 1, 0));
    pList.innerHTML = "";
    if (!filtered.length) {
      const li = document.createElement("li");
      li.className = "cmdk__empty";
      li.textContent = "No matches. Try “projects”, “email” or “book”.";
      pList.append(li);
      pInput.removeAttribute("aria-activedescendant");
      return;
    }
    filtered.forEach((c, i) => {
      const li = document.createElement("li");
      li.className = "cmdk__item";
      li.id = `cmd-${i}`;
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", String(i === active));
      li.innerHTML = `<svg class="icon" aria-hidden="true"><use href="#${c.icon}"/></svg><span></span>${c.key ? `<kbd>${c.key}</kbd>` : ""}`;
      li.querySelector("span").textContent = c.label;
      li.addEventListener("click", () => runCommand(i));
      li.addEventListener("mousemove", () => { if (active !== i) { active = i; markActive(); } });
      pList.append(li);
    });
    markActive();
  }
  function markActive() {
    $$(".cmdk__item", pList).forEach((li, i) => li.setAttribute("aria-selected", String(i === active)));
    const cur = $(`#cmd-${active}`, pList);
    if (cur) { pInput.setAttribute("aria-activedescendant", cur.id); cur.scrollIntoView({ block: "nearest" }); }
  }
  function runCommand(i) {
    const c = filtered[i];
    if (!c) return;
    closePalette();
    requestAnimationFrame(() => c.run());
  }
  function openPalette() {
    if (palette.open) return;
    pInput.value = "";
    active = 0;
    renderPalette();
    palette.showModal();
    pInput.focus();
    log("Opened the command menu");
  }
  function closePalette() { if (palette.open) palette.close(); }

  pInput.addEventListener("input", () => { active = 0; renderPalette(); });
  pInput.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); active = (active + 1) % Math.max(filtered.length, 1); markActive(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); active = (active - 1 + filtered.length) % Math.max(filtered.length, 1); markActive(); }
    else if (e.key === "Enter") { e.preventDefault(); runCommand(active); }
  });
  palette.addEventListener("click", (e) => { if (e.target === palette) closePalette(); });
  $$("[data-cmdk-open]").forEach((b) => b.addEventListener("click", openPalette));

  /* ---------- tabs: journey stages + channel layers ---------- */
  $$("[data-tabs]").forEach((list) => {
    const tabs = $$("[role='tab']", list);
    const prefix = list.dataset.log;
    function select(tab, focus) {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
      if (prefix) {
        const name = (tab.querySelector(".flow__name") || tab).textContent.trim();
        log(`${prefix} ${name}`);
      }
      // keep the selected layer chip in view on the mobile scroller
      tab.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduceMotion.matches ? "auto" : "smooth" });
    }
    tabs.forEach((t) => t.addEventListener("click", () => { if (t.getAttribute("aria-selected") !== "true") select(t); }));
    list.addEventListener("keydown", (e) => {
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      let n = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") n = (i + 1) % tabs.length;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") n = 0;
      else if (e.key === "End") n = tabs.length - 1;
      if (n === null) return;
      e.preventDefault();
      select(tabs[n], true);
    });
  });

  /* ---------- projects: expanding panels / accordion ---------- */
  const projs = $$(".proj");
  function setProject(target, toggle) {
    projs.forEach((p) => {
      const on = p === target ? (toggle ? !p.classList.contains("is-open") : true) : false;
      p.classList.toggle("is-open", on);
      $(".proj__tab", p).setAttribute("aria-expanded", String(on));
    });
    if (target.classList.contains("is-open")) log(`Opened project: ${$(".proj__label", target).textContent}`);
  }
  projs.forEach((p, i) => {
    const btn = $(".proj__tab", p);
    btn.addEventListener("click", () => {
      if (desktop.matches) { if (!p.classList.contains("is-open")) setProject(p, false); }
      else setProject(p, true);
    });
    btn.addEventListener("keydown", (e) => {
      if (!desktop.matches) return;
      let n = null;
      if (e.key === "ArrowRight") n = (i + 1) % projs.length;
      if (e.key === "ArrowLeft") n = (i - 1 + projs.length) % projs.length;
      if (n === null) return;
      e.preventDefault();
      const next = projs[n];
      setProject(next, false);
      $(".proj__tab", next).focus();
    });
  });
  // keep exactly one panel open when returning to desktop width
  desktop.addEventListener("change", (e) => {
    if (e.matches && !projs.some((p) => p.classList.contains("is-open"))) setProject(projs[0], false);
  });

  /* ---------- hero: draggable stickies ---------- */
  const board = $("[data-board]");
  const stickies = board ? $$(".sticky", board) : [];
  let zTop = 6;

  function clampMove(st, dx, dy) {
    const maxX = board.clientWidth - st.offsetWidth - st.offsetLeft;
    const maxY = board.clientHeight - st.offsetHeight - st.offsetTop;
    return [Math.max(-st.offsetLeft, Math.min(maxX, dx)), Math.max(-st.offsetTop, Math.min(maxY, dy))];
  }
  function moveSticky(st, dx, dy) {
    [dx, dy] = clampMove(st, dx, dy);
    st.style.setProperty("--dx", `${dx}px`);
    st.style.setProperty("--dy", `${dy}px`);
  }
  const offset = (st, prop) => parseFloat(st.style.getPropertyValue(prop)) || 0;
  const stickyName = (st) => st.querySelector("strong").textContent;

  stickies.forEach((st) => {
    let startX, startY, baseX, baseY, dragging = false, moved = false;

    st.addEventListener("pointerdown", (e) => {
      if (!desktop.matches || e.button !== 0) return;
      dragging = true; moved = false;
      startX = e.clientX; startY = e.clientY;
      baseX = offset(st, "--dx"); baseY = offset(st, "--dy");
      st.setPointerCapture(e.pointerId);
      st.classList.add("is-dragging");
      st.style.zIndex = ++zTop;
    });
    st.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX, dy = e.clientY - startY;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      moveSticky(st, baseX + dx, baseY + dy);
    });
    const end = () => {
      if (!dragging) return;
      dragging = false;
      st.classList.remove("is-dragging");
      if (moved) log(`Moved the “${stickyName(st)}” sticky`);
    };
    st.addEventListener("pointerup", end);
    st.addEventListener("pointercancel", end);

    st.addEventListener("keydown", (e) => {
      if (!desktop.matches) return;
      const step = e.shiftKey ? 40 : 12;
      const map = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
      if (!map[e.key]) return;
      e.preventDefault();
      st.style.zIndex = ++zTop;
      moveSticky(st, offset(st, "--dx") + map[e.key][0], offset(st, "--dy") + map[e.key][1]);
    });
  });

  // reset positions if the layout switches to the stacked mobile view
  desktop.addEventListener("change", () => stickies.forEach((st) => { st.style.removeProperty("--dx"); st.style.removeProperty("--dy"); }));

  /* ---------- hero: multiplayer cursors ---------- */
  const cursors = board ? $$("[data-cursor]", board) : [];
  const anchors = board ? $$("[data-anchor]", board) : [];
  let cursorTimers = [];
  let heroVisible = true;

  function pointNear(el) {
    const b = board.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const x = r.left - b.left + r.width * (0.25 + Math.random() * 0.6);
    const y = r.top - b.top + r.height * (0.3 + Math.random() * 0.55);
    return [Math.round(x), Math.round(y)];
  }
  function placeCursor(c, el) {
    const [x, y] = pointNear(el);
    c.style.setProperty("--cx", `${x}px`);
    c.style.setProperty("--cy", `${y}px`);
  }
  const cursorAt = [];
  function freeAnchor(i) {
    // pick something no other cursor is pointing at right now
    const options = anchors.filter((a) => !cursorAt.includes(a));
    const pick = options[Math.floor(Math.random() * options.length)] || anchors[0];
    cursorAt[i] = pick;
    return pick;
  }
  function wander(c, i) {
    clearTimeout(cursorTimers[i]);
    const tick = () => {
      if (heroVisible && !document.hidden) placeCursor(c, freeAnchor(i));
      cursorTimers[i] = setTimeout(tick, 3200 + Math.random() * 3600);
    };
    cursorTimers[i] = setTimeout(tick, 1400 + i * 700);
  }
  function startCursors() {
    if (!board || !desktop.matches || !anchors.length) return;
    const bw = board.clientWidth;
    cursors.forEach((c, i) => {
      // enter from the right edge, then settle on something on the board
      c.style.setProperty("--cx", `${bw + 40}px`);
      c.style.setProperty("--cy", `${120 + i * 160}px`);
      c.classList.add("is-on");
      const first = anchors[(i * 2 + 1) % anchors.length];
      cursorAt[i] = first;
      if (reduceMotion.matches) {
        placeCursor(c, first);
        return;
      }
      requestAnimationFrame(() => requestAnimationFrame(() => placeCursor(c, first)));
      wander(c, i);
    });
  }
  function stopCursors() {
    cursorTimers.forEach(clearTimeout);
    cursorTimers = [];
    cursors.forEach((c) => c.classList.remove("is-on"));
  }
  if (board) {
    new IntersectionObserver(([entry]) => (heroVisible = entry.isIntersecting)).observe(board);
    window.addEventListener("load", startCursors);
    desktop.addEventListener("change", (e) => (e.matches ? startCursors() : stopCursors()));
  }

  /* ---------- hero: your own labelled cursor ---------- */
  const youTag = board && $(".you-tag", board);
  if (youTag) {
    board.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse" || !desktop.matches) return;
      const b = board.getBoundingClientRect();
      youTag.style.transform = `translate(${e.clientX - b.left + 16}px, ${e.clientY - b.top + 18}px)`;
      youTag.classList.add("is-on");
    });
    board.addEventListener("pointerleave", () => youTag.classList.remove("is-on"));
  }

  /* ---------- small extras for the log ---------- */
  $$(".version details").forEach((d) =>
    d.addEventListener("toggle", () => {
      if (d.open) log(`Expanded ${d.querySelector(".version__org").firstChild.textContent.trim().split(",")[0]}`);
    })
  );
  $$("a[href^='http']").forEach((a) =>
    a.addEventListener("click", () => {
      if (a.href.includes("amazon")) log("Opened the book on Amazon");
      else if (a.href.includes("linkedin")) log("Opened LinkedIn");
    })
  );
})();
