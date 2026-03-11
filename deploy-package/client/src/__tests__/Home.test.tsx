import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import Home from '../pages/Home';
import { store } from '../store';
import * as api from '../api/dashboard';

// Mock ResizeObserver
beforeAll(() => {
  // @ts-ignore
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div className="recharts-responsive-container">{children}</div>,
  AreaChart: () => <div>AreaChart</div>,
  Area: () => <div>Area</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  CartesianGrid: () => <div>CartesianGrid</div>,
  Tooltip: () => <div>Tooltip</div>,
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}));

describe('Home Page', () => {
  beforeEach(() => {
    vi.spyOn(api, 'getDashboardStats').mockResolvedValue({
      data: {
        summary: {
          totalServers: 10,
          onlineServers: 8,
          totalPlayers: 500,
          activeAdmins: 5
        },
        serverStatuses: [
           { id: '1', name: 'Server 1', status: 'connected', playerCount: 50, maxPlayers: 100, map: 'Map1' }
        ],
        recentBans: [],
        activeAdmins: [],
        chartData: []
      }
    } as any);
  });

  it('renders dashboard stats after loading', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>
    );

    // Wait for the data to be loaded and displayed
    await waitFor(() => {
      // Check for total players (Statistic component renders value)
      expect(screen.getByText('500')).toBeInTheDocument();
      // Check for active servers
      expect(screen.getByText('8')).toBeInTheDocument();
      // Check for active admins
      expect(screen.getByText('5')).toBeInTheDocument();
      // Check for server name
      expect(screen.getByText('Server 1')).toBeInTheDocument();
    });
  });

  it('shows friendly error and supports retry when loading fails', async () => {
    vi.spyOn(api, 'getDashboardStats')
      .mockRejectedValueOnce(new Error('网络异常'))
      .mockResolvedValueOnce({
        data: {
          summary: {
            totalServers: 1,
            onlineServers: 1,
            totalPlayers: 10,
            activeAdmins: 1
          },
          serverStatuses: [],
          recentBans: [],
          activeAdmins: [],
          chartData: []
        }
      } as any);

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('数据加载异常')).toBeInTheDocument();
      expect(screen.getByText('网络异常')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '重新加载' }));

    await waitFor(() => {
      expect(screen.queryByText('数据加载异常')).not.toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });
});
