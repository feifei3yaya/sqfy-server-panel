import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Login from '../pages/Login';
import { store } from '../store';

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
    expect(screen.getByText('战术小队')).toBeInTheDocument();
    expect(screen.getByText('服务器管理系统')).toBeInTheDocument();
    
    // Check if the background image is applied to the root div
    // The root div is the first child of the container
    const rootDiv = container.firstChild as HTMLElement;
    expect(rootDiv.getAttribute('style') || '').toContain('/bg.jpg');
  });
});
