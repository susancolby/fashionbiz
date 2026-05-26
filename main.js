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
