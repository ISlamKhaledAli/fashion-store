/**
 * Shared animation utilities for the Fashion Store frontend.
 */

export const flyToCart = (
  target: React.RefObject<HTMLElement | null> | HTMLElement | null,
  onComplete?: () => void
) => {
  try {
    const cartIcon = document.getElementById("cart-icon");

    // Resolve the element from either RefObject or direct Element
    const element = target && "current" in target ? target.current : target;

    const imgRect = element?.getBoundingClientRect();
    const cartRect = cartIcon?.getBoundingClientRect();

    if (!imgRect || !cartRect || !element) {
      // Graceful fallback: trigger cart bounce anyway
      if (cartIcon) {
        cartIcon.classList.add("cart-bounce");
        setTimeout(() => cartIcon.classList.remove("cart-bounce"), 300);
      }
      onComplete?.();
      return;
    }

    const clone = document.createElement("img");
    if (element instanceof HTMLImageElement && element.src) {
      clone.src = element.src;
    } else {
      const nestedImg = element.querySelector("img");
      if (nestedImg && nestedImg.src) {
        clone.src = nestedImg.src;
      }
    }

    if (!clone.src) {
      if (cartIcon) {
        cartIcon.classList.add("cart-bounce");
        setTimeout(() => cartIcon.classList.remove("cart-bounce"), 300);
      }
      onComplete?.();
      return;
    }

    clone.style.cssText = `
      position: fixed;
      top: ${imgRect.top}px;
      left: ${imgRect.left}px;
      width: ${imgRect.width}px;
      height: ${imgRect.height}px;
      border-radius: 6px;
      z-index: 99999;
      pointer-events: none;
      object-fit: cover;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      transition: transform 0.85s cubic-bezier(0.2, 0.8, 0.2, 1),
                  top 0.85s cubic-bezier(0.2, 0.8, 0.2, 1),
                  left 0.85s cubic-bezier(0.2, 0.8, 0.2, 1),
                  width 0.85s cubic-bezier(0.2, 0.8, 0.2, 1),
                  height 0.85s cubic-bezier(0.2, 0.8, 0.2, 1),
                  opacity 0.85s ease-in,
                  border-radius 0.85s ease;
      will-change: transform, top, left, width, height, opacity;
    `;
    document.body.appendChild(clone);

    // Double RAF ensures initial position is painted before transition kicks in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        clone.style.top = `${cartRect.top + cartRect.height / 2 - 12}px`;
        clone.style.left = `${cartRect.left + cartRect.width / 2 - 12}px`;
        clone.style.width = "24px";
        clone.style.height = "24px";
        clone.style.opacity = "0.2";
        clone.style.borderRadius = "50%";
      });
    });

    const cleanup = () => {
      if (clone.parentNode) {
        clone.remove();
      }
      if (cartIcon) {
        cartIcon.classList.add("cart-bounce");
        setTimeout(() => cartIcon.classList.remove("cart-bounce"), 300);
      }
      onComplete?.();
    };

    setTimeout(cleanup, 900);
  } catch (err) {
    console.error("flyToCart error:", err);
    onComplete?.();
  }
};
