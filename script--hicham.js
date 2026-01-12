(() => {
  // --------------------- helpers --------------------- //
  const ready = (cb) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", cb, { once: true });
    } else cb();
  };

  const onWindowLoad = (cb) => {
    if (document.readyState === "complete") cb();
    else window.addEventListener("load", cb, { once: true });
  };

  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const norm = (v) => (v == null ? "" : String(v).trim());

  const parseFloor = (val) => {
    const s = norm(val);
    if (!s) return null;
    const m = s.match(/-?\d+/);
    if (!m) return null;
    const n = Number(m[0]);
    return Number.isFinite(n) ? n : null;
  };

  // --------------------- GSAP + ScrollTrigger --------------------- //
  const hasGSAP = () => typeof window.gsap !== "undefined";
  const hasScrollTrigger = () => typeof window.ScrollTrigger !== "undefined";

  function registerGSAPPlugins() {
    if (!hasGSAP()) return;
    if (hasScrollTrigger()) gsap.registerPlugin(ScrollTrigger);
  }

  // --------------------- Page load animation --------------------- //
  function pageLoad() {
    if (!hasGSAP()) return;
    const tl = gsap.timeline();

    tl.to(".main-wrapper", {
      opacity: 1,
      ease: "Quint.easeOut",
      duration: 0.5,
    });

    tl.from("[animation=loading-img]", {
      scale: 1.2,
      opacity: 0,
      stagger: { each: 0.1, from: "start" },
      ease: "Quint.easeOut",
      duration: 1,
    });

    tl.from("[animation=loading]", {
      y: "100%",
      opacity: 0,
      stagger: { each: 0.1, from: "start" },
      ease: "Quint.easeOut",
      duration: 1,
    });
  }

  // --------------------- Splide --------------------- //
  function initSplide() {
    if (typeof window.Splide === "undefined") return;
    const el = qs(".is--splide-slider");
    if (!el) return;

    const splide = new Splide(".is--splide-slider", {
      type: "slider",
      perPage: 3,
      perMove: 1,
      pagination: false,
      arrows: false,
      gap: "26rem",
      breakpoints: { 991: { perPage: 1, gap: "24rem" } },
    });

    splide.mount();
  }

  // --------------------- SVG draw on scroll --------------------- //
  function initSvgDrawOnScroll() {
    if (!hasGSAP() || !hasScrollTrigger()) return;

    const svgs = document.querySelectorAll(".svg--top, .svg--bottom");
    if (!svgs.length) return;

    svgs.forEach((svg) => {
      const paths = svg.querySelectorAll("path");
      if (!paths.length) return;

      paths.forEach((path) => {
        let len = 0;
        try {
          len = path.getTotalLength ? path.getTotalLength() : 0;
        } catch (e) {
          len = 0;
        }

        gsap.set(path, {
          strokeDasharray: len,
          strokeDashoffset: len > 0 ? len : 0,
        });

        gsap.to(path, {
          strokeDashoffset: 0,
          scrollTrigger: {
            trigger: svg,
            scrub: true,
            start: "top center",
            end: "bottom center",
            markers: false,
          },
        });
      });
    });
  }

  // --------------------- Close menu on click --------------------- //
  function initMenuCloseOnClick() {
    if (typeof window.jQuery === "undefined") return;
    const $ = window.jQuery;
    $(document).on("click", ".navlink, .background--menu", function () {
      $(".close--btn").trigger("click");
    });
  }

  // --------------------- Levels popup (FULL FIX) --------------------- //
  function initLevelsPopup() {
    if (!hasGSAP()) return;

    let currentLevel = null;

    // ✅ appart state (within current level)
    let currentAppIds = [];
    let currentAppIndex = 0;
    let currentAppId = null;

    const popup = qs(".popup");
    const popupPlan = qs(".popup .popup--plan");
    const levelNameEl = qs('[level="name"]');
    const heroLevelNumberEl = qs('[data="levelnumber"]');

    const upArrow = qs(".arrow--flex.is--up");
    const downArrow = qs(".arrow--flex.is--down");

    const cmsLevels = qsa(".etage--el");
    const buildingPaths = qsa(".img--bg.is--svg path");

    if (!popup || !popupPlan || !cmsLevels.length || !buildingPaths.length)
      return;

    // Build floors from CMS (.etage--name) and sort
    const floors = cmsLevels
      .map((el, idx) => {
        const t = norm(qs(".etage--name", el)?.textContent);
        const n = parseFloor(t);
        return { el, floor: n != null ? n : idx + 1, idx };
      })
      .sort((a, b) => a.floor - b.floor);

    const floorNums = floors.map((f) => f.floor);
    const floorToEl = new Map(floors.map((f) => [f.floor, f.el]));

    // Auto assign if no SVG attrs
    const anyHasFloorAttr = buildingPaths.some((p) => {
      return (
        parseFloor(p.getAttribute("level")) != null ||
        parseFloor(p.getAttribute("etage")) != null ||
        parseFloor(p.getAttribute("data-level")) != null
      );
    });

    if (!anyHasFloorAttr) {
      buildingPaths.forEach((p, i) => {
        const n = floorNums[i];
        if (n != null) p.setAttribute("data-level", String(n));
      });
    }

    // UI helpers
    function updateLevelName(v) {
      if (levelNameEl) levelNameEl.innerText = String(v);
    }

    function updateHeroLevelNumber(v) {
      if (!heroLevelNumberEl) return;
      heroLevelNumberEl.innerText = String(v);
    }

    // --- Apartment number extractor (robust) ---
    function getApartmentNumber(appartEl) {
      return (
        norm(qs(".appart-number", appartEl)?.textContent) ||
        norm(qs(".apartment-number", appartEl)?.textContent) ||
        norm(qs("[data-app='number']", appartEl)?.textContent)
      );
    }

    // ===== CMS data fill (targets use data="xxx") =====
    function fillApartmentData(appartEl) {
      const pickText = (...selectors) => {
        for (const s of selectors) {
          const el = appartEl.querySelector(s);
          const t = el?.innerText?.trim();
          if (t) return t;
        }
        return "";
      };

      const pickAttr = (selector, attr) =>
        appartEl.querySelector(selector)?.getAttribute(attr) || "";

      const apartmentNumber = pickText(
        ".appart-number",
        ".apartment-number",
        "[data-app='number']"
      );
      const apartmentPieces = pickText(
        ".appart-pieces",
        ".apartment-pieces",
        "[data-app='pieces']"
      );
      const apartmentSurface = pickText(
        ".appart-surface",
        ".apartment-surface",
        "[data-app='surface']"
      );
      const apartmentBalconSurface = pickText(
        ".appart-balcon-surface",
        ".appart-balcon",
        ".balcon-surface",
        "[data-app='balcon']"
      );
      const apartmentDisponibilite = pickText(
        ".appart-disponibilite",
        ".apartment-disponibilite",
        "[data-app='disponibilite']"
      );
      const apartmentLoyer = pickText(
        ".appart-loyer",
        ".apartment-loyer",
        "[data-app='loyer']"
      );
      const apartmentCharges = pickText(
        ".appart-charges",
        ".apartment-charges",
        "[data-app='charges']"
      );
      const visite360 = pickText(
        ".appart-visite360",
        ".apartment-visite360",
        "[data-app='visite360']"
      );

      const setText = (selector, value) => {
        const el = document.querySelector(selector);
        if (!el) return;
        el.innerText = value ?? "";
      };

      setText('[data="number"]', apartmentNumber);
      setText('[data="pieces"]', apartmentPieces);
      setText('[data="surface"]', apartmentSurface);
      setText('[data="balcon"]', apartmentBalconSurface);
      setText('[data="disponibilite"]', apartmentDisponibilite);
      setText('[data="loyer"]', apartmentLoyer);
      setText('[data="charges"]', apartmentCharges);

      const visite360El = document.querySelector('[data="visite360"]');
      if (visite360El) {
        if (visite360) visite360El.setAttribute("href", visite360);
        else visite360El.removeAttribute("href");
      }

      const plan3dSrc = pickAttr(
        ".appart-plan3d, .apartment-plan3d, [data-app='plan3d']",
        "src"
      );
      const plan3dSrcset = pickAttr(
        ".appart-plan3d, .apartment-plan3d, [data-app='plan3d']",
        "srcset"
      );
      const popup3dEl = document.querySelector('[data="plan3d"]');

      if (popup3dEl) {
        if (plan3dSrc) popup3dEl.setAttribute("src", plan3dSrc);
        if (plan3dSrcset) popup3dEl.setAttribute("srcset", plan3dSrcset);
        popup3dEl.style.display = "none";
        popup3dEl.offsetHeight;
        popup3dEl.style.display = "";
      }
    }

    function ensureAppIdsForLevel(levelEl) {
      const appartItems = qsa(".appart-item", levelEl);
      appartItems.forEach((item, idx) => {
        const plan = qs(".appart-plan", item);
        if (!plan) return;

        const number = getApartmentNumber(item);
        const generated = number ? `app-${number}` : `app-idx-${idx + 1}`;
        if (!plan.getAttribute("data-app-id"))
          plan.setAttribute("data-app-id", generated);
      });
    }

    function updateApartmentArrowStates() {
      const atStart = currentAppIndex <= 0;
      const atEnd = currentAppIndex >= currentAppIds.length - 1;

      if (downArrow) downArrow.classList.toggle("is--disabled", atStart);
      if (upArrow) upArrow.classList.toggle("is--disabled", atEnd);
    }

    function setActiveAbs(appId) {
      const allAbs = qsa(".appart-plan-absolute[data-app-id]", popupPlan);
      allAbs.forEach((abs) => {
        const isActive = abs.getAttribute("data-app-id") === appId;
        gsap.to(abs, {
          opacity: isActive ? 1 : 0,
          duration: 0.25,
          ease: "power2.out",
        });
      });
    }

    function selectApartmentById(appId) {
      if (!currentLevel || !appId) return;

      const levelEl = floorToEl.get(currentLevel);
      if (!levelEl) return;

      const appartItems = qsa(".appart-item", levelEl);
      const target = appartItems.find(
        (it) => qs(".appart-plan", it)?.getAttribute("data-app-id") === appId
      );
      if (!target) return;

      fillApartmentData(target);
      setActiveAbs(appId);

      currentAppId = appId;
      currentAppIndex = Math.max(0, currentAppIds.indexOf(appId));
      updateApartmentArrowStates();
    }

    function wirePlanInteractions(popupPlanEl, appartItems) {
      const appIdToItem = new Map();
      appartItems.forEach((item) => {
        const id = qs(".appart-plan", item)?.getAttribute("data-app-id");
        if (id) appIdToItem.set(id, item);
      });

      // default = min appart-number within this level
      let defaultItem = null;
      let minNumber = Infinity;

      appartItems.forEach((item) => {
        const n = parseInt(getApartmentNumber(item) || "9999", 10);
        if (!isNaN(n) && n < minNumber) {
          minNumber = n;
          defaultItem = item;
        }
      });

      if (!defaultItem && appartItems.length) defaultItem = appartItems[0];

      const defaultAppId =
        defaultItem
          ?.querySelector(".appart-plan")
          ?.getAttribute("data-app-id") || "";

      // ✅ Build ordered list of appIds for THIS level (sort by apartment number)
      currentAppIds = appartItems
        .map((it, idx) => ({
          id:
            qs(".appart-plan", it)?.getAttribute("data-app-id") ||
            `app-idx-${idx + 1}`,
          num: parseInt(getApartmentNumber(it) || "9999", 10),
        }))
        .filter((x) => x.id)
        .sort((a, b) => (a.num || 9999) - (b.num || 9999))
        .map((x) => x.id);

      currentAppId = defaultAppId;
      currentAppIndex = Math.max(0, currentAppIds.indexOf(defaultAppId));
      updateApartmentArrowStates();

      if (defaultItem) {
        fillApartmentData(defaultItem);
        if (defaultAppId) setActiveAbs(defaultAppId);
      }

      // ✅ IMPORTANT: match on .appart-plan[data-app-id] (not <path> only)
      const getAppIdFromEvent = (target) => {
        const planWrap = target?.closest?.(".appart-plan[data-app-id]");
        if (!planWrap || !popupPlanEl.contains(planWrap)) return null;
        return planWrap.getAttribute("data-app-id") || null;
      };

      popupPlanEl.addEventListener("click", (e) => {
        const appId = getAppIdFromEvent(e.target);
        if (!appId) return;

        const item = appIdToItem.get(appId);
        if (!item) return;

        fillApartmentData(item);
        setActiveAbs(appId);

        currentAppId = appId;
        currentAppIndex = Math.max(0, currentAppIds.indexOf(appId));
        updateApartmentArrowStates();
      });

      popupPlanEl.addEventListener(
        "mousemove",
        (e) => {
          const appId = getAppIdFromEvent(e.target);
          if (!appId) return;
          setActiveAbs(appId);
        },
        true
      );

      popupPlanEl.addEventListener(
        "mouseleave",
        () => {
          if (currentAppId) setActiveAbs(currentAppId);
          else if (defaultAppId) setActiveAbs(defaultAppId);
        },
        true
      );
    }

    function buildPopupPlanForLevel(levelEl, popupPlanEl) {
      ensureAppIdsForLevel(levelEl);

      const levelImage = qs(".etage--img", levelEl);
      const appartItems = qsa(".appart-item", levelEl);

      popupPlanEl.innerHTML = "";

      if (levelImage) {
        const bg = levelImage.cloneNode(true);
        popupPlanEl.appendChild(bg);
        gsap.set(bg, { opacity: 0.4 });
      }

      appartItems.forEach((item, idx) => {
        const plan = qs(".appart-plan", item);
        if (!plan) return;

        const appId = plan.getAttribute("data-app-id") || `app-idx-${idx + 1}`;

        const planClone = plan.cloneNode(true);
        planClone.setAttribute("data-app-id", appId);
        popupPlanEl.appendChild(planClone);

        const planAbsolute = qs(".appart-plan-absolute", item);
        if (planAbsolute) {
          const absClone = planAbsolute.cloneNode(true);
          absClone.setAttribute("data-app-id", appId);
          gsap.set(absClone, { opacity: 0 });
          popupPlanEl.appendChild(absClone);
        }
      });

      wirePlanInteractions(popupPlanEl, appartItems);
    }

    function openLevelPopup(levelNumber) {
      const n = Number(levelNumber);
      if (!floorToEl.has(n)) return;

      currentLevel = n;
      updateLevelName(currentLevel);

      popup.style.display = "grid";
      gsap.fromTo(
        popup,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );

      buildPopupPlanForLevel(floorToEl.get(currentLevel), popupPlan);
    }

    function closePopup() {
      gsap.to(popup, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          popup.style.display = "none";
          currentLevel = null;
          currentAppIds = [];
          currentAppIndex = 0;
          currentAppId = null;
        },
      });
    }

    // Bind building paths
    buildingPaths.forEach((path) => {
      const floor =
        parseFloor(path.getAttribute("level")) ??
        parseFloor(path.getAttribute("etage")) ??
        parseFloor(path.getAttribute("data-level"));

      if (floor == null) return;

      path.addEventListener("click", () => openLevelPopup(floor));
      path.addEventListener("mouseenter", () => updateHeroLevelNumber(floor));
    });

    // ✅ arrows + close (arrows now navigate APARTMENTS within current level)
    document.addEventListener("click", (e) => {
      const up = e.target.closest(".arrow--flex.is--up");
      if (up) {
        e.preventDefault();
        if (up.classList.contains("is--disabled")) return;
        if (!popup || popup.style.display === "none") return;
        if (!currentAppIds.length) return;

        gsap.to(up, {
          scale: 0.9,
          duration: 0.1,
          ease: "power2.out",
          onComplete: () =>
            gsap.to(up, { scale: 1, duration: 0.1, ease: "power2.out" }),
        });

        const nextIdx = Math.min(currentAppIds.length - 1, currentAppIndex + 1);
        const nextId = currentAppIds[nextIdx];
        if (nextId) selectApartmentById(nextId);
        return;
      }

      const down = e.target.closest(".arrow--flex.is--down");
      if (down) {
        e.preventDefault();
        if (down.classList.contains("is--disabled")) return;
        if (!popup || popup.style.display === "none") return;
        if (!currentAppIds.length) return;

        gsap.to(down, {
          scale: 0.9,
          duration: 0.1,
          ease: "power2.out",
          onComplete: () =>
            gsap.to(down, { scale: 1, duration: 0.1, ease: "power2.out" }),
        });

        const prevIdx = Math.max(0, currentAppIndex - 1);
        const prevId = currentAppIds[prevIdx];
        if (prevId) selectApartmentById(prevId);
        return;
      }

      const close = e.target.closest(".popup--close-trigger");
      if (close) {
        e.preventDefault();
        gsap.to(close, {
          scale: 0.9,
          duration: 0.1,
          ease: "power2.out",
          onComplete: () =>
            gsap.to(close, { scale: 1, duration: 0.1, ease: "power2.out" }),
        });
        closePopup();
      }
    });
  }

  // --------------------- BOOTSTRAP --------------------- //
  ready(() => {
    registerGSAPPlugins();
    initSplide();
    initSvgDrawOnScroll();
    initMenuCloseOnClick();
    initLevelsPopup();
  });

  onWindowLoad(() => pageLoad());
})();

(() => {
  const qs = (sel, root = document) => root.querySelector(sel);

  // ✅ show popup form on click: [popup="form"] => .popup-form--wrapper {display:flex}
  function initPopupFormOpen() {
    const wrapper = qs(".popup-form--wrapper");
    if (!wrapper) return;

    // start hidden (only if you want to force it)
    // wrapper.style.display = "none";

    document.addEventListener("click", (e) => {
      const btn = e.target.closest('[popup="form"]');
      if (!btn) return;

      e.preventDefault();
      wrapper.style.display = "flex";
    });

    // optional close (if you have a close button)
    document.addEventListener("click", (e) => {
      const close = e.target.closest(
        '[popup="form-close"], .popup-form--close, .popup-form--bg'
      );
      if (!close) return;

      e.preventDefault();
      wrapper.style.display = "none";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPopupFormOpen, {
      once: true,
    });
  } else {
    initPopupFormOpen();
  }
})();

(() => {
  // ===================== CONFIG ===================== //
  // Ratio unique pour toutes les images (change si tu veux)
  // Ex: "16 / 9", "4 / 3", "1 / 1"
  const GALLERY_RATIO = "16 / 9";

  // Comment afficher l’image dans le ratio:
  // "cover" = remplit (crop possible) / "contain" = pas de crop (barres possibles)
  const GALLERY_FIT = "cover";

  // Où récupérer les images du field Gallery dans l'appart-item (ordre de priorité)
  const GALLERY_IMG_SELECTORS = [
    ".appart-gallery img",
    ".gallery img",
    "[data-app='gallery'] img",
    "[data-gallery] img",
    ".w-dyn-list img",
    "img", // fallback ultime
  ];

  // ===================== helpers ===================== //
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const norm = (v) => (v == null ? "" : String(v).trim());
  const parseFloor = (val) => {
    const s = norm(val);
    const m = s.match(/-?\d+/);
    if (!m) return null;
    const n = Number(m[0]);
    return Number.isFinite(n) ? n : null;
  };

  // ===================== Styles (auto) ===================== //
  const ensureBaseStyle = () => {
    if (qs("#__gallery_style__")) return;

    const st = document.createElement("style");
    st.id = "__gallery_style__";
    st.textContent = `
      .gallery--wrapper.__auto{
        position:fixed; inset:0; z-index:9999;
        display:none; align-items:center; justify-content:center;
        background:#15496d;
        padding:2.25rem;
      }

      .__gallery_panel{
        width:min(980px, 100%);
        max-height:92vh;
        background:rgba(0,0,0,.08);
        border:1px solid rgba(255,255,255,.16);
        border-radius:18px;
        overflow:hidden;
        position:relative;
        display:flex;
        flex-direction:column;
        backdrop-filter: blur(10px);
      }

      .__gallery_close{
        position:absolute; top:14px; right:14px;
        width:42px; height:42px;
        border:1px solid rgba(255,255,255,.22);
        border-radius:999px;
        background:rgba(0,0,0,.18);
        color:#fff;
        cursor:pointer;
        font-size:22px;
        line-height:40px;
        display:flex; align-items:center; justify-content:center;
        transition: transform .18s ease, background .18s ease;
        z-index: 20;
      }
      .__gallery_close:hover{ transform:scale(1.05); background:rgba(0,0,0,.28); }

      .__gallery_body{ padding:16px; overflow:auto; }

      /* ==== Splide look ==== */
      .__gallery_panel .splide{ width:100%; }
      .__gallery_panel .splide__track{ overflow:hidden; border-radius:14px; }

      /* ratio wrapper */
      .__gallery_panel .splide__slide{
        display:flex;
        align-items:center;
        justify-content:center;
      }
      .__gallery_media{
        width:100%;
        aspect-ratio: var(--gallery-ratio, 16/9);
        border-radius:14px;
        overflow:hidden;
        background:rgba(0,0,0,.18);
      }
      .__gallery_media img{
        width:100%;
        height:100%;
        display:block;
        object-fit: var(--gallery-fit, cover);
      }

      /* arrows */
      .__gallery_panel .splide__arrow{
        width:46px; height:46px;
        border-radius:999px;
        background:rgba(0,0,0,.28);
        border:1px solid rgba(255,255,255,.22);
        opacity:1;
        transition: transform .18s ease, background .18s ease, border-color .18s ease;
        box-shadow: 0 10px 30px rgba(0,0,0,.20);
      }
      .__gallery_panel .splide__arrow:hover{
        transform: scale(1.06);
        background: rgba(0,0,0,.40);
        border-color: rgba(255,255,255,.34);
      }
      .__gallery_panel .splide__arrow svg{
        fill:#fff;
        width:18px; height:18px;
      }
      .__gallery_panel .splide__arrow:disabled{
        opacity:.35;
        transform:none;
        background:rgba(0,0,0,.18);
      }

      /* pagination dots */
      .__gallery_panel .splide__pagination{
        bottom: -10px;
        padding-top: 14px;
      }
      .__gallery_panel .splide__pagination__page{
        width:8px; height:8px;
        background: rgba(255,255,255,.35);
        opacity:1;
        transition: transform .18s ease, background .18s ease;
      }
      .__gallery_panel .splide__pagination__page.is-active{
        background:#fff;
        transform: scale(1.25);
      }

      /* fallback slider (sans Splide) */
      .__snap{
        display:flex; gap:12px; overflow-x:auto;
        scroll-snap-type:x mandatory;
        -webkit-overflow-scrolling:touch;
      }
      .__snap .__gallery_media{ flex:0 0 100%; scroll-snap-align:center; }

      /* Responsive */
      @media (max-width: 767px){
        .gallery--wrapper.__auto{ padding: 1rem; }
        .__gallery_panel{ max-height: 94vh; border-radius: 16px; }
        .__gallery_body{ padding: 12px; }
        .__gallery_close{ width:40px; height:40px; top:12px; right:12px; }
        .__gallery_panel .splide__arrow{ width:40px; height:40px; }
        .__gallery_panel .splide__arrow svg{ width:16px; height:16px; }
      }
    `;
    document.head.appendChild(st);
  };

  // ===================== Find current appart (from your existing popup) ===================== //
  function getCurrentLevelEl() {
    const levelName = norm(qs('[level="name"]')?.textContent);
    if (!levelName) return null;

    const currentFloor = parseFloor(levelName);
    if (currentFloor == null) return null;

    const cmsLevels = qsa(".etage--el");
    for (const levelEl of cmsLevels) {
      const t = norm(qs(".etage--name", levelEl)?.textContent);
      const n = parseFloor(t);
      if (n === currentFloor) return levelEl;
    }
    return null;
  }

  function getCurrentAppartEl() {
    const levelEl = getCurrentLevelEl();
    if (!levelEl) return null;

    const currentNumber = norm(qs('[data="number"]')?.textContent);
    if (!currentNumber) return null;

    const appartItems = qsa(".appart-item", levelEl);
    return (
      appartItems.find((it) => {
        const n =
          norm(qs(".appart-number", it)?.textContent) ||
          norm(qs(".apartment-number", it)?.textContent) ||
          norm(qs("[data-app='number']", it)?.textContent);
        return n === currentNumber;
      }) || null
    );
  }

  function pickGalleryImages(appartEl) {
    if (!appartEl) return [];
    for (const sel of GALLERY_IMG_SELECTORS) {
      const imgs = qsa(sel, appartEl).filter((img) =>
        img?.getAttribute?.("src")
      );
      if (imgs.length >= 2 || (sel !== "img" && imgs.length >= 1)) return imgs;
    }
    return [];
  }

  // ===================== Build UI ===================== //
  let splideInstance = null;

  function ensureWrapper() {
    let wrapper = qs(".gallery--wrapper");
    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.className = "gallery--wrapper __auto";
      document.body.appendChild(wrapper);
    }
    wrapper.classList.add("__auto");

    let panel = qs(".__gallery_panel", wrapper);
    if (!panel) {
      wrapper.innerHTML = `
        <div class="__gallery_panel" role="dialog" aria-modal="true">
          <button class="__gallery_close" type="button" aria-label="Close">×</button>
          <div class="__gallery_body"></div>
        </div>
      `;
    }
    return wrapper;
  }

  function destroySplide() {
    if (!splideInstance) return;
    try {
      splideInstance.destroy(true);
    } catch (e) {}
    splideInstance = null;
  }

  function buildSlideImg(img) {
    const src = img.getAttribute("src") || "";
    const srcset = img.getAttribute("srcset") || "";
    const sizes = img.getAttribute("sizes") || "";
    const alt = img.getAttribute("alt") || "";

    const media = document.createElement("div");
    media.className = "__gallery_media";
    media.style.setProperty("--gallery-ratio", GALLERY_RATIO);
    media.style.setProperty("--gallery-fit", GALLERY_FIT);

    const newImg = document.createElement("img");
    newImg.loading = "lazy";
    newImg.alt = alt;
    if (src) newImg.src = src;
    if (srcset) newImg.setAttribute("srcset", srcset);
    if (sizes) newImg.setAttribute("sizes", sizes);

    media.appendChild(newImg);
    return media;
  }

  function buildSlider(wrapper, imgs) {
    const body = qs(".__gallery_body", wrapper);
    if (!body) return;

    destroySplide();
    body.innerHTML = "";

    if (!imgs.length) {
      body.innerHTML = `<div style="color:#fff; padding:24px;">Aucune photo disponible pour cet appartement.</div>`;
      return;
    }

    if (typeof window.Splide !== "undefined") {
      const splideRoot = document.createElement("div");
      splideRoot.className = "splide";
      splideRoot.innerHTML = `
        <div class="splide__track">
          <ul class="splide__list"></ul>
        </div>
      `;
      const list = qs(".splide__list", splideRoot);

      imgs.forEach((img) => {
        const li = document.createElement("li");
        li.className = "splide__slide";
        li.appendChild(buildSlideImg(img));
        list.appendChild(li);
      });

      body.appendChild(splideRoot);

      splideInstance = new Splide(splideRoot, {
        type: "loop",
        perPage: 1,
        perMove: 1,
        gap: "1rem",
        arrows: true,
        pagination: true,
        drag: true,
        speed: 600,
        rewind: false,
        breakpoints: {
          767: { gap: "0.75rem" },
        },
      });
      splideInstance.mount();

      // important si wrapper était display:none
      setTimeout(() => {
        try {
          splideInstance.refresh();
        } catch (e) {}
      }, 0);

      return;
    }

    // fallback scroll-snap
    const snap = document.createElement("div");
    snap.className = "__snap";
    imgs.forEach((img) => snap.appendChild(buildSlideImg(img)));
    body.appendChild(snap);
  }

  function openGallery() {
    ensureBaseStyle();
    const wrapper = ensureWrapper();

    const appartEl = getCurrentAppartEl();
    const imgs = pickGalleryImages(appartEl);

    buildSlider(wrapper, imgs);

    wrapper.style.display = "flex";
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    if (splideInstance) {
      try {
        splideInstance.refresh();
      } catch (e) {}
    }
  }

  function closeGallery() {
    const wrapper = qs(".gallery--wrapper");
    if (!wrapper) return;
    wrapper.style.display = "none";
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    destroySplide();
  }

  // ===================== events ===================== //
  function init() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest('[data="gallery"], [data="galleryon"]');
      if (!btn) return;
      e.preventDefault();
      openGallery();
    });

    document.addEventListener("click", (e) => {
      const wrapper = qs(".gallery--wrapper");
      if (!wrapper || getComputedStyle(wrapper).display === "none") return;

      if (e.target.closest(".__gallery_close")) {
        e.preventDefault();
        closeGallery();
        return;
      }

      // click sur overlay (hors panel)
      const panel = qs(".__gallery_panel", wrapper);
      if (
        panel &&
        !panel.contains(e.target) &&
        e.target.closest(".gallery--wrapper")
      ) {
        closeGallery();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeGallery();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
