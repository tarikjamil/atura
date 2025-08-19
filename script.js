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
  // ---------------------- ÉTAPE 0 : Ouvrir la popup d'étage ---------------------- //
  const svgPaths = document.querySelectorAll(".img--bg.is--svg [etage]");

  svgPaths.forEach((path) => {
    path.addEventListener("click", () => {
      const etage = path.getAttribute("etage");
      console.log("📂 Étape sélectionnée :", etage);

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
        console.log("✅ Popup affichée pour étage :", etage);
      } else {
        console.warn("❌ Popup introuvable pour étage :", etage);
      }
    });
  });

  // ---------------------- ÉTAPE 1 : Cloner les .appart-plan dans .is--appart-plan ---------------------- //
  setTimeout(() => {
    const appartPlans = document.querySelectorAll(".appart-plan");

    appartPlans.forEach((plan) => {
      const wrapper = plan.closest(".w-dyn-item");
      if (!wrapper) return;

      const appId = wrapper
        .querySelector(".appart-number")
        ?.textContent?.trim();
      const etage = wrapper.querySelector(".appart-etage")?.textContent?.trim();

      if (!appId || !etage) return;

      const target = document.querySelector(
        `.relative.is--appart-plan[data-etage="${etage}"]`
      );
      if (!target) {
        console.warn(
          `❌ Container .relative.is--appart-plan[data-etage="${etage}"] introuvable`
        );
        return;
      }

      const clone = plan.cloneNode(true);
      clone.setAttribute("data-etage-app-plan", appId);

      // Injecter le data-app-id sur chaque path
      const paths = clone.querySelectorAll("path");
      paths.forEach((path) => {
        path.setAttribute("data-app-id", appId);
      });

      target.appendChild(clone);
      console.log(
        `✅ Injecté appart-plan ${appId} dans étage ${etage} avec ${paths.length} path(s)`
      );
    });
  }, 100); // Petit délai pour s'assurer que Webflow a monté tous les éléments

  // ---------------------- ÉTAPE 2 : Clic sur un path → mettre à jour les données ---------------------- //
  document.body.addEventListener("click", function (e) {
    let clicked = e.target;

    // Debug : afficher l'élément cliqué
    console.log("🖱️ Click event on:", clicked);

    // Remonter jusqu’à trouver le data-app-id
    while (clicked && !clicked.hasAttribute("data-app-id")) {
      clicked = clicked.parentElement;
    }

    if (!clicked) {
      console.warn("❌ Aucun data-app-id détecté sur le clic");
      return;
    }

    const appId = clicked.getAttribute("data-app-id");
    if (!appId) return;
    console.log("✅ Appartement sélectionné :", appId);

    const appartItem = document
      .querySelector(`.w-dyn-item .appart-number[data-app-id="${appId}"]`)
      ?.closest(".w-dyn-item");
    if (!appartItem) {
      console.warn(`❌ Aucun .w-dyn-item trouvé pour appId ${appId}`);
      return;
    }

    // Fonction de remplissage
    const setData = (dataAttr, value) => {
      const el = document.querySelector(`[data="${dataAttr}"]`);
      if (el) {
        el.textContent = value;
        console.log(`↪️ data="${dataAttr}" mis à jour :`, value);
      } else {
        console.warn(`⚠️ Élément [data="${dataAttr}"] non trouvé`);
      }
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

    // -------- PLAN 3D (image responsive) -------- //
    const plan3dImage = appartItem.querySelector(".appart-plan3d");
    const plan3dTarget = document.querySelector('[data="plan3d"]');

    if (plan3dImage && plan3dTarget) {
      const src = plan3dImage.getAttribute("src");
      const srcset = plan3dImage.getAttribute("srcset");
      const sizes = plan3dImage.getAttribute("sizes");

      if (src) {
        plan3dTarget.setAttribute("src", src);
        console.log("🖼️ Image src:", src);
      }
      if (srcset) {
        plan3dTarget.setAttribute("srcset", srcset);
        console.log("🖼️ Image srcset:", srcset);
      }
      if (sizes) {
        plan3dTarget.setAttribute("sizes", sizes);
        console.log("🖼️ Image sizes:", sizes);
      }
    }

    // -------- VISITE 360° (lien) -------- //
    const visiteLink = appartItem
      .querySelector(".appart-visite360")
      ?.getAttribute("href");
    const visiteTarget = document.querySelector('a[data="visite360"]');
    if (visiteTarget && visiteLink) {
      visiteTarget.setAttribute("href", visiteLink);
      console.log("🔗 Lien visite360 mis à jour :", visiteLink);
    }
  });
});
