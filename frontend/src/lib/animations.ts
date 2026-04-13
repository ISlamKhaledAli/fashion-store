/**
 * Shared animation utilities for the Fashion Store frontend.
 */

let isFlying = false;

export const flyToCart = (
  target: React.RefObject<HTMLElement | null> | HTMLElement | null,
  onComplete?: () => void
) => {
  if (isFlying) return;
  isFlying = true;

  const cartIcon = document.getElementById('cart-icon');
  
  // Resolve the element from either RefObject or direct Element
  const element = target && 'current' in target ? target.current : target;
  
  const imgRect = element?.getBoundingClientRect();
  const cartRect = cartIcon?.getBoundingClientRect();
  
  if (!imgRect || !cartRect || !element) {
    onComplete?.();
    return;
  }
  
  const clone = document.createElement('img');
  if (element instanceof HTMLImageElement) {
    clone.src = element.src;
  } else {
    // If it's not an img, look for an img inside it or use a placeholder/transparent if needed
    const nestedImg = element.querySelector('img');
    if (nestedImg) clone.src = nestedImg.src;
  }
  
  clone.style.cssText = `
    position: fixed;
    top: ${imgRect.top}px;
    left: ${imgRect.left}px;
    width: ${imgRect.width}px;
    height: ${imgRect.height}px;
    border-radius: 4px;
    z-index: 9999;
    pointer-events: none;
    transition: all 1.0s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    object-fit: cover;
  `;
  document.body.appendChild(clone);
  
  requestAnimationFrame(() => {
    clone.style.top = `${cartRect.top}px`;
    clone.style.left = `${cartRect.left}px`;
    clone.style.width = '20px';
    clone.style.height = '20px';
    clone.style.opacity = '0';
    clone.style.borderRadius = '50%';
  });
  
  setTimeout(() => {
    clone.remove();
    cartIcon?.classList.add('cart-bounce');
    setTimeout(() => cartIcon?.classList.remove('cart-bounce'), 300);
    isFlying = false;
    onComplete?.();
  }, 1050);
};
