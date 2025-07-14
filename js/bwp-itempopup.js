// Toggle for enabling/disabling custom product details popup
const BWP_ENABLE_CUSTOM_POPUP = false; // Set to false to disable custom popup and use Booqable default

// Block Booqable's click handlers immediately (runs before DOM is ready)
(function() {
  // Sanitize helper function
  function sanitize(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

// I am wanting everything below here to only run if the BWP_ENABLE_CUSTOM_POPUP is true
if(!BWP_ENABLE_CUSTOM_POPUP)
  {
    console.log("Custom popup disabled. Skipping script.");
    return;
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
    });


    // Helper: get cart_id from page (if present)
    function getCartId() {
      // Prefer localStorage key 'bqCartId' if present
      try {
        const id = window.localStorage.getItem('bqCartId');
        if (id && typeof id === 'string' && id.length > 10) return id;
      } catch {}
      return null;
    }

    // Extract description/images from DOM as fallback
    let description = productInner.querySelector('.bq-product-description.rx-reset.rx-content p')?.textContent?.trim();
    const imageNodesDom = productInner.querySelectorAll('.BFocalImage-citTcH img');
    let images = Array.from(imageNodesDom).map(img => img.src).filter(Boolean);
    let imageIndex = 0;
    let fallbackPopulated = false;

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

      // --- Fetch product details from Booqable API ---
      const apiUrl = 'https://timeless-events-party-rentals-ltd.booqableshop.com/api/3/product_groups';
      const cartId = getCartId();
      const payload = {
        ids: [productId],
        include: 'photos,products',
      };
      if (cartId) payload.cart_id = cartId;
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*',
          'Origin': window.location.origin,
        },
        body: JSON.stringify(payload),
      })
        .then(resp => resp.ok ? resp.json() : Promise.reject(resp))
        .then(data => {
          if (data && data.data && data.data.length > 0) {
            const prod = data.data[0];
            const attr = prod.attributes || {};
            // Description may be HTML
            description = attr.description || description || 'No description available.';
            // Find all photo IDs
            let photoIds = [];
            if (prod.relationships && prod.relationships.photos && prod.relationships.photos.data) {
              photoIds = prod.relationships.photos.data.map(p => p.id);
            }
            // Map photo IDs to URLs from included
            if (data.included && Array.isArray(data.included)) {
              images = photoIds.map(pid => {
                const photo = data.included.find(p => p.id === pid && p.type === 'photo');
                return photo?.attributes?.large_url || photo?.attributes?.original_url || null;
              }).filter(Boolean);
            }
            // Update modal with API data
            if (descEl) {
              descEl.innerHTML = description;
            }
            if (images.length > 0) {
              updateGallery(images);
            }
          } else {
            // Fallback to DOM data
            fallbackPopulate();
          }
        })
        .catch(() => {
          // Fallback to DOM data
          fallbackPopulate();
        });

      // Helper: update gallery UI
      function updateGallery(imgArr) {
        if (!galleryWrapper) {
          const imageWrapper = modal.querySelector('.bwp-image-wrapper');
          galleryWrapper = document.createElement('div');
          galleryWrapper.className = 'bwp-gallery-wrapper';
          imageWrapper.parentNode.insertBefore(galleryWrapper, imageWrapper.nextSibling);
        }
        galleryWrapper.innerHTML = '';
        images = imgArr;
        imageIndex = 0;
        setMainImage(0);
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
          // Arrows
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
      }

      // Helper: set main image and highlight thumbnail
      function setMainImage(idx) {
        if (imageEl && images[idx]) {
          imageEl.src = images[idx];
          imageEl.alt = title + ' image ' + (idx + 1);
        }
        // Highlight selected thumbnail
        if (galleryWrapper) {
          Array.from(galleryWrapper.querySelectorAll('.bwp-thumb')).forEach((thumb, i) => {
            thumb.classList.toggle('active', i === idx);
          });
        }
      }

      // Fallback: populate from DOM if API fails
      function fallbackPopulate() {
        if (fallbackPopulated) return;
        fallbackPopulated = true;
        if (descEl) descEl.textContent = description || 'No description available.';
        updateGallery(images);
      }

      // (Declarations moved above; do not redeclare)
      // (Removed duplicate modal population and setMainImage function)

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
          addButton.disabled = true;
          addButton.textContent = 'Adding...';

          // Prepare payload for /api/1/cart/book
          const cartId = getCartId();
          const payload = {
            item_id: productId,
            quantity: 1,
            configuration: { products: {} },
          };
          if (cartId) payload.id = cartId;

          fetch('https://timeless-events-party-rentals-ltd.booqableshop.com/api/1/cart/book', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json, text/plain, */*',
              'Origin': window.location.origin,
            },
            body: JSON.stringify(payload),
            credentials: 'include', // In case cookies/session are needed
          })
          .then(resp => resp.ok ? resp.json() : Promise.reject(resp))
          .then(data => {
            addButton.disabled = false;
            addButton.textContent = price ? `Add to Cart - ${price}` : 'Add to Cart';
            // Success feedback
            alert('Added to cart!');
            modal.classList.remove('active');
            document.body.style.overflow = '';
            // Optionally, update cart UI or show a toast
          })
          .catch(async err => {
            addButton.disabled = false;
            addButton.textContent = price ? `Add to Cart - ${price}` : 'Add to Cart';
            let msg = 'Failed to add to cart.';
            if (err && err.json) {
              try {
                const json = await err.json();
                if (json && json.error) msg += `\n${json.error}`;
              } catch {}
            }
            alert(msg);
          });
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