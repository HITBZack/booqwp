// Block Booqable's click handlers immediately (runs before DOM is ready)
(function() {
  // Sanitize helper function
  function sanitize(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Remove box-shadow from Booqable product cards (handles inline styles)
function removeProductBoxShadows() {
  document.querySelectorAll('.booqable-product-inner').forEach(el => {
    el.style.setProperty('box-shadow', 'none', 'important');
  });
}

document.addEventListener('DOMContentLoaded', removeProductBoxShadows);
setTimeout(removeProductBoxShadows, 1000);

const boxShadowObserver = new MutationObserver(removeProductBoxShadows);
boxShadowObserver.observe(document.body, { childList: true, subtree: true });

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
    const productId = product.getAttribute('data-id') || '';

    // Extract description
    let description = productInner.querySelector('.bq-product-description.rx-reset.rx-content p')?.textContent?.trim();
    if (!description) {
      // Try fallback to just .bq-product-description
      description = productInner.querySelector('.bq-product-description')?.textContent?.trim();
    }
    if (!description) {
      description = 'No description available.';
    }

    // Extract all images for gallery
    const imageNodes = productInner.querySelectorAll('.BFocalImage-citTcH img');
    const images = Array.from(imageNodes).map(img => img.src).filter(Boolean);
    let imageIndex = 0;

    // Update modal content
    const modal = document.getElementById('bwp-modal');
    if (modal) {
      const titleEl = modal.querySelector('.bwp-title');
      const priceEl = modal.querySelector('.bwp-price');
      const imageEl = modal.querySelector('.bwp-main-image');
      const addButton = modal.querySelector('.bwp-add-button');
      const descEl = modal.querySelector('.bwp-description');
      let galleryWrapper = modal.querySelector('.bwp-gallery-wrapper');

      if (titleEl) titleEl.innerHTML = sanitize(title);
      if (priceEl) priceEl.textContent = price;
      if (descEl) descEl.textContent = description;

      // If gallery wrapper doesn't exist, create it below image wrapper
      if (!galleryWrapper) {
        const imageWrapper = modal.querySelector('.bwp-image-wrapper');
        galleryWrapper = document.createElement('div');
        galleryWrapper.className = 'bwp-gallery-wrapper';
        imageWrapper.parentNode.insertBefore(galleryWrapper, imageWrapper.nextSibling);
      }
      galleryWrapper.innerHTML = '';

      // Helper to update main image and highlight thumbnail
      function setMainImage(idx) {
        if (imageEl && images[idx]) {
          imageEl.src = images[idx];
          imageEl.alt = title + ' image ' + (idx + 1);
        }
        // Highlight selected thumbnail
        Array.from(galleryWrapper.querySelectorAll('.bwp-thumb')).forEach((thumb, i) => {
          thumb.classList.toggle('active', i === idx);
        });
      }

      // Render thumbnails
      if (images.length > 1) {
        images.forEach((src, i) => {
          const thumb = document.createElement('img');
          thumb.src = src;
          thumb.className = 'bwp-thumb' + (i === 0 ? ' active' : '');
          thumb.alt = title + ' preview ' + (i + 1);
          thumb.style.width = '48px';
          thumb.style.height = '48px';
          thumb.style.margin = '0 4px';
          thumb.style.cursor = 'pointer';
          thumb.onclick = () => {
            imageIndex = i;
            setMainImage(i);
          };
          galleryWrapper.appendChild(thumb);
        });
        // Optional: Add left/right arrows
        const left = document.createElement('span');
        left.textContent = '◀';
        left.className = 'bwp-arrow bwp-arrow-left';
        left.style.cursor = 'pointer';
        left.style.marginRight = '8px';
        left.onclick = () => {
          imageIndex = (imageIndex - 1 + images.length) % images.length;
          setMainImage(imageIndex);
        };
        const right = document.createElement('span');
        right.textContent = '▶';
        right.className = 'bwp-arrow bwp-arrow-right';
        right.style.cursor = 'pointer';
        right.style.marginLeft = '8px';
        right.onclick = () => {
          imageIndex = (imageIndex + 1) % images.length;
          setMainImage(imageIndex);
        };
        galleryWrapper.insertBefore(left, galleryWrapper.firstChild);
        galleryWrapper.appendChild(right);
      }

      // Set initial main image
      setMainImage(0);

      if (imageEl) {
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
    const modals = document.querySelectorAll('.booqable-modal, .bq-modal, [class*="modal"], [class*="Modal"]');

    modals.forEach(el => {
      if (!el.closest('#bwp-modal')) {
        el.remove();
      }
    });
  };
  
  // Run immediately and also after a short delay (in case they load later)
  removeBooqableModals();
  setTimeout(removeBooqableModals, 1000);
  
  // Also clean up any modals that might appear later
  const observer = new MutationObserver(removeBooqableModals);
  observer.observe(document.body, { childList: true, subtree: true });
});