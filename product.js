/* ============================================================
   product.js — Individual product page logic

   WHAT THIS FILE DOES:
   1. Reads ?id= from the URL
   2. Looks up the product in localStorage (admin-saved) or the
      STATIC_PRODUCTS fallback below
   3. Renders the entire page: images, title, price, swatches,
      size dropdown, accordion sections, and similar products
   4. Manages the scroll-lock image viewer behavior
   5. Manages the similar products carousel

   TO ADD/EDIT PRODUCTS: Use the admin panel at admin.html.
   The admin saves to localStorage; this page reads from there.
   ============================================================ */


/* ============================================================
   STATIC PRODUCTS FALLBACK
   These are the hand-coded example products from products.html.
   The admin panel saves its own products to localStorage,
   but these act as a fallback for the example cards.

   STRUCTURE of each product object:
   {
     id:          string  — must match data-id on the card in products.html
     name:        string
     price:       string  — e.g. "59.99"
     category:    string
     sizes:       string  — comma-separated e.g. "S,M,L,XL"
     colors:      string  — comma-separated e.g. "black,white"
     tags:        string  — comma-separated e.g. "long-sleeve,slim-fit"
     images:      array   — list of image paths/URLs (first = primary)
     description: string  — short product description
     material:    string  — fabric/material details (shown in accordion)
     sizeGuide:   string  — HTML string for sizing table / info
     returnInfo:  string  — return policy text
     relatedIds:  array   — list of product ids to show in "Similar" carousel
   }

   HOW TO CUSTOMIZE:
   Edit these fallback objects directly, or better yet,
   manage everything through the admin panel which will
   override these automatically for its products.
   ============================================================ */
const STATIC_PRODUCTS = [
  {
    id:          'classic-long-sleeve',
    name:        'Classic Long Sleeve',
    price:       '59.99',
    category:    'shirts',
    sizes:       'S,M,L,XL',
    colors:      'black,white',
    tags:        'long-sleeve,slim-fit',
    images:      ['', '', ''],   // Replace '' with real image paths
    description: 'A clean, slim-fit long sleeve in a premium cotton blend. Designed to layer or wear alone — it goes with everything.',
    material:    '95% cotton, 5% elastane. Machine wash cold, tumble dry low. Do not bleach.',
    sizeGuide:   `<table class="size-table">
      <thead><tr><th>Size</th><th>Chest (in)</th><th>Length (in)</th></tr></thead>
      <tbody>
        <tr><td>S</td><td>36–38</td><td>27</td></tr>
        <tr><td>M</td><td>39–41</td><td>28</td></tr>
        <tr><td>L</td><td>42–44</td><td>29</td></tr>
        <tr><td>XL</td><td>45–47</td><td>30</td></tr>
      </tbody>
    </table>`,
    returnInfo:  'Free returns within 30 days of purchase. Items must be unworn and in original packaging. Start a return at our returns portal.',
    relatedIds:  ['linen-button-down', 'relaxed-tee', 'slim-chino'],
  },
  {
    id:          'linen-button-down',
    name:        'Linen Button Down',
    price:       '44.99',
    category:    'shirts',
    sizes:       'XS,S,M',
    colors:      'white,beige',
    tags:        'short-sleeve,button-down',
    images:      ['', ''],
    description: 'Light and breathable summer linen. A relaxed-collar button-down built for warm weather.',
    material:    '100% linen. Hand wash or machine wash gentle. Air dry recommended.',
    sizeGuide:   `<table class="size-table">
      <thead><tr><th>Size</th><th>Chest (in)</th><th>Length (in)</th></tr></thead>
      <tbody>
        <tr><td>XS</td><td>34–35</td><td>26</td></tr>
        <tr><td>S</td><td>36–38</td><td>27</td></tr>
        <tr><td>M</td><td>39–41</td><td>28</td></tr>
      </tbody>
    </table>`,
    returnInfo:  'Free returns within 30 days. Items must be unworn in original condition.',
    relatedIds:  ['classic-long-sleeve', 'relaxed-tee'],
  },
  {
    id:          'slim-chino',
    name:        'Slim Chino',
    price:       '79.99',
    category:    'pants',
    sizes:       'S,M,L,XL,XXL',
    colors:      'navy,black',
    tags:        'slim-fit',
    images:      ['', ''],
    description: 'Tailored slim chino in a stretch-cotton blend. Smart enough for the office, casual enough for the weekend.',
    material:    '98% cotton, 2% elastane. Machine wash cold. Do not iron directly on fabric.',
    sizeGuide:   `<table class="size-table">
      <thead><tr><th>Size</th><th>Waist (in)</th><th>Inseam (in)</th></tr></thead>
      <tbody>
        <tr><td>S</td><td>28–30</td><td>30</td></tr>
        <tr><td>M</td><td>31–33</td><td>30</td></tr>
        <tr><td>L</td><td>34–36</td><td>32</td></tr>
        <tr><td>XL</td><td>37–39</td><td>32</td></tr>
        <tr><td>XXL</td><td>40–42</td><td>32</td></tr>
      </tbody>
    </table>`,
    returnInfo:  'Free returns within 30 days. Items must be unworn in original condition.',
    relatedIds:  ['wool-overcoat', 'classic-long-sleeve'],
  },
  {
    id:          'wool-overcoat',
    name:        'Wool Overcoat',
    price:       '149.99',
    category:    'outerwear',
    sizes:       'M,L,XL',
    colors:      'grey,beige',
    tags:        'relaxed-fit',
    images:      ['', ''],
    description: 'A structured wool-blend overcoat with a clean, minimal silhouette. Built to last seasons.',
    material:    '70% wool, 20% polyester, 10% nylon. Dry clean only.',
    sizeGuide:   `<table class="size-table">
      <thead><tr><th>Size</th><th>Chest (in)</th><th>Length (in)</th></tr></thead>
      <tbody>
        <tr><td>M</td><td>40–42</td><td>42</td></tr>
        <tr><td>L</td><td>43–45</td><td>43</td></tr>
        <tr><td>XL</td><td>46–48</td><td>44</td></tr>
      </tbody>
    </table>`,
    returnInfo:  'Free returns within 30 days. Dry-clean items must be returned with original cleaning tags attached.',
    relatedIds:  ['slim-chino', 'classic-long-sleeve'],
  },
  {
    id:          'canvas-tote',
    name:        'Canvas Tote',
    price:       '24.99',
    category:    'accessories',
    sizes:       '',
    colors:      'black,navy',
    tags:        '',
    images:      ['', ''],
    description: 'A heavy-duty canvas tote with reinforced handles. Fits a laptop, gym clothes, or everything in between.',
    material:    '100% heavyweight canvas. Spot clean. Do not machine wash.',
    sizeGuide:   '<p>One size. Dimensions: 15" W × 16" H × 4" D. Handle drop: 10".</p>',
    returnInfo:  'Free returns within 30 days. Must be unused and in original condition.',
    relatedIds:  ['relaxed-tee', 'linen-button-down'],
  },
  {
    id:          'relaxed-tee',
    name:        'Relaxed Tee',
    price:       '34.99',
    category:    'shirts',
    sizes:       'S,M,L',
    colors:      'red,black,white',
    tags:        'short-sleeve,relaxed-fit',
    images:      ['', ''],
    description: 'A short-sleeve tee cut slightly wider through the chest and shoulders. Soft, breathable, everyday wear.',
    material:    '100% ring-spun cotton. Machine wash warm. Tumble dry low.',
    sizeGuide:   `<table class="size-table">
      <thead><tr><th>Size</th><th>Chest (in)</th><th>Length (in)</th></tr></thead>
      <tbody>
        <tr><td>S</td><td>38–40</td><td>27</td></tr>
        <tr><td>M</td><td>41–43</td><td>28</td></tr>
        <tr><td>L</td><td>44–46</td><td>29</td></tr>
      </tbody>
    </table>`,
    returnInfo:  'Free returns within 30 days. Must be unworn with tags attached.',
    relatedIds:  ['classic-long-sleeve', 'linen-button-down', 'canvas-tote'],
  },
];

// Maps color name → hex for rendering swatches
// Keep this in sync with the COLOR_MAP in admin.js
const COLOR_HEX = {
  black:  '#111111',
  white:  '#ffffff',
  grey:   '#888888',
  gray:   '#888888',
  navy:   '#1a2e50',
  beige:  '#d4c5a9',
  red:    '#c0392b',
  green:  '#27ae60',
  blue:   '#2563eb',
  pink:   '#ec4899',
  yellow: '#f59e0b',
  brown:  '#92400e',
  orange: '#ea580c',
  purple: '#7c3aed',
};


/* ============================================================
   BOOTSTRAP — runs when DOM is ready
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {

  /* ----------------------------------------------------------
     1. RESOLVE THE PRODUCT
     Read ?id= from the URL, look up in localStorage first,
     then fall back to STATIC_PRODUCTS.
     ---------------------------------------------------------- */
  const params     = new URLSearchParams(window.location.search);
  const productId  = params.get('id');

  if (!productId) {
    showError('No product specified.');
    return;
  }

  // localStorage products (from admin panel) take priority
  const stored = getStoredProducts();
  let product  = stored.find(function (p) { return p.id === productId; });

  // Fall back to hand-coded static products
  if (!product) {
    product = STATIC_PRODUCTS.find(function (p) { return p.id === productId; });
  }

  if (!product) {
    showError('Product not found. It may have been removed.');
    return;
  }

  // All products combined (for resolving related product cards)
  const allProducts = mergeProducts(stored, STATIC_PRODUCTS);

  renderProduct(product, allProducts);
});


/* ============================================================
   RENDER PRODUCT
   Main render function — fills every section of the page.
   ============================================================ */
function renderProduct(p, allProducts) {

  /* --- Page title and breadcrumb --- */
  document.title = p.name + ' — Renasence';

  const breadcrumb = document.getElementById('breadcrumb-product');
  if (breadcrumb) breadcrumb.textContent = p.name;

  const breadcrumbCat = document.getElementById('breadcrumb-category');
  if (breadcrumbCat && p.category) {
    breadcrumbCat.textContent = capitalize(p.category);
    breadcrumbCat.href = 'products.html?category=' + encodeURIComponent(p.category);
  }


  /* --- Images --- */
  // Support both legacy single-image (p.image) and new multi-image (p.images array)
  const images = Array.isArray(p.images) ? p.images.filter(Boolean) :
    (p.image ? [p.image] : []);

  // If no images, show a placeholder slide
  if (images.length === 0) images.push('');

  renderImages(images);


  /* --- Name and price --- */
  setEl('product-title', p.name);
  setEl('product-price', '$' + parseFloat(p.price || 0).toFixed(2));
  setEl('product-description', p.description || '');


  /* --- Color swatches --- */
  const colors = (p.colors || '').split(',').map(c => c.trim()).filter(Boolean);
  renderSwatches(colors);


  /* --- Size dropdown --- */
  const sizes = (p.sizes || '').split(',').map(s => s.trim()).filter(Boolean);
  renderSizes(sizes);


  /* --- Accordion sections --- */
  // Material / product details
  setAccordionContent('accordion-material', p.material || 'Material details coming soon.');

  // Sizing guide — can be HTML (table) or plain text
  setAccordionContent('accordion-sizing', p.sizeGuide || 'Sizing information coming soon.');

  // Return policy
  setAccordionContent('accordion-returns', p.returnInfo || 'Contact us for return information.');


  /* --- Similar products carousel --- */
  const relatedIds = Array.isArray(p.relatedIds) ? p.relatedIds :
    (p.relatedIds ? p.relatedIds.split(',').map(s => s.trim()) : []);

  renderSimilar(relatedIds, p.id, allProducts);


  /* --- Page scroll lock for images --- */
  initScrollLock();
}


/* ============================================================
   RENDER IMAGES
   Builds the image slides and dot nav.
   ============================================================ */
function renderImages(images) {
  const inner   = document.getElementById('image-scroll-inner');
  const dotsEl  = document.getElementById('image-dots');
  const counter = document.getElementById('image-counter');

  if (!inner) return;

  // Build slides
  inner.innerHTML = images.map(function (src, i) {
    return `<div class="product-image-slide" data-index="${i}">
      <img src="${src}" alt="Product image ${i + 1}"
           onerror="this.parentElement.style.background='var(--color-surface)'">
    </div>`;
  }).join('');

  // Build dots
  if (dotsEl) {
    dotsEl.innerHTML = images.map(function (_, i) {
      return `<button class="image-dot${i === 0 ? ' active' : ''}"
                      aria-label="Image ${i + 1}"
                      onclick="scrollToImage(${i})"></button>`;
    }).join('');
  }

  // Update counter
  if (counter) counter.textContent = '1 / ' + images.length;

  // Track scroll to update dots and counter
  inner.addEventListener('scroll', function () {
    const slideHeight = inner.clientHeight;
    // Which slide index is most visible
    const idx = Math.round(inner.scrollTop / slideHeight);
    updateImageNav(idx, images.length);
  });
}

// Programmatically scroll to a specific image index
window.scrollToImage = function (index) {
  const inner = document.getElementById('image-scroll-inner');
  if (!inner) return;
  inner.scrollTo({ top: index * inner.clientHeight, behavior: 'smooth' });
};

// Update dot highlights and counter text
function updateImageNav(activeIndex, total) {
  const dots    = document.querySelectorAll('.image-dot');
  const counter = document.getElementById('image-counter');

  dots.forEach(function (dot, i) {
    dot.classList.toggle('active', i === activeIndex);
  });

  if (counter) counter.textContent = (activeIndex + 1) + ' / ' + total;
}


/* ============================================================
   SCROLL LOCK
   While the user scrolls the page, the image column intercepts
   the scroll and advances through images instead of scrolling
   the page. Once the last image is visible, normal page scroll
   resumes.

   TECHNIQUE:
   We listen to the window's wheel event. If images remain,
   we prevent the default page scroll and advance the image
   scroller. Once all images have been shown once, we stop
   intercepting.
   ============================================================ */
function initScrollLock() {
  const imageSection = document.getElementById('product-images');
  if (!imageSection) return;

  const inner = document.getElementById('image-scroll-inner');
  if (!inner) return;

  // On mobile/tablet the image column is not sticky, so skip scroll lock
  if (window.innerWidth <= 900) return;

  let locked = true;   // true = intercept scroll for images

  window.addEventListener('wheel', function (e) {
    if (!locked) return;

    // Only intercept if cursor is over the left half of the page
    // (image column area)
    if (e.clientX > window.innerWidth / 2) return;

    const slides     = inner.querySelectorAll('.product-image-slide');
    const slideH     = inner.clientHeight;
    const currentIdx = Math.round(inner.scrollTop / slideH);

    if (e.deltaY > 0) {
      // Scrolling DOWN
      if (currentIdx < slides.length - 1) {
        // More images to show — advance to next image
        e.preventDefault();
        inner.scrollTo({ top: (currentIdx + 1) * slideH, behavior: 'smooth' });
      } else {
        // Last image reached — release lock so page scrolls normally
        locked = false;
      }
    } else {
      // Scrolling UP
      if (currentIdx > 0) {
        // Go back to previous image
        e.preventDefault();
        inner.scrollTo({ top: (currentIdx - 1) * slideH, behavior: 'smooth' });
      }
      // If at first image and scrolling up, re-engage lock
      if (currentIdx === 0) locked = true;
    }
  }, { passive: false });   // passive:false is required to allow preventDefault


  /* Touch support for mobile-like swipe even on desktop */
  let touchStartY = 0;
  imageSection.addEventListener('touchstart', function (e) {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  imageSection.addEventListener('touchmove', function (e) {
    if (!locked) return;
    const delta = touchStartY - e.touches[0].clientY;
    const slides     = inner.querySelectorAll('.product-image-slide');
    const slideH     = inner.clientHeight;
    const currentIdx = Math.round(inner.scrollTop / slideH);

    if (Math.abs(delta) < 10) return;  // Ignore tiny movements

    if (delta > 0 && currentIdx < slides.length - 1) {
      e.preventDefault();
      inner.scrollTo({ top: (currentIdx + 1) * slideH, behavior: 'smooth' });
      touchStartY = e.touches[0].clientY;
    } else if (delta < 0 && currentIdx > 0) {
      e.preventDefault();
      inner.scrollTo({ top: (currentIdx - 1) * slideH, behavior: 'smooth' });
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: false });
}


/* ============================================================
   RENDER SWATCHES
   Builds color circle buttons. Hidden if no colors.
   ============================================================ */
function renderSwatches(colors) {
  const container = document.getElementById('swatch-container');
  const section   = document.getElementById('swatch-section');
  const namEl     = document.getElementById('swatch-selected-name');

  if (!container || !colors.length) {
    if (section) section.style.display = 'none';
    return;
  }

  container.innerHTML = colors.map(function (color, i) {
    const hex = COLOR_HEX[color] || '#cccccc';
    return `<button class="product-swatch${i === 0 ? ' active' : ''}"
                    data-color="${color}"
                    style="background-color:${hex}"
                    title="${capitalize(color)}"
                    aria-label="${capitalize(color)}"></button>`;
  }).join('');

  // Show first color name
  if (namEl) namEl.textContent = capitalize(colors[0]);

  // Click handler
  container.querySelectorAll('.product-swatch').forEach(function (btn) {
    btn.addEventListener('click', function () {
      container.querySelectorAll('.product-swatch').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      if (namEl) namEl.textContent = capitalize(this.dataset.color);
    });
  });
}


/* ============================================================
   RENDER SIZES
   Populates the size <select> dropdown.
   ============================================================ */
function renderSizes(sizes) {
  const select  = document.getElementById('size-select');
  const section = document.getElementById('size-section');

  if (!select || !sizes.length) {
    if (section) section.style.display = 'none';
    return;
  }

  select.innerHTML =
    '<option value="">Select a size</option>' +
    sizes.map(function (s) {
      return `<option value="${s}">${s}</option>`;
    }).join('');
}


/* ============================================================
   RENDER SIMILAR PRODUCTS CAROUSEL
   Finds related products by their IDs and builds cards.
   ============================================================ */
function renderSimilar(relatedIds, currentId, allProducts) {
  const track   = document.getElementById('similar-track');
  const section = document.getElementById('similar-section');

  if (!track || !relatedIds.length) {
    if (section) section.style.display = 'none';
    return;
  }

  // Get the related product objects
  const related = relatedIds
    .map(function (id) { return allProducts.find(function (p) { return p.id === id; }); })
    .filter(Boolean);  // Remove any IDs that didn't resolve

  if (!related.length) {
    if (track) track.innerHTML = '<p style="color:var(--color-muted); font-size:0.9rem; padding: 20px 0;">Check back later — more products are on the way.</p>';
    return;
  }
}

  track.innerHTML = related.map(function (p) {
    const img = Array.isArray(p.images) ? (p.images[0] || '') : (p.image || '');
    const tags = (p.tags || '').split(',').filter(Boolean);
    const tagPills = (p.category ? `<span class="tag">${p.category}</span>` : '') +
      tags.slice(0, 2).map(t => `<span class="tag">${t.trim()}</span>`).join('');

    return `<article class="card" onclick="window.location.href='product.html?id=${encodeURIComponent(p.id)}'">
      <img class="card-image" src="${img}" alt="${p.name}">
      <div class="card-body">
        <p class="card-title">${p.name}</p>
        <p class="card-price">$${parseFloat(p.price || 0).toFixed(2)}</p>
        <div class="card-tags">${tagPills}</div>
      </div>
    </article>`;
  }).join('');

  // Carousel arrow button logic
  initCarousel();
}

function initCarousel() {
  const track = document.getElementById('similar-track');
  const prev  = document.getElementById('carousel-prev');
  const next  = document.getElementById('carousel-next');

  if (!track || !prev || !next) return;

  const scrollAmount = 300;  // Pixels to scroll per button click — adjust as needed

  next.addEventListener('click', function () {
    track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });

  prev.addEventListener('click', function () {
    track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });

  // Disable buttons at scroll boundaries
  track.addEventListener('scroll', function () {
    prev.disabled = track.scrollLeft <= 0;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
  });

  // Initial state
  prev.disabled = true;
}


/* ============================================================
   ACCORDION
   Clicking a trigger toggles the open/close state.
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.accordion-trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      const item = this.closest('.accordion-item');
      const body = item.querySelector('.accordion-body');
      const isOpen = item.classList.contains('open');

      // Close all other items (comment out these 2 lines for multi-open behavior)
      document.querySelectorAll('.accordion-item.open').forEach(function (openItem) {
        openItem.classList.remove('open');
      });

      if (!isOpen) {
        item.classList.add('open');
        // Set explicit max-height to enable CSS transition
        body.style.maxHeight = body.scrollHeight + 'px';
      } else {
        body.style.maxHeight = '';
      }
    });
  });
});


/* ============================================================
   ADD TO CART
   Placeholder handler — replace with your actual cart logic.
   ============================================================ */
function addToCart() {
  const sizeEl = document.getElementById('size-select');
  const size   = sizeEl ? sizeEl.value : '';
  const swatches = document.querySelectorAll('.product-swatch.active');
  const color    = swatches.length ? swatches[0].dataset.color : '';

  // Validate size selection if sizes exist
  if (sizeEl && sizeEl.options.length > 1 && !size) {
    sizeEl.focus();
    sizeEl.style.borderColor = 'var(--color-accent)';
    setTimeout(() => { sizeEl.style.borderColor = ''; }, 1500);
    return;
  }

  /* ── CART INTEGRATION POINT ──────────────────────────────────
     Replace this alert with your actual cart logic.
     If you're using Shopify, Snipcart, Gumroad, or similar,
     trigger their add-to-cart action here.
     Available variables:
       - productId: the product's unique ID
       - size:      selected size string (e.g. "M")
       - color:     selected color string (e.g. "black")
  ─────────────────────────────────────────────────────────── */
  const productId = new URLSearchParams(window.location.search).get('id');
  alert(`Added to cart:\nProduct: ${productId}\nSize: ${size || 'N/A'}\nColor: ${color || 'N/A'}\n\nReplace this alert with your cart integration.`);
}


/* ============================================================
   UTILITY HELPERS
   ============================================================ */

// Set the textContent of an element by id
function setEl(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// Set innerHTML of an accordion body
function setAccordionContent(accordionId, html) {
  const el = document.querySelector('#' + accordionId + ' .accordion-body-inner');
  if (el) el.innerHTML = html;
}

// Capitalize first letter of a string
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Load stored products from localStorage
function getStoredProducts() {
  try {
    return JSON.parse(localStorage.getItem('products') || '[]');
  } catch { return []; }
}

// Merge stored and static products, with stored taking priority on duplicate IDs
function mergeProducts(stored, staticList) {
  const map = {};
  staticList.forEach(p => { map[p.id] = p; });
  stored.forEach(p => { map[p.id] = p; });  // Stored overwrites static on same ID
  return Object.values(map);
}

// Show an error message on the page
function showError(msg) {
  const main = document.querySelector('main');
  if (main) {
    main.innerHTML = `
      <div style="text-align:center; padding: 80px 24px; color: var(--color-muted);">
        <h2 style="font-family:var(--font-heading); font-size:2rem; margin-bottom:1rem;">Product Not Found</h2>
        <p>${msg}</p>
        <a href="products.html" style="display:inline-block; margin-top:1.5rem; text-decoration:underline;">
          ← Back to Shop
        </a>
      </div>`;
  }
}
