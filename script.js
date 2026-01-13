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

  // STEP 2: Listen to click and hover on any level
  levelPaths.forEach((path, index) => {
    const levelNumber = index + 1;

    // Only make levels 6 and above clickable
    if (levelNumber >= 6) {
      path.addEventListener("click", () => {
        const selectedLevel = path.getAttribute("level");
        console.log("Level clicked:", selectedLevel);
        openLevelPopup(selectedLevel);
      });
    } else {
      // First 5 levels are not clickable - add a class or style to indicate
      path.style.cursor = "default";
      console.log(
        `Level ${levelNumber} is not clickable (first 5 levels are disabled)`
      );
    }

    // Add hover functionality for level number only (no path opacity change)
    path.addEventListener("mouseenter", () => {
      const hoveredLevel = path.getAttribute("level");
      console.log("Level hovered:", hoveredLevel);
      updateLevelNumber(hoveredLevel);
    });

    path.addEventListener("mouseleave", () => {
      // Keep the last hovered number - don't change anything
      console.log("Mouse left level path - keeping current number");
    });
  });

  // Cache for fetched floor data
  const floorDataCache = new Map();

  // Store current apartment data for gallery access (on window for cross-IIFE access)
  window.currentApartmentData = null;

  // Fetch individual apartment page data
  async function fetchApartmentData(apartmentUrl) {
    console.log("Fetching apartment page:", apartmentUrl);
    try {
      const response = await fetch(apartmentUrl);
      if (!response.ok) {
        console.error("Failed to fetch apartment page:", response.status);
        return null;
      }

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Extract apartment data from the individual apartment page
      const apartmentData = {
        number: doc.querySelector(".appart-number")?.textContent?.trim() || "",
        etage: doc.querySelector(".appart-etage")?.textContent?.trim() || "",
        pieces: doc.querySelector(".appart-pieces")?.textContent?.trim() || "",
        surface:
          doc.querySelector(".appart-surface")?.textContent?.trim() || "",
        balcon: doc.querySelector(".appart-balcon")?.textContent?.trim() || "",
        disponibilite:
          doc.querySelector(".appart-disponibilite")?.textContent?.trim() || "",
        loyer: doc.querySelector(".appart-loyer")?.textContent?.trim() || "",
        charges:
          doc.querySelector(".appart-charges")?.textContent?.trim() || "",
        visite360:
          doc.querySelector(".appart-visite360")?.textContent?.trim() || "",
        amenagement:
          doc.querySelector(".appart-amenagement")?.textContent?.trim() || "",
        plan3d: doc.querySelector(".appart-plan3d"),
        planAbsolute: doc.querySelector(".appart-plan-absolute"),
        plan: doc.querySelector(".appart-plan"),
        gallery: Array.from(doc.querySelectorAll(".appart-gallery-img")),
        url: apartmentUrl,
      };

      console.log("Fetched apartment data:", apartmentData.number);
      return apartmentData;
    } catch (error) {
      console.error("Error fetching apartment page:", error);
      return null;
    }
  }

  // Fetch floor page data (floor image + all apartment details)
  async function fetchFloorData(levelNumber) {
    // Check cache first
    if (floorDataCache.has(levelNumber)) {
      console.log("Using cached floor data for level:", levelNumber);
      return floorDataCache.get(levelNumber);
    }

    const floorPageUrl = `/etages/${levelNumber}`;
    console.log("Fetching floor page:", floorPageUrl);

    try {
      const response = await fetch(floorPageUrl);
      if (!response.ok) {
        console.error("Failed to fetch floor page:", response.status);
        return null;
      }

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Get floor image from etages page
      const levelImage = doc.querySelector(".etage--img");

      // Get all apartment links from etages page
      const appartLinks = Array.from(doc.querySelectorAll(".appart-link"));

      console.log(
        "Fetched floor data - Level image:",
        levelImage ? "found" : "not found"
      );
      console.log("Fetched floor data - Apartment links:", appartLinks.length);

      // Fetch each individual apartment page to get full data
      const apartmentUrls = appartLinks
        .map((link) => link.getAttribute("href"))
        .filter(Boolean);
      console.log("Fetching apartment pages:", apartmentUrls);

      const apartmentDataPromises = apartmentUrls.map((url) =>
        fetchApartmentData(url)
      );
      const apartmentDataArray = await Promise.all(apartmentDataPromises);

      // Filter out failed fetches
      const appartItems = apartmentDataArray.filter((data) => data !== null);
      console.log("Successfully fetched apartments:", appartItems.length);

      const floorData = {
        levelImage,
        appartItems, // Now contains full apartment data objects
        appartLinks,
        doc,
      };

      // Cache the data
      floorDataCache.set(levelNumber, floorData);

      return floorData;
    } catch (error) {
      console.error("Error fetching floor page:", error);
      return null;
    }
  }

  // Open level popup - now async and fetches from /etages/
  async function openLevelPopup(levelNumber) {
    console.log("Opening level popup for level:", levelNumber);
    currentLevel = levelNumber;
    updateLevelName(levelNumber);

    const popup = document.querySelector(".popup");
    const popupPlan = popup.querySelector(".popup--plan");

    // Show popup with loading state
    popup.style.display = "grid";
    popupPlan.innerHTML =
      '<div style="padding: 2rem; text-align: center; color: #666;">Loading...</div>';

    // Animate popup entrance - just fade in
    gsap.fromTo(
      popup,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: "power2.out" }
    );

    // Fetch floor data from /etages/{levelNumber}
    const floorData = await fetchFloorData(levelNumber);

    if (!floorData) {
      popupPlan.innerHTML =
        '<div style="padding: 2rem; text-align: center; color: #666;">Error loading floor data</div>';
      return;
    }

    const { levelImage, appartItems, appartLinks } = floorData;

    // Update arrow states after popup is displayed
    requestAnimationFrame(() => {
      updateArrowStates(levelNumber);
    });

    console.log("Popup displayed with fade animation");

    // Replace .popup--plan content with fetched data
    popupPlan.innerHTML = "";
    console.log("Cleared popup plan content");

    if (levelImage) {
      const clonedImage = levelImage.cloneNode(true);
      popupPlan.appendChild(clonedImage);
      console.log("Added level image to popup plan");
    }

    // appartItems is now an array of data objects with plan/planAbsolute as DOM elements
    appartItems.forEach((apartmentData, index) => {
      if (apartmentData.plan) {
        const clonedPlan = apartmentData.plan.cloneNode(true);
        popupPlan.appendChild(clonedPlan);
        console.log(
          `Added apartment plan ${index + 1} (apt #${
            apartmentData.number
          }) to popup`
        );
      }
      if (apartmentData.planAbsolute) {
        const clonedPlanAbsolute = apartmentData.planAbsolute.cloneNode(true);
        gsap.set(clonedPlanAbsolute, { opacity: 0 });
        popupPlan.appendChild(clonedPlanAbsolute);
        console.log(`Added apartment plan absolute ${index + 1} to popup`);
      }
    });

    // Set level image opacity
    const popupPlanImg = popupPlan.querySelector("img");
    if (popupPlanImg) {
      gsap.set(popupPlanImg, { opacity: 0.4 });
    }

    // Find the apartment with the smallest number (or first one if none have numbers)
    let firstAppart = null;
    let firstAppartIndex = 0;
    let minNumber = Infinity;

    appartItems.forEach((apartmentData, index) => {
      const number = parseInt(apartmentData.number || "9999", 10);
      console.log(
        `Apartment ${index}: number = "${apartmentData.number}" (parsed: ${number})`
      );
      if (!isNaN(number) && number < minNumber) {
        minNumber = number;
        firstAppart = apartmentData;
        firstAppartIndex = index;
      }
    });

    // Default to first apartment if none found by number
    if (!firstAppart && appartItems.length > 0) {
      firstAppart = appartItems[0];
      firstAppartIndex = 0;
      console.log("No apartment numbers found, defaulting to first apartment");
    }

    // Fill the first apartment's data
    if (firstAppart) {
      console.log(
        "Filling apartment data for first apartment, index:",
        firstAppartIndex,
        "number:",
        minNumber
      );
      fillApartmentData(firstAppart, levelImage);

      // Set the first apartment's .appart-plan-absolute to visible
      const planAbsoluteElements = popupPlan.querySelectorAll(
        ".appart-plan-absolute"
      );
      planAbsoluteElements.forEach((el, index) => {
        if (index === firstAppartIndex) {
          gsap.set(el, { opacity: 1 });
          console.log("Set first apartment overlay to visible, index:", index);
        }
      });
    } else {
      console.log("No apartments found on this floor");
    }

    // Setup click and hover handlers on .appart-plan paths
    setupPlanInteractions(popupPlan, appartItems, firstAppartIndex, levelImage);
  }

  // Setup plan interactions (click and hover)
  function setupPlanInteractions(
    popupPlan,
    appartItems,
    initialActiveIndex,
    levelImage
  ) {
    const planPaths = popupPlan.querySelectorAll(".appart-plan path");
    const planAbsoluteElements = popupPlan.querySelectorAll(
      ".appart-plan-absolute"
    );
    let activeApartmentIndex = initialActiveIndex;

    console.log("Plan paths found:", planPaths.length);

    // Set initial opacity: active apartment at 1, others at 0
    planAbsoluteElements.forEach((el, index) => {
      gsap.set(el, { opacity: index === activeApartmentIndex ? 1 : 0 });
    });

    planPaths.forEach((path, index) => {
      const correspondingPlanAbsolute = planAbsoluteElements[index];

      // Set initial path opacity to 0
      gsap.set(path, { opacity: 0 });

      // Click handler to change apartment info
      path.addEventListener("click", () => {
        const clickedAppart = appartItems[index];
        console.log("Plan path clicked, index:", index);

        if (clickedAppart) {
          fillApartmentData(clickedAppart, levelImage);
          const previousActiveIndex = activeApartmentIndex;
          activeApartmentIndex = index;

          // Fade out previous active apartment's .appart-plan-absolute
          if (
            previousActiveIndex !== null &&
            previousActiveIndex !== activeApartmentIndex
          ) {
            const previousActiveAbsolute =
              planAbsoluteElements[previousActiveIndex];
            if (previousActiveAbsolute) {
              gsap.to(previousActiveAbsolute, {
                opacity: 0,
                duration: 0.3,
                ease: "power2.out",
              });
            }
          }

          // Fade in new active apartment's .appart-plan-absolute
          if (correspondingPlanAbsolute) {
            gsap.to(correspondingPlanAbsolute, {
              opacity: 1,
              duration: 0.3,
              ease: "power2.out",
            });
          }
        }
      });

      // Hover handler
      path.addEventListener("mouseenter", () => {
        const tl = gsap.timeline();

        if (index !== activeApartmentIndex && activeApartmentIndex !== null) {
          const activeAbsolute = planAbsoluteElements[activeApartmentIndex];
          if (activeAbsolute) {
            tl.to(
              activeAbsolute,
              { opacity: 0, duration: 0.3, ease: "power2.out" },
              0
            );
          }
        }

        if (correspondingPlanAbsolute && index !== activeApartmentIndex) {
          tl.to(
            correspondingPlanAbsolute,
            { opacity: 1, duration: 0.3, ease: "power2.out" },
            0
          );
        }
      });

      path.addEventListener("mouseleave", () => {
        const tl = gsap.timeline();

        if (correspondingPlanAbsolute && index !== activeApartmentIndex) {
          tl.to(
            correspondingPlanAbsolute,
            { opacity: 0, duration: 0.3, ease: "power2.out" },
            0
          );
        }

        if (activeApartmentIndex !== null) {
          const activeAbsolute = planAbsoluteElements[activeApartmentIndex];
          if (activeAbsolute) {
            tl.to(
              activeAbsolute,
              { opacity: 1, duration: 0.3, ease: "power2.out" },
              0
            );
          }
        }
      });
    });
  }

  // fillApartmentData now accepts a data object (from fetchApartmentData)
  function fillApartmentData(apartmentData, levelImage) {
    console.log("Filling apartment data for:", apartmentData);

    // Store current apartment for gallery access
    window.currentApartmentData = apartmentData;

    // Helper to set text on target elements
    const setTargetText = (selector, value) => {
      const el = document.querySelector(selector);
      if (el) {
        el.innerText = value || "";
        console.log(`Set ${selector} to:`, value);
      } else {
        console.warn(`Target element ${selector} not found`);
      }
    };

    // Fill all data fields directly from the data object
    setTargetText('[data="number"]', apartmentData.number);
    setTargetText('[data="pieces"]', apartmentData.pieces);
    setTargetText('[data="surface"]', apartmentData.surface);
    setTargetText('[data="balcon"]', apartmentData.balcon);
    setTargetText('[data="disponibilite"]', apartmentData.disponibilite);

    // Change availability circle color based on disponibilite value
    const availabilityCircle = document.querySelector(
      ".popup--availability-circle"
    );
    if (availabilityCircle && apartmentData.disponibilite) {
      const disponibiliteValue = apartmentData.disponibilite
        .toLowerCase()
        .trim();
      if (disponibiliteValue === "non disponible") {
        availabilityCircle.style.backgroundColor = "orange";
        console.log("Set availability circle to orange (Non Disponible)");
      } else {
        // Reset to default/green for "Disponible"
        availabilityCircle.style.backgroundColor = "";
        console.log("Reset availability circle color (Disponible)");
      }
    }

    setTargetText('[data="loyer"]', apartmentData.loyer);
    setTargetText('[data="charges"]', apartmentData.charges);
    setTargetText('[data="amenagement"]', apartmentData.amenagement);

    // Set visite360 link
    if (apartmentData.visite360) {
      const visite360El = document.querySelector('[data="visite360"]');
      if (visite360El) {
        visite360El.setAttribute("href", apartmentData.visite360);
        console.log("Set visite360 href to:", apartmentData.visite360);
      }
    }

    // Update [data="plan3d"] with .appart-plan3d src
    if (apartmentData.plan3d) {
      const plan3dSrc = apartmentData.plan3d.getAttribute("src");
      const plan3dSrcset = apartmentData.plan3d.getAttribute("srcset");
      console.log("Apartment plan3d source:", plan3dSrc);

      if (plan3dSrc) {
        const popup3dEl = document.querySelector('[data="plan3d"]');
        if (popup3dEl) {
          popup3dEl.setAttribute("src", plan3dSrc);
          if (plan3dSrcset) {
            popup3dEl.setAttribute("srcset", plan3dSrcset);
          }
          // Force image reload
          popup3dEl.style.display = "none";
          popup3dEl.offsetHeight;
          popup3dEl.style.display = "";
          console.log("Updated popup 3D image");
        }
      }
    }
  }

  // Level navigation and popup closing functionality
  let currentLevel = null;

  // Update level name display
  function updateLevelName(levelNumber) {
    const levelNameEl = document.querySelector('[level="name"]');
    if (levelNameEl) {
      levelNameEl.innerText = levelNumber;
      console.log("Updated level name to:", levelNumber);
    } else {
      console.error('Element [level="name"] not found');
    }
  }

  // Update level number display (for hover) with animation
  function updateLevelNumber(levelNumber) {
    const levelNumberEl = document.querySelector('[data="levelnumber"]');
    if (levelNumberEl) {
      // Animate the number change
      gsap.to(levelNumberEl, {
        scale: 1.1,
        duration: 0.1,
        ease: "power2.out",
        onComplete: () => {
          levelNumberEl.innerText = levelNumber;
          gsap.to(levelNumberEl, {
            scale: 1,
            duration: 0.1,
            ease: "power2.out",
          });
        },
      });
      console.log("Updated level number to:", levelNumber);
    } else {
      console.error('Element [data="levelnumber"] not found');
    }
  }

  // Total levels - based on SVG paths in the building
  const totalLevels = levelPaths.length;

  // Update arrow states based on current level
  function updateArrowStates(levelNumber) {
    const downArrow = document.querySelector(".arrow--flex.is--down");
    const upArrow = document.querySelector(".arrow--flex.is--up");

    if (downArrow) {
      // Disable down arrow if at level 6 or below (minimum is 6)
      if (parseInt(levelNumber) <= 6) {
        downArrow.classList.add("is--disabled");
      } else {
        downArrow.classList.remove("is--disabled");
      }
    }

    if (upArrow) {
      if (parseInt(levelNumber) >= totalLevels) {
        upArrow.classList.add("is--disabled");
      } else {
        upArrow.classList.remove("is--disabled");
      }
    }
  }

  // Find next available level (up)
  function getNextLevelUp(currentLevelNum) {
    const num = parseInt(currentLevelNum);
    if (num < totalLevels) {
      console.log("Next level up from", num, "is:", num + 1);
      return num + 1;
    }
    console.log("No higher level available");
    return null;
  }

  // Find previous available level (down)
  function getPreviousLevelDown(currentLevelNum) {
    const num = parseInt(currentLevelNum);
    // Minimum level is 6, can't go below that
    if (num > 6) {
      console.log("Previous level down from", num, "is:", num - 1);
      return num - 1;
    }
    console.log("No lower level available (minimum is level 6)");
    return null;
  }

  // Navigate to specific level - now async and fetches from /etages/
  async function navigateToLevel(levelNumber) {
    if (levelNumber && levelNumber !== currentLevel) {
      console.log("Navigating to level:", levelNumber);

      // Update level and content
      currentLevel = levelNumber;
      updateLevelName(levelNumber);
      updateArrowStates(levelNumber);

      const popup = document.querySelector(".popup");
      const popupPlan = popup.querySelector(".popup--plan");

      // Show loading state
      popupPlan.innerHTML =
        '<div style="padding: 2rem; text-align: center; color: #666;">Loading...</div>';

      // Fetch floor data from /etages/{levelNumber}
      const floorData = await fetchFloorData(levelNumber);

      if (!floorData) {
        popupPlan.innerHTML =
          '<div style="padding: 2rem; text-align: center; color: #666;">Error loading floor data</div>';
        return;
      }

      const { levelImage, appartItems } = floorData;

      // Replace .popup--plan content
      popupPlan.innerHTML = "";
      if (levelImage) {
        const clonedImage = levelImage.cloneNode(true);
        popupPlan.appendChild(clonedImage);
      }

      // appartItems is now an array of data objects
      appartItems.forEach((apartmentData) => {
        if (apartmentData.plan) {
          const clonedPlan = apartmentData.plan.cloneNode(true);
          popupPlan.appendChild(clonedPlan);
        }
        if (apartmentData.planAbsolute) {
          const clonedPlanAbsolute = apartmentData.planAbsolute.cloneNode(true);
          popupPlan.appendChild(clonedPlanAbsolute);
        }
      });

      // Set level image opacity
      const popupPlanImg = popupPlan.querySelector("img");
      if (popupPlanImg) {
        gsap.set(popupPlanImg, { opacity: 0.4 });
      }

      // Find the apartment with the smallest number (or first one)
      let firstAppart = null;
      let firstAppartIndex = 0;
      let minNumber = Infinity;

      appartItems.forEach((apartmentData, index) => {
        const number = parseInt(apartmentData.number || "9999", 10);
        if (!isNaN(number) && number < minNumber) {
          minNumber = number;
          firstAppart = apartmentData;
          firstAppartIndex = index;
        }
      });

      // Default to first apartment if none found by number
      if (!firstAppart && appartItems.length > 0) {
        firstAppart = appartItems[0];
        firstAppartIndex = 0;
      }

      // Fill the first apartment's data and show its overlay
      if (firstAppart) {
        fillApartmentData(firstAppart, levelImage);

        // Set the first apartment's .appart-plan-absolute to visible
        const planAbsoluteElements = popupPlan.querySelectorAll(
          ".appart-plan-absolute"
        );
        planAbsoluteElements.forEach((el, index) => {
          if (index === firstAppartIndex) {
            gsap.set(el, { opacity: 1 });
          } else {
            gsap.set(el, { opacity: 0 });
          }
        });
      }

      // Setup interactions
      setupPlanInteractions(
        popupPlan,
        appartItems,
        firstAppartIndex,
        levelImage
      );
    }
  }

  // Close popup with fade animation
  function closePopup() {
    const popup = document.querySelector(".popup");
    if (popup) {
      // Animate popup exit - just fade out
      gsap.to(popup, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          popup.style.display = "none";
          currentLevel = null;
          console.log("Popup closed with fade animation");
        },
      });
    }
  }

  // Add event listeners for navigation and closing with animations
  document.addEventListener("click", function (e) {
    // Up arrow - next level
    if (e.target.closest(".arrow--flex.is--up")) {
      e.preventDefault();

      // Don't proceed if arrow is disabled
      const upArrow = e.target.closest(".arrow--flex.is--up");
      if (upArrow && upArrow.classList.contains("is--disabled")) {
        return;
      }

      // Animate arrow click
      gsap.to(upArrow, {
        scale: 0.9,
        duration: 0.1,
        ease: "power2.out",
        onComplete: () => {
          gsap.to(upArrow, {
            scale: 1,
            duration: 0.1,
            ease: "power2.out",
          });
        },
      });

      if (currentLevel) {
        const nextLevel = getNextLevelUp(currentLevel);
        if (nextLevel) {
          navigateToLevel(nextLevel);
        } else {
          console.log("No higher level available");
        }
      }
    }

    // Down arrow - previous level
    if (e.target.closest(".arrow--flex.is--down")) {
      e.preventDefault();

      // Don't proceed if arrow is disabled
      const downArrow = e.target.closest(".arrow--flex.is--down");
      if (downArrow && downArrow.classList.contains("is--disabled")) {
        return;
      }

      // Animate arrow click
      gsap.to(downArrow, {
        scale: 0.9,
        duration: 0.1,
        ease: "power2.out",
        onComplete: () => {
          gsap.to(downArrow, {
            scale: 1,
            duration: 0.1,
            ease: "power2.out",
          });
        },
      });

      if (currentLevel) {
        const prevLevel = getPreviousLevelDown(currentLevel);
        if (prevLevel) {
          navigateToLevel(prevLevel);
        } else {
          console.log("No lower level available");
        }
      }
    }

    // Close popup
    if (e.target.closest(".popup--close-trigger")) {
      e.preventDefault();

      // Animate close button click
      gsap.to(e.target.closest(".popup--close-trigger"), {
        scale: 0.9,
        duration: 0.1,
        ease: "power2.out",
        onComplete: () => {
          gsap.to(e.target.closest(".popup--close-trigger"), {
            scale: 1,
            duration: 0.1,
            ease: "power2.out",
          });
        },
      });

      closePopup();
    }
  });
});

// --------------------- Popup Form --------------------- //
(() => {
  const qs = (sel, root = document) => root.querySelector(sel);

  // Show popup form on click: [popup="form"] => .popup-form--wrapper {display:flex}
  function initPopupFormOpen() {
    const wrapper = qs(".popup-form--wrapper");
    if (!wrapper) return;

    document.addEventListener("click", (e) => {
      const btn = e.target.closest('[popup="form"]');
      if (!btn) return;

      e.preventDefault();
      wrapper.style.display = "flex";
    });

    // Close popup form
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

// --------------------- Gallery Popup --------------------- //
(() => {
  // ===================== CONFIG ===================== //
  // Ratio for all images (e.g., "16 / 9", "4 / 3", "1 / 1")
  const GALLERY_RATIO = "1280 / 853";

  // How to display image in ratio:
  // "cover" = fills (may crop) / "contain" = no crop (may have bars)
  const GALLERY_FIT = "cover";

  // Image selector on the apartment page
  const GALLERY_IMG_SELECTOR = ".appart-gallery-img";

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
        position:fixed; inset:0; z-index:1006;
        display:none; align-items:center; justify-content:center;
        background:#15496d80;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        padding:2.25rem;
      }

      .__gallery_panel{
        width:100vw;
        max-height:92vh;
        background:rgba(0,0,0,.08);
        border:1px solid rgba(255,255,255,.16);
        border-radius:1.125rem;
        overflow:hidden;
        position:relative;
        display:flex;
        flex-direction:column;
        backdrop-filter: blur(0.625rem);
      }

      /* Ratio for screens above 992px */
      @media (min-width: 992px){
        .__gallery_panel{
          width: auto;
          height: auto;
          max-width: 90vw;
          max-height: 80vh;
          aspect-ratio: 962 / 710;
        }
      }

      .__gallery_close{
        position:absolute; top:0.875rem; right:0.875rem;
        width:2.625rem; height:2.625rem;
        border:1px solid rgba(255,255,255,.22);
        border-radius:999px;
        background:rgba(0,0,0,.18);
        color:#fff;
        cursor:pointer;
        font-size:2rem;
        padding-top: 0.4rem;
        line-height:2.5rem;
        display:flex; align-items:center; justify-content:center;
        transition: transform .18s ease, background .18s ease;
        z-index: 20;
      }
      .__gallery_close:hover{ transform:scale(1.05); background:rgba(0,0,0,.28); }

      .__gallery_copyright{
        position:absolute; top:1.5rem; right:4.5rem;
        color:#fff;
        font-size:0.875rem;
        opacity:0.8;
        z-index: 20;
        user-select: none;
      }

      .__gallery_body{ padding:1rem; overflow:auto; }

      /* ==== Splide look ==== */
      .__gallery_panel .splide{ width:100%; }
      .__gallery_panel .splide__track{ overflow:hidden; border-radius:0.875rem; }

      /* ratio wrapper */
      .__gallery_panel .splide__slide{
        display:flex;
        align-items:center;
        justify-content:center;
      }
      .__gallery_media{
        width:100%;
        aspect-ratio: var(--gallery-ratio, 16/9);
        border-radius:0.875rem;
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
      .__gallery_panel .splide__arrows{
        display: flex;
        margin-bottom: 0.5rem;
        gap: 1rem;
      }
      .__gallery_panel .splide__arrow{
        width:2.875rem; height:2.875rem;
        border-radius:999px;
        background:rgba(0,0,0,.28);
        border:1px solid rgba(255,255,255,.22);
        opacity:1;
        transition: transform .18s ease, background .18s ease, border-color .18s ease;
        box-shadow: 0 0.625rem 1.875rem rgba(0,0,0,.20);
         display: flex; align-items: center;
    justify-content: center;
      }
      .__gallery_panel .splide__arrow--prev{
        transform: rotate(180deg);
      }
      .__gallery_panel .splide__arrow:hover{
        transform: scale(1.06);
        background: rgba(0,0,0,.40);
        border-color: rgba(255,255,255,.34);
      }
      .__gallery_panel .splide__arrow--prev:hover{
        transform: rotate(180deg) scale(1.06);
      }
      .__gallery_panel .splide__arrow svg{
        fill:#fff;
        width:1.125rem; height:1.125rem;
      }
      .__gallery_panel .splide__arrow:disabled{
        opacity:.35;
        transform:none;
        background:rgba(0,0,0,.18);
      }
      .__gallery_panel .splide__arrow--prev:disabled{
        transform: rotate(180deg);
      }

      /* pagination dots */
      .__gallery_panel .splide__pagination{
        bottom: -0.625rem;
        padding: 0;
        gap: 0.5rem;
        border-radius: 300rem;
        margin-top: 1rem;
      }
      .__gallery_panel .splide__pagination__page{
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 300rem;
        padding: 0;
        background: rgba(255,255,255,.35);
        opacity:1;
        transition: transform .18s ease, background .18s ease;
      }
      .__gallery_panel .splide__pagination__page.is-active{
        background:#fff;
        transform: scale(1.25);
      }

      /* fallback slider (without Splide) */
      .__snap{
        display:flex; gap:0.75rem; overflow-x:auto;
        scroll-snap-type:x mandatory;
        -webkit-overflow-scrolling:touch;
      }
      .__snap .__gallery_media{ flex:0 0 100%; scroll-snap-align:center; }

      /* Responsive */
      @media (max-width: 767px){
        .gallery--wrapper.__auto{ padding: 1rem; }
        .__gallery_panel{ max-height: 94vh; border-radius: 1rem; }
        .__gallery_body{ padding: 0.75rem; }
        .__gallery_close{ width:2.5rem; height:2.5rem; top:0.75rem; right:0.75rem; }
        .__gallery_panel .splide__arrow{ width:2.5rem; height:2.5rem; display: flex; align-items: center;
    justify-content: center;}
        .__gallery_panel .splide__arrow svg{ width:1rem; height:1rem; }
      }
    `;
    document.head.appendChild(st);
  };

  // ===================== Find current apartment link ===================== //
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

  // Get current level number and apartment number
  function getCurrentInfo() {
    const levelName = norm(qs('[level="name"]')?.textContent);
    const apartmentNumber = norm(qs('[data="number"]')?.textContent);

    return {
      level: levelName,
      apartmentNumber: apartmentNumber,
    };
  }

  // Fetch the floor page and find the apartment link
  async function getAppartPageUrl() {
    const { level, apartmentNumber } = getCurrentInfo();

    if (!level) {
      console.log("No level found");
      return null;
    }

    if (!apartmentNumber) {
      console.log("No apartment number found");
      return null;
    }

    console.log("Current level:", level);
    console.log("Current apartment number:", apartmentNumber);

    // Fetch the floor page
    const floorPageUrl = `/etages/${level}`;
    console.log("Fetching floor page:", floorPageUrl);

    try {
      const response = await fetch(floorPageUrl);
      if (!response.ok) {
        console.error("Failed to fetch floor page:", response.status);
        return null;
      }

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Find all .appart-link elements on the floor page
      const appartLinks = qsa(".appart-link", doc);
      console.log("Found", appartLinks.length, "apartment links on floor page");

      // Find the link that matches our apartment number
      for (const link of appartLinks) {
        // Look for apartment number inside or near this link
        const linkNumber =
          norm(qs(".appart-number", link)?.textContent) ||
          norm(qs(".appart-number", link.parentElement)?.textContent) ||
          norm(
            link.closest(".appart-item")?.querySelector(".appart-number")
              ?.textContent
          ) ||
          norm(
            link.closest(".w-dyn-item")?.querySelector(".appart-number")
              ?.textContent
          );

        console.log("Checking link, found number:", linkNumber);

        if (linkNumber === apartmentNumber) {
          const href = link.getAttribute("href");
          console.log("Found matching apartment link:", href);
          return href;
        }
      }

      // If no match by number, try to find by checking all links
      console.log(
        "No exact match found, checking all links for apartment number in URL or content"
      );
      for (const link of appartLinks) {
        const href = link.getAttribute("href") || "";
        // Check if the URL contains the apartment number
        if (
          href.includes(apartmentNumber) ||
          href.includes(`-${apartmentNumber}`)
        ) {
          console.log("Found link by URL match:", href);
          return href;
        }
      }

      console.log("No matching apartment link found on floor page");
      return null;
    } catch (error) {
      console.error("Error fetching floor page:", error);
      return null;
    }
  }

  // Get gallery images from current apartment data (already fetched)
  function getGalleryImages() {
    // First try to use cached current apartment data (stored on window for cross-IIFE access)
    const apartmentData = window.currentApartmentData;
    if (
      apartmentData &&
      apartmentData.gallery &&
      apartmentData.gallery.length > 0
    ) {
      console.log("Using cached gallery images:", apartmentData.gallery.length);
      return apartmentData.gallery.filter((img) => img?.getAttribute?.("src"));
    }

    console.log("No gallery images in current apartment data");
    return [];
  }

  // Async wrapper for backward compatibility (in case we need to fetch)
  async function fetchGalleryImages() {
    return getGalleryImages();
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
          <div class="__gallery_copyright">© Adrien Barakat</div>
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
      body.innerHTML = `<div style="color:#fff; padding:24px;">No photos available for this apartment.</div>`;
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

      // Important if wrapper was display:none
      setTimeout(() => {
        try {
          splideInstance.refresh();
        } catch (e) {}
      }, 0);

      return;
    }

    // Fallback scroll-snap
    const snap = document.createElement("div");
    snap.className = "__snap";
    imgs.forEach((img) => snap.appendChild(buildSlideImg(img)));
    body.appendChild(snap);
  }

  async function openGallery() {
    ensureBaseStyle();
    const wrapper = ensureWrapper();

    // Show loading state
    wrapper.style.display = "flex";
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const body = qs(".__gallery_body", wrapper);
    if (body) {
      body.innerHTML = `<div style="color:#fff; padding:1.5rem; text-align:center;">Loading gallery...</div>`;
    }

    // Fetch images from apartment page
    const imgs = await fetchGalleryImages();

    buildSlider(wrapper, imgs);

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

      // Click on overlay (outside panel)
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
