# FINAL FIX: Apartment Number Construction

## The Real Problem ✅

The home page shows **simplified apartment numbers**:
- Floor 6: "1", "2", "3", "4", "5"
- Floor 7: "1", "2", "3", "4", "5"
- Floor 10: "1", "2", "3", "4", "5"

But the **actual apartment codes** are:
- Floor 6: "D.D2.6.1", "D.D2.6.2", "D.D2.6.3", etc.
- Floor 7: "D.D2.7.1", "D.D2.7.2", "D.D2.7.3", etc.
- Floor 10: "D.D2.10.1", "D.D2.10.2", "D.D2.10.3", etc.

## The Solution

We now **construct the full apartment code** by combining:
```javascript
fullNumber = `D.D2.${floor}.${simpleNumber}`
```

Example:
- Simple number: **"4"** on floor **10**
- Full code: **"D.D2.10.4"** ✅

## What Changed

**File: `/Users/tarikjamil/Dropbox/Work/Github/atura/script.js`**

### In the floor sections loop (~line 1610):
```javascript
const simpleNumber = numberEl.textContent?.trim() || "";
// Construct full apartment code: D.D2.{floor}.{number}
const fullNumber = `D.D2.${currentFloor}.${simpleNumber}`;

apartments.push({
  number: fullNumber,  // Now uses "D.D2.10.4" instead of "4"
  pieces: parseInt(pieces, 10) || 0,
  etage: currentFloor,
  // ...
});
```

### In the fallback loop (~line 1673):
```javascript
const simpleNumber = numberEl.textContent?.trim() || "";
// ... determine etage ...
const fullNumber = etage ? `D.D2.${etage}.${simpleNumber}` : simpleNumber;

apartments.push({
  number: fullNumber,  // Constructed full code
  // ...
});
```

## Expected Result

### Console logs will show:
```
Floor 6, first apartment: simple="1" -> full="D.D2.6.1"
Floor 7, first apartment: simple="1" -> full="D.D2.7.1"
Floor 10, first apartment: simple="1" -> full="D.D2.10.1"
```

### Filter search list will display:
```
D.D2.6.1
D.D2.6.2
D.D2.6.3
D.D2.6.4
D.D2.6.5
D.D2.7.1
D.D2.7.2
...
D.D2.10.1
D.D2.10.2
D.D2.10.3
D.D2.10.4  ← This matches the apartment page!
```

### When clicking a filter item:
1. Opens popup with correct floor (e.g., floor 10)
2. `selectApartmentByNumber("D.D2.10.4")` is called
3. Matches against the fetched apartment data from the popup
4. Selects the correct apartment ✅

## Why This Works

The popup **fetches** individual apartment pages which have the **full apartment codes** ("D.D2.10.4").

Now our filter list **generates** the same format, so when we call `selectApartmentByNumber("D.D2.10.4")`, it matches exactly with the apartment data in the popup cache! 🎯

## Deploy & Test

1. **Upload** updated `script.js`
2. **Clear cache** (Cmd+Shift+R)
3. **Check console**: Look for `"Floor 6, first apartment: simple="1" -> full="D.D2.6.1""`
4. **Check filter list**: Should show "D.D2.X.Y" codes
5. **Click a filter item**: Should open popup AND select correct apartment! ✨
