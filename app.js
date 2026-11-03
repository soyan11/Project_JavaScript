/* LOVE DIARY — ADVANCED EDITION
   The UI markup and all styling are created from JavaScript.
   Main concepts: DOM, events, Date, arrays, objects, localStorage, JSON, PWA.
*/
(() => {
  "use strict";

  const STORAGE_KEY = "loveDiaryAdvanced_v1";
  const THEME_KEY = "loveDiaryAdvancedTheme";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  let state = {
    relationships: [],
    memories: [],
    plans: []
  };
  let currentFilter = "all";
  let searchText = "";
  let sortMode = "newest";
  let toastTimer = null;
  let deferredInstallPrompt = null;

  const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,500&display=swap');
  :root{--bg:#f7f3f6;--surface:#fff;--surface2:#fcf9fb;--text:#302538;--muted:#8d8290;--line:#eee5ec;--accent:#d87d9e;--accent2:#b75d80;--soft:#f9eaf0;--green:#5d9c7e;--red:#c76c79;--shadow:0 14px 38px rgba(54,35,57,.065);--navy:#302538}
  *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;transition:.2s}body.dark{--bg:#1c1821;--surface:#29232f;--surface2:#302936;--text:#f7eff5;--muted:#b9acbc;--line:#423746;--accent:#ed9db9;--accent2:#f1b2c8;--soft:#49313f;--green:#88c6a5;--red:#e398a0;--shadow:0 14px 38px rgba(0,0,0,.2);--navy:#f7eff5}
  button,input,select,textarea{font:inherit}button{cursor:pointer}a{color:inherit}
  .top{height:72px;position:sticky;top:0;z-index:5;display:flex;align-items:center;justify-content:space-between;padding:0 max(calc((100vw - 1160px)/2),5%);background:color-mix(in srgb,var(--surface) 90%,transparent);border-bottom:1px solid var(--line);backdrop-filter:blur(15px)}
  .brand{display:flex;gap:10px;align-items:center;text-decoration:none;font:600 23px 'Playfair Display',serif}.brand-icon{display:grid;place-items:center;width:34px;height:34px;border-radius:12px;background:var(--soft);color:var(--accent)}
  .brand span:last-child em{font-style:normal;color:var(--accent)}.nav{display:flex;gap:25px}.nav a{text-decoration:none;color:var(--muted);font-size:11px;font-weight:700;padding:27px 0;border-bottom:2px solid transparent}.nav a:hover,.nav a.active{color:var(--accent2);border-color:var(--accent)}
  .top-actions{display:flex;gap:8px}.icon-btn,.install-btn{border:1px solid var(--line);border-radius:10px;background:var(--surface);color:var(--text);padding:9px 12px}.install-btn{background:var(--navy);color:var(--bg);border:0;font-size:10px;font-weight:700}
  .wrap{width:min(1160px,90%);margin:auto}.hero{display:flex;align-items:center;justify-content:space-between;padding:58px 3% 38px;min-height:285px}.eyebrow{font-size:9px;font-weight:700;letter-spacing:2px;color:var(--accent2)}h1{font:500 clamp(42px,5vw,62px)/1.08 'Playfair Display',serif;letter-spacing:-1px;margin:17px 0 12px}h1 em{color:var(--accent);font-weight:500}.sub{font-size:12px;line-height:1.8;color:var(--muted);max-width:450px}.hero-art{width:260px;height:205px;display:grid;place-items:center;position:relative;margin-right:7%}.orb{position:absolute;width:205px;height:145px;border:1px solid #d98eaa66;border-radius:50%;transform:rotate(-30deg)}.orb.two{width:165px;height:205px;transform:rotate(35deg);border-color:#a99ad166}.heart{display:grid;place-items:center;width:105px;height:105px;border-radius:32px;background:linear-gradient(145deg,#f7dce6,#dfa2bc);color:white;font-size:47px;transform:rotate(-8deg);box-shadow:0 18px 40px #d77c9c44}.spark{position:absolute;color:var(--accent);font-size:22px}.spark.one{top:20px;right:35px}.spark.two{bottom:20px;left:20px}.hero-note{position:absolute;bottom:0;right:0;color:var(--muted);font:italic 12px 'Playfair Display',serif}
  .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:13px;margin:0 0 55px}.stat{padding:18px 20px;background:var(--surface);border:1px solid var(--line);border-radius:15px;box-shadow:var(--shadow)}.stat-head{display:flex;align-items:center;justify-content:space-between;color:var(--muted);font-size:8px;letter-spacing:1.5px;font-weight:700}.stat-symbol{display:grid;place-items:center;width:31px;height:31px;border-radius:10px;background:var(--soft);color:var(--accent);font-size:17px}.stat-num{font:34px 'Playfair Display',serif;margin-top:10px}.stat-num small{font:10px 'DM Sans',sans-serif;color:var(--muted)}.stat-foot{font-size:9px;color:var(--muted);margin-top:5px}
  .section{margin:0 0 58px;scroll-margin-top:92px}.section-head{display:flex;justify-content:space-between;align-items:end;gap:14px;margin-bottom:18px}.section-head h2{font:500 29px 'Playfair Display',serif;margin:7px 0 4px}.section-desc{font-size:10px;color:var(--muted);margin:0;line-height:1.7}.btn{border:0;border-radius:10px;padding:11px 15px;font-size:10px;font-weight:700;transition:.2s}.btn:hover{transform:translateY(-1px)}.primary{background:var(--accent);color:white;box-shadow:0 6px 15px #d87d9e30}.secondary{background:var(--soft);color:var(--accent2)}.danger{background:#f8e9eb;color:var(--red)}.toolbar{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-bottom:14px}.search{flex:1;min-width:170px}.control{border:1px solid var(--line);border-radius:9px;padding:10px 12px;background:var(--surface);color:var(--text);font-size:10px;outline:none}.control:focus{border-color:var(--accent)}.filter{display:flex;gap:5px}.filter button{border:1px solid var(--line);border-radius:20px;padding:8px 12px;background:var(--surface);color:var(--muted);font-size:9px}.filter button.selected{background:var(--soft);color:var(--accent2);border-color:transparent}
  .cards{display:grid;gap:12px}.relationship{display:grid;grid-template-columns:48px minmax(130px,1fr) minmax(150px,auto) auto;gap:15px;align-items:center;background:var(--surface);border:1px solid var(--line);border-radius:15px;padding:17px 19px;box-shadow:var(--shadow)}.avatar{width:46px;height:46px;border-radius:15px;display:grid;place-items:center;background:var(--soft);color:var(--accent2);font:22px 'Playfair Display',serif}.person{font:18px 'Playfair Display',serif;margin-bottom:4px}.meta{font-size:9px;color:var(--muted);line-height:1.6}.status{display:inline-flex;align-items:center;gap:5px;font-size:8px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;color:var(--green);margin-top:4px}.status.past{color:var(--muted)}.dot{width:6px;height:6px;border-radius:50%;background:currentColor}.duration{text-align:right}.duration strong{display:block;font:19px 'Playfair Display',serif;font-weight:500}.duration span{font-size:9px;color:var(--muted)}.actions{display:flex;gap:6px}.mini{border:1px solid var(--line);background:var(--surface2);color:var(--muted);border-radius:8px;padding:7px 9px;font-size:9px}.mini:hover{color:var(--accent2);border-color:var(--accent)}.live{grid-column:2/5;color:var(--accent2);font-size:9px;margin-top:-8px;font-variant-numeric:tabular-nums}
  .empty{padding:38px 15px;text-align:center;border:1px dashed var(--line);border-radius:15px;background:var(--surface)}.empty-icon{font-size:30px;color:var(--accent)}.empty h3{font:20px 'Playfair Display',serif;margin:8px 0}.empty p{font-size:10px;color:var(--muted)}
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:14px}.panel{padding:20px;background:var(--surface);border:1px solid var(--line);border-radius:15px;box-shadow:var(--shadow)}.panel h3{font:20px 'Playfair Display',serif;margin:0 0 13px}.milestone-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 0;border-bottom:1px solid var(--line)}.milestone-row:last-child{border:0}.milestone-name{font-size:10px;font-weight:700}.milestone-sub{font-size:9px;color:var(--muted);margin-top:3px}.pill{font-size:8px;padding:5px 8px;border-radius:20px;background:var(--soft);color:var(--accent2);white-space:nowrap}
  .memory-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.memory{position:relative;padding:17px;background:var(--surface);border:1px solid var(--line);border-radius:14px;min-height:130px;box-shadow:var(--shadow)}.memory-date{font-size:8px;letter-spacing:.8px;color:var(--accent2);font-weight:700;margin-bottom:10px}.memory-title{font:17px 'Playfair Display',serif;margin-bottom:6px}.memory-body{font-size:9px;color:var(--muted);line-height:1.7;white-space:pre-wrap;overflow-wrap:anywhere}.memory-partner{font-size:8px;color:var(--muted);margin-top:11px}.memory-del{position:absolute;right:10px;top:8px;border:0;background:none;color:var(--muted);font-size:17px}
  .settings-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.setting{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:15px;background:var(--surface);border:1px solid var(--line);border-radius:13px}.setting strong{font-size:10px}.setting p{font-size:9px;color:var(--muted);margin:4px 0 0;line-height:1.5}
  .privacy{display:flex;gap:12px;padding:17px 19px;background:var(--surface2);border:1px solid var(--line);border-radius:13px;margin-bottom:50px}.privacy b{font-size:10px}.privacy p{font-size:9px;color:var(--muted);margin:4px 0 0;line-height:1.6}
  footer{border-top:1px solid var(--line);padding:22px 5%;font-size:9px;color:var(--muted);text-align:center}.footer-heart{color:var(--accent)}
  .modal-backdrop{position:fixed;inset:0;z-index:10;background:#1b142399;display:none;align-items:center;justify-content:center;padding:15px;backdrop-filter:blur(4px)}.modal-backdrop.open{display:flex}.modal{width:min(490px,100%);max-height:92vh;overflow:auto;background:var(--surface);border:1px solid var(--line);border-radius:17px;padding:24px;box-shadow:0 24px 80px #0003}.modal-head{display:flex;justify-content:space-between;align-items:start;margin-bottom:18px}.modal h2{font:25px 'Playfair Display',serif;margin:6px 0}.close{width:30px;height:30px;border:1px solid var(--line);border-radius:9px;background:var(--surface2);color:var(--muted);font-size:19px}.field{margin:12px 0}.field label{display:block;font-size:9px;font-weight:700;color:var(--muted);margin-bottom:6px}.field input,.field textarea,.field select{width:100%;border:1px solid var(--line);border-radius:9px;padding:11px;background:var(--surface2);color:var(--text);font-size:10px;outline:none}.field input:focus,.field textarea:focus,.field select:focus{border-color:var(--accent)}.field textarea{resize:vertical}.hint{font-size:8px;color:var(--muted);font-weight:400}.modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:19px}.error{min-height:13px;color:var(--red);font-size:9px}.toast{position:fixed;bottom:22px;left:50%;transform:translate(-50%,20px);opacity:0;z-index:20;background:var(--navy);color:var(--bg);border-radius:10px;padding:11px 16px;font-size:10px;transition:.2s;pointer-events:none}.toast.show{opacity:1;transform:translate(-50%,0)}
  @media(max-width:760px){.top{padding:0 5%}.nav{gap:13px}.nav a{font-size:9px}.hero{padding:43px 2% 30px}.hero-art{transform:scale(.8);margin-right:0}.stats{grid-template-columns:repeat(2,1fr)}.relationship{grid-template-columns:43px 1fr auto;gap:11px;padding:15px}.avatar{width:42px;height:42px}.duration{grid-column:2;text-align:left}.actions{grid-column:3;grid-row:1/3;flex-direction:column}.live{grid-column:2/4}.memory-grid{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:520px){.top{height:64px}.brand{font-size:19px}.nav{gap:9px}.nav a{font-size:8px}.install-btn{padding:9px}.hero-art{display:none}h1{font-size:46px}.section-head{align-items:start;flex-direction:column}.section-head h2{font-size:26px}.two-col,.settings-grid{grid-template-columns:1fr}.memory-grid{grid-template-columns:1fr 1fr}.footer-right{display:block;margin-top:5px}}
  @media(max-width:370px){.nav{gap:6px}.nav a{font-size:7px}.memory-grid{grid-template-columns:1fr}.stat{padding:14px}}
  `;

  function injectStyles() {
    const style = document.createElement("style");
    style.id = "love-diary-styles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function appMarkup() {
    return `
      <header class="top">
        <a class="brand" href="#home"><span class="brand-icon">♥</span><span>love<em>diary</em></span></a>
        <nav class="nav"><a class="active" href="#home">Overview</a><a href="#relationships">Relationships</a><a href="#milestones">Milestones</a><a href="#memories">Memories</a><a href="#settings">Settings</a></nav>
        <div class="top-actions"><button class="icon-btn" id="themeBtn" title="Change theme">☼</button><button class="install-btn" id="installBtn" hidden>↓ Install</button></div>
      </header>
      <main class="wrap" id="home">
        <section class="hero">
          <div><div class="eyebrow">✦ YOUR PRIVATE RELATIONSHIP SPACE</div><h1>Your story.<br><em>Every moment matters.</em></h1><p class="sub">Keep track of every chapter, celebrate the time you share, and save the little memories you never want to forget.</p></div>
          <div class="hero-art" aria-hidden="true"><div class="orb"></div><div class="orb two"></div><div class="heart">♥</div><span class="spark one">✦</span><span class="spark two">✧</span><div class="hero-note">a diary of the heart</div></div>
        </section>
        <section class="stats" id="stats"></section>
        <section class="section" id="relationships">
          <div class="section-head"><div><div class="eyebrow">YOUR JOURNEY</div><h2>Relationship timeline</h2><p class="section-desc">Record each relationship with its exact start and end date.</p></div><button class="btn primary" id="addRelationship">＋ Add relationship</button></div>
          <div class="toolbar"><input class="control search" id="searchInput" placeholder="Search by partner name..." aria-label="Search partners"><div class="filter"><button data-filter="all" class="selected">All</button><button data-filter="active">Current</button><button data-filter="past">Past</button></div><select class="control" id="sortSelect" aria-label="Sort relationships"><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="longest">Longest duration</option><option value="name">Name A–Z</option></select></div>
          <div class="cards" id="relationshipCards"></div>
        </section>
        <section class="section" id="milestones">
          <div class="section-head"><div><div class="eyebrow">SPECIAL DATES</div><h2>Milestones & anniversaries</h2><p class="section-desc">See upcoming relationship milestones and celebrate each chapter.</p></div></div>
          <div class="two-col"><article class="panel"><h3>Next milestones</h3><div id="milestoneList"></div></article><article class="panel"><h3>Relationship highlights</h3><div id="highlightList"></div></article></div>
        </section>
        <section class="section" id="memories">
          <div class="section-head"><div><div class="eyebrow">LITTLE THINGS, BIG MEANING</div><h2>Memory journal</h2><p class="section-desc">Save special dates, notes, and moments connected to your relationships.</p></div><button class="btn secondary" id="addMemory">＋ Add memory</button></div>
          <div class="memory-grid" id="memoryCards"></div>
        </section>
        <section class="section" id="settings">
          <div class="section-head"><div><div class="eyebrow">YOUR DIARY, YOUR RULES</div><h2>Settings & data</h2><p class="section-desc">Choose a theme and manage your saved information.</p></div></div>
          <div class="settings-grid">
            <div class="setting"><div><strong>Appearance</strong><p>Switch between light and dark themes.</p></div><button class="btn secondary" id="settingsTheme">Change theme</button></div>
            <div class="setting"><div><strong>Export your diary</strong><p>Download a JSON backup of all your records.</p></div><button class="btn secondary" id="exportData">Export JSON</button></div>
            <div class="setting"><div><strong>Import a backup</strong><p>Restore a previously exported JSON file.</p></div><button class="btn secondary" id="importData">Import JSON</button><input type="file" id="importFile" accept="application/json,.json" hidden></div>
            <div class="setting"><div><strong>Delete all data</strong><p>Permanently clear this browser's diary records.</p></div><button class="btn danger" id="clearData">Clear diary</button></div>
          </div>
        </section>
        <aside class="privacy"><span>⌑</span><div><b>Your privacy matters.</b><p>Your records are stored in this browser using LocalStorage. They are not sent to a server. Export a backup before clearing browser data or changing devices.</p></div></aside>
      </main>
      <footer><span class="footer-heart">♥</span> Made with care · Love Diary <span class="footer-right">Your story is yours to keep.</span></footer>
      <div class="modal-backdrop" id="modalBackdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><div id="modalContent"></div></section></div>
      <div class="toast" id="toast" role="status"></div>
    `;
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved && Array.isArray(saved.relationships) && Array.isArray(saved.memories)) {
        state = { relationships: saved.relationships, memories: saved.memories, plans: Array.isArray(saved.plans) ? saved.plans : [] };
      }
    } catch (error) { console.warn("Saved data could not be loaded.", error); }
  }
  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    renderAll();
  }
  function id() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function safe(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[ch]));
  }
  function date(value) {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  function fmtDate(value, withTime = false) {
    const d = date(value); if (!d) return "Not set";
    return d.toLocaleString(undefined, withTime
      ? {year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}
      : {year:"numeric",month:"long",day:"numeric"});
  }
  function parts(start, end = new Date()) {
    const seconds = Math.max(0, Math.floor((end - start) / 1000));
    return { days:Math.floor(seconds / 86400), hours:Math.floor(seconds % 86400 / 3600), minutes:Math.floor(seconds % 3600 / 60), seconds:seconds % 60 };
  }
  function durationLabel(start, end) {
    const p = parts(start, end);
    const years = Math.floor(p.days / 365.2425);
    const months = Math.floor((p.days - years * 365.2425) / 30.436875);
    const days = Math.floor(p.days - years * 365.2425 - months * 30.436875);
    const labels = [];
    if (years) labels.push(`${years} year${years === 1 ? "" : "s"}`);
    if (months) labels.push(`${months} month${months === 1 ? "" : "s"}`);
    if (days || !labels.length) labels.push(`${days} day${days === 1 ? "" : "s"}`);
    return labels.join(", ");
  }
  function active(r) { return !r.end; }
  function totalDays(r) { const s = date(r.start); return s ? parts(s, date(r.end) || new Date()).days : 0; }
  function showToast(message) {
    const el = $("#toast"); el.textContent = message; el.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 2400);
  }
  function openModal(content) {
    $("#modalContent").innerHTML = content;
    $("#modalBackdrop").classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    $("#modalBackdrop").classList.remove("open");
    document.body.style.overflow = "";
  }
  function field(label, id, type, value = "", placeholder = "", hint = "") {
    return `<div class="field"><label for="${id}">${label} ${hint ? `<span class="hint">${hint}</span>` : ""}</label><input id="${id}" class="control" type="${type}" value="${safe(value)}" placeholder="${safe(placeholder)}" required></div>`;
  }
  function openRelationshipForm(record = null) {
    const editing = !!record;
    openModal(`<div class="modal-head"><div><div class="eyebrow">A NEW CHAPTER</div><h2 id="modalTitle">${editing ? "Edit relationship" : "Add relationship"}</h2></div><button class="close" data-close>×</button></div>
      <form id="relationshipForm">
        ${field("Partner's name","partnerName","text",record?.name || "","Enter their name")}
        ${field("Start date & time","partnerStart","datetime-local",record?.start || "","")}
        ${field("End date & time","partnerEnd","datetime-local",record?.end || "","")}
        <div class="field"><label for="partnerNote">Your note <span class="hint">(optional)</span></label><textarea id="partnerNote" rows="3" placeholder="A short note about this relationship...">${safe(record?.note || "")}</textarea></div>
        <p class="hint">Leave the end date empty if the relationship is still active.</p><p class="error" id="formError"></p>
        <div class="modal-actions"><button type="button" class="btn secondary" data-close>Cancel</button><button class="btn primary" type="submit">Save relationship ♥</button></div>
      </form>`);
    $("#partnerStart").value = record?.start || localDateTimeNow();
    $("#relationshipForm").addEventListener("submit", event => {
      event.preventDefault();
      const name = $("#partnerName").value.trim(), start = $("#partnerStart").value, end = $("#partnerEnd").value;
      const s = date(start), e = date(end);
      if (!name || !s) return $("#formError").textContent = "Enter a partner name and start date.";
      if (s > new Date()) return $("#formError").textContent = "Start date cannot be in the future.";
      if (end && (!e || e < s)) return $("#formError").textContent = "End date must be after the start date.";
      const item = { id:record?.id || id(), name, start, end, note:$("#partnerNote").value.trim(), createdAt:record?.createdAt || new Date().toISOString() };
      if (editing) state.relationships = state.relationships.map(r => r.id === record.id ? item : r);
      else state.relationships.push(item);
      closeModal(); saveState(); showToast(editing ? "Relationship updated ♥" : "Relationship saved ♥");
    });
  }
  function localDateTimeNow() {
    const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0,16);
  }
  function openMemoryForm(record = null) {
    const editing = !!record;
    const opts = state.relationships.map(r => `<option value="${r.id}" ${record?.relationshipId === r.id ? "selected" : ""}>${safe(r.name)}</option>`).join("");
    openModal(`<div class="modal-head"><div><div class="eyebrow">A MOMENT TO KEEP</div><h2 id="modalTitle">${editing ? "Edit memory" : "Add a memory"}</h2></div><button class="close" data-close>×</button></div>
      <form id="memoryForm">
        ${field("Memory title","memoryTitle","text",record?.title || "","Our first date...")}
        ${field("Memory date","memoryDate","date",record?.date || new Date().toISOString().slice(0,10),"")}
        <div class="field"><label for="memoryPartner">Connected relationship</label><select id="memoryPartner" class="control"><option value="">Personal memory</option>${opts}</select></div>
        <div class="field"><label for="memoryBody">Your memory <span class="hint">(optional)</span></label><textarea id="memoryBody" rows="4" placeholder="Write what made this moment special...">${safe(record?.body || "")}</textarea></div>
        <p class="error" id="formError"></p><div class="modal-actions"><button type="button" class="btn secondary" data-close>Cancel</button><button type="submit" class="btn primary">Save memory ✦</button></div>
      </form>`);
    $("#memoryForm").addEventListener("submit", event => {
      event.preventDefault();
      const title = $("#memoryTitle").value.trim(), day = $("#memoryDate").value;
      if (!title || !day) return $("#formError").textContent = "Enter a title and date.";
      if (date(day) > new Date()) return $("#formError").textContent = "Memory date cannot be in the future.";
      const item = {id:record?.id || id(), title, date:day, relationshipId:$("#memoryPartner").value, body:$("#memoryBody").value.trim()};
      if (editing) state.memories = state.memories.map(m => m.id === record.id ? item : m);
      else state.memories.push(item);
      closeModal(); saveState(); showToast("Memory saved ✦");
    });
  }
  function renderStats() {
    const total = state.relationships.reduce((sum,r) => sum + totalDays(r),0);
    const activeCount = state.relationships.filter(active).length;
    const totalHours = state.relationships.reduce((sum,r) => {
      const s = date(r.start), e = date(r.end) || new Date();
      return sum + (s ? Math.floor((e-s)/3600000) : 0);
    },0);
    const stats = [
      ["TOTAL PARTNERS",state.relationships.length,"People in your story","♡"],
      ["TOTAL TIME",total.toLocaleString(),"Combined whole days","◷"],
      ["CURRENTLY DATING",activeCount,"Active relationships","♥"],
      ["MEMORIES SAVED",state.memories.length,"Moments you have kept","✧"]
    ];
    $("#stats").innerHTML = stats.map(s => `<article class="stat"><div class="stat-head">${s[0]}<span class="stat-symbol">${s[3]}</span></div><div class="stat-num">${s[1]}</div><div class="stat-foot">${s[2]}</div></article>`).join("");
  }
  function getVisibleRelationships() {
    let records = [...state.relationships];
    if (currentFilter === "active") records = records.filter(active);
    if (currentFilter === "past") records = records.filter(r => !active(r));
    if (searchText) records = records.filter(r => r.name.toLowerCase().includes(searchText));
    if (sortMode === "newest") records.sort((a,b) => date(b.start)-date(a.start));
    if (sortMode === "oldest") records.sort((a,b) => date(a.start)-date(b.start));
    if (sortMode === "longest") records.sort((a,b) => totalDays(b)-totalDays(a));
    if (sortMode === "name") records.sort((a,b) => a.name.localeCompare(b.name));
    return records;
  }
  function renderRelationships() {
    const records = getVisibleRelationships();
    if (!records.length) {
      $("#relationshipCards").innerHTML = `<div class="empty"><div class="empty-icon">♡</div><h3>${state.relationships.length ? "No matching relationships" : "Your story starts here"}</h3><p>${state.relationships.length ? "Try changing your search or filter." : "Add a relationship to begin keeping track of your journey."}</p>${state.relationships.length ? "" : `<button class="btn primary" id="emptyAdd">＋ Add your first relationship</button>`}</div>`;
      $("#emptyAdd")?.addEventListener("click", () => openRelationshipForm());
      return;
    }
    $("#relationshipCards").innerHTML = records.map(r => {
      const s = date(r.start), e = date(r.end) || new Date(), p = parts(s,e);
      return `<article class="relationship"><div class="avatar">${safe((r.name[0] || "♡").toUpperCase())}</div><div><div class="person">${safe(r.name)}</div><div class="meta">Started ${fmtDate(r.start,true)}${r.end ? `<br>Ended ${fmtDate(r.end,true)}` : ""}</div><div class="status ${active(r) ? "" : "past"}"><i class="dot"></i>${active(r) ? "Currently dating" : "Past relationship"}</div></div><div class="duration"><strong>${durationLabel(s,e)}</strong><span>${p.days.toLocaleString()} days total</span></div><div class="actions"><button class="mini" data-edit-rel="${r.id}">Edit</button><button class="mini" data-delete-rel="${r.id}">Delete</button></div>${active(r) ? `<div class="live" data-live="${r.id}">Together ${p.days} days · ${p.hours}h ${p.minutes}m ${p.seconds}s</div>` : ""}</article>`;
    }).join("");
  }
  function nextMilestoneFor(r) {
    const start = date(r.start), now = new Date(), elapsed = parts(start,now).days;
    const milestones = [7,14,30,50,100,180,200,300,365,500,730,1000,1500,2000,3650];
    const target = milestones.find(n => n > elapsed) || (Math.floor(elapsed/365)+1)*365;
    return {target, remaining:target-elapsed, elapsed, name:target % 365 === 0 ? `${Math.round(target/365)} year${target/365===365?"":"s"}` : `${target} days`};
  }
  function renderMilestones() {
    const activeRecords = state.relationships.filter(active).map(r => ({r, m:nextMilestoneFor(r)})).sort((a,b)=>a.m.remaining-b.m.remaining);
    $("#milestoneList").innerHTML = activeRecords.length ? activeRecords.slice(0,5).map(({r,m}) => `<div class="milestone-row"><div><div class="milestone-name">${safe(r.name)} · ${m.name}</div><div class="milestone-sub">${m.elapsed.toLocaleString()} days together</div></div><span class="pill">${m.remaining} days left</span></div>`).join("") : `<p class="section-desc">Add a current relationship to see upcoming milestones here.</p>`;
    const longest = [...state.relationships].sort((a,b)=>totalDays(b)-totalDays(a))[0];
    const earliest = [...state.relationships].sort((a,b)=>date(a.start)-date(b.start))[0];
    const items = [
      ["Longest chapter",longest ? `${longest.name} · ${totalDays(longest).toLocaleString()} days` : "No records yet"],
      ["First recorded",earliest ? `${earliest.name} · ${fmtDate(earliest.start)}` : "No records yet"],
      ["Past relationships",state.relationships.filter(r=>!active(r)).length],
      ["Current relationships",state.relationships.filter(active).length]
    ];
    $("#highlightList").innerHTML = items.map(([k,v])=>`<div class="milestone-row"><div class="milestone-name">${k}</div><span class="pill">${safe(v)}</span></div>`).join("");
  }
  function renderMemories() {
    const records = [...state.memories].sort((a,b)=>b.date.localeCompare(a.date));
    $("#memoryCards").innerHTML = records.length ? records.map(m => {
      const rel = state.relationships.find(r=>r.id===m.relationshipId);
      return `<article class="memory"><button class="memory-del" data-delete-memory="${m.id}" aria-label="Delete memory">×</button><div class="memory-date">${fmtDate(m.date)}</div><div class="memory-title">${safe(m.title)}</div><div class="memory-body">${safe(m.body || "A little moment worth remembering.")}</div><div class="memory-partner">${rel ? `With ${safe(rel.name)}` : "Personal memory"}</div><div style="margin-top:10px"><button class="mini" data-edit-memory="${m.id}">Edit memory</button></div></article>`;
    }).join("") : `<div class="empty" style="grid-column:1/-1"><div class="empty-icon">✧</div><h3>No memories saved yet</h3><p>Save a special moment when you are ready.</p></div>`;
  }
  function renderAll() {
    renderStats(); renderRelationships(); renderMilestones(); renderMemories();
    $$(".filter button").forEach(btn => btn.classList.toggle("selected",btn.dataset.filter===currentFilter));
  }
  function tick() {
    state.relationships.filter(active).forEach(r => {
      const el = $(`[data-live="${r.id}"]`);
      if (!el) return;
      const p = parts(date(r.start),new Date());
      el.textContent = `Together ${p.days.toLocaleString()} days · ${p.hours}h ${p.minutes}m ${p.seconds}s`;
    });
    renderMilestones();
  }
  function exportData() {
    const blob = new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),...state},null,2)],{type:"application/json"});
    const url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href=url; a.download=`love-diary-backup-${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(url);
    showToast("Backup downloaded.");
  }
  function importData(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed || !Array.isArray(parsed.relationships) || !Array.isArray(parsed.memories)) throw new Error("Invalid backup");
        if (!confirm("Import this backup and replace the diary currently saved in this browser?")) return;
        state = {relationships:parsed.relationships,memories:parsed.memories,plans:Array.isArray(parsed.plans)?parsed.plans:[]};
        saveState(); showToast("Backup imported.");
      } catch (error) { showToast("Could not import: invalid JSON backup."); }
    };
    reader.readAsText(file);
  }
  function setTheme() {
    document.body.classList.toggle("dark");
    localStorage.setItem(THEME_KEY,document.body.classList.contains("dark")?"dark":"light");
    $("#themeBtn").textContent = document.body.classList.contains("dark") ? "☾" : "☼";
  }
  function bindEvents() {
    $("#addRelationship").addEventListener("click",()=>openRelationshipForm());
    $("#addMemory").addEventListener("click",()=>openMemoryForm());
    $("#searchInput").addEventListener("input",e=>{searchText=e.target.value.trim().toLowerCase();renderRelationships();});
    $("#sortSelect").addEventListener("change",e=>{sortMode=e.target.value;renderRelationships();});
    $$(".filter button").forEach(btn=>btn.addEventListener("click",()=>{currentFilter=btn.dataset.filter;renderRelationships();$$(".filter button").forEach(b=>b.classList.toggle("selected",b===btn));}));
    $("#relationshipCards").addEventListener("click",e=>{
      const edit=e.target.closest("[data-edit-rel]"), del=e.target.closest("[data-delete-rel]");
      if(edit){const r=state.relationships.find(x=>x.id===edit.dataset.editRel);if(r)openRelationshipForm(r);}
      if(del){const r=state.relationships.find(x=>x.id===del.dataset.deleteRel);if(r&&confirm(`Delete the relationship with ${r.name}?`)){state.relationships=state.relationships.filter(x=>x.id!==r.id);state.memories.forEach(m=>{if(m.relationshipId===r.id)m.relationshipId="";});saveState();showToast("Relationship deleted.");}}
    });
    $("#memoryCards").addEventListener("click",e=>{
      const del=e.target.closest("[data-delete-memory]"), edit=e.target.closest("[data-edit-memory]");
      if(del&&confirm("Delete this memory?")){state.memories=state.memories.filter(m=>m.id!==del.dataset.deleteMemory);saveState();showToast("Memory deleted.");}
      if(edit){const m=state.memories.find(x=>x.id===edit.dataset.editMemory);if(m)openMemoryForm(m);}
    });
    $("#modalBackdrop").addEventListener("click",e=>{if(e.target.id==="modalBackdrop"||e.target.closest("[data-close]"))closeModal();});
    document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();});
    $("#themeBtn").addEventListener("click",setTheme);$("#settingsTheme").addEventListener("click",setTheme);
    $("#exportData").addEventListener("click",exportData);
    $("#importData").addEventListener("click",()=>$("#importFile").click());
    $("#importFile").addEventListener("change",e=>{if(e.target.files[0])importData(e.target.files[0]);e.target.value="";});
    $("#clearData").addEventListener("click",()=>{if(confirm("This will permanently delete all relationships and memories saved in this browser. Continue?")){state={relationships:[],memories:[],plans:[]};saveState();showToast("Your diary has been cleared.");}});
    $$(".nav a").forEach(a=>a.addEventListener("click",()=>{$$(".nav a").forEach(n=>n.classList.toggle("active",n===a));}));
  }
  function setupPWA() {
    window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstallPrompt=e;$("#installBtn").hidden=false;});
    $("#installBtn").addEventListener("click",async()=>{
      if(!deferredInstallPrompt){showToast("Use your browser menu to install this app.");return;}
      deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;$("#installBtn").hidden=true;
    });
    if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(console.warn));
  }
  function init() {
    injectStyles();
    $("#app").innerHTML=appMarkup();
    loadState();
    if(localStorage.getItem(THEME_KEY)==="dark"){document.body.classList.add("dark");$("#themeBtn").textContent="☾";}
    bindEvents();renderAll();setupPWA();setInterval(tick,1000);
  }
  init();
})();