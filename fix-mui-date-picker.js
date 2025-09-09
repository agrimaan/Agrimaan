/**
 * This script fixes issues with MUI Date Pickers in the Agrimaan application
 * It adds the necessary dependencies and providers to make date pickers work
 */

const fs = require('fs');
const path = require('path');

// Check if package.json exists
const packageJsonPath = path.join(__dirname, 'Agrimaan', 'agrimaan-app', 'frontend', 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('Error: package.json not found at', packageJsonPath);
  process.exit(1);
}

// Read package.json
let packageJson;
try {
  packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
} catch (error) {
  console.error('Error reading package.json:', error);
  process.exit(1);
}

// Check if @mui/x-date-pickers and date-fns are already installed
const hasMuiDatePickers = packageJson.dependencies['@mui/x-date-pickers'];
const hasDateFns = packageJson.dependencies['date-fns'];

// Add dependencies if they don't exist
let dependenciesChanged = false;

if (!hasMuiDatePickers) {
  packageJson.dependencies['@mui/x-date-pickers'] = '^6.18.2';
  dependenciesChanged = true;
  console.log('Added @mui/x-date-pickers dependency');
}

if (!hasDateFns) {
  packageJson.dependencies['date-fns'] = '^2.30.0';
  dependenciesChanged = true;
  console.log('Added date-fns dependency');
}

// Save package.json if changes were made
if (dependenciesChanged) {
  try {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('Updated package.json with new dependencies');
  } catch (error) {
    console.error('Error writing to package.json:', error);
    process.exit(1);
  }
}

// Check if index.tsx exists
const indexPath = path.join(__dirname, 'Agrimaan', 'agrimaan-app', 'frontend', 'src', 'index.tsx');
if (!fs.existsSync(indexPath)) {
  console.error('Error: index.tsx not found at', indexPath);
  process.exit(1);
}

// Read index.tsx
let indexContent;
try {
  indexContent = fs.readFileSync(indexPath, 'utf8');
} catch (error) {
  console.error('Error reading index.tsx:', error);
  process.exit(1);
}

// Check if LocalizationProvider is already imported
if (!indexContent.includes('LocalizationProvider')) {
  // Add import for LocalizationProvider and AdapterDateFns
  indexContent = indexContent.replace(
    "import { ThemeProvider } from '@mui/material/styles';",
    "import { ThemeProvider } from '@mui/material/styles';\nimport { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';\nimport { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';"
  );

  // Wrap the app with LocalizationProvider
  indexContent = indexContent.replace(
    '<ThemeProvider theme={theme}>',
    '<ThemeProvider theme={theme}>\n    <LocalizationProvider dateAdapter={AdapterDateFns}>'
  );

  indexContent = indexContent.replace(
    '</ThemeProvider>',
    '    </LocalizationProvider>\n  </ThemeProvider>'
  );

  // Save the updated index.tsx
  try {
    fs.writeFileSync(indexPath, indexContent);
    console.log('Updated index.tsx with LocalizationProvider');
  } catch (error) {
    console.error('Error writing to index.tsx:', error);
    process.exit(1);
  }
} else {
  console.log('LocalizationProvider is already set up in index.tsx');
}

console.log('MUI Date Pickers setup completed successfully!');