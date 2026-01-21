// Run this in the console on https://atura.webflow.io/home-with-filters
// to see what's actually inside the .w-dyn-item elements

console.log("=== HOME PAGE STRUCTURE DIAGNOSTIC ===");

const etageElements = document.querySelectorAll(".etage--el");
console.log("Found", etageElements.length, "floor sections");

if (etageElements.length > 0) {
  const firstFloor = etageElements[0];
  const floorName = firstFloor.querySelector(".etage--name")?.textContent;
  console.log("\n--- FIRST FLOOR:", floorName, "---");
  
  const items = firstFloor.querySelectorAll(".w-dyn-item");
  console.log("Found", items.length, "items in this floor");
  
  if (items.length > 0) {
    const firstItem = items[0];
    console.log("\n--- FIRST ITEM STRUCTURE ---");
    console.log("Full HTML:", firstItem.outerHTML.substring(0, 500));
    console.log("\n.appart-number:", firstItem.querySelector(".appart-number")?.textContent);
    console.log(".appart-pieces:", firstItem.querySelector(".appart-pieces")?.textContent);
    console.log(".appart-etage:", firstItem.querySelector(".appart-etage")?.textContent);
    console.log(".appart-loyer:", firstItem.querySelector(".appart-loyer")?.textContent);
    console.log("data-app-id:", firstItem.getAttribute("data-app-id"));
    
    console.log("\n--- ALL TEXT IN FIRST ITEM ---");
    console.log(firstItem.innerText);
    
    console.log("\n--- ALL CLASSES IN CHILDREN ---");
    firstItem.querySelectorAll("*").forEach((el, i) => {
      if (el.className && i < 20) { // First 20 elements
        console.log(`  ${i}. ${el.tagName}.${el.className}: "${el.textContent?.trim().substring(0, 30)}"`);
      }
    });
  }
}

console.log("\n=== CHECK FOR APARTMENT DATA ELSEWHERE ===");
console.log("All .appart-number on page:", document.querySelectorAll(".appart-number").length);
console.log("All [data-app-id] on page:", document.querySelectorAll("[data-app-id]").length);

// Check if apartment data is stored somewhere else
const firstAppNumber = document.querySelector(".appart-number");
if (firstAppNumber) {
  console.log("\n--- FIRST .appart-number ELEMENT FOUND ---");
  console.log("Text:", firstAppNumber.textContent);
  console.log("Parent:", firstAppNumber.parentElement?.className);
  console.log("Closest .w-dyn-item:", firstAppNumber.closest(".w-dyn-item") ? "YES" : "NO");
}
