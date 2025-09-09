import React, { useState } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Chip
} from '@mui/material';
import {
  Language as LanguageIcon,
  Translate as TranslateIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { languages, isRTL } from '../../i18n';

interface LanguageSelectorProps {
  variant?: 'select' | 'menu' | 'chip';
  size?: 'small' | 'medium' | 'large';
  showFlag?: boolean;
  showNativeName?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'select',
  size = 'medium',
  showFlag = true,
  showNativeName = true
}) => {
  const { i18n, t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    
    // Update document direction for RTL languages
    document.dir = isRTL(languageCode) ? 'rtl' : 'ltr';
    
    // Store language preference
    localStorage.setItem('preferredLanguage', languageCode);
    
    // Close menu if using menu variant
    if (variant === 'menu') {
      setAnchorEl(null);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Select variant
  if (variant === 'select') {
    return (
      <FormControl size={size as 'medium' | 'small'} sx={{ minWidth: 120 }}>
        <InputLabel id="language-select-label">
          {t('common.language')}
        </InputLabel>
        <Select
          labelId="language-select-label"
          value={i18n.language}
          label={t('common.language')}
          onChange={(e) => handleLanguageChange(e.target.value)}
        >
          {languages.map((language) => (
            <MenuItem key={language.code} value={language.code}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {showFlag && (
                  <Typography component="span" sx={{ fontSize: '1.2em' }}>
                    {language.flag}
                  </Typography>
                )}
                <Box>
                  <Typography variant="body2">
                    {language.name}
                  </Typography>
                  {showNativeName && language.nativeName !== language.name && (
                    <Typography variant="caption" color="text.secondary">
                      {language.nativeName}
                    </Typography>
                  )}
                </Box>
                {i18n.language === language.code && (
                  <CheckIcon color="primary" fontSize="small" />
                )}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  // Chip variant
  if (variant === 'chip') {
    return (
      <Tooltip title={t('common.language')}>
        <Chip
          icon={<TranslateIcon />}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {showFlag && currentLanguage.flag}
              {showNativeName ? currentLanguage.nativeName : currentLanguage.name}
            </Box>
          }
          onClick={handleMenuOpen}
          variant="outlined"
          size={size as 'medium' | 'small'}
        />
      </Tooltip>
    );
  }

  // Menu variant (default)
  return (
    <>
      <Tooltip title={t('common.language')}>
        <IconButton
          onClick={handleMenuOpen}
          size={size}
          sx={{
            color: 'inherit',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <LanguageIcon />
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            maxHeight: 400,
            width: 280,
            '& .MuiMenuItem-root': {
              py: 1
            }
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {languages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            selected={i18n.language === language.code}
          >
            <ListItemIcon>
              <Typography component="span" sx={{ fontSize: '1.5em' }}>
                {language.flag}
              </Typography>
            </ListItemIcon>
            <ListItemText
              primary={language.name}
              secondary={showNativeName && language.nativeName !== language.name ? language.nativeName : undefined}
            />
            {i18n.language === language.code && (
              <CheckIcon color="primary" fontSize="small" />
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSelector;