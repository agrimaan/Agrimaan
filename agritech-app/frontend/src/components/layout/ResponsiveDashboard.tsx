import React, { useState } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
  IconButton, 
  Typography, 
  useTheme, 
  useMediaQuery,
  Collapse,
  Divider,
  Chip,
  Button,
  Tabs,
  Tab,
  SwipeableViews
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RefreshIcon from '@mui/icons-material/Refresh';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { styled } from '@mui/material/styles';

// Define prop types for the component
interface ResponsiveDashboardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  onRefresh?: () => void;
  tabbed?: boolean;
  tabs?: string[];
}

// Define styled components
const ExpandButton = styled(IconButton)(({ theme }) => ({
  padding: 4,
  marginLeft: 'auto',
}));

const DashboardCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const CardHeaderStyled = styled(CardHeader)(({ theme }) => ({
  padding: theme.spacing(2),
  paddingBottom: theme.spacing(1),
  '& .MuiCardHeader-action': {
    margin: 0,
  },
}));

const CardContentStyled = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2),
  paddingTop: theme.spacing(1),
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  '&:last-child': {
    paddingBottom: theme.spacing(2),
  },
}));

const ResponsiveDashboard: React.FC<ResponsiveDashboardProps> = ({
  children,
  title = 'Dashboard',
  subtitle,
  onRefresh,
  tabbed = false,
  tabs = ['Overview', 'Details', 'Analytics']
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState(0);

  // Handle section expand/collapse
  const handleToggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Check if a section is expanded
  const isSectionExpanded = (sectionId: string) => {
    return expandedSections[sectionId] !== false; // Default to expanded
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle swipe change
  const handleSwipeChange = (index: number) => {
    setActiveTab(index);
  };

  // Wrap children with responsive container
  const renderChildren = () => {
    // If children is an array, process each child
    if (Array.isArray(children)) {
      return React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;

        // Get section ID from child props or generate one
        const sectionId = child.props.id || `section-${index}`;
        const sectionTitle = child.props.title || `Section ${index + 1}`;
        
        // For mobile, wrap each child in a collapsible card
        if (isMobile) {
          return (
            <Grid item xs={12} key={sectionId}>
              <DashboardCard>
                <CardHeaderStyled
                  title={
                    <Typography variant="h6" component="div">
                      {sectionTitle}
                    </Typography>
                  }
                  action={
                    <ExpandButton
                      onClick={() => handleToggleSection(sectionId)}
                      aria-expanded={isSectionExpanded(sectionId)}
                      aria-label="show more"
                    >
                      {isSectionExpanded(sectionId) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </ExpandButton>
                  }
                />
                <Collapse in={isSectionExpanded(sectionId)} timeout="auto" unmountOnExit>
                  <CardContentStyled>
                    {child}
                  </CardContentStyled>
                </Collapse>
              </DashboardCard>
            </Grid>
          );
        }
        
        // For tablet and desktop, use the original layout but with responsive adjustments
        return (
          <Grid 
            item 
            xs={12} 
            sm={child.props.sm || 6} 
            md={child.props.md || 4} 
            lg={child.props.lg || 3} 
            xl={child.props.xl || 2}
            key={sectionId}
          >
            {child}
          </Grid>
        );
      });
    }
    
    // If children is a single element
    return children;
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Dashboard Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box>
            <Typography variant={isMobile ? "h5" : "h4"} component="h1" gutterBottom>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="subtitle1" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box>
            {onRefresh && (
              <IconButton onClick={onRefresh} aria-label="refresh">
                <RefreshIcon />
              </IconButton>
            )}
            <IconButton aria-label="more options">
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>
        
        {/* Optional tabs for different dashboard views */}
        {tabbed && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              variant={isMobile ? "fullWidth" : "standard"}
              scrollButtons={isMobile ? "auto" : undefined}
              allowScrollButtonsMobile
            >
              {tabs.map((tab, index) => (
                <Tab key={index} label={tab} id={`dashboard-tab-${index}`} />
              ))}
            </Tabs>
          </Box>
        )}
      </Box>
      
      {/* Dashboard Content */}
      {tabbed ? (
        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={activeTab}
          onChangeIndex={handleSwipeChange}
        >
          {tabs.map((tab, index) => (
            <div
              key={index}
              role="tabpanel"
              hidden={activeTab !== index}
              id={`dashboard-tabpanel-${index}`}
              aria-labelledby={`dashboard-tab-${index}`}
            >
              {activeTab === index && (
                <Grid container spacing={isMobile ? 2 : 3}>
                  {renderChildren()}
                </Grid>
              )}
            </div>
          ))}
        </SwipeableViews>
      ) : (
        <Grid container spacing={isMobile ? 2 : 3}>
          {renderChildren()}
        </Grid>
      )}
    </Box>
  );
};

export default ResponsiveDashboard;