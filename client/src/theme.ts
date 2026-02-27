import { theme } from 'antd';
import type { ThemeConfig } from 'antd';

export const appTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#eab308', // Amber-500 (Tactical Gold)
    colorBgBase: '#0b0c10', // Dark tactical background
    colorBgContainer: 'rgba(21, 23, 30, 0.85)', // Semi-transparent container
    colorBgElevated: 'rgba(21, 23, 30, 0.95)', // Elevated surfaces (modals, dropdowns)
    colorBorder: 'rgba(234, 179, 8, 0.2)', // Amber border for tactical feel
    borderRadius: 2, // Sharper corners for military/tactical feel
    fontFamily: "'Inter', system-ui, sans-serif",
    colorText: '#e5e7eb',
    colorTextSecondary: '#9ca3af',
  },
  components: {
    Layout: {
      bodyBg: 'transparent',
      headerBg: 'transparent',
      siderBg: 'transparent',
      lightSiderBg: 'transparent',
    },
    Menu: {
      darkItemBg: 'transparent',
      darkSubMenuItemBg: 'transparent',
      itemBg: 'transparent',
      subMenuItemBg: 'transparent',
      activeBarBorderWidth: 0,
      itemSelectedColor: '#eab308',
      itemSelectedBg: 'rgba(234, 179, 8, 0.1)',
      itemHoverBg: 'rgba(234, 179, 8, 0.05)',
    },
    Button: {
      primaryShadow: '0 4px 14px 0 rgba(234, 179, 8, 0.3)',
      defaultShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.1)',
      fontWeight: 600,
    },
    Input: {
      colorBgContainer: 'rgba(11, 12, 16, 0.6)',
      activeBorderColor: '#eab308',
      hoverBorderColor: '#ca8a04',
    },
    Card: {
      colorBgContainer: 'rgba(21, 23, 30, 0.75)',
      headerBg: 'rgba(234, 179, 8, 0.05)',
    },
    Table: {
      headerBg: 'rgba(234, 179, 8, 0.05)',
      headerColor: '#eab308',
      borderColor: 'rgba(234, 179, 8, 0.1)',
    }
  }
};
