import React from 'react';
import { Button, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <Tooltip title={i18n.language === 'zh' ? 'Switch to English' : '切换到中文'}>
      <Button
        type="text"
        onClick={toggleLanguage}
        className="flex items-center justify-center w-8 h-8 rounded hover:bg-white/10 transition-colors"
      >
        <span className="text-amber-500 font-bold text-xs border border-amber-500/50 rounded px-1 min-w-[24px] text-center">
          {i18n.language === 'zh' ? 'CN' : 'EN'}
        </span>
      </Button>
    </Tooltip>
  );
};

export default LanguageSwitcher;
