export const SITE_PATH = '/';
export const ABOUT_PATH = '/about';
export const KITS_PATH = '/kits';
export const GUIDE_PATH = '/guide';
export const RULES_PATH = '/rules';
export const LOGIN_PATH = '/login';
export const PANEL_ROOT_PATH = '/panel';

export const panelPath = (path = '') => {
  const normalizedPath = path.replace(/^\/+/, '');
  return normalizedPath ? `${PANEL_ROOT_PATH}/${normalizedPath}` : PANEL_ROOT_PATH;
};

export const legacyPanelPaths = [
  '/servers',
  '/servers/config',
  '/players',
  '/rcon',
  '/game/broadcasts',
  '/bans',
  '/operation/cdk',
  '/operation/matches',
  '/operation/vip',
  '/operation/calendar',
  '/users/list',
  '/users/squad-admins',
  '/logs',
  '/logs/kill',
  '/logs/chat',
  '/logs/console',
  '/logs/system',
  '/profile',
];
