import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import OfficialSite from '../pages/OfficialSite';

describe('OfficialSite', () => {
  it('renders hero content and entry actions', () => {
    render(
      <MemoryRouter>
        <OfficialSite />
      </MemoryRouter>
    );

    expect(screen.getByText('SQUAD COMMUNITY')).toBeInTheDocument();
    expect(screen.getAllByText('【FY】肥鸭服务器').length).toBeGreaterThan(0);
    expect(screen.getByText('立即加入QQ群')).toBeInTheDocument();
    expect(screen.getByText('打开QQ群邀请链接')).toBeInTheDocument();
    expect(screen.getByText('阅读服务器规则')).toBeInTheDocument();
    expect(screen.getByText('sq-fy.cn')).toBeInTheDocument();
    expect(screen.getAllByText('147724008').length).toBeGreaterThan(0);
  });
});
