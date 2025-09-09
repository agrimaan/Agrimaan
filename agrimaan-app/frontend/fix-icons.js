/**
 * This script fixes the missing icon components in the Agrimaan frontend
 */

const fs = require('fs');
const path = require('path');

// Path to frontend src directory
const srcPath = path.join(process.cwd(), 'Agrimaan/agrimaan-app/frontend/src');

// Create a custom icon component for fields
const createFieldsIcon = () => {
  const iconsDir = path.join(srcPath, 'components/icons');
  
  // Create the icons directory if it doesn't exist
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }
  
  // Create the FieldsIcon component
  const fieldsIconContent = `import React from 'react';
import { SvgIcon } from '@mui/material';
import LandscapeIcon from '@mui/icons-material/Landscape';

const FieldsIcon = (props) => {
  return <LandscapeIcon {...props} />;
};

export default FieldsIcon;
`;

  fs.writeFileSync(path.join(iconsDir, 'FieldsIcon.js'), fieldsIconContent);
  console.log('Created FieldsIcon component');
};

// Fix the ResponsiveLayout component
const fixResponsiveLayout = () => {
  const filePath = path.join(srcPath, 'components/layout/ResponsiveLayout.tsx');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add import for FieldsIcon
    content = content.replace(
      /import DashboardIcon from '@mui\/icons-material\/Dashboard';/,
      `import DashboardIcon from '@mui/icons-material/Dashboard';\nimport LandscapeIcon from '@mui/icons-material/Landscape';`
    );
    
    // Replace fieldscapeIcon with LandscapeIcon
    content = content.replace(
      /{ text: 'fields', icon: <fieldscapeIcon \/>, path: '\/fields' },/,
      `{ text: 'Fields', icon: <LandscapeIcon />, path: '/fields' },`
    );
    
    fs.writeFileSync(filePath, content);
    console.log('Fixed ResponsiveLayout component');
  } else {
    console.log('ResponsiveLayout component not found');
  }
};

// Fix the Sidebar component
const fixSidebar = () => {
  const filePath = path.join(srcPath, 'components/layout/Sidebar.tsx');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add import for LandscapeIcon
    content = content.replace(
      /import DashboardIcon from '@mui\/icons-material\/Dashboard';/,
      `import DashboardIcon from '@mui/icons-material/Dashboard';\nimport LandscapeIcon from '@mui/icons-material/Landscape';`
    );
    
    // Replace fieldsIcon with LandscapeIcon
    content = content.replace(
      /icon: <fieldsIcon \/>/,
      `icon: <LandscapeIcon />`
    );
    
    fs.writeFileSync(filePath, content);
    console.log('Fixed Sidebar component');
  } else {
    console.log('Sidebar component not found');
  }
};

// Fix the MobileNavigation component
const fixMobileNavigation = () => {
  const filePath = path.join(srcPath, 'components/navigation/MobileNavigation.tsx');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace import for fieldscapeIcon
    content = content.replace(
      /import fieldscapeIcon from '@mui\/icons-material\/fieldscape';/,
      `import LandscapeIcon from '@mui/icons-material/Landscape';`
    );
    
    // Replace fieldscapeIcon with LandscapeIcon
    content = content.replace(
      /{ text: 'fields', icon: <fieldscapeIcon \/>, path: '\/fields' },/,
      `{ text: 'Fields', icon: <LandscapeIcon />, path: '/fields' },`
    );
    
    // Replace fieldscapeIcon in BottomNavigationAction
    content = content.replace(
      /icon={<fieldscapeIcon \/>}/,
      `icon={<LandscapeIcon />}`
    );
    
    fs.writeFileSync(filePath, content);
    console.log('Fixed MobileNavigation component');
  } else {
    console.log('MobileNavigation component not found');
  }
};

// Fix the BlockchainVisualization component
const fixBlockchainVisualization = () => {
  const filePath = path.join(srcPath, 'components/visualizations/BlockchainVisualization.tsx');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace import for fieldscapeIcon
    content = content.replace(
      /import fieldscapeIcon from '@mui\/icons-material\/fieldscape';/,
      `import LandscapeIcon from '@mui/icons-material/Landscape';`
    );
    
    // Replace fieldscapeIcon with LandscapeIcon
    content = content.replace(
      /return <fieldscapeIcon \/>;/,
      `return <LandscapeIcon />;`
    );
    
    fs.writeFileSync(filePath, content);
    console.log('Fixed BlockchainVisualization component');
  } else {
    console.log('BlockchainVisualization component not found');
  }
};

// Create a simple FieldsMap component
const createFieldsMapComponent = () => {
  const visualizationsDir = path.join(srcPath, 'components/visualizations');
  
  // Create the FieldsMap component
  const fieldsMapContent = `import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

interface FieldsMapProps {
  fields?: any[];
  height?: string | number;
  width?: string | number;
}

const FieldsMap: React.FC<FieldsMapProps> = ({ 
  fields = [], 
  height = 400, 
  width = '100%' 
}) => {
  return (
    <Paper 
      elevation={2} 
      sx={{ 
        height, 
        width, 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
        backgroundColor: '#f5f5f5'
      }}
    >
      <Typography variant="h6" gutterBottom>
        Field Map Visualization
      </Typography>
      <Box 
        sx={{ 
          flex: 1, 
          width: '100%', 
          backgroundColor: '#e0f2f1',
          borderRadius: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {fields.length > 0 ? (
          <Typography>
            {fields.length} fields available. Map visualization will be implemented soon.
          </Typography>
        ) : (
          <Typography>
            No fields available. Add fields to see them on the map.
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default FieldsMap;
`;

  fs.writeFileSync(path.join(visualizationsDir, 'FieldsMap.tsx'), fieldsMapContent);
  console.log('Created FieldsMap component');
};

// Fix the store import in BuyerSavedItems
const fixStoreImport = () => {
  const filePath = path.join(srcPath, 'pages/buyer/BuyerSavedItems.tsx');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix the store import path
    content = content.replace(
      /import { RootState } from '..\/store';/,
      `import { RootState } from '../../store';`
    );
    
    fs.writeFileSync(filePath, content);
    console.log('Fixed store import in BuyerSavedItems');
  } else {
    console.log('BuyerSavedItems component not found');
  }
};

// Run all fixes
createFieldsIcon();
fixResponsiveLayout();
fixSidebar();
fixMobileNavigation();
fixBlockchainVisualization();
createFieldsMapComponent();
fixStoreImport();

console.log('All fixes applied successfully!');