# SCOPE FIX: Made fetchFloorData Globally Accessible

## The Problem

`ReferenceError: fetchFloorData is not defined`

The filter system code is in a separate IIFE (Immediately Invoked Function Expression), so it couldn't access `fetchFloorData` which was defined in a different IIFE scope.

## The Fix

Made `fetchFloorData` globally accessible by attaching it to `window`:

```javascript
// Before (line ~189):
async function fetchFloorData(levelNumber) {
  // ...
}

// After:
window.fetchFloorData = async function fetchFloorData(levelNumber) {
  // ...
}
```

And updated the call in `loadAllApartments` (line ~1597):

```javascript
// Before:
const floorData = await fetchFloorData(level);

// After:
const floorData = await window.fetchFloorData(level);
```

## Why This Works

- `window.fetchFloorData` is accessible from any scope
- The filter IIFE can now call `window.fetchFloorData(level)`
- Same function, same caching, just globally accessible

## Expected Result

Now the console should show:

```
Initializing filter system...
Loading all apartments using fetchFloorData...
Detected floors on page: [6, 7, 8, 9, 10, 11, ...]
Loading floor 6 apartments...
Fetching floor page: /etages/6
Floor 6: Found 5 apartments
Loading floor 7 apartments...
Using cached floor data for level: 7
Floor 7: Found 5 apartments
...
Loaded apartments: 126
```

No more `ReferenceError`! ✅

## Deploy & Test

1. **Upload** updated `script.js`
2. **Clear cache** (Cmd+Shift+R)
3. Should now load apartments successfully!
