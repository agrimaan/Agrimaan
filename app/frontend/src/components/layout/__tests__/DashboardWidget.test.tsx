import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DashboardWidget from '../DashboardWidget';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Create a theme for testing
const theme = createTheme();

// Wrapper component with ThemeProvider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('DashboardWidget Component', () => {
  test('renders with title and children', () => {
    render(
      <DashboardWidget title="Test Widget">
        <div data-testid="widget-content">Widget Content</div>
      </DashboardWidget>,
      { wrapper: TestWrapper }
    );
    
    expect(screen.getByText('Test Widget')).toBeInTheDocument();
    expect(screen.getByTestId('widget-content')).toBeInTheDocument();
    expect(screen.getByText('Widget Content')).toBeInTheDocument();
  });
  
  test('renders with subtitle', () => {
    render(
      <DashboardWidget 
        title="Test Widget" 
        subtitle="Widget Subtitle"
      >
        <div>Widget Content</div>
      </DashboardWidget>,
      { wrapper: TestWrapper }
    );
    
    expect(screen.getByText('Widget Subtitle')).toBeInTheDocument();
  });
  
  test('renders loading state', () => {
    render(
      <DashboardWidget 
        title="Test Widget" 
        loading={true}
      >
        <div data-testid="widget-content">Widget Content</div>
      </DashboardWidget>,
      { wrapper: TestWrapper }
    );
    
    // In loading state, the content should not be visible
    expect(screen.queryByTestId('widget-content')).not.toBeInTheDocument();
    // Should show skeleton loading UI
    expect(screen.getAllByRole('progressbar').length).toBeGreaterThan(0);
  });
  
  test('renders error state', () => {
    const errorMessage = 'An error occurred';
    render(
      <DashboardWidget 
        title="Test Widget" 
        error={errorMessage}
      >
        <div data-testid="widget-content">Widget Content</div>
      </DashboardWidget>,
      { wrapper: TestWrapper }
    );
    
    // In error state, the content should not be visible
    expect(screen.queryByTestId('widget-content')).not.toBeInTheDocument();
    // Should show error message
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText('Error Loading Data')).toBeInTheDocument();
  });
  
  test('calls onRefresh when refresh button is clicked', () => {
    const handleRefresh = jest.fn();
    render(
      <DashboardWidget 
        title="Test Widget" 
        onRefresh={handleRefresh}
      >
        <div>Widget Content</div>
      </DashboardWidget>,
      { wrapper: TestWrapper }
    );
    
    // Find and click the refresh button
    const refreshButton = screen.getByLabelText('refresh');
    fireEvent.click(refreshButton);
    
    // Check if the onRefresh callback was called
    expect(handleRefresh).toHaveBeenCalledTimes(1);
  });
  
  test('calls onFullscreen when fullscreen button is clicked', () => {
    const handleFullscreen = jest.fn();
    render(
      <DashboardWidget 
        title="Test Widget" 
        onFullscreen={handleFullscreen}
      >
        <div>Widget Content</div>
      </DashboardWidget>,
      { wrapper: TestWrapper }
    );
    
    // Open the menu
    const menuButton = screen.getByLabelText('widget options');
    fireEvent.click(menuButton);
    
    // Find and click the fullscreen option
    const fullscreenOption = screen.getByText('Fullscreen');
    fireEvent.click(fullscreenOption);
    
    // Check if the onFullscreen callback was called
    expect(handleFullscreen).toHaveBeenCalledTimes(1);
  });
  
  test('calls onDownload when download button is clicked', () => {
    const handleDownload = jest.fn();
    render(
      <DashboardWidget 
        title="Test Widget" 
        onDownload={handleDownload}
      >
        <div>Widget Content</div>
      </DashboardWidget>,
      { wrapper: TestWrapper }
    );
    
    // Open the menu
    const menuButton = screen.getByLabelText('widget options');
    fireEvent.click(menuButton);
    
    // Find and click the download option
    const downloadOption = screen.getByText('Download');
    fireEvent.click(downloadOption);
    
    // Check if the onDownload callback was called
    expect(handleDownload).toHaveBeenCalledTimes(1);
  });
  
  test('calls onShare when share button is clicked', () => {
    const handleShare = jest.fn();
    render(
      <DashboardWidget 
        title="Test Widget" 
        onShare={handleShare}
      >
        <div>Widget Content</div>
      </DashboardWidget>,
      { wrapper: TestWrapper }
    );
    
    // Open the menu
    const menuButton = screen.getByLabelText('widget options');
    fireEvent.click(menuButton);
    
    // Find and click the share option
    const shareOption = screen.getByText('Share');
    fireEvent.click(shareOption);
    
    // Check if the onShare callback was called
    expect(handleShare).toHaveBeenCalledTimes(1);
  });
  
  test('calls onRemove when remove button is clicked', () => {
    const handleRemove = jest.fn();
    render(
      <DashboardWidget 
        title="Test Widget" 
        onRemove={handleRemove}
      >
        <div>Widget Content</div>
      </DashboardWidget>,
      { wrapper: TestWrapper }
    );
    
    // Open the menu
    const menuButton = screen.getByLabelText('widget options');
    fireEvent.click(menuButton);
    
    // Find and click the remove option
    const removeOption = screen.getByText('Remove');
    fireEvent.click(removeOption);
    
    // Check if the onRemove callback was called
    expect(handleRemove).toHaveBeenCalledTimes(1);
  });
  
  test('toggles help text when help button is clicked', () => {
    const helpText = 'This is a helpful description of the widget';
    render(
      <DashboardWidget 
        title="Test Widget" 
        helpText={helpText}
      >
        <div>Widget Content</div>
      </DashboardWidget>,
      { wrapper: TestWrapper }
    );
    
    // Help text should not be visible initially
    expect(screen.queryByText(helpText)).not.toBeInTheDocument();
    
    // Find and click the help button
    const helpButton = screen.getByLabelText('Show help');
    fireEvent.click(helpButton);
    
    // Help text should now be visible
    expect(screen.getByText(helpText)).toBeInTheDocument();
    
    // Click the help button again to hide the help text
    fireEvent.click(helpButton);
    
    // Help text should be hidden again
    expect(screen.queryByText(helpText)).not.toBeInTheDocument();
  });
  
  test('renders without options when noOptions is true', () => {
    render(
      <DashboardWidget 
        title="Test Widget" 
        noOptions={true}
      >
        <div>Widget Content</div>
      </DashboardWidget>,
      { wrapper: TestWrapper }
    );
    
    // The options menu button should not be present
    expect(screen.queryByLabelText('widget options')).not.toBeInTheDocument();
  });
  
  test('applies custom height, minHeight, and maxHeight', () => {
    render(
      <DashboardWidget 
        title="Test Widget" 
        height="400px"
        minHeight="300px"
        maxHeight="500px"
      >
        <div>Widget Content</div>
      </DashboardWidget>,
      { wrapper: TestWrapper }
    );
    
    // Get the card element
    const card = screen.getByText('Test Widget').closest('.MuiCard-root');
    expect(card).toHaveStyle('height: 400px');
    expect(card).toHaveStyle('min-height: 300px');
    expect(card).toHaveStyle('max-height: 500px');
  });
});