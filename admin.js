/* ============================================================
   admin.js — All logic for the admin panel.

   SECTIONS:
     1. Password / Auth
     2. Tab / Panel navigation
     3. Product CRUD (Create, Read, Update, Delete)
     4. localStorage persistence
     5. Appearance (CSS variable editor + live preview)
     6. Settings (password change, data export/import)
     7. Toast notifications
   ============================================================ */


/* ------------------------------------------------------------
   SECTION 1: PASSWORD / AUTH

   The password is stored as a plain string in localStorage.
   On first load the default password is used (set below).
   The user can change it in the Settings panel.

   ⚠ SECURITY NOTE:
   This is client-side only — anyone who opens browser DevTools
   can see localStorage. This is "keep honest people out" security,
   not real authentication. Good enough for a personal admin page
   that is never linked publicly.
   ------------------------------------------------------------ */

const DEFAULT_PASSWORD = 'admin1234';   // ← CHANGE THIS before deploying

// Retrieve stored password, or fall back to the default
function getStoredPassword() {
  return localStorage.getItem('admin_password') || DEFAULT_PASSWORD;
}

// Called when the login form is submitted
function attemptLogin() {
  const input = document.getElementById('password-input').value;
  const errorEl = document.getElementById('login-error');

  if (input === getStoredPassword()) {
    // Mark as logged in for this browser session
    sessionStorage.setItem('admin_authed', 'true');
    showAdminShell();
  } else {
    errorEl.textContent = 'Incorrect password.';
    document.getElementById('password-input').value = '';
    document.getElementById('password-input').focus();
  }
}

// Show the admin UI and hide the login screen
function showAdminShell() {
  document.getElementById('login-screen').style.display = 'none';
  const shell = document.getElementById('admin-shell');
  shell.classList.add('visible');
  renderProductTable();       // Load products when admin opens
  initAppearancePanel();      // Load appearance settings
}

// Log out: clear session flag and reload page
function logout() {
  sessionStorage.removeItem('admin_authed');
  window.location.reload();
}

// On page load: skip login if already authenticated this session
document.addEventListener('DOMContentLoaded', function () {
  if (sessionStorage.getItem('admin_authed') === 'true') {
    showAdminShell();
  }

  // Allow pressing Enter in the password field to submit
  document.getElementById('password-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') attemptLogin();
  });
});


/* ------------------------------------------------------------
   SECTION 2: TAB / PANEL NAVIGATION
   Clicking a sidebar item shows the matching panel and hides others.
   ------------------------------------------------------------ */

// Called by onclick on each sidebar item
// panelId: the id of the .admin-panel to show (e.g. 'panel-products')
function showPanel(panelId, clickedEl) {
  // Hide all panels
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
  // Deactivate all sidebar items
  document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));

  // Show the requested panel
  document.getElementById(panelId).classList.add('active');

  // Mark the clicked sidebar item as active
  if (clickedEl) clickedEl.classList.add('active');
}


/* ------------------------------------------------------------
   SECTION 3: PRODUCT CRUD

   Products are stored in localStorage as a JSON array.
   Each product object has these fields:
   {
     id:       string (timestamp-based unique ID),
     name:     string,
     price:    string (e.g. "49.99"),
     category: string (e.g. "shirts"),
     sizes:    string (comma-separated, e.g. "S,M,L"),
     colors:   string (comma-separated, e.g. "black,white"),
     tags:     string (comma-separated, e.g. "long-sleeve,slim-fit"),
     image:    string (URL or relative path),
   }
   ------------------------------------------------------------ */

// Load products array from localStorage, or return empty array
function loadProducts() {
  try {
    return JSON.parse(localStorage.getItem('products') || '[]');
  } catch {
    return [];
  }
}

// Save the products array back to localStorage
function saveProducts(products) {
  localStorage.setItem('products', JSON.stringify(products));
}

// Generate a simple unique ID from the current timestamp
function generateId() {
  return 'p_' + Date.now();
}


/* ---- Render the product table ---- */
function renderProductTable() {
  const products = loadProducts();
  const tbody    = document.getElementById('product-tbody');
  const countEl  = document.getElementById('product-count');

  if (countEl) countEl.textContent = products.length + ' product' + (products.length !== 1 ? 's' : '');

  if (products.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <strong>No products yet.</strong>
            <p>Fill in the form above and click "Add Product".</p>
          </div>
        </td>
      </tr>`;
    return;
  }

  // Build one <tr> per product
  tbody.innerHTML = products.map(function (p) {

    // Render color dots from comma-separated color string
    const colorDots = (p.colors || '').split(',')
      .filter(Boolean)
      .map(function (c) {
        // Look up the hex from the COLOR_MAP defined below
        const hex = COLOR_MAP[c.trim()] || '#cccccc';
        return `<span class="color-dot" style="background:${hex}" title="${c.trim()}"></span>`;
      }).join('');

    // Render tag pills from comma-separated tags string
    const tagPills = (p.tags || '').split(',')
      .filter(Boolean)
      .map(function (t) {
        return `<span class="table-tag">${t.trim()}</span>`;
      }).join('');

    // Escape the product object as JSON for the edit button's onclick
    // We pass the id and re-look it up in editProduct() to avoid injection issues
    return `
      <tr>
        <td>
          <img class="product-thumb"
               src="${p.image || ''}"
               alt="${p.name}"
               onerror="this.style.background='var(--admin-bg)'">
        </td>
        <td><strong>${p.name}</strong></td>
        <td>$${parseFloat(p.price || 0).toFixed(2)}</td>
        <td>${p.category || '—'}</td>
        <td>${colorDots || '—'}</td>
        <td>${tagPills || '—'}</td>
        <td>
          <div class="row-actions">
            <button class="btn-admin btn-admin-ghost"
                    onclick="editProduct('${p.id}')">Edit</button>
            <button class="btn-admin btn-admin-danger"
                    onclick="deleteProduct('${p.id}')">Delete</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

// Maps color name → hex so table dots show the right color.
// Add your custom colors here to match the swatches in products.html.
const COLOR_MAP = {
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


/* ---- Add a new product from the form ---- */
function addProduct() {
  const product = readForm();
  if (!product) return;   // Validation failed

  product.id = generateId();

  const products = loadProducts();
  products.push(product);
  saveProducts(products);

  resetForm();
  renderProductTable();
  generateProductsHTML();   // Regenerate the HTML output
  showToast('Product added!', 'success');
}


/* ---- Populate the form with an existing product for editing ---- */
function editProduct(id) {
  const products = loadProducts();
  const p = products.find(function (x) { return x.id === id; });
  if (!p) return;

  // Fill form fields with the product's current values
  document.getElementById('f-name').value     = p.name     || '';
  document.getElementById('f-price').value    = p.price    || '';
  document.getElementById('f-category').value = p.category || '';
  document.getElementById('f-sizes').value    = p.sizes    || '';
  document.getElementById('f-colors').value   = p.colors   || '';
  document.getElementById('f-tags').value     = p.tags     || '';
  document.getElementById('f-image').value    = p.image    || '';

  // Store the id being edited in a hidden field so saveEdit() knows which to update
  document.getElementById('f-edit-id').value = id;

  // Swap buttons: hide "Add", show "Save Edit" + "Cancel"
  document.getElementById('btn-add-product').style.display   = 'none';
  document.getElementById('btn-save-edit').style.display     = 'inline-flex';
  document.getElementById('btn-cancel-edit').style.display   = 'inline-flex';

  // Update the form title
  document.getElementById('form-card-title').textContent = 'Edit Product';

  // Scroll to the form
  document.getElementById('product-form-card').scrollIntoView({ behavior: 'smooth' });
}


/* ---- Save changes to an existing product ---- */
function saveEdit() {
  const updated = readForm();
  if (!updated) return;

  const id       = document.getElementById('f-edit-id').value;
  const products = loadProducts();
  const index    = products.findIndex(function (x) { return x.id === id; });

  if (index === -1) {
    showToast('Product not found.', 'error');
    return;
  }

  // Preserve the original id
  updated.id = id;
  products[index] = updated;
  saveProducts(products);

  resetForm();
  renderProductTable();
  generateProductsHTML();
  showToast('Product updated!', 'success');
}


/* ---- Delete a product by id (with confirmation) ---- */
function deleteProduct(id) {
  if (!confirm('Delete this product? This cannot be undone.')) return;

  const products = loadProducts().filter(function (p) { return p.id !== id; });
  saveProducts(products);

  renderProductTable();
  generateProductsHTML();
  showToast('Product deleted.', 'success');
}


/* ---- Read values from the product form ----
   Returns a product object, or null if validation fails. */
function readForm() {
  const name     = document.getElementById('f-name').value.trim();
  const price    = document.getElementById('f-price').value.trim();
  const category = document.getElementById('f-category').value.trim();
  const sizes    = document.getElementById('f-sizes').value.trim();
  const colors   = document.getElementById('f-colors').value.trim();
  const tags     = document.getElementById('f-tags').value.trim();
  const image    = document.getElementById('f-image').value.trim();

  // Basic validation
  if (!name) {
    showToast('Product name is required.', 'error');
    document.getElementById('f-name').focus();
    return null;
  }
  if (!price || isNaN(parseFloat(price))) {
    showToast('Enter a valid price (e.g. 49.99).', 'error');
    document.getElementById('f-price').focus();
    return null;
  }

  return { name, price, category, sizes, colors, tags, image };
}


/* ---- Reset the form to its blank add-new state ---- */
function resetForm() {
  document.getElementById('f-name').value     = '';
  document.getElementById('f-price').value    = '';
  document.getElementById('f-category').value = '';
  document.getElementById('f-sizes').value    = '';
  document.getElementById('f-colors').value   = '';
  document.getElementById('f-tags').value     = '';
  document.getElementById('f-image').value    = '';
  document.getElementById('f-edit-id').value  = '';

  document.getElementById('btn-add-product').style.display  = 'inline-flex';
  document.getElementById('btn-save-edit').style.display    = 'none';
  document.getElementById('btn-cancel-edit').style.display  = 'none';
  document.getElementById('form-card-title').textContent    = 'Add New Product';
}


/* ------------------------------------------------------------
   SECTION 4: GENERATE products.html OUTPUT

   This generates the <article> blocks you paste into products.html.
   Because this is a static site (no server), the admin can't
   write to files directly. Instead it builds the HTML string
   so you can copy-paste it into the product grid in products.html.

   When you eventually move to a server/backend, this would be
   replaced by an API write.
   ------------------------------------------------------------ */
function generateProductsHTML() {
  const products = loadProducts();
  const output   = document.getElementById('html-output');
  if (!output) return;

  if (products.length === 0) {
    output.textContent = '<!-- No products yet -->';
    return;
  }

  const html = products.map(function (p) {
    return `<article class="card product-card"
  data-category="${p.category || ''}"
  data-sizes="${p.sizes || ''}"
  data-colors="${p.colors || ''}"
  data-tags="${p.tags || ''}"
  data-price="${p.price || '0'}"
  data-name="${p.name || ''}">
  <img class="card-image" src="${p.image || ''}" alt="${p.name || ''}">
  <div class="card-body">
    <p class="card-title">${p.name || ''}</p>
    <p class="card-price">$${parseFloat(p.price || 0).toFixed(2)}</p>
    <div class="card-tags">
${(p.category ? `      <span class="tag">${p.category}</span>\n` : '')}${(p.tags || '').split(',').filter(Boolean).map(function (t) {
  return `      <span class="tag">${t.trim()}</span>`;
}).join('\n')}
    </div>
  </div>
</article>`;
  }).join('\n\n');

  output.textContent = html;
}


/* ------------------------------------------------------------
   SECTION 5: APPEARANCE (CSS Variable Editor + Live Preview)

   The editor reads the CSS variables defined in style.css
   and lets you change them visually. Changes are saved to
   localStorage and applied to a live preview iframe.

   To apply changes permanently to style.css, click
   "Export CSS" and copy-paste the output into style.css.
   ------------------------------------------------------------ */

// Defines all editable CSS variables.
// Each entry: { id, label, variable, type, hint }
//   id:       matches the input's id in the HTML form
//   variable: the CSS custom property name
//   type:     'color' | 'text' | 'select'
//   options:  (for select type) array of { label, value }
const CSS_VARS = [
  // Colors
  { id: 'v-bg',           label: 'Page Background',    variable: '--color-bg',           type: 'color' },
  { id: 'v-text',         label: 'Primary Text',        variable: '--color-text',         type: 'color' },
  { id: 'v-muted',        label: 'Muted / Caption Text',variable: '--color-muted',        type: 'color' },
  { id: 'v-border',       label: 'Borders',             variable: '--color-border',       type: 'color' },
  { id: 'v-accent',       label: 'Accent (buttons)',    variable: '--color-accent',       type: 'color' },
  { id: 'v-accent-hover', label: 'Accent Hover',        variable: '--color-accent-hover', type: 'color' },
  { id: 'v-surface',      label: 'Card / Surface Bg',   variable: '--color-surface',      type: 'color' },
  // Spacing
  { id: 'v-gap',          label: 'Base Gap / Spacing',  variable: '--gap',                type: 'text',
    hint: 'e.g. 24px' },
  { id: 'v-radius',       label: 'Border Radius',       variable: '--radius',             type: 'text',
    hint: 'e.g. 4px (0 = square, 8px = rounded)' },
  { id: 'v-max-width',    label: 'Max Content Width',   variable: '--max-width',          type: 'text',
    hint: 'e.g. 1200px' },
  { id: 'v-nav-height',   label: 'Nav Bar Height',      variable: '--nav-height',         type: 'text',
    hint: 'e.g. 64px' },
];

// Defaults mirror style.css :root — used if localStorage has nothing
const CSS_VAR_DEFAULTS = {
  '--color-bg':           '#ffffff',
  '--color-text':         '#111111',
  '--color-muted':        '#666666',
  '--color-border':       '#dddddd',
  '--color-accent':       '#111111',
  '--color-accent-hover': '#444444',
  '--color-surface':      '#f5f5f5',
  '--gap':                '24px',
  '--radius':             '4px',
  '--max-width':          '1200px',
  '--nav-height':         '64px',
};

// Load saved appearance from localStorage
function loadAppearance() {
  try {
    return JSON.parse(localStorage.getItem('appearance') || '{}');
  } catch {
    return {};
  }
}

// Save appearance to localStorage
function saveAppearance(values) {
  localStorage.setItem('appearance', JSON.stringify(values));
}

// Initialize all input fields in the appearance panel with current/saved values
function initAppearancePanel() {
  const saved = loadAppearance();

  CSS_VARS.forEach(function (def) {
    const input = document.getElementById(def.id);
    if (!input) return;
    // Use saved value → default value
    input.value = saved[def.variable] || CSS_VAR_DEFAULTS[def.variable] || '';

    // On any change, save and refresh the preview
    input.addEventListener('input', function () {
      const current = loadAppearance();
      current[def.variable] = this.value;
      saveAppearance(current);
      refreshPreview();
      generateCSSExport();
    });
  });

  refreshPreview();
  generateCSSExport();
}

// Reload the preview iframe (pointing at index.html or whichever page is selected)
function refreshPreview() {
  const frame     = document.getElementById('preview-frame');
  const pageSelect = document.getElementById('preview-page');
  const page      = pageSelect ? pageSelect.value : 'index.html';
  const saved     = loadAppearance();

  // Build a query string of all CSS vars to inject into the preview
  // The preview page reads this and applies it via a <style> block
  const params = new URLSearchParams();
  CSS_VARS.forEach(function (def) {
    const val = saved[def.variable] || CSS_VAR_DEFAULTS[def.variable];
    params.set(def.variable, val);
  });

  // Reload with the params appended; preview-inject.js in the preview page reads them
  frame.src = page + '?preview=1&' + params.toString() + '&t=' + Date.now();
}

// Set the preview device size (desktop / tablet / mobile)
function setPreviewSize(size) {
  document.querySelector('.preview-wrap').className = 'preview-wrap ' + size;
  document.querySelectorAll('.preview-size-btn').forEach(function (btn) {
    btn.classList.toggle('active', btn.dataset.size === size);
  });
}

// Generate the :root { } CSS block for copy-pasting into style.css
function generateCSSExport() {
  const saved  = loadAppearance();
  const output = document.getElementById('css-export-output');
  if (!output) return;

  const lines = CSS_VARS.map(function (def) {
    const val = saved[def.variable] || CSS_VAR_DEFAULTS[def.variable];
    return `  ${def.variable}: ${val};`;
  });

  output.textContent =
    ':root {\n' +
    '  /* --- Colors --- */\n' +
    lines.slice(0, 7).join('\n') + '\n\n' +
    '  /* --- Sizing & Spacing --- */\n' +
    lines.slice(7).join('\n') + '\n' +
    '}';
}

// Copy the CSS export to clipboard
function copyCSSExport() {
  const text = document.getElementById('css-export-output').textContent;
  navigator.clipboard.writeText(text).then(function () {
    showToast('CSS copied to clipboard!', 'success');
  }).catch(function () {
    showToast('Copy failed — select the text manually.', 'error');
  });
}

// Reset all appearance values back to defaults
function resetAppearance() {
  if (!confirm('Reset all appearance settings to defaults?')) return;
  localStorage.removeItem('appearance');
  initAppearancePanel();
  showToast('Appearance reset to defaults.', 'success');
}


/* ------------------------------------------------------------
   SECTION 6: SETTINGS PANEL
   ------------------------------------------------------------ */

// Change the admin password
function changePassword() {
  const current = document.getElementById('s-current-pw').value;
  const newPw   = document.getElementById('s-new-pw').value;
  const confirm = document.getElementById('s-confirm-pw').value;

  if (current !== getStoredPassword()) {
    showToast('Current password is incorrect.', 'error');
    return;
  }
  if (!newPw || newPw.length < 6) {
    showToast('New password must be at least 6 characters.', 'error');
    return;
  }
  if (newPw !== confirm) {
    showToast('Passwords do not match.', 'error');
    return;
  }

  localStorage.setItem('admin_password', newPw);
  document.getElementById('s-current-pw').value = '';
  document.getElementById('s-new-pw').value     = '';
  document.getElementById('s-confirm-pw').value = '';
  showToast('Password changed!', 'success');
}

// Export all data (products + appearance) as a downloadable JSON file
function exportData() {
  const data = {
    products:   loadProducts(),
    appearance: loadAppearance(),
    exported:   new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'fashion-admin-backup-' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Data exported!', 'success');
}

// Import data from a JSON backup file
function importData(event) {
  const file   = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.products)   saveProducts(data.products);
      if (data.appearance) saveAppearance(data.appearance);
      renderProductTable();
      initAppearancePanel();
      generateProductsHTML();
      showToast('Data imported successfully!', 'success');
    } catch {
      showToast('Import failed — invalid file.', 'error');
    }
  };
  reader.readAsText(file);
}

// Clear ALL localStorage data for this site (destructive!)
function clearAllData() {
  if (!confirm('⚠ This will delete ALL products and appearance settings. Are you sure?')) return;
  if (!confirm('Really sure? This cannot be undone.')) return;
  localStorage.removeItem('products');
  localStorage.removeItem('appearance');
  localStorage.removeItem('admin_password');
  renderProductTable();
  initAppearancePanel();
  generateProductsHTML();
  showToast('All data cleared.', 'success');
}


/* ------------------------------------------------------------
   SECTION 7: TOAST NOTIFICATIONS
   Brief message that appears bottom-right and fades out.
   type: 'success' | 'error'
   ------------------------------------------------------------ */
let toastTimer = null;

function showToast(message, type) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className   = 'show ' + (type || 'success');

  // Clear any existing timer so rapid calls don't overlap
  if (toastTimer) clearTimeout(toastTimer);

  // Auto-dismiss after 2.8 seconds
  toastTimer = setTimeout(function () {
    toast.className = '';
  }, 2800);
}
