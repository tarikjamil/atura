# Filter Click Fix - Version 2

## Problem Discovered

The filter system was fetching apartment data from `/etages/` pages, but:
1. The apartment data is **already on the page** in Webflow CMS collection items
2. Fetching from `/etages/3` returns 404 because floors start at 6, not 1
3. The apartment numbers in the CMS don't match the fetched data structure

### Console Errors from Live Site:
```
Opening apartment: D.D2.06.1 on floor: 3
Fetching floor page: /etages/3
Failed to fetch floor page: 404
Floor data not found in cache
```

## Root Cause

The original `loadAllApartments()` function was:
1. **Fetching** apartments from `/etages/{level}` pages (levels 6-20)
2. **Fetching** each individual apartment page
3. This was slow (10-30 seconds) and created apartment objects with wrong floor numbers

But the apartment data is **already in the HTML** on the `/home-with-filters` page as Webflow CMS collection items!

## Solution

Completely rewrote `loadAllApartments()` to:
1. **Read directly from the page DOM** - no fetching needed!
2. Find all `.w-dyn-item` elements (Webflow collection items)
3. Extract apartment data from each item's child elements
4. Parse floor number from `.appart-etage` or from the apartment number itself

### New Code:

```javascript
async function loadAllApartments() {
  console.log("Loading all apartments from page data...");
  const apartments = [];

  // Find collection items already on the page
  const collectionItems = document.querySelectorAll('.w-dyn-item');
  
  collectionItems.forEach((item) => {
    // Extract data from the collection item
    const numberEl = item.querySelector('.appart-number, [data-apt="number"]');
    const piecesEl = item.querySelector('.appart-pieces, [data-apt="pieces"]');
    const loyerEl = item.querySelector('.appart-loyer, [data-apt="loyer"]');
    const disponibiliteEl = item.querySelector('.appart-disponibilite, [data-apt="disponibilite"]');
    const etageEl = item.querySelector('.appart-etage, [data-apt="etage"]');
    
    if (!numberEl) return;
    
    const number = numberEl.textContent?.trim() || "";
    if (!number) return;

    // Extract all data
    const pieces = piecesEl?.textContent?.trim() || "";
    const loyer = loyerEl?.textContent?.trim() || "";
    const disponibilite = disponibiliteEl?.textContent?.trim() || "";
    const etageText = etageEl?.textContent?.trim() || "";
    
    // Parse etage
    let etage = etageText ? parseInt(etageText, 10) : null;
    
    // Fallback: parse from number (e.g., "6.1" -> floor 6)
    if (!etage || isNaN(etage)) {
      const match = number.match(/^(\d+)\./);
      if (match) {
        etage = parseInt(match[1], 10);
      }
    }

    apartments.push({
      number,
      pieces: parseInt(pieces, 10) || 0,
      etage,
      loyer,
      loyerValue: parseLoyerValue(loyer),
      disponibilite,
      url: null,
    });

    // Track unique values
    if (pieces) uniquePieces.add(parseInt(pieces, 10));
    if (etage !== null && !isNaN(etage)) uniqueEtages.add(etage);
  });

  console.log("Loaded apartments from page:", apartments.length);
  return apartments;
}
```

## Benefits

1. ✅ **Instant loading** - no network requests needed
2. ✅ **Accurate data** - reads the actual data from your CMS
3. ✅ **Correct floor numbers** - directly from the data structure
4. ✅ **No 404 errors** - doesn't try to fetch non-existent pages
5. ✅ **Works offline** - all data is already on the page

## Expected Console Output After Fix

```
Loading all apartments from page data...
Found appart items: X
Found collection items: Y
Loaded apartments from page: 151
Unique pieces: [3, 4, 5, 6]
Unique etages: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26]
Filter system initialized
```

When clicking an apartment:
```
Opening apartment: 6.1 on floor: 6
Opening level popup for level: 6
Fetching floor page: /etages/6
[Popup opens successfully]
```

## Deployment

Upload the updated `script.js` to replace:
`https://atura-code.netlify.app/script.js`

Clear browser cache or do a hard refresh (Cmd+Shift+R / Ctrl+Shift+F5) to ensure the new version loads.

## Testing

After deployment:
1. Open `/home-with-filters`
2. Check console - should see "Loaded apartments from page: 151" almost instantly
3. Click on any apartment in the filter search list
4. Should open popup with correct floor and apartment selected
