# Filter System Implementation

## Overview
A comprehensive filter system has been implemented for the apartment listing application. The system allows users to filter apartments by multiple criteria and view them in the popup interface.

## Files Created/Modified

### 1. **script-backup.js** (NEW)
- Backup of the original `script.js` file for safety

### 2. **filter.html** (NEW)
- Contains HTML templates for the filter inputs:
  - Loyer (rent) range inputs with MIN/MAX fields
  - Disponibilité (availability) checkbox

### 3. **script.js** (MODIFIED)
- Added comprehensive filter system at the end of the file
- Exposed necessary functions globally for cross-module communication

## Features Implemented

### 1. Filter Panel Toggle
- **Trigger Element**: Clicking on the element with class `.filter--trigger` or the first `.div-block-19` containing "FILTRES" text
- **Animation**: The `.filters--parent` element animates from `width: 0%` to `width: 100%` and back
- **Duration**: 0.5 seconds with smooth easing

### 2. Filter by Number of Pieces (Nb. de Pièces)
- **Location**: First `.div-block-19.is--filter` element
- **Controls**: Arrow buttons to cycle through available piece counts
- **Display**: Shows "TOUS" (all) by default, then cycles through available values
- **Data Source**: `.appart-pieces` from apartment data

### 3. Filter by Floor (Étage)
- **Location**: Second `.div-block-19.is--filter` element
- **Controls**: Arrow buttons to cycle through available floors
- **Display**: Shows "TOUS" (all) by default, then cycles through floor numbers
- **Data Source**: Extracted from `.appart-number` (e.g., "1.10" → floor 1)

### 4. Filter by Rent (Loyer)
- **Location**: Third `.div-block-19.is--filter` element
- **Controls**: Two number inputs for minimum and maximum rent values
- **HTML Structure**: 
  ```html
  <input type="number" class="loyer-input loyer-min" placeholder="MIN." />
  <span class="loyer-separator">-</span>
  <input type="number" class="loyer-input loyer-max" placeholder="MAX." />
  ```
- **Data Source**: `.appart-loyer` (parses "CHF 1.942,00" format)
- **Filtering**: Real-time filtering as user types

### 5. Filter by Availability (Disponibilité)
- **Location**: Fourth `.div-block-19.is--filter` element
- **Control**: Checkbox added dynamically
- **Behavior**: When checked, shows only apartments marked as "Disponible"
- **Data Source**: `.appart-disponibilite` field

### 6. Filter Search List
- **Location**: `.filter--search` container
- **Content**: Dynamically populated `.filter--search-item` elements
- **Structure**: Each item shows `.filter--search-name` with apartment number
- **Interaction**: Clicking an item opens the popup and shows the correct apartment on the correct floor
- **Filtering**: List updates in real-time based on all active filters

### 7. Reset Filters
- **Trigger**: `.filter--reset` element
- **Behavior**: Resets all filters to default state (TOUS, empty inputs, unchecked checkbox)
- **Effect**: Refreshes the search list to show all apartments

## Data Loading

### Apartment Data Collection
The system automatically fetches all apartment data on initialization:
- Loops through floors 6-20
- Fetches each floor page from `/etages/{levelNumber}`
- Extracts apartment links from each floor
- Fetches individual apartment pages to get complete data
- Caches all data for fast filtering

### Data Structure
Each apartment object contains:
```javascript
{
  number: "1.10",           // Apartment number
  pieces: 4,                // Number of rooms (parsed as integer)
  etage: 1,                 // Floor number (extracted from apartment number)
  loyer: "CHF 1.942,00",    // Original rent string
  loyerValue: 1942,         // Parsed rent value for comparison
  disponibilite: "Disponible", // Availability status
  url: "/appartements/..."  // URL to apartment page
}
```

## Technical Implementation

### Filter State Management
```javascript
const filterState = {
  pieces: null,        // null = show all
  etage: null,         // null = show all
  loyerMin: null,      // null = no minimum
  loyerMax: null,      // null = no maximum
  disponibleOnly: false // false = show all
};
```

### Key Functions

#### `loadAllApartments()`
- Fetches all apartment data from the server
- Builds the complete apartment list
- Extracts unique values for pieces and floors

#### `getFilteredApartments()`
- Filters apartments based on current filter state
- Applies all active filters simultaneously
- Returns array of matching apartments

#### `updateFilterSearchList()`
- Clears and rebuilds the search list
- Creates clickable apartment items
- Sorts results by apartment number

#### `selectApartmentByNumber(apartmentNumber)`
- Selects a specific apartment in the open popup
- Finds and clicks the correct plan path
- Exposed globally as `window.selectApartmentByNumber()`

### Global Exposures
For cross-module communication:
- `window.openLevelPopup(levelNumber)` - Opens popup for specific floor
- `window.selectApartmentByNumber(number)` - Selects specific apartment

## Integration Points

### Existing Code Modifications
1. **Line 381-383**: Exposed `openLevelPopup` function globally
2. **Line 383-430**: Added `selectApartmentByNumber` function
3. **Line 1460+**: Added complete filter system module

### CSS Requirements (Not included)
The following CSS classes may need styling:
- `.loyer-range-wrapper` - Container for rent inputs
- `.loyer-input` - Number input fields
- `.loyer-separator` - Separator between MIN/MAX
- `.loyer-min`, `.loyer-max` - Specific input styling
- `.disponibilite-checkbox` - Checkbox styling

## Usage

### HTML Structure Required
The page must include the filter HTML structure as provided. Key elements:
- `.filters--parent` - Main filter container
- `.filter--trigger` or `.div-block-19` with "FILTRES" - Toggle button
- `.filter--reset` - Reset button
- `.filter--search` - Search results container
- Multiple `.div-block-19.is--filter` - Individual filter containers

### Initialization
The filter system initializes automatically when the DOM is ready. It will:
1. Fetch all apartment data
2. Set up all filter controls
3. Render the initial search list
4. Set up event listeners

### Performance Considerations
- All apartment data is fetched once on load
- Filtering happens client-side for instant results
- Floor data is cached to avoid redundant fetching
- Search list updates are throttled during rapid filter changes

## Browser Compatibility
- Requires modern browser with ES6+ support
- Uses async/await for data fetching
- Depends on GSAP for animations
- Uses fetch API for data loading

## Future Enhancements
Potential improvements:
1. Add loading indicators during initial data fetch
2. Implement debouncing on loyer input changes
3. Add URL parameters to preserve filter state
4. Implement sort options for search results
5. Add animation when filter list updates
6. Save user preferences in localStorage
