// Performance optimization utilities

// Debounce function for search and input handling
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for scroll and resize events
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Image lazy loading utility
export const lazyLoadImage = (img, src) => {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const image = entry.target;
        image.src = src;
        image.classList.remove('lazy');
        imageObserver.unobserve(image);
      }
    });
  });

  imageObserver.observe(img);
};

// Preload critical resources
export const preloadResource = (href, as = 'script') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
};

// Bundle size optimization - tree shaking helper
export const importOnly = (module, exports) => {
  return exports.reduce((acc, exportName) => {
    acc[exportName] = module[exportName];
    return acc;
  }, {});
};

// Memory management - cleanup function
export const cleanup = (cleanupFunctions) => {
  return () => {
    cleanupFunctions.forEach(cleanup => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    });
  };
};

// Performance monitoring
export const measurePerformance = (name, fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
  return result;
};

// Virtual scrolling helper for large lists
export const getVisibleItems = (items, containerHeight, itemHeight, scrollTop) => {
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  return {
    items: items.slice(startIndex, endIndex),
    startIndex,
    endIndex,
    totalHeight: items.length * itemHeight
  };
};

// Cache management
export const createCache = (maxSize = 100) => {
  const cache = new Map();
  
  return {
    get: (key) => cache.get(key),
    set: (key, value) => {
      if (cache.size >= maxSize) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      cache.set(key, value);
    },
    clear: () => cache.clear(),
    size: () => cache.size
  };
};

// Web Workers for heavy computations
export const createWorker = (workerFunction) => {
  const blob = new Blob([`(${workerFunction.toString()})()`], {
    type: 'application/javascript'
  });
  return new Worker(URL.createObjectURL(blob));
};

// Service Worker registration for caching
export const registerServiceWorker = async () => {
  // Disable service worker for local development to avoid offline detection issues
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    try {
      // Only register if sw.js exists (check first)
      const response = await fetch('/sw.js', { method: 'HEAD' });
      if (response.ok) {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        return registration;
      } else {
        console.log('Service Worker file not found, skipping registration');
      }
    } catch (error) {
      // Silently fail - service worker is optional
      console.log('Service Worker registration skipped:', error.message);
    }
  } else {
    // Unregister any existing service workers in development
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
          await registration.unregister();
          console.log('Service Worker unregistered for development');
        }
        // Also clear all caches
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
          console.log('All caches cleared');
        }
      } catch (error) {
        console.log('Service Worker unregistration skipped:', error.message);
      }
    }
    console.log('Service Worker registration skipped (development mode)');
  }
};

// Critical CSS inlining
export const inlineCriticalCSS = (css) => {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
};

// Resource hints for better loading
export const addResourceHints = (resources) => {
  resources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = resource.rel || 'prefetch';
    link.href = resource.href;
    if (resource.as) link.as = resource.as;
    if (resource.crossorigin) link.crossOrigin = resource.crossorigin;
    document.head.appendChild(link);
  });
};
