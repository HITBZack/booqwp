// Block Booqable's click handlers immediately (runs before DOM is ready)
(function() {
  // Sanitize helper function
  function sanitize(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Block all click events on product elements using capture phase
  document.addEventListener('click', function(e) {
    const productInner = e.target.closest('.booqable-product-inner');
    if (!productInner) return;
    
    // Stop the event immediately in the capture phase
    e.stopImmediatePropagation();
    e.preventDefault();
    
    // Only proceed if the click is on a valid product
    const product = productInner.closest('.booqable-product');
    if (!product) return;
    
    // Extract product info
    const title = productInner.querySelector('.bq-product-name')?.textContent?.trim() || 'Product';
    const price = productInner.querySelector('.bq-price')?.textContent?.trim() || '';
    const image = productInner.querySelector('.BFocalImage-citTcH img')?.src || '';
    const productId = product.getAttribute('data-id') || '';
    
    // Update modal content
    const modal = document.getElementById('bwp-modal');
    if (modal) {
      const titleEl = modal.querySelector('.bwp-title');
      const priceEl = modal.querySelector('.bwp-price');
      const imageEl = modal.querySelector('.bwp-main-image');
      const addButton = modal.querySelector('.bwp-add-button');
      
      if (titleEl) titleEl.innerHTML = sanitize(title);
      if (priceEl) priceEl.textContent = price;
      if (imageEl) {
        imageEl.src = image;
        imageEl.alt = title;
        // Add click handler for lightbox
        imageEl.onclick = function(e) {
          e.stopPropagation();
          const lightbox = modal.querySelector('.bwp-lightbox');
          if (lightbox) {
            lightbox.querySelector('img').src = this.src;
            lightbox.classList.add('active');
          }
        };
      }
      if (addButton) {
        addButton.setAttribute('data-product-id', productId);
        addButton.textContent = price ? `Add to Cart - ${price}` : 'Add to Cart';
        addButton.onclick = function() {
          // TODO: Implement add to cart functionality
          alert(`Added ${title} to cart!`);
          modal.classList.remove('active');
          document.body.style.overflow = '';
        };
      }
      
      // Show modal with animation
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }, true); // Capture phase
  
  // Close modal when clicking outside or on close button
  document.addEventListener('click', function(e) {
    const modal = document.getElementById('bwp-modal');
    if (!modal) return;
    
    // Close lightbox if open
    const lightbox = modal.querySelector('.bwp-lightbox.active');
    if (lightbox) {
      lightbox.classList.remove('active');
      return;
    }
    
    // Close modal if clicking close button or outside content
    if (e.target.closest('.bwp-close-btn') || e.target === modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
  
  // Handle keyboard events
  document.addEventListener('keydown', function(e) {
    const modal = document.getElementById('bwp-modal');
    if (!modal || !modal.classList.contains('active')) return;
    
    if (e.key === 'Escape') {
      const lightbox = modal.querySelector('.bwp-lightbox.active');
      if (lightbox) {
        lightbox.classList.remove('active');
      } else {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  });
})();

// Clean up any Booqable modals after page loads
document.addEventListener('DOMContentLoaded', function() {
  // Remove any existing Booqable modals
  const removeBooqableModals = () => {
    document.querySelectorAll('.booqable-modal, .bq-modal, [class*="modal"], [class*="Modal"]')
      .filter(el => !el.closest('#bwp-modal'))
      .forEach(el => el.remove());
  };
  
  // Run immediately and also after a short delay (in case they load later)
  removeBooqableModals();
  setTimeout(removeBooqableModals, 1000);
  
  // Also clean up any modals that might appear later
  const observer = new MutationObserver(removeBooqableModals);
  observer.observe(document.body, { childList: true, subtree: true });
});