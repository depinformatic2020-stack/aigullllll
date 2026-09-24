/* =========================================================
   Сайт Айгул Джекшеновой
   Настройки — меняйте здесь
   ========================================================= */
const CONFIG = {
  PIN: "1616",           // код для входа в режим редактирования (смените на свой)
  START_YEAR: 2009,      // год начала работы в образовании
  ROLES: [
    "преподаватель цифровой экономики",
    "ментор UNICEF «Девочки в науке»",
    "математик и информатик",
    "мама троих детей",
  ],
};

/* ---------- Исходное содержимое редактируемых разделов ---------- */
const DEFAULTS = {
  places: [
    { title: "Кыргызский экономический университет им. М. Рыскулбекова", meta: "С 2009 года · по настоящее время",
      text: "Кафедра «Экономико-математическое моделирование и цифровые технологии». Здесь прошёл весь мой путь — от методиста до преподавателя, и здесь я каждый день работаю со студентами." },
    { title: "Кыргызский Национальный Университет им. Ж. Баласагына", meta: "Факультет информационных и инновационных технологий",
      text: "Кафедра информатики и вычислительной техники. Университет, который когда-то выпустил меня, — теперь место, где я делюсь знаниями сама." },
  ],
  projects: [
    { title: "«Девочки в науке»", meta: "Ментор · UNICEF в Кыргызстане",
      text: "Проект Детского фонда ООН, который помогает девочкам выбирать науку, технологии и математику. Я поддерживаю участниц, показываю, что IT — это про них тоже." },
    { title: "She Starts", meta: "Участница проекта",
      text: "Проект о развитии женского лидерства и предпринимательства. Для меня это возможность учиться у сильных женщин и вдохновлять других." },
    { title: "Empowering Women in Entrepreneurship through Media", meta: "2021 · SMM",
      text: "Активное участие в проекте и успешно пройденное онлайн-обучение в сфере SMM — цифровые медиа как инструмент для роста." },
  ],
  courses: [
    { meta: "2010", title: "Организация и управление учебным процессом", text: "КНУ и центр развития «Ала-Тоо», сертификат" },
    { meta: "2011", title: "Корпоративная этика", text: "Образовательный центр «Дасмия», сертификат" },
    { meta: "2012", title: "Психология деловых отношений", text: "КНУ им. Ж. Баласагына, сертификат" },
    { meta: "2017", title: "Профессиональное выгорание", text: "КЭУ им. М. Рыскулбекова, сертификат" },
    { meta: "2017", title: "Единство в многообразии: педагогические подходы и технологии", text: "КЭУ им. М. Рыскулбекова, сертификат" },
    { meta: "2020", title: "Интерактивные методы обучения с использованием дистанционных образовательных технологий", text: "КЭУ им. М. Рыскулбекова, сертификат" },
    { meta: "2021", title: "Психология и педагогика", text: "КЭУ им. М. Рыскулбекова, сертификат" },
    { meta: "2021", title: "Проверка дипломных работ (ВКР)", text: "Антиплагиат, Москва, сертификат" },
    { meta: "2021", title: "English language — Intermediate level", text: "КЭУ, Бишкек, Certificate" },
    { meta: "2021", title: "Разработка учебной программы «Цифровая экономика»", text: "Дипломатическая академия МИД КР, сертификат" },
    { meta: "", title: "Интерактивные методы обучения и управление учебным процессом", text: "Сертификат" },
  ],
  articles: [],
  gallery: [],
  certs: [],
};

/* Подписи полей формы для каждого раздела */
const FORM = {
  places:   { h: "Учреждение",           title: "Название",          meta: "Период / подразделение" },
  projects: { h: "Проект",               title: "Название проекта",  meta: "Роль / год" },
  courses:  { h: "Повышение квалификации", title: "Название курса",  meta: "Год",  text: "Организация, сертификат" },
  articles: { h: "Статья",               title: "Заголовок статьи",  meta: "Дата / журнал" },
  gallery:  { h: "Событие",              title: "Название события",  meta: "Дата / место" },
  certs:    { h: "Сертификат",           title: "Название сертификата", meta: "Год / организация" },
};

/* =========================================================
   Хранилище (IndexedDB — вмещает много фотографий)
   ========================================================= */
const Store = (() => {
  let dbp;
  const open = () => dbp || (dbp = new Promise((res, rej) => {
    const r = indexedDB.open("aigul-site", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("kv");
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  }));
  const tx = async (mode, fn) => {
    const db = await open();
    return new Promise((res, rej) => {
      const t = db.transaction("kv", mode);
      const req = fn(t.objectStore("kv"));
      t.oncomplete = () => res(req && req.result);
      t.onerror = () => rej(t.error);
    });
  };
  return {
    get: (k) => tx("readonly", (s) => s.get(k)).catch(() => undefined),
    set: (k, v) => tx("readwrite", (s) => s.put(v, k)),
  };
})();

const state = {};
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

async function loadState() {
  for (const key of Object.keys(DEFAULTS)) {
    const saved = await Store.get(key);
    state[key] = Array.isArray(saved) ? saved : DEFAULTS[key].map((it) => ({ id: uid(), ...it }));
  }
}
async function save(key) {
  try { await Store.set(key, state[key]); }
  catch (e) { toast("Не удалось сохранить: " + e.message); }
}

/* =========================================================
   Отрисовка разделов
   ========================================================= */
const tools = (key, id) =>
  `<div class="item-tools"><button data-edit="${key}" data-id="${id}" title="Редактировать">✎</button><button class="del" data-del="${key}" data-id="${id}" title="Удалить">🗑</button></div>`;

const VIEWS = {
  card: (it, key, i) => `
    <article class="card reveal reveal--up" style="--d:${(i % 3) * 0.1}s">
      ${tools(key, it.id)}
      ${it.img ? `<div class="card__img" data-zoom="${key}:${it.id}"><img src="${it.img}" alt="${esc(it.title)}" loading="lazy"></div>` : ""}
      <div class="card__body">
        ${it.img ? "" : `<div class="card__num">${String(i + 1).padStart(2, "0")}</div>`}
        ${it.meta ? `<div class="card__meta">${esc(it.meta)}</div>` : ""}
        <h3>${esc(it.title)}</h3>
        ${it.text ? `<p>${esc(it.text)}</p>` : ""}
      </div>
    </article>`,

  course: (it, key, i) => `
    <div class="course reveal ${i % 2 ? "reveal--right" : "reveal--left"}" style="--d:${(i % 4) * 0.06}s">
      ${tools(key, it.id)}
      <div class="course__year">${esc(it.meta)}</div>
      <div>
        <h3>${esc(it.title)}</h3>
        ${it.text ? `<p>${esc(it.text)}</p>` : ""}
        ${it.img ? `<img class="course__img" src="${it.img}" alt="" data-zoom="${key}:${it.id}" loading="lazy">` : ""}
      </div>
    </div>`,

  article: (it, key, i) => `
    <article class="article reveal reveal--up" style="--d:${(i % 3) * 0.1}s">
      ${tools(key, it.id)}
      ${it.img ? `<div class="article__img"><img src="${it.img}" alt="${esc(it.title)}" loading="lazy"></div>` : ""}
      <div class="article__body">
        ${it.meta ? `<div class="article__meta">${esc(it.meta)}</div>` : ""}
        <h3>${esc(it.title)}</h3>
        ${it.text ? `<p>${esc(it.text)}</p>` : ""}
        <button class="article__more" data-read="${it.id}">Читать</button>
      </div>
    </article>`,

  gallery: (it, key, i) => `
    <figure class="shot reveal reveal--up" style="--d:${(i % 3) * 0.1}s">
      ${tools(key, it.id)}
      ${it.img ? `<img src="${it.img}" alt="${esc(it.title)}" data-zoom="${key}:${it.id}" loading="lazy">` : ""}
      ${it.title || it.text || it.meta ? `<figcaption class="shot__cap">
        ${it.meta ? `<span>${esc(it.meta)}</span>` : ""}
        ${it.title ? `<b>${esc(it.title)}</b>` : ""}
        ${it.text ? `<p>${esc(it.text)}</p>` : ""}
      </figcaption>` : ""}
    </figure>`,

  cert: (it, key, i) => `
    <div class="cert reveal reveal--up" style="--d:${(i % 4) * 0.08}s">
      ${tools(key, it.id)}
      ${it.img ? `<img src="${it.img}" alt="${esc(it.title)}" data-zoom="${key}:${it.id}" loading="lazy">` : ""}
      ${it.title ? `<b>${esc(it.title)}</b>` : ""}
      ${it.meta ? `<span>${esc(it.meta)}</span>` : ""}
      ${it.text ? `<span>${esc(it.text)}</span>` : ""}
    </div>`,
};

function render(key) {
  const box = $(`.collection[data-collection="${key}"]`);
  if (!box) return;
  const view = VIEWS[box.dataset.view];
  const items = state[key] || [];
  box.innerHTML = items.length
    ? items.map((it, i) => view(it, key, i)).join("")
    : `<div class="empty">${esc(box.dataset.empty || "Пока здесь пусто.")}</div>`;
  $$(".reveal", box).forEach((el) => revealObserver.observe(el));
  if (key === "courses") updateCounters(true);
}
const renderAll = () => Object.keys(DEFAULTS).forEach(render);

/* =========================================================
   Форма добавления / редактирования
   ========================================================= */
const modal = $("#modal"), form = $("#itemForm"), drop = $("#drop"), preview = $("#fPreview");
let current = { key: null, id: null, img: null };

function openForm(key, id = null) {
  const f = FORM[key];
  const it = id ? state[key].find((x) => x.id === id) : null;
  current = { key, id, img: it?.img || null };
  $("#modalTitle").textContent = (it ? "Редактировать: " : "Добавить: ") + f.h.toLowerCase();
  $("#lblTitle").textContent = f.title;
  $("#lblMeta").textContent = f.meta;
  $("#fTitle").value = it?.title || "";
  $("#fMeta").value = it?.meta || "";
  $("#fText").value = it?.text || "";
  $("#fText").previousElementSibling.textContent = f.text || "Текст";
  $("#fImg").value = "";
  setPreview(current.img);
  showModal(modal);
  setTimeout(() => $("#fTitle").focus(), 200);
}
function setPreview(src) {
  preview.src = src || "";
  drop.classList.toggle("has", !!src);
}

$("#fImg").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  $("#dropHint").textContent = "Обработка…";
  try {
    current.img = await compressImage(file);
    setPreview(current.img);
  } catch { toast("Не удалось прочитать изображение"); }
  $("#dropHint").textContent = "Нажмите, чтобы загрузить фото";
});
$("#removeImg").addEventListener("click", () => { current.img = null; $("#fImg").value = ""; setPreview(null); });

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    title: $("#fTitle").value.trim(),
    meta: $("#fMeta").value.trim(),
    text: $("#fText").value.trim(),
    img: current.img,
  };
  if (!data.title && !data.text && !data.img) { toast("Добавьте текст или фото"); return; }
  const list = state[current.key];
  if (current.id) Object.assign(list.find((x) => x.id === current.id), data);
  else list.push({ id: uid(), ...data });
  await save(current.key);
  render(current.key);
  hideModal(modal);
  toast("Сохранено ✓");
});

/* Сжатие фото до 1600px, чтобы сайт оставался быстрым */
function compressImage(file, max = 1600, quality = 0.85) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * k);
        c.height = Math.round(img.height * k);
        const ctx = c.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        res(c.toDataURL("image/jpeg", quality));
      };
      img.onerror = rej;
      img.src = reader.result;
    };
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

/* =========================================================
   Клики: добавить, редактировать, удалить, увеличить, читать
   ========================================================= */
document.addEventListener("click", async (e) => {
  const t = e.target.closest("[data-add],[data-edit],[data-del],[data-zoom],[data-read],[data-close]");
  if (!t) return;

  if (t.dataset.add) return openForm(t.dataset.add);
  if (t.dataset.edit) return openForm(t.dataset.edit, t.dataset.id);

  if (t.dataset.del) {
    if (!confirm("Удалить эту запись?")) return;
    const key = t.dataset.del;
    state[key] = state[key].filter((x) => x.id !== t.dataset.id);
    await save(key);
    render(key);
    return toast("Удалено");
  }

  if (t.dataset.zoom) {
    const [key, id] = t.dataset.zoom.split(":");
    const it = state[key].find((x) => x.id === id);
    if (it?.img) openLightbox(`<img src="${it.img}" alt="${esc(it.title)}">`);
    return;
  }

  if (t.dataset.read) {
    const it = state.articles.find((x) => x.id === t.dataset.read);
    if (!it) return;
    openLightbox(`<article class="read">
      ${it.img ? `<img src="${it.img}" alt="">` : ""}
      <div class="read__body">
        ${it.meta ? `<div class="article__meta">${esc(it.meta)}</div>` : ""}
        <h2>${esc(it.title)}</h2>
        <p>${esc(it.text)}</p>
      </div></article>`);
    return;
  }

  if (t.hasAttribute("data-close")) {
    const m = t.closest(".modal, .lightbox");
    if (m) hideModal(m);
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") $$(".modal.show, .lightbox.show").forEach(hideModal);
});

function showModal(m) { m.classList.add("show"); m.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; }
function hideModal(m) { m.classList.remove("show"); m.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; }
function openLightbox(html) { $("#lightboxContent").innerHTML = html; showModal($("#lightbox")); }
$("#lightbox").addEventListener("click", (e) => { if (e.target.id === "lightbox" || e.target.id === "lightboxContent") hideModal($("#lightbox")); });

let toastTimer;
function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2400);
}

/* =========================================================
   Режим редактирования
   ========================================================= */
const EDIT_KEY = "aigul-edit";
const setEditing = (on) => {
  document.body.classList.toggle("editing", on);
  try { on ? localStorage.setItem(EDIT_KEY, "1") : localStorage.removeItem(EDIT_KEY); } catch {}
};
try { if (localStorage.getItem(EDIT_KEY)) setEditing(true); } catch {}

const pinModal = $("#pinModal");
function askPin() {
  $("#pinInput").value = "";
  $("#pinErr").classList.remove("show");
  showModal(pinModal);
  setTimeout(() => $("#pinInput").focus(), 200);
}
$("#editToggle").addEventListener("click", () => document.body.classList.contains("editing") ? setEditing(false) : askPin());
$("#exitEdit").addEventListener("click", () => { setEditing(false); toast("Режим редактирования выключен"); });
$("#pinForm").addEventListener("submit", (e) => {
  e.preventDefault();
  if ($("#pinInput").value === CONFIG.PIN) {
    hideModal(pinModal);
    setEditing(true);
    toast("Можно добавлять и редактировать ✎");
  } else $("#pinErr").classList.add("show");
});
if (location.hash === "#edit" && !document.body.classList.contains("editing")) askPin();

/* Резервная копия: скачать и восстановить */
$("#exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `sait-aigul-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast("Копия сохранена");
});
$("#importInput").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    for (const key of Object.keys(DEFAULTS)) {
      if (Array.isArray(data[key])) { state[key] = data[key]; await save(key); }
    }
    renderAll();
    toast("Данные восстановлены ✓");
  } catch { toast("Файл не подходит"); }
  e.target.value = "";
});

/* =========================================================
   Анимации
   ========================================================= */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("in"); revealObserver.unobserve(en.target); }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
$$(".reveal").forEach((el) => revealObserver.observe(el));

/* Имя по буквам */
$$(".split").forEach((el, line) => {
  const text = el.textContent;
  el.textContent = "";
  [...text].forEach((ch, i) => {
    const s = document.createElement("span");
    s.className = "ch";
    s.textContent = ch;
    s.style.animationDelay = `${0.25 + line * 0.35 + i * 0.05}s`;
    el.appendChild(s);
  });
});

/* Печатающиеся роли */
(function typed() {
  const el = $("#typed");
  let r = 0, i = 0, del = false;
  const tick = () => {
    const word = CONFIG.ROLES[r];
    el.textContent = word.slice(0, i);
    if (!del && i < word.length) { i++; setTimeout(tick, 60); }
    else if (!del) { del = true; setTimeout(tick, 2000); }
    else if (i > 0) { i--; setTimeout(tick, 28); }
    else { del = false; r = (r + 1) % CONFIG.ROLES.length; setTimeout(tick, 350); }
  };
  setTimeout(tick, 1400);
})();

/* Счётчики */
let countersStarted = false;
function counterTarget(el) {
  if (el.dataset.target === "years") return new Date().getFullYear() - CONFIG.START_YEAR;
  if (el.dataset.target === "courses") return (state.courses || []).length;
  return +el.dataset.count;
}
function updateCounters(silent) {
  if (!countersStarted) return;
  $$(".counter").forEach((el) => {
    const target = counterTarget(el);
    if (silent) { el.textContent = target; return; }
    const t0 = performance.now(), dur = 1600;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}
function watchCounters() {
  new IntersectionObserver((en, obs) => {
    if (en[0].isIntersecting) { countersStarted = true; updateCounters(); obs.disconnect(); }
  }, { threshold: 0.5 }).observe($(".hero__stats"));
}

/* Линия таймлайна растёт при прокрутке */
const timeline = $("#timeline");
function timelineProgress() {
  const r = timeline.getBoundingClientRect();
  const p = Math.min(100, Math.max(0, ((innerHeight * 0.6 - r.top) / r.height) * 100));
  timeline.style.setProperty("--progress", p + "%");
  $(".timeline__line span").style.height = p + "%";
}

/* Навигация: фон, активный пункт, мобильное меню */
const nav = $("#nav"), menu = $("#navMenu"), burger = $("#burger");
const links = $$(".nav__menu a");
const sections = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);
function onScroll() {
  nav.classList.toggle("scrolled", scrollY > 30);
  timelineProgress();
  let cur = null;
  sections.forEach((s) => { if (s.getBoundingClientRect().top < innerHeight * 0.35) cur = s.id; });
  links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + cur));
}
addEventListener("scroll", onScroll, { passive: true });
burger.addEventListener("click", () => { burger.classList.toggle("open"); menu.classList.toggle("open"); });
links.forEach((a) => a.addEventListener("click", () => { burger.classList.remove("open"); menu.classList.remove("open"); }));

/* Аккордеон «Обо мне» */
$$(".acc__head").forEach((btn) => btn.addEventListener("click", () => btn.parentElement.classList.toggle("open")));

/* Видео-приветствие: звук */
const video = $("#heroVideo"), soundBtn = $("#soundBtn");
soundBtn.addEventListener("click", () => {
  const on = video.muted;
  video.muted = !on;
  if (on) { video.currentTime = 0; video.play(); }
  soundBtn.classList.toggle("on", on);
  $("span", soundBtn).textContent = on ? "Выключить звук" : "Послушать приветствие";
});

/* =========================================================
   Запуск
   ========================================================= */
$("#year").textContent = new Date().getFullYear();
onScroll();
loadState().then(() => {
  renderAll();
  watchCounters();
});
