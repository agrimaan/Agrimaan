import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  CardHeader, 
  IconButton, 
  Typography, 
  Divider, 
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Skeleton,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefreshIcon from '@mui/icons-material/Refresh';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Define prop types for the component
interface DashboardWidgetProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onFullscreen?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onRemove?: () => void;
  id?: string;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  height?: number | string;
  minHeight?: number | string;
  maxHeight?: number | string;
  noOptions?: boolean;
  helpText?: string;
}

// Define styled components
const WidgetCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const WidgetCardHeader = styled(CardHeader)(({ theme }) => ({
  padding: theme.spacing(2),
  paddingBottom: theme.spacing(1),
  '& .MuiCardHeader-action': {
    margin: 0,
  },
}));

const WidgetCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2),
  paddingTop: theme.spacing(1),
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'auto',
  '&:last-child': {
    paddingBottom: theme.spacing(2),
  },
}));

const ErrorBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3),
  color: theme.palette.error.main,
  textAlign: 'center',
  height: '100%',
}));

const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  children,
  title,
  subtitle,
  icon,
  loading = false,
  error = null,
  onRefresh,
  onFullscreen,
  onDownload,
  onShare,
  onRemove,
  id,
  sm,
  md,
  lg,
  xl,
  height = 'auto',
  minHeight = '200px',
  maxHeight = 'none',
  noOptions = false,
  helpText
}) => {
  const theme = useTheme();
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  // Handle menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // Handle fullscreen toggle
  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
    if (onFullscreen) {
      onFullscreen();
    }
    handleMenuClose();
  };
  
  // Handle refresh
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
    handleMenuClose();
  };
  
  // Handle download
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    }
    handleMenuClose();
  };
  
  // Handle share
  const handleShare = () => {
    if (onShare) {
      onShare();
    }
    handleMenuClose();
  };
  
  // Handle remove
  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    }
    handleMenuClose();
  };
  
  // Handle help toggle
  const handleHelpToggle = () => {
    setShowHelp(!showHelp);
  };
  
  return (
    <WidgetCard
      id={id}
      sx={{
        height: height,
        minHeight: minHeight,
        maxHeight: maxHeight,
        ...(isFullscreen && {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: theme.zIndex.modal,
          m: 0,
          borderRadius: 0,
          maxHeight: '100vh',
          height: '100vh',
        }),
      }}
    >
      <WidgetCardHeader
        avatar={icon}
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" component="div">
              {title}
            </Typography>
            {helpText && (
              <Tooltip title={showHelp ? "Hide help" : "Show help"}>
                <IconButton 
                  size="small" 
                  onClick={handleHelpToggle}
                  sx={{ ml: 1 }}
                >
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        }
        subheader={subtitle}
        action={
          !noOptions && (
            <Box>
              {onRefresh && (
                <IconButton onClick={handleRefresh} size="small">
                  <RefreshIcon fontSize="small" />
                </IconButton>
              )}
              <IconButton
                aria-label="widget options"
                aria-controls="widget-menu"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                size="small"
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
              <Menu
                id="widget-menu"
                anchorEl={menuAnchorEl}
                keepMounted
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
              >
                {onRefresh && (
                  <MenuItem onClick={handleRefresh}>
                    <ListItemIcon>
                      <RefreshIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Refresh" />
                  </MenuItem>
                )}
                {onFullscreen && (
                  <MenuItem onClick={handleFullscreenToggle}>
                    <ListItemIcon>
                      {isFullscreen ? (
                        <FullscreenExitIcon fontSize="small" />
                      ) : (
                        <FullscreenIcon fontSize="small" />
                      )}
                    </ListItemIcon>
                    <ListItemText primary={isFullscreen ? "Exit Fullscreen" : "Fullscreen"} />
                  </MenuItem>
                )}
                {onDownload && (
                  <MenuItem onClick={handleDownload}>
                    <ListItemIcon>
                      <DownloadIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Download" />
                  </MenuItem>
                )}
                {onShare && (
                  <MenuItem onClick={handleShare}>
                    <ListItemIcon>
                      <ShareIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Share" />
                  </MenuItem>
                )}
                {onRemove && (
                  <MenuItem onClick={handleRemove}>
                    <ListItemIcon>
                      <DeleteOutlineIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Remove" />
                  </MenuItem>
                )}
              </Menu>
            </Box>
          )
        }
      />
      
      {showHelp && helpText && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {helpText}
          </Typography>
          <Divider sx={{ mt: 1 }} />
        </Box>
      )}
      
      <WidgetCardContent>
        {loading ? (
          <Box sx={{ width: '100%' }}>
            <Skeleton variant="rectangular" width="100%" height={30} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" width="100%" height={100} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Skeleton variant="rectangular" width="30%" height={20} />
              <Skeleton variant="rectangular" width="30%" height={20} />
            </Box>
          </Box>
        ) : error ? (
          <ErrorBox>
            <Typography variant="h6" color="error" gutterBottom>
              Error Loading Data
            </Typography>
            <Typography variant="body2">{error}</Typography>
            {onRefresh && (
              <IconButton onClick={onRefresh} color="primary" sx={{ mt: 2 }}>
                <RefreshIcon />
              </IconButton>
            )}
          </ErrorBox>
        ) : (
          children
        )}
      </WidgetCardContent>
    </WidgetCard>
  );
};

export default DashboardWidget;