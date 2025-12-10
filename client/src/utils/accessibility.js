// Accessibility utilities and helpers

// ARIA labels and descriptions
export const ariaLabels = {
  // Navigation
  mainNavigation: 'Main navigation',
  userMenu: 'User menu',
  searchInput: 'Search',
  
  // Actions
  startAnalysis: 'Start analysis',
  stopAnalysis: 'Stop analysis',
  uploadFile: 'Upload file',
  downloadResults: 'Download results',
  viewDashboard: 'View dashboard',
  
  // Status
  loading: 'Loading',
  error: 'Error',
  success: 'Success',
  warning: 'Warning',
  
  // Content
  liveMetrics: 'Live communication metrics',
  analysisResults: 'Analysis results',
  featureDescription: 'Feature description',
  
  // Interactive elements
  closeModal: 'Close modal',
  expandDetails: 'Expand details',
  collapseDetails: 'Collapse details',
  nextSlide: 'Next slide',
  previousSlide: 'Previous slide',
};

// Keyboard navigation helpers
export const keyboardNavigation = {
  // Key codes
  KEYS: {
    ENTER: 'Enter',
    SPACE: ' ',
    ESCAPE: 'Escape',
    TAB: 'Tab',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    HOME: 'Home',
    END: 'End',
  },

  // Handle keyboard events
  handleKeyDown: (event, handlers) => {
    const { key } = event;
    
    if (handlers[key]) {
      event.preventDefault();
      handlers[key](event);
    }
  },

  // Focus management
  trapFocus: (element) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    
    // Return cleanup function
    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  },

  // Skip to content link
  createSkipLink: (targetId, text = 'Skip to main content') => {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = text;
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-purple-600 text-white px-4 py-2 rounded-lg z-50';
    skipLink.setAttribute('aria-label', text);
    return skipLink;
  },
};

// Screen reader announcements
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Color contrast utilities
export const colorContrast = {
  // Check if color combination meets WCAG standards
  checkContrast: (foreground, background) => {
    // Simplified contrast calculation
    // In a real implementation, you'd use a proper contrast calculation library
    const fgLuminance = colorContrast.getLuminance(foreground);
    const bgLuminance = colorContrast.getLuminance(background);
    
    const contrast = (Math.max(fgLuminance, bgLuminance) + 0.05) / 
                     (Math.min(fgLuminance, bgLuminance) + 0.05);
    
    return {
      ratio: contrast,
      meetsAA: contrast >= 4.5,
      meetsAAA: contrast >= 7,
    };
  },

  // Get luminance of a color
  getLuminance: (color) => {
    // Simplified luminance calculation
    // In a real implementation, you'd parse the color properly
    return 0.5; // Placeholder
  },
};

// Focus management
export const focusManagement = {
  // Save current focus
  saveFocus: () => {
    const activeElement = document.activeElement;
    if (activeElement && activeElement !== document.body) {
      activeElement.setAttribute('data-previous-focus', 'true');
    }
  },

  // Restore previous focus
  restoreFocus: () => {
    const previousFocus = document.querySelector('[data-previous-focus="true"]');
    if (previousFocus) {
      previousFocus.focus();
      previousFocus.removeAttribute('data-previous-focus');
    }
  },

  // Focus first focusable element
  focusFirst: (container) => {
    const focusable = container.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable) {
      focusable.focus();
    }
  },

  // Focus last focusable element
  focusLast: (container) => {
    const focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length > 0) {
      focusable[focusable.length - 1].focus();
    }
  },
};

// ARIA helpers
export const ariaHelpers = {
  // Set ARIA attributes
  setAttributes: (element, attributes) => {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  },

  // Toggle ARIA expanded
  toggleExpanded: (element, isExpanded) => {
    element.setAttribute('aria-expanded', isExpanded.toString());
  },

  // Set ARIA described by
  setDescribedBy: (element, descriptionId) => {
    element.setAttribute('aria-describedby', descriptionId);
  },

  // Set ARIA labelled by
  setLabelledBy: (element, labelId) => {
    element.setAttribute('aria-labelledby', labelId);
  },

  // Set ARIA hidden
  setHidden: (element, isHidden) => {
    element.setAttribute('aria-hidden', isHidden.toString());
  },
};

// Motion preferences
export const motionPreferences = {
  // Check if user prefers reduced motion
  prefersReducedMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Get motion-safe animation properties
  getMotionSafeProps: (defaultProps) => {
    if (motionPreferences.prefersReducedMotion()) {
      return {
        ...defaultProps,
        transition: { duration: 0 },
        animate: defaultProps.initial,
      };
    }
    return defaultProps;
  },
};

// High contrast mode
export const highContrast = {
  // Check if user prefers high contrast
  prefersHighContrast: () => {
    return window.matchMedia('(prefers-contrast: high)').matches;
  },

  // Apply high contrast styles
  applyHighContrast: () => {
    if (highContrast.prefersHighContrast()) {
      document.body.classList.add('high-contrast');
    }
  },
};

// Font size preferences
export const fontSizePreferences = {
  // Check user's font size preference
  getFontSizePreference: () => {
    const saved = localStorage.getItem('eloquent_ai_font_size');
    return saved || 'medium';
  },

  // Set font size
  setFontSize: (size) => {
    const sizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
      extraLarge: '20px',
    };
    
    document.documentElement.style.fontSize = sizes[size];
    localStorage.setItem('eloquent_ai_font_size', size);
  },

  // Apply saved font size
  applyFontSize: () => {
    const size = fontSizePreferences.getFontSizePreference();
    fontSizePreferences.setFontSize(size);
  },
};

// Accessibility testing helpers
export const accessibilityTesting = {
  // Check for common accessibility issues
  runBasicChecks: () => {
    const issues = [];

    // Check for missing alt text
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
      if (!img.alt && !img.getAttribute('aria-label')) {
        issues.push(`Image ${index + 1} missing alt text`);
      }
    });

    // Check for missing form labels
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach((input, index) => {
      if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (!label) {
          issues.push(`Form input ${index + 1} missing label`);
        }
      }
    });

    // Check for missing heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > previousLevel + 1) {
        issues.push(`Heading hierarchy issue at heading ${index + 1}`);
      }
      previousLevel = level;
    });

    return issues;
  },

  // Generate accessibility report
  generateReport: () => {
    const issues = accessibilityTesting.runBasicChecks();
    const report = {
      timestamp: new Date().toISOString(),
      issues: issues,
      score: Math.max(0, 100 - (issues.length * 10)),
      recommendations: [
        'Ensure all images have descriptive alt text',
        'Provide labels for all form inputs',
        'Maintain proper heading hierarchy',
        'Use sufficient color contrast',
        'Provide keyboard navigation',
        'Include focus indicators',
      ],
    };

    return report;
  },
};

// Initialize accessibility features
export const initializeAccessibility = () => {
  // Apply saved preferences
  fontSizePreferences.applyFontSize();
  highContrast.applyHighContrast();

  // Add skip link
  const skipLink = keyboardNavigation.createSkipLink('main-content');
  document.body.insertBefore(skipLink, document.body.firstChild);

  // Set up reduced motion
  if (motionPreferences.prefersReducedMotion()) {
    document.body.classList.add('reduced-motion');
  }

  // Announce page load
  announceToScreenReader('Page loaded successfully');

  console.log('Accessibility features initialized');
};

export default {
  ariaLabels,
  keyboardNavigation,
  announceToScreenReader,
  colorContrast,
  focusManagement,
  ariaHelpers,
  motionPreferences,
  highContrast,
  fontSizePreferences,
  accessibilityTesting,
  initializeAccessibility,
};
