/* ============================================================
   products.js — Filter, sort, and search logic for products.html

   HOW IT WORKS:
   Each product card in the HTML has data-* attributes that
   describe its properties (category, price, size, color, tags).
   This script reads those attributes and shows/hides cards
   based on what the user selects in the filter sidebar.

   TO ADD A NEW PRODUCT: Add a card to the HTML with the right
   data attributes — no JS changes needed.

   TO ADD A NEW FILTER TYPE: Add a filter group in the HTML and
   a corresponding case in the applyFilters() function below.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {


  /* ----------------------------------------------------------
     ELEMENT REFERENCES
     ---------------------------------------------------------- */
  const productCards  = document.querySelectorAll('.product-card');  // All product cards
  const resultCount   = document.querySelector('.result-count');      // "Showing X items" text
  const sortSelect    = document.querySelector('.sort-select');        // Sort dropdown
  const productGrid   = document.querySelector('.product-grid');      // The grid wrapper
  const activeFiltersContainer = document.querySelector('.active-filters'); // Chip bar
  const clearAllBtn   = document.querySelector('.btn-clear');          // "Clear all" button


  /* ----------------------------------------------------------
     STATE
     Tracks which filters are currently active.
     Each key maps to a Set of selected values.
     Add or remove keys here if you add/remove filter types.
     ---------------------------------------------------------- */
  const activeFilters = {
    category: new Set(),   // e.g. 'shirts', 'pants'
    size:     new Set(),   // e.g. 'S', 'M', 'L'
    color:    new Set(),   // e.g. 'black', 'white'
    tag:      new Set(),   // e.g. 'long-sleeve', 'slim-fit'
    priceMin: null,        // Number or null
    priceMax: null,        // Number or null
  };


  /* ----------------------------------------------------------
     CHECKBOX FILTERS (category, size, tag)
     Listens for changes on all checkbox inputs.
     ---------------------------------------------------------- */
  const checkboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');

  checkboxes.forEach(function (checkbox) {
    checkbox.addEventListener('change', function () {
      const filterType  = this.dataset.filter;  // e.g. 'category', 'size', 'tag'
      const filterValue = this.value;           // e.g. 'shirts', 'M'

      if (this.checked) {
        activeFilters[filterType].add(filterValue);
      } else {
        activeFilters[filterType].delete(filterValue);
      }

      applyFilters();
      updateActiveChips();
    });
  });


  /* ----------------------------------------------------------
     COLOR SWATCH FILTERS
     Swatches toggle on click and add/remove from the color set.
     ---------------------------------------------------------- */
  const swatches = document.querySelectorAll('.swatch');

  swatches.forEach(function (swatch) {
    swatch.addEventListener('click', function () {
      const color = this.dataset.color;  // e.g. 'black', 'red'

      if (activeFilters.color.has(color)) {
        activeFilters.color.delete(color);
        this.classList.remove('selected');
      } else {
        activeFilters.color.add(color);
        this.classList.add('selected');
      }

      applyFilters();
      updateActiveChips();
    });
  });


  /* ----------------------------------------------------------
     PRICE RANGE FILTERS
     Reads from the two price input fields when they change.
     ---------------------------------------------------------- */
  const priceMinInput = document.querySelector('#price-min');
  const priceMaxInput = document.querySelector('#price-max');

  if (priceMinInput) {
    priceMinInput.addEventListener('input', function () {
      // parseFloat converts the string to a number; empty string → null
      activeFilters.priceMin = this.value !== '' ? parseFloat(this.value) : null;
      applyFilters();
      updateActiveChips();
    });
  }

  if (priceMaxInput) {
    priceMaxInput.addEventListener('input', function () {
      activeFilters.priceMax = this.value !== '' ? parseFloat(this.value) : null;
      applyFilters();
      updateActiveChips();
    });
  }


  /* ----------------------------------------------------------
     CLEAR ALL FILTERS
     Resets all state and unchecks all inputs.
     ---------------------------------------------------------- */
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', clearAllFilters);
  }

  function clearAllFilters() {
    // Reset each filter set
    activeFilters.category.clear();
    activeFilters.size.clear();
    activeFilters.color.clear();
    activeFilters.tag.clear();
    activeFilters.priceMin = null;
    activeFilters.priceMax = null;

    // Uncheck all checkboxes
    checkboxes.forEach(function (cb) { cb.checked = false; });

    // Deselect all swatches
    swatches.forEach(function (s) { s.classList.remove('selected'); });

    // Clear price inputs
    if (priceMinInput) priceMinInput.value = '';
    if (priceMaxInput) priceMaxInput.value = '';

    applyFilters();
    updateActiveChips();
  }


  /* ----------------------------------------------------------
     APPLY FILTERS
     The main logic. Loops through every product card and decides
     whether to show or hide it based on activeFilters.
     ---------------------------------------------------------- */
  function applyFilters() {
    const allCards = document.querySelectorAll('.product-card');
    if (allCards.length === 0) {
       const grid = document.querySelector('.product-grid');
       if (grid && !grid.querySelector('.no-results')) {
         const msg = document.createElement('p');
         msg.className = 'no-results';
         msg.textContent = 'Check back later — new products are on the way.';
         grid.appendChild(msg);
       }
    return;
    }
       
    let visibleCount = 0;

    productCards.forEach(function (card) {
      const show = cardMatchesFilters(card);
      card.classList.toggle('hidden', !show);  // .hidden → display:none in CSS
      if (show) visibleCount++;
    });

    // Update the result counter text
    if (resultCount) {
      resultCount.textContent = visibleCount + ' item' + (visibleCount !== 1 ? 's' : '');
    }

    // Show "no results" message if nothing matches
    let noResults = productGrid.querySelector('.no-results');
    if (visibleCount === 0) {
      if (!noResults) {
        noResults = document.createElement('p');
        noResults.className = 'no-results';
        noResults.textContent = 'No products match your filters.';
        productGrid.appendChild(noResults);
      }
    } else {
      if (noResults) noResults.remove();
    }
  }


  /* ----------------------------------------------------------
     CARD MATCHES FILTERS
     Returns true if a single card passes ALL active filters.
     Each filter type is a separate check (AND logic between types).
     Within a type, any selected value is a match (OR logic within type).

     Data attributes read from the card:
       data-category="shirts"
       data-sizes="S,M,L"          (comma-separated)
       data-colors="black,white"   (comma-separated)
       data-tags="long-sleeve,slim-fit" (comma-separated)
       data-price="49.99"
     ---------------------------------------------------------- */
  function cardMatchesFilters(card) {

    // --- Category ---
    if (activeFilters.category.size > 0) {
      const cardCategory = card.dataset.category || '';
      if (!activeFilters.category.has(cardCategory)) return false;
    }

    // --- Size (card can have multiple sizes) ---
    if (activeFilters.size.size > 0) {
      const cardSizes = (card.dataset.sizes || '').split(',').map(s => s.trim());
      // True if the card has at least one of the selected sizes
      const hasSize = [...activeFilters.size].some(s => cardSizes.includes(s));
      if (!hasSize) return false;
    }

    // --- Color (card can have multiple colors) ---
    if (activeFilters.color.size > 0) {
      const cardColors = (card.dataset.colors || '').split(',').map(c => c.trim());
      const hasColor = [...activeFilters.color].some(c => cardColors.includes(c));
      if (!hasColor) return false;
    }

    // --- Tags (sub-types like 'long-sleeve', 'slim-fit') ---
    if (activeFilters.tag.size > 0) {
      const cardTags = (card.dataset.tags || '').split(',').map(t => t.trim());
      // Must match ALL selected tags (AND logic for tags)
      const hasAllTags = [...activeFilters.tag].every(t => cardTags.includes(t));
      if (!hasAllTags) return false;
    }

    // --- Price ---
    const cardPrice = parseFloat(card.dataset.price || '0');
    if (activeFilters.priceMin !== null && cardPrice < activeFilters.priceMin) return false;
    if (activeFilters.priceMax !== null && cardPrice > activeFilters.priceMax) return false;

    return true;  // Passed all checks
  }


  /* ----------------------------------------------------------
     SORT
     Sorts visible cards by the chosen sort option.
     ---------------------------------------------------------- */
  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      sortProducts(this.value);
    });
  }

  function sortProducts(method) {
    // Get all cards as an array so we can sort them
    const cards = Array.from(productCards);

    cards.sort(function (a, b) {
      if (method === 'price-asc') {
        return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
      }
      if (method === 'price-desc') {
        return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
      }
      if (method === 'name-asc') {
        return (a.dataset.name || '').localeCompare(b.dataset.name || '');
      }
      if (method === 'name-desc') {
        return (b.dataset.name || '').localeCompare(a.dataset.name || '');
      }
      // Default: use original DOM order (the data-order attribute)
      return parseInt(a.dataset.order || 0) - parseInt(b.dataset.order || 0);
    });

    // Re-append cards to the grid in the new sorted order
    // Only non-hidden cards will be visible due to CSS
    cards.forEach(function (card) {
      productGrid.appendChild(card);
    });
  }


  /* ----------------------------------------------------------
     ACTIVE FILTER CHIPS
     Shows a small chip for each active filter so the user can
     see and remove individual filters without opening the sidebar.
     ---------------------------------------------------------- */
  function updateActiveChips() {
    if (!activeFiltersContainer) return;

    // Clear existing chips
    activeFiltersContainer.innerHTML = '';

    // Helper: create one chip element
    function makeChip(label, onRemove) {
      const chip = document.createElement('span');
      chip.className = 'active-filter-chip';
      chip.innerHTML = label + ' <button aria-label="Remove filter">×</button>';
      chip.querySelector('button').addEventListener('click', onRemove);
      activeFiltersContainer.appendChild(chip);
    }

    // Create chips for each active filter
    activeFilters.category.forEach(function (val) {
      makeChip(val, function () {
        activeFilters.category.delete(val);
        // Also uncheck the matching checkbox
        uncheckCheckbox('category', val);
        applyFilters();
        updateActiveChips();
      });
    });

    activeFilters.size.forEach(function (val) {
      makeChip('Size: ' + val, function () {
        activeFilters.size.delete(val);
        uncheckCheckbox('size', val);
        applyFilters();
        updateActiveChips();
      });
    });

    activeFilters.color.forEach(function (val) {
      makeChip('Color: ' + val, function () {
        activeFilters.color.delete(val);
        // Also deselect the matching swatch
        const swatch = document.querySelector('.swatch[data-color="' + val + '"]');
        if (swatch) swatch.classList.remove('selected');
        applyFilters();
        updateActiveChips();
      });
    });

    activeFilters.tag.forEach(function (val) {
      makeChip(val, function () {
        activeFilters.tag.delete(val);
        uncheckCheckbox('tag', val);
        applyFilters();
        updateActiveChips();
      });
    });

    if (activeFilters.priceMin !== null) {
      makeChip('Min $' + activeFilters.priceMin, function () {
        activeFilters.priceMin = null;
        if (priceMinInput) priceMinInput.value = '';
        applyFilters();
        updateActiveChips();
      });
    }

    if (activeFilters.priceMax !== null) {
      makeChip('Max $' + activeFilters.priceMax, function () {
        activeFilters.priceMax = null;
        if (priceMaxInput) priceMaxInput.value = '';
        applyFilters();
        updateActiveChips();
      });
    }
  }

  // Helper: uncheck a specific checkbox by its data-filter and value
  function uncheckCheckbox(filterType, value) {
    const cb = document.querySelector(
      '.filter-option input[data-filter="' + filterType + '"][value="' + value + '"]'
    );
    if (cb) cb.checked = false;
  }


  /* ----------------------------------------------------------
     MOBILE: Filter sidebar toggle
     Shows/hides the filter panel on small screens.
     ---------------------------------------------------------- */
  const filterToggleBtn = document.querySelector('.filter-toggle-btn');
  const filterBody      = document.querySelector('.filter-body');

  if (filterToggleBtn && filterBody) {
    filterToggleBtn.addEventListener('click', function () {
      filterBody.classList.toggle('open');
      const isOpen = filterBody.classList.contains('open');
      // Update button label
      filterToggleBtn.querySelector('.toggle-label').textContent =
        isOpen ? 'Hide Filters' : 'Show Filters';
    });
  }


  /* ----------------------------------------------------------
     INITIAL RENDER
     Run once on page load so counts and state are correct.
     ---------------------------------------------------------- */
  applyFilters();

  // Store original DOM order so "default" sort works correctly
  productCards.forEach(function (card, index) {
    card.dataset.order = index;
  });

});
