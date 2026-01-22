# FLOOR NUMBER FIX: Extract from data-app-id

## The Problem

1. **Étage filter showing 1-10** instead of 6-26
2. **Apartment codes wrong**: "D.D1.25.2" instead of "D.d2.25.2"  
3. **Floor numbers incorrect**: Apartment on floor 25 was showing as floor "1"

## Root Cause

The `.appart-etage` element on individual apartment pages contains the **position within that floor** (1, 2, 3, 4, 5), NOT the actual floor number!

For example:
- Apartment "D.D1.25.2" is on **floor 25**
- But `.appart-etage` shows "**1**" (because it's the 1st or 2nd apartment on that floor)
- The actual floor number is in `data-app-id="4.25"` → **25**

## The Solution

Extract the floor number from the `data-app-id` attribute instead of `.appart-etage`:

### Updated `fetchApartmentData()` (~line 156):

```javascript
// Before:
etage: doc.querySelector(".appart-etage")?.textContent?.trim() || "",

// After:
// Get floor number from data-app-id (e.g., "4.25" -> floor 25)
const planElement = doc.querySelector(".appart-plan[data-app-id]");
const dataAppId = planElement?.getAttribute("data-app-id") || "";
const etageFromData = dataAppId.split('.')[1]; // "4.25" -> "25"

const apartmentData = {
  number,
  etage: etageFromData || doc.querySelector(".appart-etage")?.textContent?.trim() || "",
  // ... rest of data
}
```

## How data-app-id Works

From your HTML example:
```html
<div data-app-id="4.25" class="appart-plan w-richtext">
  <path d="..." fill="#4191A7"></path>
</div>
```

Format: `data-app-id="{position}.{floor}"`
- **Position**: 1, 2, 3, 4, 5 (apartment position on that floor)
- **Floor**: 6, 7, 8... 25, 26 (actual floor number)

Examples:
- `data-app-id="1.6"` → 1st apartment on floor 6
- `data-app-id="4.25"` → 4th apartment on floor 25
- `data-app-id="5.26"` → 5th apartment on floor 26

## Expected Result

### Apartment data will now have correct floor numbers:
```javascript
{
  number: "D.d2.25.2",
  etage: "25",  // ✅ Correct! (was "1" before)
  pieces: 4,
  loyer: "CHF 2.690,00",
  disponibilite: "Disponible"
}
```

### Étage filter will show correct range:
```
Unique etages: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 18, 19, 20, 21, 22, 23, 24, 25, 26]
```
✅ Shows 6-26 instead of 1-10!

### Filter list will have correct codes:
```html
<div class="filter--search-name">D.d2.25.2</div>
```
✅ Shows "D.d2.25.2" with correct floor, not "D.D1.25.2"

### When clicking filter item:
1. Opens popup for floor **25** ✅
2. Looks for apartment "D.d2.25.2" in floor data
3. Matches and selects the correct apartment ✅

## Deploy & Test

1. **Upload** updated `script.js`
2. **Clear cache** (Cmd+Shift+R)
3. **Check console** for: `"Unique etages: [6, 7, 8, ... 25, 26]"`
4. **Check étage filter**: Should cycle through 6-26
5. **Click apartment in filter**: Should open correct floor AND select correct apartment!

The floor numbers should now be correct throughout the entire filter system! 🎯
