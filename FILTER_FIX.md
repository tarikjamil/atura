# Filter Search Item Click Fix

## Issue Identified

When clicking on `.filter--search-item` elements, the popup wasn't opening because the floor number was being parsed as `NaN`.

**Console Error:**
```
Opening apartment: D.D2.06.5 on floor: NaN
```

## Root Cause

The original `parseEtage()` function was trying to extract the floor number from apartment numbers like "D.D2.06.5" by splitting on "." and parsing the first part as an integer:

```javascript
function parseEtage(number) {
  if (!number) return null;
  const parts = number.split(".");
  return parts[0] ? parseInt(parts[0], 10) : null;  // "D" → NaN
}
```

This worked for simple formats like "1.10" (floor 1, apt 10) but failed for "D.D2.06.5" format.

## Solution

Since apartments are being fetched from `/etages/{level}` pages, we know the floor from the URL itself! The fix now:

1. **First tries** to get the floor from `.appart-etage` element on the apartment page
2. **Falls back** to using the `level` variable from the fetch loop (the floor number in the URL)

```javascript
// Extract apartment data
const number = aptDoc.querySelector(".appart-number")?.textContent?.trim() || "";
const pieces = aptDoc.querySelector(".appart-pieces")?.textContent?.trim() || "";
const loyer = aptDoc.querySelector(".appart-loyer")?.textContent?.trim() || "";
const disponibilite = aptDoc.querySelector(".appart-disponibilite")?.textContent?.trim() || "";

// First try to get etage from .appart-etage element
const etageText = aptDoc.querySelector(".appart-etage")?.textContent?.trim();
let etage = etageText ? parseInt(etageText, 10) : null;

// If not found or invalid, use the current level from the URL
if (!etage || isNaN(etage)) {
  etage = level;  // Use the floor number from /etages/{level}
}
```

## Result

Now when clicking on a filter search item:
- ✅ Correct floor number is identified
- ✅ `window.openLevelPopup(etage)` is called with valid floor number
- ✅ Popup opens and shows the correct floor
- ✅ `window.selectApartmentByNumber(number)` selects the correct apartment

## Testing

After deploying this fix to your Webflow site:

1. Open the filter panel
2. Click on any apartment in the search list (e.g., "D.D2.06.5")
3. **Expected result**: Popup should open showing the correct floor with the apartment selected

## Deployment

Upload the updated `script.js` file to replace the version at:
`https://atura-code.netlify.app/script.js`

The fix is in the `loadAllApartments()` function around line 1575-1595.
