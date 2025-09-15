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

// --------------------- levels popup --------------------- //

document.addEventListener("DOMContentLoaded", function () {
  // STEP 1: Number each level path inside the SVG
  const levelPaths = document.querySelectorAll(".img--bg.is--svg path");
  levelPaths.forEach((path, index) => {
    path.setAttribute("level", index + 1);
  });

  // STEP 2: Listen to click on any level
  levelPaths.forEach((path) => {
    path.addEventListener("click", () => {
      const selectedLevel = path.getAttribute("level");
      console.log("Level clicked:", selectedLevel);
      openLevelPopup(selectedLevel);
    });
  });

  function openLevelPopup(levelNumber) {
    console.log("Opening level popup for level:", levelNumber);
    const popup = document.querySelector(".popup");
    const popupPlan = popup.querySelector(".popup--plan");
    const popupPlan3d = popup.querySelector(".popup--plan-3d");
    const levelEl = document.querySelector(
      `.etage--el:nth-child(${levelNumber})`
    );

    console.log("Level element found:", levelEl);
    if (!levelEl) {
      console.log("No level element found for level:", levelNumber);
      return;
    }

    const levelImage = levelEl.querySelector(".etage--img");
    const appartItems = levelEl.querySelectorAll(".appart-item");

    console.log("Level image found:", levelImage);
    console.log("Apartment items found:", appartItems.length);

    // Show popup
    popup.style.display = "flex";
    console.log("Popup displayed");

    // Replace .popup--plan content with .etage--img and all appart-plan RichTexts
    popupPlan.innerHTML = "";
    if (levelImage) {
      popupPlan.appendChild(levelImage.cloneNode(true));
    }

    appartItems.forEach((item) => {
      const plan = item.querySelector(".appart-plan");
      if (plan) {
        popupPlan.appendChild(plan.cloneNode(true));
      }
    });

    // Find the apartment with the smallest .appart-number
    let minAppart = null;
    let minNumber = Infinity;

    appartItems.forEach((item) => {
      const numberEl = item.querySelector(".appart-number");
      const number = parseInt(numberEl?.innerText || "9999", 10);
      if (!isNaN(number) && number < minNumber) {
        minNumber = number;
        minAppart = item;
      }
    });

    // If found, fill the apartment details
    if (minAppart) {
      console.log(
        "Filling apartment data for apartment with number:",
        minNumber
      );
      fillApartmentData(minAppart, levelImage);
    } else {
      console.log("No minimum apartment found");
    }

    // STEP 3: Click handler on .appart-plan paths to change apartment info
    const planPaths = popupPlan.querySelectorAll("path");
    console.log("Plan paths found:", planPaths.length);
    planPaths.forEach((path) => {
      path.addEventListener("click", () => {
        const index = Array.from(planPaths).indexOf(path);
        const clickedAppart = appartItems[index];
        console.log(
          "Plan path clicked, index:",
          index,
          "apartment:",
          clickedAppart
        );
        if (clickedAppart) {
          fillApartmentData(clickedAppart, levelImage);
        }
      });
    });
  }

  function fillApartmentData(appartEl, levelImage) {
    console.log("Filling apartment data for element:", appartEl);
    const getText = (selector) =>
      appartEl.querySelector(selector)?.innerText || "";
    const getImageSrc = (el) => el?.getAttribute("src") || "";

    const apartmentNumber = getText(".appart-number");
    const apartmentPieces = getText(".appart-pieces");
    const apartmentSurface = getText(".appart-surface");
    const apartmentBalcon = getText(".appart-balcon");
    const apartmentDisponibilite = getText(".appart-disponibilite");

    console.log("Apartment data:", {
      number: apartmentNumber,
      pieces: apartmentPieces,
      surface: apartmentSurface,
      balcon: apartmentBalcon,
      disponibilite: apartmentDisponibilite,
    });

    // Debug each element before setting innerText
    const numberEl = document.querySelector('[data="number"]');
    const piecesEl = document.querySelector('[data="pieces"]');
    const surfaceEl = document.querySelector('[data="surface"]');
    const balconEl = document.querySelector('[data="balcon"]');
    const disponibiliteEl = document.querySelector('[data="disponibilite"]');

    console.log("Target elements found:", {
      numberEl,
      piecesEl,
      surfaceEl,
      balconEl,
      disponibiliteEl,
    });

    if (numberEl) numberEl.innerText = apartmentNumber;
    else console.error('Element [data="number"] not found');

    if (piecesEl) piecesEl.innerText = apartmentPieces;
    else console.error('Element [data="pieces"] not found');

    if (surfaceEl) surfaceEl.innerText = apartmentSurface;
    else console.error('Element [data="surface"] not found');

    if (balconEl) balconEl.innerText = apartmentBalcon;
    else console.error('Element [data="balcon"] not found');

    if (disponibiliteEl) disponibiliteEl.innerText = apartmentDisponibilite;
    else console.error('Element [data="disponibilite"] not found');

    const visite360 = getText(".appart-visite360");
    console.log("Visite 360 link:", visite360);
    if (visite360) {
      const visite360El = document.querySelector('[data="visite360"]');
      console.log("Visite 360 element found:", visite360El);
      if (visite360El) {
        visite360El.setAttribute("href", visite360);
      } else {
        console.error('Element [data="visite360"] not found');
      }
    }

    if (levelImage) {
      const imgSrc = getImageSrc(levelImage);
      console.log("Level image source:", imgSrc);
      if (imgSrc) {
        const popup3dEl = document.querySelector(".popup--plan-3d");
        console.log("Popup 3D element found:", popup3dEl);
        if (popup3dEl) {
          popup3dEl.setAttribute("src", imgSrc);
        } else {
          console.error("Element .popup--plan-3d not found");
        }
      }
    }
  }
});
