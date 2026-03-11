import { useState, useLayoutEffect, useEffect } from 'react';

interface UseSidebarLayoutResult {
  sidebarWidth: number;
  contentStyle: {
    marginLeft: number;
    width: string;
  };
}

export const useSidebarLayout = (
  sidebarRef: React.RefObject<HTMLElement>,
  isMobile: boolean,
  defaultWidth: number = 250,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _collapsedWidth: number = 80
): UseSidebarLayoutResult => {
  const [sidebarWidth, setSidebarWidth] = useState(isMobile ? 0 : defaultWidth);

  // Use useLayoutEffect to prevent layout thrashing/flickering if possible,
  // fallback to useEffect for SSR safety (though this is client-side).
  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    if (isMobile) {
      setSidebarWidth(0);
      return;
    }

    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    // Initial measure
    const initialWidth = sidebar.getBoundingClientRect().width;
    if (initialWidth > 0) {
      setSidebarWidth(initialWidth);
    }

    // Create ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Use borderBoxSize if available for better precision, fallback to contentRect
        let width = 0;
        if (entry.borderBoxSize && entry.borderBoxSize.length > 0) {
          width = entry.borderBoxSize[0].inlineSize;
        } else {
          width = entry.contentRect.width;
        }
        
        // Update state only if width changed significantly to avoid loops
        if (width <= 0) {
          continue;
        }

        setSidebarWidth((prev) => {
          if (Math.abs(prev - width) > 0.5) {
            return width;
          }
          return prev;
        });
      }
    });

    resizeObserver.observe(sidebar);

    return () => {
      resizeObserver.disconnect();
    };
  }, [sidebarRef, isMobile]);

  // Calculate content style dynamically
  const contentStyle = {
    marginLeft: sidebarWidth,
    width: `calc(100% - ${sidebarWidth}px)`,
  };

  return {
    sidebarWidth,
    contentStyle,
  };
};
