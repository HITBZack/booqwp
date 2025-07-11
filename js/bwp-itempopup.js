document.addEventListener('DOMContentLoaded', function () {
  // Helper to sanitize text
  function sanitize(text) {
    const div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
  }

  // Listen for product link clicks
  document.querySelectorAll('[data-booqable-product]').forEach(el => {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();

      // Fetch product details
      const title = sanitize(el.querySelector('.booqable-product-title')?.innerText || 'Product Title');
      const desc = sanitize(el.querySelector('.booqable-product-description')?.innerText || 'Description...');
      const imgSrc = el.querySelector('img')?.src || '';
      const price = sanitize(el.querySelector('.booqable-product-price')?.innerText || '');

      // Inject into modal (sync IDs with modal-template.php)
      document.getElementById('bwp-modal-title').innerHTML = title;
      document.getElementById('bwp-modal-description').innerHTML = desc;
      document.getElementById('bwp-modal-image').src = imgSrc;
      document.getElementById('bwp-modal-price').innerHTML = price;

      // Add-to-cart
      const productId = el.getAttribute('data-booqable-product');
      document.getElementById('bwp-add-to-cart').onclick = function () {
        window.Booqable.addToCart(productId, 1);
        // Optionally trigger animation here
        alert('Added to cart!');
      };

      // Show modal with animation
      const modal = document.getElementById('bwp-modal');
      modal.classList.remove('bwp-hidden');
      modal.classList.add('bwp-fade-in');
      setTimeout(() => modal.classList.remove('bwp-fade-in'), 350);
    });
  });

  // Close modal
  document.getElementById('bwp-modal-close').addEventListener('click', () => {
    const modal = document.getElementById('bwp-modal');
    modal.classList.add('bwp-fade-out');
    setTimeout(() => {
      modal.classList.add('bwp-hidden');
      modal.classList.remove('bwp-fade-out');
    }, 350);
  });

  // Lightbox logic
  document.getElementById('bwp-modal-image').addEventListener('click', () => {
    const lightbox = document.getElementById('bwp-lightbox');
    const lightboxImg = document.getElementById('bwp-lightbox-image');
    lightboxImg.src = document.getElementById('bwp-modal-image').src;
    lightbox.classList.remove('bwp-hidden');
    lightbox.classList.add('bwp-lightbox-zoom-in');
    setTimeout(() => lightbox.classList.remove('bwp-lightbox-zoom-in'), 350);
  });

  document.getElementById('bwp-lightbox-close').addEventListener('click', () => {
    const lightbox = document.getElementById('bwp-lightbox');
    lightbox.classList.add('bwp-lightbox-zoom-out');
    setTimeout(() => {
      lightbox.classList.add('bwp-hidden');
      lightbox.classList.remove('bwp-lightbox-zoom-out');
    }, 350);
  });

  // Close lightbox on overlay click
  document.getElementById('bwp-lightbox').addEventListener('click', function(e) {
    if (e.target === this) {
      document.getElementById('bwp-lightbox-close').click();
    }
  });
});