# SVG CLICK FIX: Use dispatchEvent Instead of .click()

## The Problem

**Error:** `planPaths[aptIndex].click is not a function`

The apartment was found correctly (index 4), but clicking failed because:
- SVG `<path>` elements don't have a native `.click()` method
- Need to use `dispatchEvent()` to trigger click events on SVG elements

## Console Evidence

```
✓ Found by exact match at index: 4
Found apartment at index: 4
Total plan paths: 10
Clicking plan path at index: 4
❌ Uncaught TypeError: planPaths[aptIndex].click is not a function
```

## The Solution

Changed from `.click()` to `.dispatchEvent()` for SVG elements:

### Updated Code (~line 482):

```javascript
// Before:
planPaths[aptIndex].click();

// After:
const clickEvent = new MouseEvent('click', {
  view: window,
  bubbles: true,
  cancelable: true
});
planPaths[aptIndex].dispatchEvent(clickEvent);
```

## Why This Works

- **`.click()`** only works on HTML elements (buttons, links, etc.)
- **`dispatchEvent()`** works on ALL DOM elements, including SVG
- Creates a proper `MouseEvent` that bubbles up through the DOM
- Triggers any click event listeners attached to the SVG path

## Expected Result

Now when clicking a filter item:

1. ✅ Opens popup for floor 6
2. ✅ Finds apartment "D.D1.06.3" at index 4
3. ✅ **Dispatches click event** on the 5th path (index 4)
4. ✅ Apartment gets selected and details are shown

Console will show:
```
✓ Found by exact match at index: 4
Found apartment at index: 4
Total plan paths: 10
Clicking plan path at index: 4
Selected apartment: D.D1.06.3
```

## Deploy & Test

1. **Upload** updated `script.js`
2. **Clear cache** (Cmd+Shift+R)
3. **Click any filter item**
4. Should now **select the correct apartment**! 🎯

The error is gone and the apartment should be properly selected!
