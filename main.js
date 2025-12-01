/**
 * Results Driven - Main JavaScript
 * Modernized with privacy protection for contact information
 */

(function() {
  "use strict";

  // ===========================================
  // PRIVACY PROTECTION - Contact Info Obfuscation
  // ===========================================
  
  /**
   * Decode obfuscated contact information
   * This prevents bots from easily scraping email/phone
   */
  const ContactProtection = {
    // ROT13-style encoding for basic obfuscation
    decode: function(encoded) {
      return encoded.split('').map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          return String.fromCharCode(((code - 65 + 13) % 26) + 65);
        } else if (code >= 97 && code <= 122) {
          return String.fromCharCode(((code - 97 + 13) % 26) + 97);
        }
        return char;
      }).join('');
    },
    
    // Encoded contact details (ROT13 encoded)
    // Original: phil@resultsdriven.co.uk -> encoded
    // Original: 07812105882 -> stored as parts
    getEmail: function() {
      const parts = ['cuvy', '@', 'erfhygfqevira', '.pb.hx'];
      return parts.map(p => this.decode(p)).join('');
    },
    
    getPhone: function() {
      // Store as array of number parts to prevent simple scraping
      const parts = ['078', '121', '058', '82'];
      return parts.join('');
    },
    
    // Initialize contact links after page load
    init: function() {
      const emailContainer = document.querySelector('#email-contact');
      const phoneContainer = document.querySelector('#phone-contact');
      
      if (emailContainer) {
        const email = this.getEmail();
        const contactInfo = emailContainer.querySelector('.contact-info');
        if (contactInfo) {
          const link = document.createElement('a');
          link.href = 'mailto:' + email;
          link.textContent = email;
          link.setAttribute('aria-label', 'Send email');
          contactInfo.appendChild(link);
        }
        
        // Make the whole card clickable
        emailContainer.addEventListener('click', function() {
          window.location.href = 'mailto:' + email;
        });
      }
      
      if (phoneContainer) {
        const phone = this.getPhone();
        const formattedPhone = phone.replace(/(\d{5})(\d{6})/, '$1 $2');
        const contactInfo = phoneContainer.querySelector('.contact-info');
        if (contactInfo) {
          const link = document.createElement('a');
          link.href = 'tel:' + phone;
          link.textContent = formattedPhone;
          link.setAttribute('aria-label', 'Call phone number');
          contactInfo.appendChild(link);
        }
        
        // Make the whole card clickable
        phoneContainer.addEventListener('click', function() {
          window.location.href = 'tel:' + phone;
        });
      }
    }
  };

  // ===========================================
  // UTILITY FUNCTIONS
  // ===========================================
  
  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim();
    if (all) {
      return [...document.querySelectorAll(el)];
    } else {
      return document.querySelector(el);
    }
  };

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all);
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener));
      } else {
        selectEl.addEventListener(type, listener);
      }
    }
  };

  /**
   * Easy on scroll event listener
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener);
  };

  // ===========================================
  // HEADER & NAVIGATION
  // ===========================================

  /**
   * Toggle header scrolled class
   */
  const selectHeader = select('#header');
  if (selectHeader) {
    const headerScrolled = () => {
      if (window.scrollY > 100) {
        selectHeader.classList.add('header-scrolled');
      } else {
        selectHeader.classList.remove('header-scrolled');
      }
    };
    window.addEventListener('load', headerScrolled);
    onscroll(document, headerScrolled);
  }

  /**
   * Navbar links active state on scroll
   */
  const navbarlinks = select('#navbar .scrollto', true);
  const navbarlinksActive = () => {
    const position = window.scrollY + 200;
    navbarlinks.forEach(navbarlink => {
      if (!navbarlink.hash) return;
      const section = select(navbarlink.hash);
      if (!section) return;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navbarlink.classList.add('active');
      } else {
        navbarlink.classList.remove('active');
      }
    });
  };
  window.addEventListener('load', navbarlinksActive);
  onscroll(document, navbarlinksActive);

  /**
   * Mobile navigation toggle
   */
  const mobileNavToggle = select('.mobile-nav-toggle');
  const navbar = select('.navbar');
  
  if (mobileNavToggle) {
    mobileNavToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      navbar.classList.toggle('active');
      this.classList.toggle('active');
      this.setAttribute('aria-expanded', navbar.classList.contains('active'));
      
      // Toggle overlay
      let overlay = select('.nav-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'nav-overlay';
        document.body.appendChild(overlay);
        overlay.addEventListener('click', closeNavbar);
      }
      overlay.classList.toggle('active');
    });
  }
  
  function closeNavbar() {
    if (navbar) navbar.classList.remove('active');
    if (mobileNavToggle) {
      mobileNavToggle.classList.remove('active');
      mobileNavToggle.setAttribute('aria-expanded', 'false');
    }
    const overlay = select('.nav-overlay');
    if (overlay) overlay.classList.remove('active');
  }

  // Close mobile nav on link click
  on('click', '.navbar .nav-link', function(e) {
    closeNavbar();
  }, true);

  // ===========================================
  // SMOOTH SCROLLING
  // ===========================================

  /**
   * Scrolls to an element with header offset
   */
  const scrollto = (el) => {
    const header = select('#header');
    const offset = header ? header.offsetHeight : 0;
    const element = select(el);
    
    if (!element) return;
    
    const elementPos = element.offsetTop;
    window.scrollTo({
      top: elementPos - offset - 20,
      behavior: 'smooth'
    });
  };

  /**
   * Scroll with offset on links with .scrollto class
   */
  on('click', '.scrollto', function(e) {
    if (select(this.hash)) {
      e.preventDefault();
      scrollto(this.hash);
    }
  }, true);

  /**
   * Scroll with offset on page load with hash links in the url
   */
  window.addEventListener('load', () => {
    if (window.location.hash) {
      if (select(window.location.hash)) {
        scrollto(window.location.hash);
      }
    }
  });

  // ===========================================
  // BACK TO TOP BUTTON
  // ===========================================

  const backtotop = select('.back-to-top');
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active');
      } else {
        backtotop.classList.remove('active');
      }
    };
    window.addEventListener('load', toggleBacktotop);
    onscroll(document, toggleBacktotop);
    
    backtotop.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ===========================================
  // FOOTER YEAR
  // ===========================================
  
  const yearElement = select('#current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // ===========================================
  // EXTERNAL LIBRARY INITIALIZATION
  // ===========================================

  /**
   * Animation on scroll (AOS)
   */
  window.addEventListener('load', () => {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false,
        offset: 50
      });
    }
  });

  /**
   * PureCounter initialization
   */
  window.addEventListener('load', () => {
    if (typeof PureCounter !== 'undefined') {
      new PureCounter();
    }
  });

  /**
   * GLightbox initialization
   */
  window.addEventListener('load', () => {
    if (typeof GLightbox !== 'undefined') {
      GLightbox({
        selector: '.glightbox'
      });
    }
  });

  // ===========================================
  // INITIALIZE ON DOM READY
  // ===========================================

  document.addEventListener('DOMContentLoaded', function() {
    // Initialize contact protection (obfuscated email/phone)
    ContactProtection.init();
    
    // Set current year in footer
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  });

  // ===========================================
  // PERFORMANCE: Lazy Loading Images
  // ===========================================
  
  if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    });
    
    lazyImages.forEach(img => {
      imageObserver.observe(img);
    });
  }

  // ===========================================
  // ACCESSIBILITY: Keyboard Navigation
  // ===========================================
  
  // Handle keyboard navigation for interactive elements
  document.addEventListener('keydown', function(e) {
    // ESC key closes mobile nav
    if (e.key === 'Escape') {
      closeNavbar();
    }
  });

  // Ensure contact cards are keyboard accessible
  const contactCards = select('.contact-card', true);
  contactCards.forEach(card => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    
    card.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
  });

})();
