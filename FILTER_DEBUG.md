# Filter Selection Fix - Debugging Version

## Status Update

✅ **Working:**
- Filter panel opens/closes
- Apartments load from page data
- Clicking filter item opens popup with correct floor

❌ **Not Working:**
- Always selects first apartment instead of the clicked one

## Root Cause

The apartment numbers in your filter (from page HTML) might not **exactly match** the apartment numbers in the `floorDataCache` (fetched from `/etages/` pages).

For example:
- Filter might have: `"1"`, `"2"`, `"3"`
- Floor data cache might have: `"1 "` (with space), `"01"`, or formatted differently

## The Fix

I've added comprehensive debugging to trace the issue:

### 1. Enhanced `selectApartmentByNumber()` Function

Now includes:
- ✅ Logs the apartment number being searched
- ✅ Shows all available apartment numbers in floor data
- ✅ Tries multiple matching strategies:
  1. Exact match
  2. Trimmed match (removes spaces)
  3. Number-only match (removes all non-digits)

```javascript
// Example output you'll see:
selectApartmentByNumber called with: "1"
Current level number: 6
Apartments in floor data: 5
Looking for apartment: "1"
Available apartment numbers: ["1", "2", "3", "4", "5"]
Found apartment at index: 0
Total plan paths: 5
Clicking plan path at index: 0
```

### 2. Enhanced Click Handler

```javascript
// Now logs when you click:
=== FILTER ITEM CLICKED ===
Apartment number from filter: "1"
Apartment floor from filter: 6
Full apartment data: {number: "1", pieces: 4, etage: 6, ...}
Calling selectApartmentByNumber with: "1"
```

## Next Steps - What To Do

1. **Deploy** the updated `script.js` to: `https://atura-code.netlify.app/script.js`

2. **Clear cache** and reload the page

3. **Click on an apartment** in the filter list

4. **Check the console** and send me the output - it will show:
   - What apartment number you clicked
   - What apartment numbers are available in the floor data
   - Whether the match was found
   - Which index was clicked

5. With that information, I can:
   - See exactly why the matching is failing
   - Fix the matching logic if needed
   - Or identify if the data structure needs adjustment

## Example Console Output to Share

After you click an apartment, you should see something like:

```
=== FILTER ITEM CLICKED ===
Apartment number from filter: "1"
Apartment floor from filter: 6
...
selectApartmentByNumber called with: "1"
Current level number: 6
Apartments in floor data: 5
Looking for apartment: "1"
Available apartment numbers: ["1", "2", "3", "4", "5"]
Found apartment at index: 0  <-- This is the key line!
```

**Please share this console output** and I'll see exactly what's happening!

## Potential Issues to Check

1. **Apartment numbers don't match** - Filter has "1" but floor data has "D.1.06"
2. **Index is wrong** - Finding apartment but clicking wrong path index
3. **Timing issue** - Path click happens before popup is fully rendered

The extensive logging will reveal which issue it is! 🔍
