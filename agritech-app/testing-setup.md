# Testing Framework Setup Plan

## Overview
This document outlines the plan for setting up a comprehensive testing framework for the AgriTech application. The testing framework will include unit tests, integration tests, and end-to-end tests to ensure the reliability and stability of the application.

## 1. Testing Tools and Libraries

### Frontend Testing
- **Jest**: Primary test runner and assertion library
- **React Testing Library**: For testing React components
- **Mock Service Worker (MSW)**: For mocking API requests
- **jest-axe**: For accessibility testing
- **jest-dom**: For DOM testing utilities
- **user-event**: For simulating user interactions

### Backend Testing
- **Mocha**: Test framework
- **Chai**: Assertion library
- **Sinon**: For mocks, stubs, and spies
- **Supertest**: For API endpoint testing
- **nyc (Istanbul)**: For code coverage

### End-to-End Testing
- **Cypress**: For end-to-end testing
- **Cypress Testing Library**: For better Cypress selectors
- **Cypress Axe**: For accessibility testing in E2E tests

## 2. Directory Structure

```
agritech-app/
├── frontend/
│   ├── src/
│   │   ├── __tests__/           # Global test files
│   │   ├── components/
│   │   │   ├── __tests__/       # Component tests
│   │   │   └── ...
│   │   ├── features/
│   │   │   ├── __tests__/       # Feature tests
│   │   │   └── ...
│   │   └── ...
│   ├── cypress/
│   │   ├── e2e/                 # E2E test files
│   │   ├── fixtures/            # Test data
│   │   ├── support/             # Support files
│   │   └── ...
│   └── ...
├── backend/
│   ├── src/
│   │   ├── __tests__/           # Global test files
│   │   ├── controllers/
│   │   │   ├── __tests__/       # Controller tests
│   │   │   └── ...
│   │   ├── models/
│   │   │   ├── __tests__/       # Model tests
│   │   │   └── ...
│   │   └── ...
│   └── ...
└── ...
```

## 3. Implementation Plan

### 3.1 Frontend Testing Setup

#### Step 1: Install Dependencies
```bash
cd agritech-app/frontend
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event msw jest-axe jest-environment-jsdom
```

#### Step 2: Configure Jest
Create `jest.config.js` in the frontend directory:

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|tsx)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/__mocks__/fileMock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/serviceWorker.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

#### Step 3: Create Setup Files
Create `src/setupTests.ts`:

```typescript
import '@testing-library/jest-dom';
import { server } from './__mocks__/server';

// Setup MSW server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

Create `src/__mocks__/fileMock.js`:

```javascript
module.exports = 'test-file-stub';
```

#### Step 4: Setup Mock Service Worker
Create `src/__mocks__/server.ts`:

```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

Create `src/__mocks__/handlers.ts`:

```typescript
import { rest } from 'msw';

export const handlers = [
  // Define API mocks here
  rest.get('/api/fields', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: '1', name: 'Field 1', area: 25.4 },
        { id: '2', name: 'Field 2', area: 18.7 },
      ])
    );
  }),
  // Add more handlers as needed
];
```

#### Step 5: Add Test Scripts to package.json
```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

### 3.2 Backend Testing Setup

#### Step 1: Install Dependencies
```bash
cd agritech-app/backend
npm install --save-dev mocha chai sinon supertest nyc ts-node @types/mocha @types/chai @types/sinon @types/supertest
```

#### Step 2: Configure Mocha
Create `.mocharc.js` in the backend directory:

```javascript
module.exports = {
  require: 'ts-node/register',
  extension: ['ts'],
  spec: 'src/**/*.test.ts',
  timeout: 5000,
};
```

#### Step 3: Configure NYC (Istanbul) for Code Coverage
Create `.nycrc` in the backend directory:

```json
{
  "extends": "@istanbuljs/nyc-config-typescript",
  "all": true,
  "check-coverage": true,
  "include": ["src/**/*.ts"],
  "exclude": ["src/**/*.test.ts", "src/types/**"],
  "reporter": ["text", "html"],
  "branches": 70,
  "lines": 70,
  "functions": 70,
  "statements": 70
}
```

#### Step 4: Add Test Scripts to package.json
```json
"scripts": {
  "test": "mocha",
  "test:watch": "mocha --watch",
  "test:coverage": "nyc mocha"
}
```

### 3.3 End-to-End Testing Setup

#### Step 1: Install Cypress
```bash
cd agritech-app/frontend
npm install --save-dev cypress @testing-library/cypress cypress-axe
```

#### Step 2: Initialize Cypress
```bash
npx cypress open
```

#### Step 3: Configure Cypress
Update `cypress.config.js`:

```javascript
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  viewportWidth: 1280,
  viewportHeight: 720,
  video: false,
  screenshotOnRunFailure: true,
});
```

#### Step 4: Setup Cypress Commands
Create `cypress/support/commands.js`:

```javascript
import '@testing-library/cypress/add-commands';
import 'cypress-axe';

// Add custom commands here
```

#### Step 5: Add Cypress Scripts to package.json
```json
"scripts": {
  "cypress:open": "cypress open",
  "cypress:run": "cypress run",
  "test:e2e": "start-server-and-test start http://localhost:3000 cypress:run"
}
```

## 4. Sample Tests

### 4.1 Frontend Component Test Example

Create `frontend/src/components/layout/DashboardWidget.test.tsx`:

```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DashboardWidget from './DashboardWidget';

describe('DashboardWidget', () => {
  test('renders widget with title', () => {
    render(
      <DashboardWidget title="Test Widget">
        <div>Widget content</div>
      </DashboardWidget>
    );
    
    expect(screen.getByText('Test Widget')).toBeInTheDocument();
    expect(screen.getByText('Widget content')).toBeInTheDocument();
  });
  
  test('shows loading state', () => {
    render(
      <DashboardWidget title="Loading Widget" loading={true}>
        <div>Widget content</div>
      </DashboardWidget>
    );
    
    expect(screen.getByText('Loading Widget')).toBeInTheDocument();
    expect(screen.queryByText('Widget content')).not.toBeInTheDocument();
  });
  
  test('shows error state', () => {
    render(
      <DashboardWidget 
        title="Error Widget" 
        error="An error occurred"
      >
        <div>Widget content</div>
      </DashboardWidget>
    );
    
    expect(screen.getByText('Error Widget')).toBeInTheDocument();
    expect(screen.getByText('An error occurred')).toBeInTheDocument();
    expect(screen.queryByText('Widget content')).not.toBeInTheDocument();
  });
  
  test('calls onRefresh when refresh button is clicked', () => {
    const handleRefresh = jest.fn();
    
    render(
      <DashboardWidget 
        title="Refresh Widget" 
        onRefresh={handleRefresh}
      >
        <div>Widget content</div>
      </DashboardWidget>
    );
    
    fireEvent.click(screen.getByLabelText('refresh'));
    expect(handleRefresh).toHaveBeenCalledTimes(1);
  });
});
```

### 4.2 Backend API Test Example

Create `backend/src/controllers/__tests__/fieldController.test.ts`:

```typescript
import { expect } from 'chai';
import sinon from 'sinon';
import request from 'supertest';
import { app } from '../../app';
import { Field } from '../../models/Field';

describe('Field Controller', () => {
  let findStub: sinon.SinonStub;
  
  beforeEach(() => {
    // Stub the Field model's find method
    findStub = sinon.stub(Field, 'find');
  });
  
  afterEach(() => {
    // Restore all stubs
    sinon.restore();
  });
  
  describe('GET /api/fields', () => {
    it('should return all fields', async () => {
      // Setup the stub to return test data
      const mockFields = [
        { id: '1', name: 'Field 1', area: 25.4 },
        { id: '2', name: 'Field 2', area: 18.7 },
      ];
      findStub.resolves(mockFields);
      
      // Make the request
      const response = await request(app).get('/api/fields');
      
      // Assertions
      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal(mockFields);
      expect(findStub.calledOnce).to.be.true;
    });
    
    it('should handle errors', async () => {
      // Setup the stub to throw an error
      findStub.rejects(new Error('Database error'));
      
      // Make the request
      const response = await request(app).get('/api/fields');
      
      // Assertions
      expect(response.status).to.equal(500);
      expect(response.body).to.have.property('error');
      expect(findStub.calledOnce).to.be.true;
    });
  });
});
```

### 4.3 End-to-End Test Example

Create `frontend/cypress/e2e/dashboard.cy.js`:

```javascript
describe('Dashboard Page', () => {
  beforeEach(() => {
    // Visit the dashboard page
    cy.visit('/dashboard');
  });
  
  it('should display the dashboard title', () => {
    cy.findByRole('heading', { name: /dashboard/i }).should('exist');
  });
  
  it('should display summary cards', () => {
    cy.findByText(/total fields/i).should('exist');
    cy.findByText(/active crops/i).should('exist');
    cy.findByText(/active sensors/i).should('exist');
    cy.findByText(/alerts/i).should('exist');
  });
  
  it('should navigate to fields page when clicking "View all fields"', () => {
    cy.findByText(/view all fields/i).click();
    cy.url().should('include', '/fields');
  });
  
  it('should have no accessibility violations', () => {
    cy.injectAxe();
    cy.checkA11y();
  });
});
```

## 5. Test Coverage Goals

### 5.1 Frontend Test Coverage
- **Components**: 80% coverage
- **Features**: 70% coverage
- **Utilities**: 90% coverage
- **Redux Slices**: 80% coverage

### 5.2 Backend Test Coverage
- **Controllers**: 80% coverage
- **Services**: 80% coverage
- **Models**: 70% coverage
- **Utilities**: 90% coverage

### 5.3 End-to-End Test Coverage
- Cover all critical user flows
- Test all major features
- Verify responsive design on different viewport sizes

## 6. Continuous Integration Setup

### 6.1 GitHub Actions Workflow
Create `.github/workflows/test.yml`:

```yaml
name: Test

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json
    
    - name: Install dependencies
      run: npm ci
      working-directory: ./frontend
    
    - name: Run tests
      run: npm test
      working-directory: ./frontend
    
    - name: Upload coverage
      uses: actions/upload-artifact@v3
      with:
        name: frontend-coverage
        path: frontend/coverage
  
  backend-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: backend/package-lock.json
    
    - name: Install dependencies
      run: npm ci
      working-directory: ./backend
    
    - name: Run tests
      run: npm test
      working-directory: ./backend
    
    - name: Upload coverage
      uses: actions/upload-artifact@v3
      with:
        name: backend-coverage
        path: backend/coverage
  
  e2e-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json
    
    - name: Install dependencies
      run: npm ci
      working-directory: ./frontend
    
    - name: Run E2E tests
      run: npm run test:e2e
      working-directory: ./frontend
    
    - name: Upload screenshots
      uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: cypress-screenshots
        path: frontend/cypress/screenshots
```

## 7. Implementation Timeline

### Week 1: Setup and Configuration
- Day 1-2: Set up Jest and React Testing Library for frontend
- Day 3-4: Set up Mocha, Chai, and Sinon for backend
- Day 5: Set up Cypress for end-to-end testing

### Week 2: Write Core Tests
- Day 1-2: Write tests for core components (Layout, Navigation, etc.)
- Day 3-4: Write tests for authentication and user preferences
- Day 5: Write tests for API endpoints

### Week 3: Feature Tests
- Day 1-2: Write tests for field management and mapping
- Day 3-4: Write tests for marketplace features
- Day 5: Write end-to-end tests for critical user flows

### Week 4: Integration and CI/CD
- Day 1-2: Set up GitHub Actions for continuous integration
- Day 3-4: Integrate test coverage reporting
- Day 5: Documentation and review

## 8. Conclusion
This testing framework will provide comprehensive coverage of the AgriTech application, ensuring reliability and stability. The combination of unit tests, integration tests, and end-to-end tests will catch issues at different levels, from component functionality to user flows.