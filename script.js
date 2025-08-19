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

document.addEventListener("DOMContentLoaded", function () {
  // ---------------------- ÉTAPE 0 : Ouvrir la bonne popup d'étage ---------------------- //
  const svgPaths = document.querySelectorAll(".img--bg.is--svg [etage]");

  svgPaths.forEach((path) => {
    path.addEventListener("click", () => {
      const etage = path.getAttribute("etage");

      // Masquer toutes les popups
      document.querySelectorAll(".popup[data-etage]").forEach((p) => {
        p.style.display = "none";
      });

      // Afficher celle correspondant à l’étage cliqué
      const popupToShow = document.querySelector(
        `.popup[data-etage="${etage}"]`
      );
      if (popupToShow) {
        popupToShow.style.display = "grid";
      }
    });
  });

  // ---------------------- ÉTAPE 1 : Cloner les .appart-plan dans la bonne popup ---------------------- //
  const appartPlans = document.querySelectorAll(".appart-plan");

  appartPlans.forEach((plan) => {
    const wrapper = plan.closest(".w-dyn-item");
    if (!wrapper) return;

    const appId = wrapper.querySelector(".appart-number")?.textContent?.trim();
    const etage = wrapper.querySelector(".appart-etage")?.textContent?.trim();

    console.log("🧱 Ajout de l'appart-plan", appId, "dans étage", etage);
    if (!appId || !etage) return;

    const target = document.querySelector(
      `.relative.is--appart-plan[data-etage="${etage}"]`
    );
    if (target) {
      const clone = plan.cloneNode(true);
      clone.setAttribute("data-etage-app-plan", appId);
      target.appendChild(clone);
    } else {
      console.warn(
        `❌ Container .relative.is--appart-plan[data-etage="${etage}"] introuvable`
      );
    }
  });

  // ---------------------- ÉTAPE 2 : Sur clic sur path d’un SVG, mettre à jour les données ---------------------- //
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

    // Texte
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

    // Image (plan 3D)
    const plan3dSrc = appartItem
      .querySelector(".appart-plan3d")
      ?.getAttribute("src");
    const plan3dTarget = document.querySelector('[data="plan3d"]');
    if (plan3dTarget && plan3dSrc) {
      plan3dTarget.setAttribute("src", plan3dSrc);
    }

    // Lien (visite 360°)
    const visiteLink = appartItem
      .querySelector(".appart-visite360")
      ?.getAttribute("href");
    const visiteTarget = document.querySelector('[data="visite360"]');
    if (visiteTarget && visiteLink) {
      visiteTarget.setAttribute("href", visiteLink);
    }
  });
});
