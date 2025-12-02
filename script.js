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
  levelPaths.forEach((path) => {
    path.addEventListener("click", () => {
      const selectedLevel = path.getAttribute("level");
      console.log("Level clicked:", selectedLevel);
      openLevelPopup(selectedLevel);
    });

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

  function openLevelPopup(levelNumber) {
    console.log("Opening level popup for level:", levelNumber);
    currentLevel = levelNumber;
    updateLevelName(levelNumber);

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

    // Show popup with fade animation
    popup.style.display = "grid";

    // Update arrow states after popup is displayed (use requestAnimationFrame to ensure DOM is ready)
    requestAnimationFrame(() => {
      updateArrowStates(levelNumber);
    });

    // Animate popup entrance - just fade in
    gsap.fromTo(
      popup,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      }
    );

    console.log("Popup displayed with fade animation");

    // Replace .popup--plan content with .etage--img and all appart-plan RichTexts
    popupPlan.innerHTML = "";
    console.log("Cleared popup plan content");
    if (levelImage) {
      const clonedImage = levelImage.cloneNode(true);
      popupPlan.appendChild(clonedImage);
      console.log("Added level image to popup plan:", clonedImage);
    }

    appartItems.forEach((item, index) => {
      const plan = item.querySelector(".appart-plan");
      if (plan) {
        const clonedPlan = plan.cloneNode(true);
        popupPlan.appendChild(clonedPlan);
        console.log(`Added apartment plan ${index + 1} to popup:`, clonedPlan);
      }
      const planAbsolute = item.querySelector(".appart-plan-absolute");
      if (planAbsolute) {
        const clonedPlanAbsolute = planAbsolute.cloneNode(true);
        // Set initial opacity to 0
        gsap.set(clonedPlanAbsolute, { opacity: 0 });
        popupPlan.appendChild(clonedPlanAbsolute);
        console.log(
          `Added apartment plan absolute ${index + 1} to popup:`,
          clonedPlanAbsolute
        );
      }
    });

    // Update .popup--plan with .etage--img src
    if (levelImage) {
      const popupPlanImg = popupPlan.querySelector("img");
      console.log("Popup plan img found:", popupPlanImg);
      if (popupPlanImg) {
        const levelImgSrc = levelImage.getAttribute("src");
        const levelImgSrcset = levelImage.getAttribute("srcset");
        const currentSrc = popupPlanImg.getAttribute("src");
        const currentSrcset = popupPlanImg.getAttribute("srcset");

        console.log("Current popup plan img src:", currentSrc);
        console.log("Current popup plan img srcset:", currentSrcset);
        console.log("Will update popup plan img src to:", levelImgSrc);
        console.log("Will update popup plan img srcset to:", levelImgSrcset);

        popupPlanImg.setAttribute("src", levelImgSrc);
        if (levelImgSrcset) {
          popupPlanImg.setAttribute("srcset", levelImgSrcset);
        }

        // Force image reload
        popupPlanImg.style.display = "none";
        popupPlanImg.offsetHeight; // Trigger reflow
        popupPlanImg.style.display = "";

        // Set .etage--img opacity to 0.4 permanently
        gsap.set(popupPlanImg, { opacity: 0.4 });

        console.log("Updated .popup--plan img src and srcset");
      } else {
        console.error("No img found in .popup--plan");
      }
    }

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
    let activeApartmentIndex = null;
    if (minAppart) {
      console.log(
        "Filling apartment data for apartment with number:",
        minNumber
      );
      fillApartmentData(minAppart, levelImage);
      // Find the index of the active apartment
      activeApartmentIndex = Array.from(appartItems).indexOf(minAppart);
    } else {
      console.log("No minimum apartment found");
    }

    // STEP 3: Click and hover handlers on .appart-plan paths
    const planPaths = popupPlan.querySelectorAll(".appart-plan path");
    console.log("Plan paths found:", planPaths.length);
    console.log("Plan paths elements:", planPaths);
    const planAbsoluteElements = popupPlan.querySelectorAll(
      ".appart-plan-absolute"
    );

    // Set initial opacity: active apartment at 1, others at 0
    planAbsoluteElements.forEach((el, index) => {
      if (index === activeApartmentIndex) {
        gsap.set(el, { opacity: 1 });
      } else {
        gsap.set(el, { opacity: 0 });
      }
    });

    planPaths.forEach((path, index) => {
      console.log(`Plan path ${index}:`, path);
      const correspondingPlanAbsolute = planAbsoluteElements[index];

      // Set initial path opacity to 0
      gsap.set(path, { opacity: 0 });

      // Click handler to change apartment info
      path.addEventListener("click", () => {
        const clickedIndex = Array.from(planPaths).indexOf(path);
        const clickedAppart = appartItems[clickedIndex];
        console.log(
          "Plan path clicked, index:",
          clickedIndex,
          "apartment:",
          clickedAppart
        );
        if (clickedAppart) {
          fillApartmentData(clickedAppart, levelImage);
          // Update active apartment
          const previousActiveIndex = activeApartmentIndex;
          activeApartmentIndex = clickedIndex;

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

      // Hover handler to show .appart-plan-absolute with opacity animation
      path.addEventListener("mouseenter", () => {
        // Use timeline to animate all elements simultaneously
        const tl = gsap.timeline();

        // If hovering a different apartment, fade out the active one
        if (index !== activeApartmentIndex && activeApartmentIndex !== null) {
          const activeAbsolute = planAbsoluteElements[activeApartmentIndex];
          if (activeAbsolute) {
            tl.to(
              activeAbsolute,
              {
                opacity: 0,
                duration: 0.3,
                ease: "power2.out",
              },
              0
            );
          }
        }

        // Show hovered apartment's .appart-plan-absolute
        if (correspondingPlanAbsolute && index !== activeApartmentIndex) {
          tl.to(
            correspondingPlanAbsolute,
            {
              opacity: 1,
              duration: 0.3,
              ease: "power2.out",
            },
            0
          ); // Start at same time (position 0)
        }
      });

      path.addEventListener("mouseleave", () => {
        // Use timeline to animate all elements simultaneously
        const tl = gsap.timeline();

        // Hide hovered apartment's .appart-plan-absolute (if it's not the active one)
        if (correspondingPlanAbsolute && index !== activeApartmentIndex) {
          tl.to(
            correspondingPlanAbsolute,
            {
              opacity: 0,
              duration: 0.3,
              ease: "power2.out",
            },
            0
          );
        }

        // Show active apartment's .appart-plan-absolute again
        if (activeApartmentIndex !== null) {
          const activeAbsolute = planAbsoluteElements[activeApartmentIndex];
          if (activeAbsolute) {
            tl.to(
              activeAbsolute,
              {
                opacity: 1,
                duration: 0.3,
                ease: "power2.out",
              },
              0
            );
          }
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

    // Update .popup--plan-3d with .appart-plan3d src
    const appartPlan3d = appartEl.querySelector(".appart-plan3d");
    if (appartPlan3d) {
      const plan3dSrc = appartPlan3d.getAttribute("src");
      const plan3dSrcset = appartPlan3d.getAttribute("srcset");
      console.log("Apartment plan3d source:", plan3dSrc);
      console.log("Apartment plan3d srcset:", plan3dSrcset);

      if (plan3dSrc) {
        const popup3dEl = document.querySelector('[data="plan3d"]');
        console.log("Popup 3D element found:", popup3dEl);
        if (popup3dEl) {
          const currentSrc = popup3dEl.getAttribute("src");
          const currentSrcset = popup3dEl.getAttribute("srcset");
          console.log("Current popup 3D src:", currentSrc);
          console.log("Current popup 3D srcset:", currentSrcset);
          console.log("Will update to src:", plan3dSrc);
          console.log("Will update to srcset:", plan3dSrcset);

          popup3dEl.setAttribute("src", plan3dSrc);
          if (plan3dSrcset) {
            popup3dEl.setAttribute("srcset", plan3dSrcset);
          }

          // Force image reload
          popup3dEl.style.display = "none";
          popup3dEl.offsetHeight; // Trigger reflow
          popup3dEl.style.display = "";

          console.log("Updated popup 3D image src and srcset");
        } else {
          console.error('Element [data="plan3d"] not found');
        }
      }
    } else {
      console.log("No .appart-plan3d found in apartment element");
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

  // Update arrow states based on current level
  function updateArrowStates(levelNumber) {
    const allLevels = document.querySelectorAll(".etage--el");
    const totalLevels = allLevels.length;
    const downArrow = document.querySelector(".arrow--flex.is--down");
    const upArrow = document.querySelector(".arrow--flex.is--up");

    if (downArrow) {
      if (levelNumber === 1) {
        downArrow.classList.add("is--disabled");
      } else {
        downArrow.classList.remove("is--disabled");
      }
    }

    if (upArrow) {
      if (levelNumber === totalLevels) {
        upArrow.classList.add("is--disabled");
      } else {
        upArrow.classList.remove("is--disabled");
      }
    }
  }

  // Find next available level (up)
  function getNextLevelUp(currentLevelNum) {
    const allLevels = document.querySelectorAll(".etage--el");
    let nextLevel = null;

    for (let i = 0; i < allLevels.length; i++) {
      const levelNum = i + 1;
      if (levelNum > currentLevelNum) {
        nextLevel = levelNum;
        break;
      }
    }

    console.log("Next level up from", currentLevelNum, "is:", nextLevel);
    return nextLevel;
  }

  // Find previous available level (down)
  function getPreviousLevelDown(currentLevelNum) {
    const allLevels = document.querySelectorAll(".etage--el");
    let prevLevel = null;

    for (let i = allLevels.length - 1; i >= 0; i--) {
      const levelNum = i + 1;
      if (levelNum < currentLevelNum) {
        prevLevel = levelNum;
        break;
      }
    }

    console.log("Previous level down from", currentLevelNum, "is:", prevLevel);
    return prevLevel;
  }

  // Navigate to specific level - no popup movement
  function navigateToLevel(levelNumber) {
    if (levelNumber && levelNumber !== currentLevel) {
      console.log("Navigating to level:", levelNumber);

      // Update level and content without moving popup
      currentLevel = levelNumber;
      updateLevelName(levelNumber);
      updateArrowStates(levelNumber);

      // Update popup content without animation
      const popup = document.querySelector(".popup");
      const popupPlan = popup.querySelector(".popup--plan");
      const popupPlan3d = popup.querySelector(".popup--plan-3d");
      const levelEl = document.querySelector(
        `.etage--el:nth-child(${levelNumber})`
      );

      if (levelEl) {
        const levelImage = levelEl.querySelector(".etage--img");
        const appartItems = levelEl.querySelectorAll(".appart-item");

        // Replace .popup--plan content with .etage--img and all appart-plan RichTexts
        popupPlan.innerHTML = "";
        if (levelImage) {
          const clonedImage = levelImage.cloneNode(true);
          popupPlan.appendChild(clonedImage);
        }

        appartItems.forEach((item, index) => {
          const plan = item.querySelector(".appart-plan");
          if (plan) {
            const clonedPlan = plan.cloneNode(true);
            popupPlan.appendChild(clonedPlan);
          }
          const planAbsolute = item.querySelector(".appart-plan-absolute");
          if (planAbsolute) {
            const clonedPlanAbsolute = planAbsolute.cloneNode(true);
            popupPlan.appendChild(clonedPlanAbsolute);
          }
        });

        // Update .popup--plan with .etage--img src
        if (levelImage) {
          const popupPlanImg = popupPlan.querySelector("img");
          if (popupPlanImg) {
            const levelImgSrc = levelImage.getAttribute("src");
            const levelImgSrcset = levelImage.getAttribute("srcset");
            popupPlanImg.setAttribute("src", levelImgSrc);
            if (levelImgSrcset) {
              popupPlanImg.setAttribute("srcset", levelImgSrcset);
            }
            // Set .etage--img opacity to 0.4 permanently
            gsap.set(popupPlanImg, { opacity: 0.4 });
          }
        }

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

        // If found, fill the apartment data
        let activeApartmentIndex = null;
        if (minAppart) {
          fillApartmentData(minAppart, levelImage);
          // Find the index of the active apartment
          activeApartmentIndex = Array.from(appartItems).indexOf(minAppart);
        }

        // Add click and hover handlers to plan paths
        const planPaths = popupPlan.querySelectorAll(".appart-plan path");
        const planAbsoluteElements = popupPlan.querySelectorAll(
          ".appart-plan-absolute"
        );

        // Set initial opacity: active apartment at 1, others at 0
        planAbsoluteElements.forEach((el, index) => {
          if (index === activeApartmentIndex) {
            gsap.set(el, { opacity: 1 });
          } else {
            gsap.set(el, { opacity: 0 });
          }
        });

        planPaths.forEach((path, index) => {
          const correspondingPlanAbsolute = planAbsoluteElements[index];

          // Set initial path opacity to 0
          gsap.set(path, { opacity: 0 });

          // Click handler to change apartment info
          path.addEventListener("click", () => {
            const clickedIndex = Array.from(planPaths).indexOf(path);
            const clickedAppart = appartItems[clickedIndex];
            if (clickedAppart) {
              fillApartmentData(clickedAppart, levelImage);
              // Update active apartment
              const previousActiveIndex = activeApartmentIndex;
              activeApartmentIndex = clickedIndex;

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

          // Hover handler to show .appart-plan-absolute with opacity animation
          path.addEventListener("mouseenter", () => {
            // Use timeline to animate all elements simultaneously
            const tl = gsap.timeline();

            // If hovering a different apartment, fade out the active one
            if (
              index !== activeApartmentIndex &&
              activeApartmentIndex !== null
            ) {
              const activeAbsolute = planAbsoluteElements[activeApartmentIndex];
              if (activeAbsolute) {
                tl.to(
                  activeAbsolute,
                  {
                    opacity: 0,
                    duration: 0.3,
                    ease: "power2.out",
                  },
                  0
                );
              }
            }

            // Show hovered apartment's .appart-plan-absolute
            if (correspondingPlanAbsolute && index !== activeApartmentIndex) {
              tl.to(
                correspondingPlanAbsolute,
                {
                  opacity: 1,
                  duration: 0.3,
                  ease: "power2.out",
                },
                0
              ); // Start at same time (position 0)
            }
          });

          path.addEventListener("mouseleave", () => {
            // Use timeline to animate all elements simultaneously
            const tl = gsap.timeline();

            // Hide hovered apartment's .appart-plan-absolute (if it's not the active one)
            if (correspondingPlanAbsolute && index !== activeApartmentIndex) {
              tl.to(
                correspondingPlanAbsolute,
                {
                  opacity: 0,
                  duration: 0.3,
                  ease: "power2.out",
                },
                0
              );
            }

            // Show active apartment's .appart-plan-absolute again
            if (activeApartmentIndex !== null) {
              const activeAbsolute = planAbsoluteElements[activeApartmentIndex];
              if (activeAbsolute) {
                tl.to(
                  activeAbsolute,
                  {
                    opacity: 1,
                    duration: 0.3,
                    ease: "power2.out",
                  },
                  0
                );
              }
            }
          });
        });
      }
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
