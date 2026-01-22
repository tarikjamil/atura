# MAJOR FIX: Fetch All Apartments from /etages/ Pages

## The Problems

1. **Not all apartments were fetched** - Only apartments visible on the home page were being loaded
2. **Apartment selection not working** - When clicking a filter item, the correct floor opened but wrong apartment was selected

## Root Cause

The filter system was trying to read apartment data **from the home page HTML**, but:
- The home page only shows a subset of apartments (not all)
- The home page has simplified data structures
- The full apartment codes ("D.D2.10.4") exist on individual apartment pages

Meanwhile, the popup system **fetches from `/etages/` pages** and then **fetches each individual apartment page** to get complete data including the full apartment codes.

## The Solution

**Completely rewrote `loadAllApartments()` to match the popup's approach:**

1. Detect all floor numbers from the page (6, 7, 8, 9, 10, 11... 26)
2. For each floor, fetch `/etages/{level}` page
3. Extract all `.appart-link` elements from each floor page  
4. Fetch each individual apartment page
5. Extract full apartment data including the real apartment code ("D.D2.10.4")

This is **exactly the same logic** used by `fetchFloorData()` which powers the popup!

## What Changed

**File: `/Users/tarikjamil/Dropbox/Work/Github/atura/script.js`**

### Complete rewrite of `loadAllApartments()` function (~line 1576):

```javascript
async function loadAllApartments() {
  console.log("Loading all apartments by fetching from /etages/ pages...");
  const apartments = [];
  
  // Get unique floor numbers from the page
  const floorElements = document.querySelectorAll('.etage--name');
  const floors = Array.from(floorElements)
    .map(el => parseInt(el.textContent.trim(), 10))
    .filter(num => !isNaN(num))
    .filter((num, idx, arr) => arr.indexOf(num) === idx); // unique
  
  console.log("Detected floors on page:", floors);
  
  // For each floor, fetch the floor page and get apartment links
  for (const level of floors) {
    const floorPageUrl = level == 10 ? `/etages/10-bi08i` : `/etages/${level}`;
    console.log(`Fetching floor page for level ${level}: ${floorPageUrl}`);
    
    // ... fetch floor page ...
    // ... get .appart-link elements ...
    // ... fetch each individual apartment page ...
    // ... extract full apartment data ...
    
    apartments.push({
      number,  // NOW has the real "D.D2.10.4" from the apartment page!
      pieces: parseInt(pieces, 10) || 0,
      etage,
      loyer,
      loyerValue: parseLoyerValue(loyer),
      disponibilite,
      url,
    });
  }
  
  return apartments;
}
```

**Key changes:**
- ✅ Fetches from `/etages/` pages (same as popup)
- ✅ Fetches individual apartment pages (same as popup)
- ✅ Gets REAL apartment codes ("D.D2.10.4")
- ✅ Gets ALL apartments (not just those on home page)
- ✅ Data structure matches what's in `floorDataCache`

## Expected Result

### On page load:
```
Loading all apartments by fetching from /etages/ pages...
Detected floors on page: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, ...]
Fetching floor page for level 6: /etages/6
Floor 6: Found 5 apartment links
Fetching floor page for level 7: /etages/7
Floor 7: Found 5 apartment links
...
Loaded apartments from /etages/ pages: 126
First 10 apartment numbers: ["D.D2.6.1", "D.D2.6.2", "D.D2.6.3", ...]
```

### Filter list will show:
```
D.D2.6.1
D.D2.6.2
D.D2.6.3
...
D.D2.10.4
...
D.D2.26.5
```

### When clicking a filter item:
1. Opens popup for the correct floor (e.g., floor 10)
2. Popup fetches floor data → apartment codes like "D.D2.10.4"
3. Calls `selectApartmentByNumber("D.D2.10.4")`  
4. Finds exact match in `floorDataCache` → "D.D2.10.4"
5. Selects the CORRECT apartment! ✅

## Why This Works

**Before:**
- Filter: "D.D2.10.4" (constructed from home page data)
- Popup: "D.D2.10.4" (fetched from apartment page)
- ❌ But filter only had subset of apartments

**After:**
- Filter: "D.D2.10.4" (fetched from apartment page)
- Popup: "D.D2.10.4" (fetched from apartment page)
- ✅ Same source, same format, EXACT match!
- ✅ ALL apartments loaded!

## Deploy & Test

1. **Upload** updated `script.js`
2. **Clear cache** (Cmd+Shift+R)
3. **Wait for load** - Will take longer (~2-3 seconds) because it's fetching all apartment pages
4. **Check console**: "Loaded apartments from /etages/ pages: 126" (or similar count)
5. **Check filter list**: Should show ALL apartments
6. **Click any filter item**: Should open correct floor AND select correct apartment! 🎯
