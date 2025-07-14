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