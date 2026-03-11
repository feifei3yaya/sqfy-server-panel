import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import UserAvatar from '../UserAvatar';

describe('UserAvatar', () => {
  it('renders with provided src', () => {
    const src = 'https://example.com/avatar.png';
    render(<UserAvatar src={src} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', src);
  });

  it('renders default avatar when src is missing', () => {
    render(<UserAvatar />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/default-avatar.svg');
  });

  it('renders default avatar on error', () => {
    const src = 'https://example.com/invalid.png';
    render(<UserAvatar src={src} />);
    const img = screen.getByRole('img');
    fireEvent.error(img);
    expect(img).toHaveAttribute('src', '/default-avatar.svg');
  });

  it('has correct alt text', () => {
    render(<UserAvatar alt="Test Avatar" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', 'Test Avatar');
  });
});