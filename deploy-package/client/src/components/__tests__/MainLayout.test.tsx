import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { describe, expect, it } from 'vitest';
import MainLayout from '../MainLayout';
import authReducer, { setUser } from '../../store/authSlice';
import themeReducer from '../../store/themeSlice';

const renderWithRole = (role: string) => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      theme: themeReducer,
    },
  });

  store.dispatch(setUser({ id: 'u1', username: 'tester', role }));

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<div>主页</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

describe('MainLayout', () => {
  it('hides user management menu for observer', () => {
    renderWithRole('observer');
    expect(screen.queryByText('人员管理')).not.toBeInTheDocument();
  });

  it('shows user management menu for superadmin', () => {
    renderWithRole('superadmin');
    fireEvent.click(screen.getByText('人员管理'));
    expect(screen.getByText('平台用户')).toBeInTheDocument();
    expect(screen.getByText('游戏管理员')).toBeInTheDocument();
  });
});
