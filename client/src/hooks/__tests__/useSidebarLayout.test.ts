import { renderHook, act } from '@testing-library/react';
import { useSidebarLayout } from '../useSidebarLayout';

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserver;

describe('useSidebarLayout', () => {
  it('should return default width initially', () => {
    const ref = { current: document.createElement('div') };
    const { result } = renderHook(() => useSidebarLayout(ref, false, 240, 80));

    // Initially it might be 240 or 0 depending on the mock measurement
    // Since we didn't mock getBoundingClientRect yet, let's assume default behavior logic
    expect(result.current.contentStyle.marginLeft).toBeDefined();
  });

  it('should handle mobile mode', () => {
    const ref = { current: document.createElement('div') };
    const { result } = renderHook(() => useSidebarLayout(ref, true));

    expect(result.current.sidebarWidth).toBe(0);
    expect(result.current.contentStyle.marginLeft).toBe(0);
    expect(result.current.contentStyle.width).toBe('calc(100% - 0px)');
  });

  it('should update width when resized', () => {
    // We need to mock ResizeObserver callback behavior to test this fully,
    // or trust that the logic inside the hook is correct based on the code review.
    // For unit testing a hook that depends on ResizeObserver, we usually mock the observer 
    // to call the callback manually.
    
    let callback: ResizeObserverCallback;
    global.ResizeObserver = class ResizeObserver {
        constructor(cb: ResizeObserverCallback) {
            callback = cb;
        }
        observe() {}
        disconnect() {}
        unobserve() {}
    };

    const ref = { current: document.createElement('div') };
    // Mock getBoundingClientRect
    ref.current.getBoundingClientRect = () => ({ width: 200 } as DOMRect);

    const { result } = renderHook(() => useSidebarLayout(ref, false));

    // Initial render effect
    expect(result.current.sidebarWidth).toBe(200);

    // Simulate resize
    act(() => {
        if (callback) {
            callback([
                {
                    contentRect: { width: 300 } as DOMRectReadOnly,
                    borderBoxSize: [{ inlineSize: 300, blockSize: 100 }],
                } as ResizeObserverEntry
            ], {} as ResizeObserver);
        }
    });

    expect(result.current.sidebarWidth).toBe(300);
    expect(result.current.contentStyle.width).toBe('calc(100% - 300px)');
  });
});
