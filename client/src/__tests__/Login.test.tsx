import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Login from '../pages/Login';
import { store } from '../store';

// Mock window.matchMedia for Ant Design
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('Login Page', () => {
  it('renders login form and background image', () => {
    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Provider>
    );

    // Check if the title is present
    expect(screen.getByText('Squad 服务器管理')).toBeInTheDocument();
    
    // Check if the background image is applied to the root div
    // The root div is the first child of the container
    const rootDiv = container.firstChild;
    expect(rootDiv).toHaveStyle({
      backgroundImage: 'url(/DLYMBJ.png)',
      backgroundSize: 'cover'
    });
  });
});
