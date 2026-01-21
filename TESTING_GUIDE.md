# Filter System - Quick Testing Guide

## Prerequisites
Ensure your HTML includes the filter structure with these key elements:
- `.filters--parent` - The main filter container
- A trigger element (either `.filter--trigger` or a `.div-block-19` containing "FILTRES")
- `.filter--search` - Container for apartment search results
- Four `.div-block-19.is--filter` elements for the four filters
- `.filter--reset` - Reset button

## Testing Steps

### 1. Test Filter Panel Toggle
1. Look for the "FILTRES" button in your interface
2. Click it - the filter panel should slide open (0% → 100% width)
3. Click again - panel should slide closed
4. **Expected**: Smooth GSAP animation over 0.5 seconds

### 2. Test Number of Pieces Filter
1. Open the filter panel
2. Find the first filter section "NB. DE PIÈCES"
3. Click the next arrow (→) button
4. **Expected**: Number changes from "TOUS" to available piece counts
5. Click previous arrow (←) to cycle backwards
6. **Expected**: Search list updates immediately with each change

### 3. Test Floor (Étage) Filter
1. Find the second filter section "ÉTAGE"
2. Use arrow buttons to cycle through floor numbers
3. **Expected**: Shows "TOUS" by default, then floor numbers (6-20)
4. Search list should update to show only apartments on selected floor

### 4. Test Rent (Loyer) Range Filter
1. Find the "LOYER" filter section with two input fields
2. Enter a minimum value (e.g., 1500)
3. **Expected**: Search list shows only apartments with rent ≥ 1500
4. Enter a maximum value (e.g., 2500)
5. **Expected**: Search list shows apartments with rent between 1500-2500
6. Clear inputs to reset

### 5. Test Availability Checkbox
1. Find "UNIQUEMENT BIENS DISPONIBLES" section
2. Check the checkbox
3. **Expected**: Search list shows only apartments marked as "Disponible"
4. Uncheck to show all apartments again

### 6. Test Combined Filters
1. Set pieces filter to "4"
2. Set floor filter to "1"
3. Enter rent range: 1500 - 2000
4. Check availability checkbox
5. **Expected**: Search list shows only 4-piece apartments on floor 1, priced between 1500-2000, and available

### 7. Test Search List
1. Apply some filters
2. Check that `.filter--search` is populated with `.filter--search-item` elements
3. Each item should have `.filter--search-name` showing apartment number
4. **Expected**: List is sorted by apartment number

### 8. Test Apartment Selection
1. Apply filters to narrow down results
2. Click on an apartment in the search list
3. **Expected**:
   - Popup opens automatically
   - Correct floor is displayed on the left
   - Selected apartment details appear on the right
   - Apartment highlight/overlay is shown on the floor plan

### 9. Test Reset Functionality
1. Apply multiple filters
2. Click "REINITIALISER" (reset button)
3. **Expected**:
   - Pieces filter: "TOUS"
   - Floor filter: "TOUS"
   - Rent inputs: Cleared
   - Checkbox: Unchecked
   - Search list: Shows all apartments

### 10. Test Edge Cases
- Try filtering with no matching apartments (should show empty list)
- Try entering invalid rent values (should handle gracefully)
- Try clicking apartment items multiple times
- Try opening/closing filter panel rapidly

## Console Debugging

Open browser console (F12) to see helpful debug messages:
- "Initializing filter system..." - Filter system starting
- "Loading all apartments for filters..." - Data fetching begins
- "Loaded apartments: X" - Number of apartments loaded
- "Opening apartment: X on floor: Y" - When clicking search item
- "Selected apartment: X" - When apartment is selected in popup

## Common Issues

### Filter Panel Not Opening
- Check that `.filters--parent` exists in HTML
- Check that trigger element exists (contains "FILTRES" text)
- Verify GSAP is loaded

### Search List Not Updating
- Check browser console for errors
- Verify apartment data is loading (check "Loaded apartments" message)
- Check that `.filter--search` container exists

### Apartment Not Opening
- Verify `openLevelPopup` function is available
- Check that floor number is correctly extracted
- Ensure popup structure exists in HTML

### No Apartments Showing
- Check that server is running and apartment pages are accessible
- Verify `/etages/` endpoints are working
- Check apartment page structure matches expected selectors

## Performance Notes

### Initial Load Time
- First load fetches all apartment data (floors 6-20)
- Each floor page is fetched, then each apartment page
- Can take 10-30 seconds depending on number of apartments
- Loading happens asynchronously in background

### Filter Speed
- After initial load, filtering is instant (client-side)
- No server requests needed for filtering
- Data is cached for fast access

## Browser Requirements
- Modern browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Fetch API support
- ES6+ support (async/await, arrow functions, etc.)
