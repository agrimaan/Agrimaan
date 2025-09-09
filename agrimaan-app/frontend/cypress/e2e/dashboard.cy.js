/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

describe('Dashboard Page', () => {
  beforeEach(() => {
    // Intercept API calls and provide mock data
    cy.intercept('GET', '/api/fields', { 
      statusCode: 200, 
      body: [
        { id: 'Fields-1', name: 'North Fields', area: 25.4, crop: 'Corn', soilType: 'Clay Loam' },
        { id: 'Fields-2', name: 'South Fields', area: 18.7, crop: 'Soybeans', soilType: 'Silt Loam' }
      ]
    }).as('getFields');
    
    cy.intercept('GET', '/api/crops', { 
      statusCode: 200, 
      body: [
        { id: 'crop-1', name: 'Corn', status: 'growing', Fields: 'Fields-1' },
        { id: 'crop-2', name: 'Soybeans', status: 'planted', Fields: 'Fields-2' },
        { id: 'crop-3', name: 'Wheat', status: 'harvested', Fields: 'Fields-3' }
      ]
    }).as('getCrops');
    
    cy.intercept('GET', '/api/sensors', { 
      statusCode: 200, 
      body: [
        { id: 'sensor-1', name: 'Soil Moisture 1', status: 'active', Fields: 'Fields-1' },
        { id: 'sensor-2', name: 'Temperature 1', status: 'active', Fields: 'Fields-1' },
        { id: 'sensor-3', name: 'Soil Moisture 2', status: 'inactive', Fields: 'Fields-2' },
        { id: 'sensor-4', name: 'Weather Station', status: 'error', Fields: 'Fields-2' }
      ]
    }).as('getSensors');
    
    cy.intercept('GET', '/api/analytics/recommendations', { 
      statusCode: 200, 
      body: [
        { 
          id: 'rec-1', 
          type: 'irrigation_recommendation', 
          action: 'Increase irrigation in North Fields', 
          priority: 'high',
          Fields: { id: 'Fields-1', name: 'North Fields' }
        },
        { 
          id: 'rec-2', 
          type: 'pest_risk', 
          action: 'Check for aphids in South Fields', 
          priority: 'medium',
          Fields: { id: 'Fields-2', name: 'South Fields' }
        }
      ]
    }).as('getRecommendations');
    
    // Visit the dashboard page
    cy.visit('/dashboard');
    
    // Wait for API calls to complete
    cy.wait(['@getFields', '@getCrops', '@getSensors', '@getRecommendations']);
  });
  
  it('should display the dashboard title', () => {
    cy.findByRole('heading', { name: /dashboard/i }).should('be.visible');
  });
  
  it('should display summary cards with correct data', () => {
    // Check Total fields card
    cy.contains('Total fields')
      .parent()
      .parent()
      .within(() => {
        cy.findByText('2').should('be.visible');
        cy.findByText('View all fields').should('be.visible');
      });
    
    // Check Active Crops card
    cy.contains('Active Crops')
      .parent()
      .parent()
      .within(() => {
        cy.findByText('2').should('be.visible');
        cy.findByText('View all crops').should('be.visible');
      });
    
    // Check Active Sensors card
    cy.contains('Active Sensors')
      .parent()
      .parent()
      .within(() => {
        cy.findByText('2').should('be.visible');
        cy.findByText('View all sensors').should('be.visible');
      });
    
    // Check Alerts card
    cy.contains('Alerts')
      .parent()
      .parent()
      .within(() => {
        cy.findByText('1').should('be.visible');
        cy.findByText('View all alerts').should('be.visible');
      });
  });
  
  it('should navigate to fields page when clicking "View all fields"', () => {
    cy.findByText('View all fields').click();
    cy.url().should('include', '/fields');
  });
  
  it('should display soil moisture chart', () => {
    cy.contains('Soil Moisture Trend').should('be.visible');
    cy.get('canvas').should('exist');
  });
  
  it('should display recommendations', () => {
    cy.contains('Recommendations').should('be.visible');
    cy.contains('Increase irrigation in North Fields').should('be.visible');
    cy.contains('Check for aphids in South Fields').should('be.visible');
    cy.contains('View All Recommendations').should('be.visible');
  });
  
  it('should display crop status chart', () => {
    cy.contains('Crop Status').should('be.visible');
    cy.get('canvas').should('exist');
  });
  
  it('should display sensor status chart', () => {
    cy.contains('Sensor Status').should('be.visible');
    cy.get('canvas').should('exist');
  });
  
  it('should display weather forecast', () => {
    cy.contains('Weather Forecast').should('be.visible');
    cy.contains('Partly Cloudy').should('be.visible');
  });
  
  it('should display crop yield comparison chart', () => {
    cy.contains('Crop Yield Comparison').should('be.visible');
    cy.get('canvas').should('exist');
  });
  
  it('should navigate to analytics page when clicking "View All Recommendations"', () => {
    cy.findByText('View All Recommendations').click();
    cy.url().should('include', '/analytics');
  });
  
  it('should be responsive on mobile viewport', () => {
    // Resize viewport to mobile size
    cy.viewport('iphone-x');
    
    // Check that the layout adjusts
    cy.findByRole('heading', { name: /dashboard/i }).should('be.visible');
    
    // Cards should stack vertically
    cy.get('.MuiGrid-container').first().within(() => {
      cy.get('.MuiGrid-item').should('have.css', 'max-width', '100%');
    });
    
    // Mobile navigation should be visible
    cy.get('[role="tablist"]').should('be.visible');
  });
  
  it('should have no accessibility violations', () => {
    // Check for accessibility violations
    cy.injectAxe();
    cy.checkA11y();
  });
  
  it('should allow adding a new Fields', () => {
    // Intercept the POST request
    cy.intercept('POST', '/api/fields', {
      statusCode: 201,
      body: {
        id: 'Fields-3',
        name: 'East Fields',
        area: 15.2,
        crop: null,
        soilType: 'Sandy Loam'
      }
    }).as('createFields');
    
    // Click the Add Fields button
    cy.findByText('Add Fields').click();
    
    // Should navigate to the new Fields form
    cy.url().should('include', '/fields/new');
    
    // Fill out the form
    cy.findByLabelText(/Fields name/i).type('East Fields');
    cy.findByLabelText(/area/i).type('15.2');
    cy.findByLabelText(/soil type/i).type('Sandy Loam');
    
    // Submit the form
    cy.findByText('Save Fields').click();
    
    // Wait for the API call
    cy.wait('@createFields');
    
    // Should redirect to the fields page
    cy.url().should('include', '/fields');
    
    // Should show a success message
    cy.contains('Fields created successfully').should('be.visible');
  });
  
  it('should refresh data when clicking refresh button', () => {
    // Reset the intercepts with new data
    cy.intercept('GET', '/api/fields', { 
      statusCode: 200, 
      body: [
        { id: 'Fields-1', name: 'North Fields', area: 25.4, crop: 'Corn', soilType: 'Clay Loam' },
        { id: 'Fields-2', name: 'South Fields', area: 18.7, crop: 'Soybeans', soilType: 'Silt Loam' },
        { id: 'Fields-3', name: 'East Fields', area: 15.2, crop: null, soilType: 'Sandy Loam' }
      ]
    }).as('getFieldsRefresh');
    
    // Find and click the refresh button on the Total fields card
    cy.contains('Total fields')
      .parent()
      .parent()
      .within(() => {
        cy.get('button[aria-label="refresh"]').click();
      });
    
    // Wait for the API call
    cy.wait('@getFieldsRefresh');
    
    // Check that the data has been updated
    cy.contains('Total fields')
      .parent()
      .parent()
      .within(() => {
        cy.findByText('3').should('be.visible');
      });
  });
  
  it('should toggle between light and dark mode', () => {
    // Open user menu
    cy.get('button[aria-label="account settings"]').click();
    
    // Click on Settings
    cy.findByText('Settings').click();
    
    // Should navigate to settings page
    cy.url().should('include', '/settings');
    
    // Click on Display tab
    cy.findByText('Display').click();
    
    // Select Dark mode
    cy.findByLabelText('Dark').click();
    
    // Check that dark mode is applied
    cy.get('body').should('have.css', 'background-color', 'rgb(18, 18, 18)');
    
    // Select Light mode
    cy.findByLabelText('Light').click();
    
    // Check that light mode is applied
    cy.get('body').should('have.css', 'background-color', 'rgb(255, 255, 255)');
  });
});