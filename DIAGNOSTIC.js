// DIAGNOSTIC SCRIPT - Run this in browser console on /home-with-filters
// This will show us exactly how apartments are structured on the page

console.log("=== APARTMENT DATA DIAGNOSTIC ===");

// 1. Find all collection items
const collectionItems = document.querySelectorAll('.w-dyn-item');
console.log("\n1. Collection Items:", collectionItems.length);

if (collectionItems.length > 0) {
  console.log("\nFirst collection item HTML:");
  console.log(collectionItems[0].outerHTML.substring(0, 500));
  
  console.log("\nFirst collection item class list:");
  console.log(Array.from(collectionItems[0].classList));
  
  console.log("\nSearching in first item for apartment data:");
  const firstItem = collectionItems[0];
  console.log("  .appart-number:", firstItem.querySelector('.appart-number')?.textContent);
  console.log("  .appart-pieces:", firstItem.querySelector('.appart-pieces')?.textContent);
  console.log("  .appart-loyer:", firstItem.querySelector('.appart-loyer')?.textContent);
  console.log("  .appart-etage:", firstItem.querySelector('.appart-etage')?.textContent);
  console.log("  .appart-disponibilite:", firstItem.querySelector('.appart-disponibilite')?.textContent);
  
  // Check all children
  console.log("\nAll text in first item:");
  console.log(firstItem.textContent.trim().substring(0, 200));
}

// 2. Look for floor/etage sections
console.log("\n2. Looking for floor sections...");
const etageEls = document.querySelectorAll('[class*="etage"]');
console.log("Elements with 'etage' in class:", etageEls.length);

if (etageEls.length > 0) {
  console.log("\nFirst 5 etage elements:");
  Array.from(etageEls).slice(0, 5).forEach((el, i) => {
    console.log(`  ${i}: class="${el.className}", text="${el.textContent.trim().substring(0, 50)}"`);
  });
}

// 3. Look for etage--el (floor containers)
const etageContainers = document.querySelectorAll('.etage--el');
console.log("\n3. Floor containers (.etage--el):", etageContainers.length);

if (etageContainers.length > 0) {
  const firstFloor = etageContainers[0];
  console.log("\nFirst floor container:");
  console.log("  Floor name (.etage--name):", firstFloor.querySelector('.etage--name')?.textContent);
  console.log("  Apartments in this floor:", firstFloor.querySelectorAll('.w-dyn-item, .appart-item').length);
}

// 4. Look for all elements with apartment-related classes
console.log("\n4. Apartment-related elements:");
console.log("  .appart-item:", document.querySelectorAll('.appart-item').length);
console.log("  .appart-number:", document.querySelectorAll('.appart-number').length);
console.log("  .appart-pieces:", document.querySelectorAll('.appart-pieces').length);
console.log("  .appart-loyer:", document.querySelectorAll('.appart-loyer').length);
console.log("  .appart-etage:", document.querySelectorAll('.appart-etage').length);

// 5. Sample some apartment numbers
console.log("\n5. First 10 apartment numbers found:");
const numbers = Array.from(document.querySelectorAll('.appart-number')).slice(0, 10);
numbers.forEach((el, i) => {
  console.log(`  ${i}: "${el.textContent.trim()}"`);
});

// 6. Check for any CMS collection lists
console.log("\n6. CMS Collection Lists:");
const lists = document.querySelectorAll('.w-dyn-list, [class*="collection"]');
console.log("  Found lists:", lists.length);

console.log("\n=== END DIAGNOSTIC ===");
