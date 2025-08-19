// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Function to load page
function pageLoad() {
  let tl = gsap.timeline();
  tl.to(".main-wrapper", {
    opacity: 1,
    ease: "Quint.easeOut",
    duration: 0.5,
  });
  tl.from("[animation=loading-img]", {
    scale: 1.2,
    opacity: "0",
    stagger: { each: 0.1, from: "start" },
    ease: "Quint.easeOut",
    duration: 1,
  });
  tl.from("[animation=loading]", {
    y: "100%",
    opacity: "0",
    stagger: { each: 0.1, from: "start" },
    ease: "Quint.easeOut",
    duration: 1,
  });
}
// Run the page load function
pageLoad();

// Initialize Splide slider when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  var splide = new Splide(".is--splide-slider", {
    type: "slider",
    perPage: 3,
    perMove: 1,
    pagination: false,
    arrows: false,
    gap: "26rem",
    breakpoints: {
      991: {
        perPage: 1,
        gap: "24rem",
      },
    },
  });
  splide.mount();
});

// Select all SVGs
const svgs = document.querySelectorAll(".svg--top, .svg--bottom");

// Loop through each SVG
svgs.forEach((svg) => {
  const paths = svg.querySelectorAll("path");
  const totalLength = Array.from(paths).reduce(
    (total, path) => total + path.getTotalLength(),
    0
  );

  let cumulativeLength = 0;

  // Loop through each path in the SVG
  paths.forEach((path) => {
    const pathLength = path.getTotalLength();
    const start = (cumulativeLength / totalLength) * 100;
    const end = ((cumulativeLength + pathLength) / totalLength) * 100;

    // Set initial stroke properties
    gsap.set(path, {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength > 0 ? pathLength : 0,
    });

    // Animate the stroke offset
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

    cumulativeLength += pathLength > 0 ? pathLength : 0;
  });
});

// Add click event listener to navlink and background menu
$(document).on("click", ".navlink, .background--menu", function () {
  $(".close--btn").click();
});

// ---------------------------- Ouvre popup etages ----------------------------- //

document.addEventListener("DOMContentLoaded", function () {
  // Étape 0 : Clic sur un étage dans l'image SVG pour ouvrir la popup correspondante
  const svgPaths = document.querySelectorAll(".img--bg.is--svg [etage]");

  svgPaths.forEach((path) => {
    path.addEventListener("click", () => {
      const etage = path.getAttribute("etage");

      // Masquer toutes les popups d'étage
      document.querySelectorAll(".popup[data-etage]").forEach((p) => {
        p.style.display = "none";
      });

      // Afficher la bonne popup
      const popupToShow = document.querySelector(
        `.popup[data-etage="${etage}"]`
      );
      if (popupToShow) {
        popupToShow.style.display = "grid";
      }
    });
  });
});

// ---------------------------- etages ----------------------------- //

document.addEventListener("DOMContentLoaded", function () {
  // Étape 1 : Cloner chaque .appart-plan vers le bon .relative.is--appart-plan
  const appartPlans = document.querySelectorAll(".appart-plan");
  appartPlans.forEach((plan) => {
    const appId = plan
      .closest(".w-dyn-item")
      ?.querySelector(".appart-number")
      ?.textContent?.trim();
    if (!appId) return;

    const etage = plan
      .closest(".w-dyn-item")
      ?.querySelector(".appart-etage")
      ?.textContent?.trim();
    const target = document.querySelector(
      `.relative.is--apart-plan[data-etage*="${etage}"]`
    );

    if (target) {
      const clone = plan.cloneNode(true);
      clone.setAttribute("data-etage-app-plan", appId);
      target.appendChild(clone);
    }
  });

  // Étape 2 : Gérer les clics sur les paths avec data-app-id
  document.body.addEventListener("click", function (e) {
    const clicked = e.target.closest("[data-app-id]");
    if (!clicked) return;

    const appId = clicked.getAttribute("data-app-id");

    const appartItem = document
      .querySelector(`.w-dyn-item .appart-number[data-app-id="${appId}"]`)
      ?.closest(".w-dyn-item");
    if (!appartItem) return;

    const setData = (dataAttr, value) => {
      const el = document.querySelector(`[data="${dataAttr}"]`);
      if (el) el.textContent = value;
    };

    // Mettre à jour les données texte
    setData(
      "number",
      appartItem.querySelector(".appart-number")?.textContent?.trim() || ""
    );
    setData(
      "pieces",
      appartItem.querySelector(".appart-pieces")?.textContent?.trim() || ""
    );
    setData(
      "disponibilite",
      appartItem.querySelector(".appart-disponibilite")?.textContent?.trim() ||
        ""
    );
    setData(
      "surface",
      appartItem.querySelector(".appart-surface")?.textContent?.trim() || ""
    );
    setData(
      "balcon",
      appartItem.querySelector(".appart-balcon")?.textContent?.trim() || ""
    );

    // Mettre à jour l’image (plan 3D)
    const plan3dSrc = appartItem
      .querySelector(".appart-plan3d")
      ?.getAttribute("src");
    const plan3dTarget = document.querySelector('[data="plan3d"]');
    if (plan3dTarget && plan3dSrc) {
      plan3dTarget.setAttribute("src", plan3dSrc);
    }

    // Mettre à jour le lien (visite 360)
    const visiteLink = appartItem
      .querySelector(".appart-3dlink")
      ?.getAttribute("href");
    const visiteTarget = document.querySelector('[data="visite360"]');
    if (visiteTarget && visiteLink) {
      visiteTarget.setAttribute("href", visiteLink);
    }
  });
});
