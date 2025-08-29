import React, { ReactElement, ReactNode } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
  IconButton,
  Collapse,
  Card,
  CardContent,
  CardHeader,
  Tabs,
  Tab,
} from '@mui/material';

//import SwipeableViews from 'react-swipeable-views';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// Interface for child props
interface DashboardChildProps {
  id?: string;
  title?: string;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

interface ResponsiveDashboardProps {
  children: ReactNode;
  title?: string;
}

const ResponsiveDashboard: React.FC<ResponsiveDashboardProps> = ({ 
  children, 
  title = "Dashboard" 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({});

  const handleSectionToggle = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const renderChildren = () => {
    return React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) return child;
      
      // Type assertion for child props
      const childElement = child as ReactElement<DashboardChildProps>;
      const childProps = childElement.props;
      
      // Get section ID from child props or generate one
      const sectionId = childProps.id || `section-${index}`;
      const sectionTitle = childProps.title || `Section ${index + 1}`;
      
      // For mobile, wrap each child in a collapsible card
      if (isMobile) {
        return (
          <Card key={sectionId} sx={{ mb: 2 }}>
            <CardHeader
              title={sectionTitle}
              action={
                <IconButton
                  onClick={() => handleSectionToggle(sectionId)}
                  aria-expanded={expandedSections[sectionId]}
                  aria-label="show more"
                >
                  {expandedSections[sectionId] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              }
            />
            <Collapse in={expandedSections[sectionId]} timeout="auto" unmountOnExit>
              <CardContent>
                {child}
              </CardContent>
            </Collapse>
          </Card>
        );
      }
      
      // For desktop/tablet, use responsive grid
      return (
        <Grid 
          item 
          xs={12} 
          sm={childProps.sm || 6} 
          md={childProps.md || 4} 
          lg={childProps.lg || 3} 
          xl={childProps.xl || 2}
          key={sectionId}
        >
          {child}
        </Grid>
      );
    });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {title}
      </Typography>
      
      {isMobile ? (
        <Box>
          {renderChildren()}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {renderChildren()}
        </Grid>
      )}
    </Container>
  );
};

export default ResponsiveDashboard;
