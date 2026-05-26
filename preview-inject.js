/* ============================================================
   preview-inject.js — CSS Variable Injector for Live Preview

   This file is loaded on every public page (index, products, about).
   When the page is loaded inside the admin's preview iframe, it reads
   the CSS variable overrides from the URL query string and injects
   them as a <style> block, giving a live preview of appearance changes.

   On normal (non-preview) visits, it does nothing.

   HOW IT WORKS:
   - Admin iframe loads: products.html?preview=1&--color-bg=%23fff&...
   - This script detects ?preview=1
   - Reads each CSS variable from the URL params
   - Creates a <style> block that overrides :root variables
   ============================================================ */

(function () {
  const params = new URLSearchParams(window.location.search);

  // Only run inside the admin preview
  if (params.get('preview') !== '1') return;

  // Collect all params that look like CSS custom properties (start with --)
  const overrides = [];
  params.forEach(function (value, key) {
    if (key.startsWith('--')) {
      // Sanitize: only allow safe CSS value characters
      // This prevents any CSS injection through the URL
      const safeValue = value.replace(/[^a-zA-Z0-9#%.,\-_ px]/g, '');
      overrides.push('  ' + key + ': ' + safeValue + ';');
    }
  });

  if (overrides.length === 0) return;

  // Inject a <style> tag that overrides the :root variables
  const style = document.createElement('style');
  style.id = 'admin-preview-overrides';
  style.textContent = ':root {\n' + overrides.join('\n') + '\n}';
  document.head.appendChild(style);

})();
