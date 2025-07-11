document.addEventListener('DOMContentLoaded', function () {
    // Disable Booqable modal behavior
    document.querySelectorAll('[data-booqable-product]').forEach(el => {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
  
        // Simulate fetching product details
        const title = el.querySelector('.booqable-product-title')?.innerText || 'Product Title';
        const desc = el.querySelector('.booqable-product-description')?.innerText || 'Description...';
        const imgSrc = el.querySelector('img')?.src || '';
  
        // Inject into modal
        document.getElementById('bwp-title').innerText = title;
        document.getElementById('bwp-description').innerText = desc;
        document.getElementById('bwp-full-image').src = imgSrc;
  
        // Add-to-cart logic — keeps Booqable system intact
        const productId = el.getAttribute('data-booqable-product');
        document.getElementById('bwp-add-to-cart').onclick = function () {
          window.Booqable.addToCart(productId, 1); // Adds 1 qty
          alert('Added to cart!');
        };
  
        document.getElementById('bwp-modal').classList.remove('bwp-hidden');
      });
    });
  
    // Close modal
    document.querySelector('.bwp-close').addEventListener('click', () => {
      document.getElementById('bwp-modal').classList.add('bwp-hidden');
    });
  
    // Lightbox placeholder (just zoom for now)
    document.getElementById('bwp-full-image').addEventListener('click', () => {
      window.open(document.getElementById('bwp-full-image').src, '_blank');
    });
  });
  