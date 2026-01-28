# Filter Dropdown Update

## Summary
Replaced the arrow-based filter navigation with select dropdowns for "NB. DE PIÈCES" and "ÉTAGE" filters, and changed the default filter panel state to open on load.

## Changes Made

### 1. HTML Structure (filter-dropdowns.html)
Created new HTML for the filter dropdowns:

```html
<!-- For NB. DE PIÈCES -->
<div class="filter-dropdown-wrapper">
  <select class="filter-select filter-pieces-select">
    <option value="">TOUS</option>
    <!-- Options populated by JavaScript -->
  </select>
</div>

<!-- For ÉTAGE -->
<div class="filter-dropdown-wrapper">
  <select class="filter-select filter-etage-select">
    <option value="">TOUS</option>
    <!-- Options populated by JavaScript -->
  </select>
</div>
```

### 2. CSS (style.css)
Added styling for the select dropdowns:

```css
.filter-dropdown-wrapper {
  width: 100%;
}

.filter-select {
  width: 100%;
  padding: 8px 12px;
  font-family: inherit;
  font-size: inherit;
  color: inherit;
  background-color: transparent;
  border: 1px solid currentColor;
  border-radius: 4px;
  cursor: pointer;
  outline: none;
}

.filter-select:focus {
  border-color: currentColor;
  opacity: 0.8;
}
```

### 3. JavaScript Updates (script.js)

#### setupPiecesFilter()
- Now replaces `.filter--arrows` content with a select dropdown
- Dynamically populates options from `uniquePieces`
- Updates filter state on select change
- No more prev/next buttons

#### setupEtageFilter()
- Same approach as pieces filter
- Dynamically populates options from `uniqueEtages`
- Updates filter state on select change

#### setupResetButton()
- Updated to reset select dropdowns instead of `.number--title` elements
- Resets both `.filter-pieces-select` and `.filter-etage-select` to empty value

#### setupFilterToggle()
- **Changed initial state**: Filter panel now starts at `width: 100%` (open)
- **Changed icon states**: `.filter--icon-open` starts at opacity 0, `.filter--icon-close` starts at opacity 1
- **Changed isOpen variable**: Now starts as `true`
- First click now closes the panel, second click opens it

## User Experience Changes

### Before:
- Arrow buttons to cycle through values
- Filter panel closed by default
- Icons showed "open" state initially

### After:
- Dropdown select menus with all options visible at once
- Filter panel open by default
- Icons show "close" state initially
- First click closes panel, subsequent clicks toggle

## Benefits
1. **Easier navigation**: Users can see all available options at once
2. **Faster filtering**: Direct selection instead of cycling through values
3. **Better UX**: Filter panel visible immediately on page load
4. **Consistent behavior**: All filter triggers work the same way
5. **Accessible**: Standard select elements are more accessible than custom arrow navigation
