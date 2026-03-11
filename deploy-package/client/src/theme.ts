import { theme } from 'antd';
import type { ThemeConfig } from 'antd';

export type ThemeMode = 'light' | 'dark';

const brand = {
  primaryDark: '#fbbf24',
  primaryLight: '#b45309',
  panelDark: 'rgba(15, 17, 21, 0.72)',
  panelDarkStrong: 'rgba(15, 17, 21, 0.88)',
  panelLight: 'rgba(255, 255, 255, 0.88)',
  panelLightStrong: '#ffffff'
};

export const darkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: brand.primaryDark,
    colorInfo: '#3b82f6',
    colorSuccess: '#22c55e',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorBgBase: '#0b0c10',
    colorBgLayout: '#0b0c10',
    colorBgContainer: brand.panelDark,
    colorBgElevated: brand.panelDarkStrong,
    colorBorder: 'rgba(251, 191, 36, 0.16)',
    colorBorderSecondary: 'rgba(251, 191, 36, 0.1)',
    colorText: '#e5e7eb',
    colorTextSecondary: '#9ca3af',
    colorTextTertiary: '#6b7280',
    colorTextQuaternary: '#4b5563',
    colorFill: 'rgba(255, 255, 255, 0.06)',
    colorFillSecondary: 'rgba(255, 255, 255, 0.04)',
    colorFillTertiary: 'rgba(255, 255, 255, 0.02)',
    colorFillQuaternary: 'rgba(255, 255, 255, 0.01)',
    colorBgSpotlight: 'rgba(251, 191, 36, 0.12)',
    borderRadius: 10,
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  components: {
    Layout: {
      bodyBg: '#0b0c10',
      headerBg: brand.panelDark,
      siderBg: brand.panelDarkStrong,
      lightSiderBg: brand.panelDarkStrong,
    },
    Menu: {
      darkItemBg: 'transparent',
      darkSubMenuItemBg: 'transparent',
      itemBg: 'transparent',
      subMenuItemBg: 'transparent',
      activeBarBorderWidth: 3,
      itemSelectedColor: brand.primaryDark,
      itemSelectedBg: 'rgba(251, 191, 36, 0.15)',
      itemHoverBg: 'rgba(251, 191, 36, 0.08)',
      itemColor: '#cbd5e1',
      itemHoverColor: '#f8fafc'
    },
    Button: {
      primaryShadow: '0 4px 14px 0 rgba(251, 191, 36, 0.35)',
      defaultShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.1)',
      fontWeight: 600,
      borderRadius: 6,
    },
    Input: {
      colorBgContainer: 'rgba(11, 12, 16, 0.6)',
      activeBorderColor: brand.primaryDark,
      hoverBorderColor: '#f59e0b',
      borderRadius: 6,
    },
    Card: {
      colorBgContainer: brand.panelDark,
      headerBg: 'rgba(251, 191, 36, 0.05)',
      borderRadiusLG: 12,
      borderRadiusSM: 8,
    },
    Table: {
      headerBg: 'rgba(251, 191, 36, 0.08)',
      headerColor: '#fbbf24',
      borderColor: 'rgba(251, 191, 36, 0.15)',
      rowHoverBg: 'rgba(251, 191, 36, 0.04)',
    },
    Select: {
      borderRadius: 6,
    },
    Dropdown: {
      borderRadiusLG: 10,
    },
    Modal: {
      borderRadiusLG: 16,
    },
    Drawer: {
      borderRadiusLG: 16,
    }
  }
};

export const lightTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: brand.primaryLight,
    colorInfo: '#1d4ed8',
    colorSuccess: '#15803d',
    colorWarning: '#b45309',
    colorError: '#b91c1c',
    colorBgBase: '#f5f7fb',
    colorBgContainer: brand.panelLight,
    colorBgElevated: brand.panelLightStrong,
    colorBgLayout: '#eef2f9',
    colorBgSpotlight: 'rgba(0, 0, 0, 0.85)',
    colorBorder: 'rgba(180, 83, 9, 0.2)',
    colorBorderSecondary: 'rgba(180, 83, 9, 0.12)',
    colorText: '#0f172a',
    colorTextSecondary: '#475569',
    colorTextTertiary: '#64748b',
    colorTextQuaternary: '#94a3b8',
    colorFill: 'rgba(15, 23, 42, 0.04)',
    colorFillSecondary: 'rgba(15, 23, 42, 0.02)',
    colorFillTertiary: 'rgba(15, 23, 42, 0.01)',
    colorFillQuaternary: 'rgba(15, 23, 42, 0.005)',
    borderRadius: 8,
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  components: {
    Layout: {
      bodyBg: '#eef2f9',
      headerBg: brand.panelLight,
      siderBg: 'rgba(255, 255, 255, 0.96)',
      lightSiderBg: 'rgba(255, 255, 255, 0.96)',
    },
    Menu: {
      darkItemBg: 'transparent',
      darkSubMenuItemBg: 'transparent',
      subMenuItemBg: 'transparent',
      activeBarBorderWidth: 3,
      itemSelectedColor: brand.primaryLight,
      itemSelectedBg: 'rgba(180, 83, 9, 0.12)',
      itemHoverBg: 'rgba(180, 83, 9, 0.08)',
      itemColor: '#475569',
      itemHoverColor: '#0f172a',
    },
    Button: {
      primaryShadow: '0 4px 14px 0 rgba(180, 83, 9, 0.35)',
      defaultShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.1)',
      fontWeight: 600,
      borderRadius: 6,
    },
    Input: {
      colorBgContainer: 'rgba(255, 255, 255, 0.98)',
      activeBorderColor: brand.primaryLight,
      hoverBorderColor: '#92400e',
      borderRadius: 6,
    },
    Card: {
      colorBgContainer: brand.panelLight,
      headerBg: 'rgba(180, 83, 9, 0.04)',
      borderRadiusLG: 12,
      borderRadiusSM: 8,
      boxShadowTertiary: '0 10px 30px rgba(15, 23, 42, 0.08)',
    },
    Table: {
      headerBg: 'rgba(180, 83, 9, 0.05)',
      headerColor: '#92400e',
      borderColor: '#e2e8f0',
      rowHoverBg: 'rgba(180, 83, 9, 0.03)',
    },
    Select: {
      borderRadius: 6,
    },
    Dropdown: {
      borderRadiusLG: 10,
    },
    Modal: {
      borderRadiusLG: 16,
    },
    Drawer: {
      borderRadiusLG: 16,
    }
  }
};

export const getTheme = (mode: ThemeMode): ThemeConfig => {
  return mode === 'dark' ? darkTheme : lightTheme;
};
