# FILTER ICON CLOSE: Added Click Handler

## What Was Added

Clicking on `.filter--icon` now closes the filter panel, same as clicking the trigger.

## Changes Made

**File: `/Users/tarikjamil/Dropbox/Work/Github/atura/script.js`**

### Updated `setupFilterToggle()` function (~line 1971):

**Before:**
- Only `.filter--trigger` could toggle the filter
- Toggle logic was inline in the event listener

**After:**
- Extracted toggle logic into a reusable `toggleFilter` function
- Added `.filter--icon` as a second trigger
- Both elements now toggle the filter panel

### Code Changes:

```javascript
// Find the filter icon
const filterIcon = document.querySelector(".filter--icon");

// Extract toggle logic into a function
const toggleFilter = (e) => {
  e.preventDefault();

  if (isOpen) {
    // Close filter
    gsap.to(filtersParent, {
      width: "0%",
      duration: 0.5,
      ease: "power2.inOut",
    });
  } else {
    // Open filter
    gsap.to(filtersParent, {
      width: "100%",
      duration: 0.5,
      ease: "power2.inOut",
    });
  }

  isOpen = !isOpen;
};

// Add click listener to filter trigger
filterTrigger.addEventListener("click", toggleFilter);

// Add click listener to filter icon (close button)
if (filterIcon) {
  filterIcon.addEventListener("click", toggleFilter);
}
```

## How It Works

1. **User clicks `.filter--trigger`** (FILTRES button) → Filter opens
2. **User clicks `.filter--icon`** (close icon) → Filter closes
3. **User clicks either one again** → Filter toggles

Both triggers use the same animation and state management!

## Expected Result

- ✅ Clicking "FILTRES" button opens/closes filter
- ✅ Clicking `.filter--icon` opens/closes filter  
- ✅ Smooth GSAP animation (0.5s duration)
- ✅ Synchronized state - only one element needed to toggle

## Deploy & Test

1. **Upload** updated `script.js`
2. **Clear cache** (Cmd+Shift+R)
3. **Click the filter icon** → Should close the filter panel! 🎯
