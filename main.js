/* ============================================================
   main.js — Shared JavaScript
   Runs on every page. Handles the nav and any global behavior.
   Load this in every HTML file via <script src="main.js">
   ============================================================ */


/* ------------------------------------------------------------
   NAV: Mobile hamburger toggle
   Clicking the hamburger button opens/closes the nav links.
   ------------------------------------------------------------ */

// Wait for the entire DOM to load before running any JS
document.addEventListener('DOMContentLoaded', function () {

  const toggle = document.querySelector('.nav-toggle');    // Hamburger button
  const navLinks = document.querySelector('.nav-links');   // The <ul> of links

  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      // Toggle the 'open' class — CSS handles the show/hide
      navLinks.classList.toggle('open');

      // Accessibility: tell screen readers whether the menu is expanded
      const isOpen = navLinks.classList.contains('open');
      toggle.setAttribute('aria-expanded', isOpen);
    });
  }


  /* ----------------------------------------------------------
     NAV: Close menu when a link is clicked (mobile UX)
     ---------------------------------------------------------- */
  const allNavLinks = document.querySelectorAll('.nav-links a');
  allNavLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });


  /* ----------------------------------------------------------
     NAV: Mark the current page link as active
     Compares the link href to the current page filename.
     ---------------------------------------------------------- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  allNavLinks.forEach(function (link) {
    const linkPage = link.getAttribute('href').split('/').pop();
    if (linkPage === currentPage) {
      link.classList.add('active');
    }
  });

});

/* ============================================================
   CART
   Stores cart items in localStorage under the key 'cart'.
   Each item: { id, name, price, size, color, image, qty }

   The cart opens/closes via openCart() / closeCart().
   addToCart() in product.js calls window.Cart.add(...) below.
   ============================================================ */

window.Cart = (function () {

  const STORAGE_KEY = 'cart';

  /* ---- Storage helpers ---- */

  function load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  }

  function save(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }


  /* ---- Public API ---- */

  // Add an item to the cart (called from product.js)
  // Params match the fields you already have on the product page.
  function add({ id, name, price, size, color, image }) {
    const items = load();

    // Use a composite key so black/M and white/M are separate line items
    const key = id + '|' + (size || '') + '|' + (color || '');
    const existing = items.find(i => i.key === key);

    if (existing) {
      existing.qty += 1;             // Already in cart — bump quantity
    } else {
      items.push({ key, id, name, price: parseFloat(price), size, color, image, qty: 1 });
    }

    save(items);
    updateBadge();
    renderCartItems();
    openCart();                      // Open drawer after adding
  }

  // Remove one line item entirely
  function remove(key) {
    save(load().filter(i => i.key !== key));
    updateBadge();
    renderCartItems();
  }

  // Change quantity; removes the item if qty drops to 0
  function setQty(key, qty) {
    if (qty < 1) { remove(key); return; }
    const items = load();
    const item = items.find(i => i.key === key);
    if (item) { item.qty = qty; save(items); }
    updateBadge();
    renderCartItems();
  }

  // Open the cart overlay and drawer
  function openCart() {
    document.getElementById('cart-overlay').classList.add('open');
    document.getElementById('cart-drawer').classList.add('open');
    document.body.style.overflow = 'hidden';  // Prevent page scroll behind drawer
  }

  // Close the cart
  function closeCart() {
    document.getElementById('cart-overlay').classList.remove('open');
    document.getElementById('cart-drawer').classList.remove('open');
    document.body.style.overflow = '';
  }

  // Recalculate and display subtotal
  function getSubtotal(items) {
    return items.reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  // Update the red badge number on the nav cart button
  function updateBadge() {
    const items     = load();
    const totalQty  = items.reduce((sum, i) => sum + i.qty, 0);
    const badge     = document.getElementById('cart-badge');
    if (!badge) return;
    badge.textContent = totalQty;
    badge.classList.toggle('visible', totalQty > 0);
  }

  // Re-render the list of items inside the drawer
  function renderCartItems() {
    const items       = load();
    const container   = document.getElementById('cart-items');
    const countEl     = document.getElementById('cart-item-count');
    const subtotalEl  = document.getElementById('cart-subtotal-amount');
    if (!container) return;

    // Update header count
    const totalQty = items.reduce((sum, i) => sum + i.qty, 0);
    if (countEl) countEl.textContent = '(' + totalQty + (totalQty === 1 ? ' item' : ' items') + ')';

    // Update subtotal
    if (subtotalEl) subtotalEl.textContent = '$' + getSubtotal(items).toFixed(2);

    // Empty state
    if (items.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <p>Your cart is empty.</p>
          <p>Add a product from the shop to get started.</p>
        </div>`;
      return;
    }

    // Build one row per line item
    container.innerHTML = items.map(function (item) {
      // Safely escape strings used in onclick attributes
      const safeKey = item.key.replace(/'/g, "\\'");
      return `
        <div class="cart-item">
          <img class="cart-item-img"
               src="${item.image || ''}"
               alt="${item.name}"
               onerror="this.style.background='var(--color-surface)'">

          <div class="cart-item-details">
            <span class="cart-item-name">${item.name}</span>
            <span class="cart-item-options">
              ${item.size  ? 'Size: ' + item.size   : ''}
              ${item.size && item.color ? ' · ' : ''}
              ${item.color ? item.color.charAt(0).toUpperCase() + item.color.slice(1) : ''}
            </span>
            <span class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</span>

            <div class="cart-item-qty">
              <button class="cart-qty-btn"
                      onclick="Cart.setQty('${safeKey}', ${item.qty - 1})"
                      aria-label="Decrease quantity">−</button>
              <span class="cart-qty-value">${item.qty}</span>
              <button class="cart-qty-btn"
                      onclick="Cart.setQty('${safeKey}', ${item.qty + 1})"
                      aria-label="Increase quantity">+</button>
            </div>
          </div>

          <button class="cart-item-delete"
                  onclick="Cart.remove('${safeKey}')"
                  aria-label="Remove from cart">✕</button>
        </div>`;
    }).join('');
  }

  /* ---- Init: run on every page load ---- */
  document.addEventListener('DOMContentLoaded', function () {
    updateBadge();

    // Close drawer when clicking the overlay
    const overlay = document.getElementById('cart-overlay');
    if (overlay) overlay.addEventListener('click', closeCart);

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeCart();
    });
  });

  // Expose public methods
  return { add, remove, setQty, open: openCart, close: closeCart };

})();
