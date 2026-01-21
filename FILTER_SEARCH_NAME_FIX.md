# Filter Search Name Fix - Using Correct Selector

## The Problem

The `.filter--search-name` was showing "1, 2, 3, 4, 5, 6..." instead of "D.D2.10.4" style apartment codes.

## Root Cause

The `loadAllApartments()` function was looking for `.appart-number` **first**, but on the home page, there might be multiple elements with this class or the **data attribute** `[data-app="number"]` contains the correct apartment code.

Looking at the apartment page HTML you provided:
```html
<div data-app-id="1.10" class="appart-etage">1</div>
<div data-app-id="1.10" class="appart-number">D.D2.10.4</div>
```

The correct apartment number "D.D2.10.4" is in `class="appart-number"`, but we were getting "1" instead.

## The Fix

Updated the selector priority in `loadAllApartments()` to:

1. **FIRST**: Try `[data-app="number"]` - the data attribute
2. **SECOND**: Try `.appart-number` - the class
3. **THIRD**: Try `[data-apt="number"]` - alternative data attribute

```javascript
const numberEl = 
  item.querySelector('[data-app="number"]') ||
  item.querySelector('.appart-number') || 
  item.querySelector('[data-apt="number"]');
```

This matches the same logic already used elsewhere in the code (line 1224):
```javascript
norm(qs("[data-app='number']", it)?.textContent);
```

## Added Debugging

Enhanced debugging to show:
- Which selector actually found the apartment number
- First apartment number from each floor
- Any items where no number was found

New console output will show:
```
Floor 6, first apartment number: D.D2.10.4 from element: appart-number
```

or

```
Floor 6, first apartment number: D.D2.10.4 from: number
```

(depending on whether it came from class or data-app attribute)

## What Changed

**File: `/Users/tarikjamil/Dropbox/Work/Github/atura/script.js`**

Lines updated:
- **~1598-1618**: Floor sections loop - updated selector priority and added debugging
- **~1653-1678**: Fallback loop - updated selector priority and added debugging

## Testing

1. **Upload** updated `script.js`
2. **Clear cache** (Cmd+Shift+R)
3. **Check console** for new log messages:
   - `"Floor X, first apartment number:"` - Should show "D.D2.10.4" style codes
   - `"First 10 apartment numbers:"` - Should show proper apartment codes
4. **Check filter list** - `.filter--search-name` should now display correct apartment codes

## Expected Result

✅ Filter search list should show: "D.D2.10.1", "D.D2.10.2", "D.D2.10.3", etc.  
❌ NOT: "1", "2", "3", "4", "5", "6"...

The apartment codes should match what you see when you open the popup and what's shown on individual apartment pages.
