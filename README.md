# Solar Calculator for Commercial Vehicles

This Solar Calculator helps **commercial fleet operators** and **commercial vehicle owners** (buses, trucks, vans, trailers) make informed decisions about solar panel investments by providing:

1. **Financial Clarity**: Understand the true cost savings over 1, 2, and 5 years with accurate ROI calculations
2. **Environmental Impact**: See your positive contribution to reducing CO2 emissions and fuel consumption
3. **Commercial Vehicle Support**: Specifically designed for Buses, Trucks, Vans, and Trailers
4. **Multiple Engine Types**: Works with Electric, Diesel, and Petrol engines
5. **Physical Constraints**: Accounts for payload reserve and max roof load capacity
6. **Operational Factors**: Considers parking type, operating months, and winter usage
7. **Personalized Results**: Based on your specific vehicle, location, and driving habits
8. **Multi-Currency**: View savings in EUR or USD
9. **Responsive Design**: Works seamlessly on all devices from mobile to desktop
10. **Multi-Language**: Available in English, German and Spanish

The app empowers fleet managers and commercial vehicle operators to understand not just how much money they'll save, but also how much they'll reduce their carbon footprint and contribute positively to the environment.
Built with Next.js 16, React 19, and TypeScript.

## Technology Stack Overview

### Core Framework & Language

| Technology     | Purpose                         | Why We Use It                                                                   |
| -------------- | ------------------------------- | ------------------------------------------------------------------------------- |
| **Next.js 16** | React framework with App Router | Server-side rendering, routing, API routes, optimal performance                 |
| **React 19**   | UI library                      | Component-based architecture, latest features (automatic batching, transitions) |
| **TypeScript** | Programming language            | Type safety, better developer experience, catch errors early                    |

### UI & Styling

| Technology          | Purpose                     | Why We Use It                                                |
| ------------------- | --------------------------- | ------------------------------------------------------------ |
| **Tailwind CSS v4** | Utility-first CSS framework | Rapid styling, consistent design system, CSS-first approach  |
| **Recharts**        | Interactive charts library  | Visualize savings, ROI, CO2 reduction with responsive charts |

### Forms & Validation

| Technology              | Purpose                | Why We Use It                                                          |
| ----------------------- | ---------------------- | ---------------------------------------------------------------------- |
| **react-hook-form**     | Form state management  | Performant forms with minimal re-renders, excellent TypeScript support |
| **Zod**                 | Schema validation      | Type-safe validation, auto-generate TypeScript types from schemas      |
| **@hookform/resolvers** | Form + Zod integration | Connect react-hook-form with Zod validation                            |

### Authentication & Security

| Technology                   | Purpose               | Why We Use It                                                |
| ---------------------------- | --------------------- | ------------------------------------------------------------ |
| **NextAuth.js v5 (Auth.js)** | Authentication system | Secure login/registration, session management, OAuth support |
| **bcryptjs**                 | Password hashing      | Secure password storage with salt and hash                   |
| **jsonwebtoken**             | JWT token generation  | Secure session tokens for API authentication                 |

### Database & ORM

| Technology     | Purpose             | Why We Use It                                                                     |
| -------------- | ------------------- | --------------------------------------------------------------------------------- |
| **PostgreSQL** | Relational database | Reliable, scalable, handles complex relationships (users, vehicles, calculations) |
| **Prisma**     | TypeScript ORM      | Type-safe database queries, auto-generated types, easy migrations                 |

### Data Fetching & State Management

| Technology                       | Purpose                 | Why We Use It                                                          |
| -------------------------------- | ----------------------- | ---------------------------------------------------------------------- |
| **TanStack Query (React Query)** | Server state management | Caching, automatic refetching, optimistic updates, loading states      |
| **Zustand**                      | Client state management | Lightweight (1KB), simple global state for form steps, theme, UI state |

### AI & Optimization

| Technology            | Purpose      | Why We Use It                                                                       |
| --------------------- | ------------ | ----------------------------------------------------------------------------------- |
| **Firebase Genkit**   | AI framework | Multi-model support (Gemini, OpenAI, Claude), structured outputs, prompt management |
| **Google Gemini Pro** | AI model     | Cost-effective, excellent at analysis and recommendations, large context window     |

### Internationalization (i18n)

| Technology    | Purpose                | Why We Use It                                                       |
| ------------- | ---------------------- | ------------------------------------------------------------------- |
| **next-intl** | Multi-language support | App Router optimized, supports en/es/fr, server & client components |

### PDF Export & Charts Export

| Technology      | Purpose                  | Why We Use It                                                |
| --------------- | ------------------------ | ------------------------------------------------------------ |
| **jsPDF**       | PDF generation           | Create professional calculation reports as downloadable PDFs |
| **html2canvas** | HTML to image conversion | Convert charts to images for embedding in PDFs               |

### Utilities & Helpers

| Technology         | Purpose                | Why We Use It                                            |
| ------------------ | ---------------------- | -------------------------------------------------------- |
| **Day.js**         | Date manipulation      | Lightweight (2KB), modern alternative to moment.js       |
| **clsx**           | Conditional classNames | Utility for constructing className strings conditionally |
| **tailwind-merge** | Merge Tailwind classes | Intelligently merge conflicting Tailwind classes         |

### Development Tools

| Technology     | Purpose             | Why We Use It                                          |
| -------------- | ------------------- | ------------------------------------------------------ |
| **ESLint**     | Code linting        | Maintain code quality, catch errors, enforce standards |
| **Prisma CLI** | Database migrations | Manage database schema changes, seed data              |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd solar-calculator
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   DATABASE_URL="postgresql://user:password@host:port/database"
   ```

4. **Initialize the database**

   ```bash
   # Run Prisma migrations
   npx prisma migrate dev --name init

   # Seed the database with initial data
   npx prisma db seed
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Prisma Commands

- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Create and apply new migration
- `npx prisma generate` - Generate Prisma Client
- `npx prisma db seed` - Seed the database

### Adding Translations

Edit the JSON files in the `messages/` directory:

- `messages/en.json` - English
- `messages/es.json` - Spanish
- `messages/fr.json` - French

## Implementation Plan

The project will be implemented in 9 phases:

1. **Foundation** - Dependencies, database setup, Prisma configuration
2. **Theme System** - Dark/light mode with localStorage persistence
3. **Internationalization** - next-intl setup with multiple locales
4. **UI Components** - Base components (Button, Input, Select, etc.)
5. **Form Foundation** - Zod schemas and validation logic
6. **Multi-Step Form** - Form orchestrator and step components
7. **API Routes** - Backend endpoints for calculations and vehicles
8. **Error Boundaries** - Error handling at root and locale levels
9. **Integration & Testing** - Connect all pieces and test thoroughly

For detailed implementation steps, see the [implementation plan](.claude/plans/dreamy-floating-kazoo.md).

## Key Features Implementation

### Theme Switching

- Custom React Context provider for theme management
- localStorage persistence for user preference
- Smooth CSS transitions between themes
- System preference fallback

### Form Validation

- Zod schemas for each form step
- TypeScript types auto-generated from schemas
- Real-time validation feedback
- Error messages in multiple languages

### Internationalization

- URL-based locale detection (`/en`, `/es`, `/de`)
- Server-side and client-side translation support
- Automatic locale detection based on browser settings
- Default locale (English) accessible at root

### Server vs Client Components

- **Server Components**: Layouts, static pages, API handlers
- **Client Components**: Forms, theme toggle, interactive elements

### AI Optimization Helper

- **Trigger**: Automatically generated after viewing calculation results
- **Type**: One-shot comprehensive analysis report (non-conversational)
- **AI Framework**: Firebase Genkit with Google Gemini Pro
- **Report Focuses On**:
  - **Fleet Operation Efficiency**:
    - Route optimization recommendations based on vehicle type and daily km
    - Parking strategy improvements (depot vs street vs customer site vs mixed)
    - Seasonal operation adjustments (operating months, winter usage impact)
    - Fuel efficiency tips specific to vehicle category (bus/truck/van/trailer)
    - Daily operation schedule optimization for maximum solar charging
    - Multi-vehicle fleet coordination strategies
  - **Cost Reduction Strategies**:
    - Government incentives and tax benefits by region (EU/US)
    - Financing options: lease vs buy analysis, payment plans, fleet discounts
    - Maintenance tips to extend solar system life (20-25 years)
    - Bulk purchase discounts for fleet operators (quantity tiers)
    - Energy tariff optimization (time-of-use rates, demand charges)
    - Insurance and warranty considerations
- **Storage**: AI recommendations stored in database linked to calculation for future reference
- **Multi-language**: Reports generated in user's selected language (en/es/fr)
- **Export**: Included in PDF export alongside calculation results

## Overview

This application provides a multi-step form interface where users can input their vehicle details and location to calculate:

- Daily, monthly, and yearly solar energy production
- Energy savings compared to traditional fuels (diesel, petrol, grid electricity)
- Cost savings in EUR and USD for 1, 2, and 5 year periods
- Daily range added to their vehicle
- Time required to fully charge their vehicle battery
- Optimal solar panel configuration
- Return on investment (ROI) timeline

## Features

- **User Authentication & Accounts**:
  - Secure user registration and login
  - Personal dashboard to view all saved calculations
  - Calculation history with date and vehicle details
  - Password reset and account management
  - Session management with secure tokens

- **Multi-Step Form**: Intuitive 3-step process for data collection
  - Step 1: Vehicle category selection (Bus, Truck, Van, Trailer)
  - Step 2: Vehicle details (manufacturer, model, engine type, fuel consumption/battery capacity, payload, roof load, parking type, operating months, winter usage)
  - Step 3: Solar panel setup and location information

- **Commercial Vehicle Support**: Designed for fleet and commercial vehicles
  - **Buses**: Public transport, tour buses, school buses
  - **Trucks**: Delivery trucks, freight haulers, box trucks
  - **Vans**: Cargo vans, delivery vans, service vehicles
  - **Trailers**: Refrigerated trailers, cargo trailers, mobile units

- **Multiple Engine Types**: Calculate savings for different powertrains
  - **Electric Engines**: Battery capacity (kWh), charging costs, direct grid replacement
  - **Diesel Engines**: Fuel consumption (L/100km), diesel prices, auxiliary power offset (15%)
  - **Petrol Engines**: Fuel consumption (L/100km), petrol prices, auxiliary power offset (15%)

- **Three Simulation Scenarios**: Compare different outcome projections
  - **Optimistic Scenario**: Best-case assumptions (high sun hours, low fuel prices increase, high solar efficiency)
  - **Realistic Scenario**: Average-case assumptions (standard conditions, moderate price changes)
  - **Pessimistic Scenario**: Worst-case assumptions (lower sun hours, high fuel prices, system degradation)
  - Side-by-side comparison with interactive charts
  - Scenario-specific ROI and break-even calculations

- **Interactive Charts & Diagrams**: Visual data representation
  - Multi-year savings comparison (bar/line charts)
  - ROI timeline visualization with break-even point
  - CO2 reduction progress charts
  - Energy production seasonal charts
  - Cost comparison charts (with vs without solar)
  - Scenario comparison overlay charts
  - Exportable charts as PNG/PDF

- **PDF Report Export**: Professional calculation reports
  - **Comprehensive PDF Report** including:
    - Executive summary with key metrics
    - All three scenarios (Optimistic, Realistic, Pessimistic) side-by-side
    - Vehicle and system specifications
    - Detailed financial breakdown (1, 2, 5-year projections)
    - Environmental impact analysis
    - All charts and visualizations embedded
    - Cost comparison tables
    - ROI timeline diagram
    - Recommendations and next steps
  - **Branded PDF** with company logo and professional formatting
  - **Downloadable** directly from results page or dashboard
  - **Shareable** for fleet managers, stakeholders, investors

- **Cost Savings Analysis**: Comprehensive financial calculations
  - Compare solar energy costs vs traditional fuel/electricity costs
  - Multi-year projections: 1 year, 2 years, and 5 years (per scenario)
  - Multi-currency support: EUR (€) and USD ($)
  - Return on Investment (ROI) timeline
  - Break-even point calculation

- **Environmental Impact Tracking**: Understand your positive contribution
  - CO2 emissions reduction (kg per year)
  - Total CO2 saved over 1, 2, and 5 years
  - Fuel consumption reduction (liters saved)
  - Equivalent trees planted metric
  - Carbon footprint visualization
  - Environmental impact comparison charts

- **Dark/Light Theme**: User-controlled theme toggle with localStorage persistence

- **Multi-Language Support**: Internationalization with English, Spanish, and French

- **Real-time Calculations**: Accurate solar energy calculations based on:
  - Panel wattage and quantity
  - Geographic location and sun hours
  - Vehicle energy/fuel consumption and efficiency
  - Current fuel prices (diesel, petrol) and electricity rates
  - Solar panel installation costs

- **Database Storage**: PostgreSQL database for storing calculations and vehicle data

- **Responsive Design**: Optimized for most common European screen sizes (2025)
  - Mobile: 360px - 428px (smartphones)
  - Tablet: 768px - 1024px (tablets, iPads)
  - Desktop: 1366px - 1920px (laptops, monitors)
  - Large Desktop: 2560px+ (4K displays)
  - Mobile-first approach with Tailwind CSS breakpoints

- **Error Boundaries**: Graceful error handling at multiple levels

## Data Collection & Processing Architecture

This section clarifies what data is collected from users (frontend) versus what is calculated and stored on the backend.

### 📥 Frontend: User Input Data (Form Fields)

#### Step 1: Vehicle Type Selection

- Vehicle category: **Bus** | **Truck** | **Van** | **Trailer**
- Large selection cards with vehicle illustrations
- Each card shows typical use cases for that vehicle type

#### Step 2: Vehicle Details

**Common fields (all vehicle types):**

1. **Manufacturer** - Text input
   - Vehicle manufacturer name
   - Example: "Mercedes-Benz", "Volkswagen", "Tesla"

2. **Model** - Text input
   - Vehicle model name
   - Example: "Sprinter", "Crafter", "Model 3"

3. **Payload Reserve (kg)** - Number input
   - Available payload capacity in kilograms
   - Used to calculate weight constraints for solar panels
   - Example: 500, 1000, 1500

4. **Max Roof Load (kg)** - Number input
   - Maximum roof load capacity in kilograms
   - Critical for determining safe panel installation limits
   - Example: 150, 200, 300

5. **Engine Type** - Dropdown selector
   - Options: **Diesel** | **Petrol** | **Electric**
   - Determines which engine-specific fields to show below

6. **Parking Type** - Dropdown selector
   - Where the vehicle is typically parked
   - Options: **Depot** | **Street** | **Customer Site** | **Mixed**
   - Affects sun exposure and charging recommendations

7. **Operating Months** - Number input (1-12)
   - Number of months per year the vehicle operates
   - Example: 12 (year-round), 8 (seasonal), 6 (summer only)
   - Default: 12

8. **Winter Usage** - Checkbox
   - Whether the vehicle is used during winter months (December-February)
   - Affects seasonal production calculations
   - Checked = Yes, Unchecked = No

**Engine Type-Specific Fields:**

**For Diesel Engines:**

- **Fuel consumption (L/100km)** - Number input
  - Example: 6.5, 8.0, 12.0
- **Diesel price per liter (€/$)** - Number input
  - Current local diesel price
  - Example: 1.60 €/L
- **Daily driving distance (km)** - Number input
  - Average daily kilometers driven
  - Example: 50, 100, 200

**For Petrol Engines:**

- **Fuel consumption (L/100km)** - Number input
  - Example: 7.2, 9.0, 11.5
- **Petrol price per liter (€/$)** - Number input
  - Current local petrol price
  - Example: 1.70 €/L
- **Daily driving distance (km)** - Number input
  - Average daily kilometers driven
  - Example: 50, 100, 200

**For Electric Engines:**

- **Battery capacity (kWh)** - Number input
  - Total battery capacity
  - Example: 60, 75, 100
- **Range on full charge (km)** - Number input
  - Maximum range per full charge
  - Example: 300, 450, 520
- **Electricity cost per kWh (€/$)** - Number input
  - Current local electricity price for charging
  - Example: 0.30 €/kWh
- **Daily driving distance (km)** - Number input
  - Average daily kilometers driven
  - Example: 50, 100, 200

#### Step 3: Solar Panel Setup & Location

**Panel Configuration:**

- Number of panels (integer) - e.g., 10
- Wattage per panel (W) - e.g., 400

**Location Data:**

- Location name (text) - e.g., "Madrid, Spain"
- Latitude (decimal) - e.g., 40.4168 (auto-filled from geocoding)
- Longitude (decimal) - e.g., -3.7038 (auto-filled from geocoding)
- Average daily sun hours (decimal) - e.g., 5.5 (suggested by location)

**Cost Information** (Critical for accurate ROI calculation):

- **Panel price per unit** (€/$)
  - Example: 250-400 € per 400W panel
  - Includes panel hardware cost only
- **Installation cost total** (€/$)
  - Example: 1500-3000 € (one-time cost)
  - Includes: labor, mounting hardware, wiring, inverter, permits
  - Professional installation by certified technicians
- **Annual maintenance cost** (€/$)
  - Example: 100-200 € per year (recurring cost)
  - Includes: cleaning, inspection, monitoring system, minor repairs
  - Factor for long-term cost analysis

**ROI Calculation Components:**

```
Initial Investment = (panelCount × panelPrice) + installationCost
Annual Operating Cost = annualMaintenanceCost
Annual Fuel Savings = fuelCostWithoutSolar - fuelCostWithSolar
Net Annual Benefit = annualFuelSavings - annualMaintenanceCost
Break-Even Point (years) = initialInvestment / netAnnualBenefit
```

**Preferences:**

- Currency: **EUR (€)** | **USD ($)**
- Language: **English** | **Spanish** | **French**

### ⚙️ Backend: Calculated & Stored Data

#### Energy Production Calculations

**Server-side computations:**

```
Total wattage = panelCount × wattagePerPanel
Daily energy (kWh) = (totalWattage × sunHours × 0.8) / 1000
Monthly energy (kWh) = dailyEnergy × 30
Yearly energy (kWh) = dailyEnergy × 365
```

#### Vehicle-Specific Calculations

**Electric Vehicles:**

```
Daily charging cost = (dailyKm / range) × battery × electricityPrice
Days to full charge = battery / dailyEnergyProduction
Daily range added = dailyEnergy × (range / battery)
Annual cost without solar = dailyChargingCost × 365
```

**Diesel Vehicles:**

```
Daily fuel used (L) = (dailyKm / 100) × fuelConsumption
Daily fuel cost = dailyFuelUsed × dieselPrice
Annual fuel cost = dailyFuelCost × 365
Fuel saved by solar (L) = yearlyEnergy / 10
Cost avoided = fuelSaved × dieselPrice
```

**Petrol Vehicles:**

```
Daily fuel used (L) = (dailyKm / 100) × fuelConsumption
Daily fuel cost = dailyFuelUsed × petrolPrice
Annual fuel cost = dailyFuelCost × 365
Fuel saved by solar (L) = yearlyEnergy / 9
Cost avoided = fuelSaved × petrolPrice
```

#### Financial Analysis

**ROI & Savings Calculations:**

```
Initial investment = (panelCount × panelPrice) + installationCost
Annual savings = annualCostWithoutSolar - maintenanceCost

Year 1 net = annualSavings - initialInvestment
Year 2 net = (annualSavings × 2) - initialInvestment
Year 5 net = (annualSavings × 5) - initialInvestment

ROI years = initialInvestment / annualSavings
Break-even month = roiYears × 12
```

**Currency Conversion:**

- EUR ↔ USD using current exchange rates
- Updated periodically via external API or manual configuration

#### Environmental Impact Calculations

**CO2 Emissions Reduction:**

```
Electric: yearlyEnergy × 0.4 kg CO2 (grid replacement)
Diesel: fuelSaved × 2.68 kg CO2
Petrol: fuelSaved × 2.31 kg CO2

Multi-year: annualCO2 × years (1, 2, 5)
```

**Tree Equivalence:**

```
Trees equivalent = annualCO2Reduction / 21
```

**Fuel Savings:**

```
Annual fuel avoided (L) = (dailyKm × 365 / 100) × fuelConsumption
```

#### Backend Constants (Pre-configured)

**CO2 Emission Factors (European Standards 2025):**

- Grid electricity: `0.4 kg CO2/kWh`
- Diesel combustion: `2.68 kg CO2/L`
- Petrol combustion: `2.31 kg CO2/L`

**Energy Conversions:**

- Diesel energy density: `10 kWh/L`
- Petrol energy density: `9 kWh/L`

**Environmental Constants:**

- Tree CO2 absorption: `21 kg/year`
- Solar efficiency factor: `0.8` (80%)

**Reference Prices (European averages 2025):**

- Diesel: `1.60 €/L`
- Petrol: `1.70 €/L`
- Electricity: `0.30 €/kWh`

### 💾 Database Storage (PostgreSQL via Prisma)

**Stored in database:**

- ✅ All user input data (vehicle specs, panel config, location)
- ✅ All calculated results (energy, savings, environmental impact)
- ✅ Timestamp of calculation
- ✅ User preferences (locale, currency)
- ✅ Historical calculations for comparison
- ✅ Vehicle library (pre-defined vehicle models with specs)

**NOT stored:**

- ❌ User personal information (anonymous calculations)
- ❌ Sensitive location details (only coordinates for sun hours)
- ❌ Payment information (not applicable)

## Tech Stack

### Frontend

- **Next.js 16** - React framework with App Router
- **React 19** - UI library with latest features
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first CSS framework (CSS-first approach)
- **react-hook-form** - Performant form management
- **Zod** - TypeScript-first schema validation
- **TanStack Query** - Server state management and data fetching
- **next-intl** - Internationalization for App Router
- **Recharts** - Composable charting library for React
- **NextAuth.js v5** - Authentication for Next.js (Auth.js)

### Backend

- **Next.js API Routes** - RESTful API endpoints
- **Prisma** - Type-safe ORM for PostgreSQL
- **PostgreSQL** - Relational database
- **NextAuth.js** - Session management and authentication
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT token generation

### Utilities

- **Day.js** - Lightweight date manipulation
- **clsx + tailwind-merge** - Conditional className utility
- **html2canvas** - Chart export to PNG
- **jsPDF** - PDF generation for reports

## Design System

### Color Palette

#### Light Mode

- **Primary**: `#B6F065` - Action green for buttons and active states
- **Background**: `#F9F9F7` - Soft off-white page background
- **Card**: `#FFFFFF` - Pure white for containers
- **Input**: `#F1F3F5` - Light grey for form fields
- **Text Heading**: `#1A1A1A` - Dark charcoal
- **Text Body**: `#666666` - Medium grey
- **Info Box**: `#EBE9E0` - Warm beige
- **Border**: `#E5E7EB` - Light border color

#### Dark Mode

- **Primary**: `#B6F065` - Consistent green accent
- **Background**: `#1A1A1A` - Dark charcoal
- **Card**: `#2A2A2A` - Dark card background
- **Input**: `#333333` - Dark input fields
- **Text Heading**: `#F9F9F7` - Light text
- **Text Body**: `#A0A0A0` - Medium grey
- **Border**: `#404040` - Dark borders

### Typography

- **Font Family**: Inter or Plus Jakarta Sans
- **Title**: 32px, Bold
- **Section Headers**: 20px, Semibold
- **Labels**: 14px, Medium

### Spacing

- **Card Border Radius**: 24px (`rounded-3xl`)
- **Input Border Radius**: 12px (`rounded-xl`)
- **Button Border Radius**: 16px (`rounded-2xl`)
- **Section Padding**: 40px
- **Card Gaps**: 16px
- **Form Groups**: 24px

## Project Structure

```
solar-calculator/
├── app/
│   ├── [locale]/              # Internationalized routes
│   │   ├── layout.tsx         # Locale-specific layout
│   │   ├── page.tsx           # Landing/Calculator page
│   │   ├── login/             # Login page
│   │   │   └── page.tsx
│   │   ├── register/          # Registration page
│   │   │   └── page.tsx
│   │   ├── dashboard/         # User dashboard (protected)
│   │   │   ├── page.tsx       # Dashboard home
│   │   │   ├── calculations/  # Saved calculations list
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/      # Individual calculation view
│   │   │   │       └── page.tsx
│   │   │   └── profile/       # User profile settings
│   │   │       └── page.tsx
│   │   ├── calculator/        # Multi-step calculator flow
│   │   │   └── page.tsx
│   │   ├── results/           # Results page with 3 scenarios
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # NextAuth API routes
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   ├── calculations/  # Calculation CRUD
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── vehicles/      # Vehicle data
│   │   │   │   └── route.ts
│   │   │   └── users/         # User management
│   │   │       └── route.ts
│   │   └── error.tsx          # Error boundary
│   ├── layout.tsx             # Root layout with providers
│   ├── globals.css            # Global styles and theme variables
│   └── error.tsx              # Root error boundary
├── components/
│   ├── auth/                  # Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── UserMenu.tsx
│   ├── calculator/            # Calculator form components
│   │   ├── CalculatorForm.tsx
│   │   ├── StepIndicator.tsx
│   │   ├── FormNavigation.tsx
│   │   └── steps/
│   │       ├── Step1VehicleCategory.tsx
│   │       ├── Step2VehicleDetails.tsx
│   │       └── Step3PanelSetup.tsx
│   ├── dashboard/             # Dashboard components
│   │   ├── CalculationCard.tsx
│   │   ├── CalculationsList.tsx
│   │   └── StatsOverview.tsx
│   ├── charts/                # Chart components
│   │   ├── SavingsChart.tsx
│   │   ├── ROIChart.tsx
│   │   ├── CO2Chart.tsx
│   │   ├── EnergyProductionChart.tsx
│   │   ├── ScenarioComparisonChart.tsx
│   │   └── ChartExport.tsx
│   ├── results/               # Results display components
│   │   ├── ScenarioTabs.tsx
│   │   ├── MetricsCards.tsx
│   │   ├── DetailedBreakdown.tsx
│   │   └── ResultsExport.tsx
│   ├── ui/                    # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Card.tsx
│   │   ├── Label.tsx
│   │   ├── Tabs.tsx
│   │   ├── Dialog.tsx
│   │   └── ErrorMessage.tsx
│   ├── theme/                 # Theme toggle
│   │   └── ThemeToggle.tsx
│   └── providers/             # Context providers
│       ├── ThemeProvider.tsx
│       ├── QueryProvider.tsx
│       ├── SessionProvider.tsx
│       └── Providers.tsx
├── lib/
│   ├── auth/                  # Authentication utilities
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── auth-options.ts    # Auth options
│   │   └── session.ts         # Session helpers
│   ├── db/                    # Database configuration
│   │   └── prisma.ts          # Prisma client singleton
│   ├── validations/           # Zod schemas
│   │   ├── calculator.ts      # Calculator schemas
│   │   ├── auth.ts            # Auth schemas
│   │   └── user.ts            # User schemas
│   ├── utils/                 # Utility functions
│   │   ├── calculations.ts    # Solar calculations
│   │   ├── scenarios.ts       # Scenario calculations
│   │   ├── date.ts            # Day.js utilities
│   │   └── cn.ts              # classNames utility
│   └── api/                   # API client functions
│       └── client.ts
├── prisma/
│   ├── schema.prisma          # Database schema (with User, Session, Account)
│   ├── migrations/            # Database migrations
│   └── seed.ts                # Seed data
├── types/                     # TypeScript type definitions
│   ├── calculator.ts
│   ├── api.ts
│   ├── scenarios.ts           # Scenario types
│   └── auth.ts                # Auth types
├── messages/                  # i18n translation files
│   ├── en.json
│   ├── es.json
│   └── de.json
├── middleware.ts              # next-intl + auth middleware
├── i18n.ts                   # i18n configuration
└── auth.config.ts            # NextAuth configuration
```

## Database Schema

### User

- Stores user account information
- id, email (unique), hashedPassword, name
- emailVerified (datetime), image (avatar URL optional)
- createdAt, updatedAt timestamps
- One-to-many → Calculation
- One-to-many → Session

### Session

- Stores active user sessions (NextAuth)
- id, sessionToken (unique), userId
- expires (datetime)
- createdAt, updatedAt timestamps
- Many-to-one → User

### Account

- OAuth provider accounts (optional for social login)
- id, userId, type, provider, providerAccountId
- refresh_token, access_token, expires_at, token_type, scope, id_token
- Many-to-one → User

### VerificationToken

- Email verification tokens
- identifier (email), token (unique), expires
- Used for password reset and email verification

### VehicleType

- Stores commercial vehicle categories (Bus, Truck, Van, Trailer)
- Includes typical use cases and characteristics for each category
- One-to-many relationship with Vehicle

### Vehicle

- Stores vehicle specifications (manufacturer, model)
- **Physical constraints**: payload reserve (kg), max roof load (kg)
- **Operational details**: engine type, parking type, operating months, winter usage, daily driving distance
- **Electric vehicles**: battery capacity (kWh), range (km), charging cost per kWh
- **Fuel vehicles** (Diesel/Petrol): fuel consumption (L/100km), fuel price per liter
- Unique constraint on (manufacturer, model)
- One-to-many relationship with Calculation

### Calculation

- Stores calculation results and input parameters for ALL three scenarios
- **Metadata**: userId (links to User), calculationName, description, createdAt, updatedAt
- **Common Input Data**: vehicleId, panel configuration, location data, currency preference
-
- **Optimistic Scenario** (best case):
  - Energy Production: dailyEnergyKwh, monthlyEnergyKwh, yearlyEnergyKwh
  - Cost Analysis: savings1Year, savings2Years, savings5Years, roiYears, breakEvenMonths
  - Environmental Impact: co2ReductionKgPerYear, equivalentTreesPlanted
  - Assumptions: +10% sun hours, -5% fuel price inflation, 95% solar efficiency

- **Realistic Scenario** (average case):
  - Energy Production: dailyEnergyKwh, monthlyEnergyKwh, yearlyEnergyKwh
  - Cost Analysis: savings1Year, savings2Years, savings5Years, roiYears, breakEvenMonths
  - Environmental Impact: co2ReductionKgPerYear, equivalentTreesPlanted
  - Assumptions: Standard sun hours, +3% fuel price inflation, 80% solar efficiency

- **Pessimistic Scenario** (worst case):
  - Energy Production: dailyEnergyKwh, monthlyEnergyKwh, yearlyEnergyKwh
  - Cost Analysis: savings1Year, savings2Years, savings5Years, roiYears, breakEvenMonths
  - Environmental Impact: co2ReductionKgPerYear, equivalentTreesPlanted
  - Assumptions: -15% sun hours, +10% fuel price inflation, 70% solar efficiency (degradation)

- Many-to-one → User
- Many-to-one → Vehicle
- One-to-one → AIRecommendation

### AIRecommendation

- Stores AI-generated optimization analysis for each calculation
- **Metadata**: id, calculationId (unique, links to Calculation), generatedAt, locale (en/es/fr)
- **AI Output** (JSON field):
  - **fleetEfficiency**:
    - routeOptimization (array of recommendations)
    - parkingStrategy (object with analysis and suggestions)
    - seasonalAdjustments (object with winter/summer strategies)
    - fuelEfficiencyTips (array of tips specific to vehicle category)
    - solarChargingSchedule (object with optimal timing)
    - fleetCoordination (array of multi-vehicle strategies)
  - **costReduction**:
    - governmentIncentives (array by region: EU/US with program names, amounts, deadlines)
    - financingOptions (array with lease/buy comparison, payment plans, ROI analysis)
    - maintenanceTips (array of strategies to extend system life)
    - bulkDiscounts (object with quantity tiers and estimated savings)
    - energyTariffOptimization (object with time-of-use recommendations)
    - insuranceWarranty (object with coverage recommendations and cost estimates)
- **Summary**: executiveSummary (string, 2-3 paragraph overview in user's language)
- **Metadata**: aiModel (string, e.g., "gemini-pro"), promptVersion (string), processingTimeMs (integer)
- One-to-one → Calculation
- Timestamps: createdAt, updatedAt

## Results Display Layout

After users complete the 3-step form, they will see comprehensive results organized into clear sections:

### Key Metrics at a Glance (Top Cards)

Displayed as prominent cards at the top of results:

1. **Annual Energy Production**
   - Total: `X,XXX kWh/year`
   - Daily average: `XX.X kWh/day`
   - Icon: ☀️ or solar panel icon

2. **Annual Fuel Cost Savings**
   - Amount: `X,XXX €` or `X,XXX $`
   - Percentage saved: `XX%`
   - Icon: 💰 or savings icon

3. **Payback Period**
   - Time: `X.X years` or `XX months`
   - Visual progress bar showing ROI timeline
   - Icon: ⏱️ or calendar icon

4. **CO₂ Reduction**
   - Amount: `X.XX tons/year`
   - Cumulative over 5 years
   - Icon: 🌱 or leaf icon

### Detailed Breakdowns (Expandable Sections)

#### 1. Solar Energy Production

```
☀️ Annual Production: X,XXX kWh/year
📊 Daily Average: XX.X kWh/day
📅 Monthly Average: XXX kWh/month
⚡ Peak Daily Production: XX.X kWh (summer)
❄️ Minimum Daily Production: X.X kWh (winter)
```

#### 2. Fuel Savings (Diesel/Petrol Vehicles)

```
⛽ Annual Fuel Saved: XXX liters/year
💵 Annual Cost Savings: X,XXX €/year
📉 Fuel Consumption Reduced: XX%
🔌 Auxiliary Power Offset: Up to 15% fuel savings
```

**For Electric Vehicles:**

```
🔌 Grid Electricity Replaced: X,XXX kWh/year
💵 Charging Cost Savings: X,XXX €/year
🔋 Equivalent Full Charges: XX charges/year
```

#### 3. 5-Year Financial Benefit (Featured Card)

**Prominently highlighted with accent color gradient:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 TOTAL 5-YEAR SAVINGS

Initial Investment:     -X,XXX €
Total Savings (5 yr):   +XX,XXX €
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NET BENEFIT:            +XX,XXX €
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Year 1: -X,XXX € (investment year)
Year 2: +X,XXX €
Year 3: +X,XXX €
Year 4: +X,XXX €
Year 5: +XX,XXX €
```

#### 4. Environmental Impact

```
🌍 Annual CO₂ Reduction: X.XX tons/year
🌲 Equivalent Trees Planted: XXX trees
📊 5-Year CO₂ Reduction: XX.X tons total
♻️ Fuel Not Consumed: X,XXX liters (5 years)

Visual: Tree icons or CO₂ reduction chart
```

#### 5. Recommended System Configuration

```
📦 Recommended Panels: XX × 400W panels
⚡ Total System Capacity: X.X kW
📐 Estimated Roof Space: XX m²
🧭 Optimal Placement: South-facing, XX° tilt
🔧 Installation Complexity: [Low|Medium|High]
```

### Year-by-Year Breakdown (Interactive Table)

| Year | Investment | Savings | Maintenance | Net Benefit | Cumulative |
| ---- | ---------- | ------- | ----------- | ----------- | ---------- |
| 0    | -X,XXX €   | 0 €     | 0 €         | -X,XXX €    | -X,XXX €   |
| 1    | 0 €        | X,XXX € | -XXX €      | X,XXX €     | -XXX €     |
| 2    | 0 €        | X,XXX € | -XXX €      | X,XXX €     | +X,XXX €   |
| 3    | 0 €        | X,XXX € | -XXX €      | X,XXX €     | +X,XXX €   |
| 4    | 0 €        | X,XXX € | -XXX €      | X,XXX €     | +XX,XXX €  |
| 5    | 0 €        | X,XXX € | -XXX €      | X,XXX €     | +XX,XXX €  |

### Comparison Visualization

**With Solar vs Without Solar (Annual Costs):**

```
Without Solar: ████████████████████ X,XXX €/year
With Solar:    ████ XXX €/year (maintenance only)

YOU SAVE: X,XXX €/year ⭐
```

### Additional Calculation Factors

The calculations account for:

✅ **Engine Type Specifics:**

- Diesel: 2.68 kg CO₂/L, average €1.60/L
- Petrol: 2.31 kg CO₂/L, average €1.70/L
- Electric: 0.4 kg CO₂/kWh (grid), average €0.30/kWh

✅ **Seasonal Variations:**

- Operating months per year (user input or default 12)
- Winter usage reduction factor (20-30% less sun)
- Summer peak production boost

✅ **Vehicle-Specific Savings:**

- **Diesel/Petrol**: Up to 15% fuel savings from auxiliary power offset (alternator, A/C, accessories powered by solar)
- **Electric**: Direct grid replacement - full kWh-to-kWh savings

✅ **System Recommendations:**

- Default panel specification: 400W panels
- Automatic calculation of optimal panel count
- Considers roof space efficiency
- Factors in local sun hours and geographic location

## Scenario Assumptions

The calculator provides three different scenarios to help users understand the range of possible outcomes:

### Optimistic Scenario (Best Case)

**Assumptions:**

- Solar panel efficiency: **95%** (newer high-efficiency panels)
- Sun hours adjustment: **+10%** (above-average sunny days)
- Fuel price inflation: **-5% per year** (stabilizing energy markets)
- System degradation: **0.5% per year** (minimal degradation)
- Parking exposure bonus: **+5%** (optimal parking conditions)
- Maintenance costs: **Standard** (no unexpected repairs)

**Use Case**: Best-case planning for areas with excellent sun exposure and stable energy prices.

### Realistic Scenario (Average Case) - **DEFAULT**

**Assumptions:**

- Solar panel efficiency: **80%** (standard industry efficiency)
- Sun hours adjustment: **0%** (user-provided average)
- Fuel price inflation: **+3% per year** (moderate inflation)
- System degradation: **1% per year** (normal panel aging)
- Parking exposure: **As selected** (no adjustment)
- Maintenance costs: **Standard** (as provided by user)

**Use Case**: Most likely outcome based on current market conditions and historical data.

### Pessimistic Scenario (Worst Case)

**Assumptions:**

- Solar panel efficiency: **70%** (accounting for degradation and suboptimal conditions)
- Sun hours adjustment: **-15%** (more cloudy days, urban shadows)
- Fuel price inflation: **+10% per year** (high energy price increases)
- System degradation: **2% per year** (faster panel aging)
- Parking exposure penalty: **-10%** (suboptimal parking conditions)
- Maintenance costs: **+25%** (unexpected repairs and issues)

**Use Case**: Conservative planning to ensure ROI even under challenging conditions.

## Calculation Formulas

### Solar Energy Production

The app uses the following formulas to calculate solar energy production:

```typescript
// Base calculation
totalWattage = panelCount × panelWattage
dailyEnergyKwh = (totalWattage × averageSunHours × 0.8) / 1000
monthlyEnergyKwh = dailyEnergyKwh × 30
yearlyEnergyKwh = dailyEnergyKwh × 365

// With seasonal variations
peakDailyProduction = dailyEnergyKwh × 1.3  // Summer (30% increase)
minDailyProduction = dailyEnergyKwh × 0.7   // Winter (30% decrease)

// Operating months factor (if < 12 months/year)
adjustedYearlyEnergy = dailyEnergyKwh × 30 × operatingMonths

// Recommended panel count (reverse calculation)
requiredPanels = Math.ceil((targetEnergyKwh × 1000) / (wattagePerPanel × avgSunHours × 0.8 × 365))

// Panel weight validation (safety check)
panelWeight = 18  // kg per 400W panel (average)
totalPanelWeight = panelCount × panelWeight
maxAllowedPanels = Math.floor(maxRoofLoadKg / panelWeight)
isWithinRoofLimit = totalPanelWeight <= maxRoofLoadKg

// Parking type sun exposure adjustment
parkingFactors = {
  DEPOT: 1.0,          // Best - open parking lot, full sun exposure
  CUSTOMER_SITE: 0.85, // Good - usually open areas at customer locations
  STREET: 0.7,         // Reduced - urban shadows, buildings, trees
  MIXED: 0.85          // Average of different parking scenarios
}
adjustedDailyEnergy = dailyEnergyKwh × parkingFactors[parkingType]

// Operating months adjustment
if (operatingMonths < 12) {
  annualEnergyAdjusted = dailyEnergyKwh × 30 × operatingMonths
}

// Winter usage adjustment
if (winterUsage === false) {
  // Exclude winter months (Dec, Jan, Feb) = 3 months
  winterMonthsReduction = 3
  effectiveOperatingMonths = operatingMonths - winterMonthsReduction
  annualEnergyAdjusted = dailyEnergyKwh × 30 × effectiveOperatingMonths
}
```

_Note: The 0.8 factor accounts for system efficiency losses (inverter, wiring, temperature, soiling, etc.)_

### Vehicle-Specific Calculations

#### Electric Vehicles

```typescript
daysToFullCharge = batteryKwh / dailyEnergyKwh
dailyRangeKm = dailyEnergyKwh × (rangeKm / batteryKwh)
dailyGridCost = (dailyKm / rangeKm) × batteryKwh × electricityPricePerKwh
dailySolarCost = 0  // After ROI period
```

#### Diesel Vehicles

```typescript
// Base fuel consumption without solar
dailyFuelConsumption = (dailyKm / 100) × fuelConsumptionPer100km
dailyFuelCost = dailyFuelConsumption × dieselPricePerLiter
annualFuelCost = dailyFuelCost × 365

// Solar savings from auxiliary power offset (alternator, A/C, accessories)
auxiliaryPowerSavingsPercentage = 0.15  // Up to 15% fuel savings
auxiliaryFuelSaved = dailyFuelConsumption × auxiliaryPowerSavingsPercentage
auxiliaryCostSaved = auxiliaryFuelSaved × dieselPricePerLiter

// Direct solar energy conversion (for fully electric auxiliary systems)
solarEquivalentLiters = yearlyEnergyKwh / 10  // 10 kWh per liter diesel
directFuelSavings = solarEquivalentLiters × dieselPricePerLiter

// Total annual savings
totalAnnualSavings = (auxiliaryCostSaved × 365) + directFuelSavings
totalFuelSavedLiters = auxiliaryFuelSaved × 365 + solarEquivalentLiters
```

#### Petrol Vehicles

```typescript
// Base fuel consumption without solar
dailyFuelConsumption = (dailyKm / 100) × fuelConsumptionPer100km
dailyFuelCost = dailyFuelConsumption × petrolPricePerLiter
annualFuelCost = dailyFuelCost × 365

// Solar savings from auxiliary power offset (alternator, A/C, accessories)
auxiliaryPowerSavingsPercentage = 0.15  // Up to 15% fuel savings
auxiliaryFuelSaved = dailyFuelConsumption × auxiliaryPowerSavingsPercentage
auxiliaryCostSaved = auxiliaryFuelSaved × petrolPricePerLiter

// Direct solar energy conversion (for fully electric auxiliary systems)
solarEquivalentLiters = yearlyEnergyKwh / 9  // 9 kWh per liter petrol
directFuelSavings = solarEquivalentLiters × petrolPricePerLiter

// Total annual savings
totalAnnualSavings = (auxiliaryCostSaved × 365) + directFuelSavings
totalFuelSavedLiters = auxiliaryFuelSaved × 365 + solarEquivalentLiters
```

### Cost Savings Calculation

```typescript
// Initial Investment
solarSystemCost = (panelCount × panelPrice) + installationCost

// Annual Savings
annualFuelCost = dailyFuelCost × 365
annualSolarSavings = annualFuelCost - annualMaintenanceCost

// Multi-Year Projections
savings1Year = annualSolarSavings - solarSystemCost
savings2Years = (annualSolarSavings × 2) - solarSystemCost
savings5Years = (annualSolarSavings × 5) - solarSystemCost

// ROI Calculation
roiYears = solarSystemCost / annualSolarSavings
breakEvenMonth = roiYears × 12

// Currency Conversion
savingsEUR = savingsUSD × exchangeRate
```

### Environmental Impact Calculation

```typescript
// CO2 Emissions Reduction by Vehicle Type

// Electric Vehicles (replacing grid charging)
co2PerKwhGrid = 0.4  // kg CO2 per kWh (European average)
co2ReductionKgPerYear = yearlyEnergyKwh × co2PerKwhGrid

// Diesel Vehicles
co2PerLiterDiesel = 2.68  // kg CO2 per liter of diesel
fuelSavedLiters = yearlyEnergyKwh / 10  // Rough conversion
co2ReductionKgPerYear = fuelSavedLiters × co2PerLiterDiesel

// Petrol Vehicles
co2PerLiterPetrol = 2.31  // kg CO2 per liter of petrol
fuelSavedLiters = yearlyEnergyKwh / 9  // Rough conversion
co2ReductionKgPerYear = fuelSavedLiters × co2PerLiterPetrol

// Multi-Year Projections
co2Reduction2Years = co2ReductionKgPerYear × 2
co2Reduction5Years = co2ReductionKgPerYear × 5

// Tree Equivalence
// Average tree absorbs ~21 kg of CO2 per year
equivalentTreesPlanted = co2ReductionKgPerYear / 21

// Fuel Saved
fuelSavedLitersPerYear = (dailyKm × 365) / 100 × fuelConsumptionPer100km

// Energy Independence
energyIndependencePercentage = (yearlyEnergyKwh / totalEnergyNeeded) × 100
```

### Constants Used

```typescript
// CO2 Emission Factors (European Standards 2025)
const CO2_PER_KWH_GRID = 0.4; // kg CO2 per kWh from grid
const CO2_PER_LITER_DIESEL = 2.68; // kg CO2 per liter
const CO2_PER_LITER_PETROL = 2.31; // kg CO2 per liter
const CO2_ABSORBED_PER_TREE = 21; // kg CO2 per year per tree

// Energy Density (for fuel-to-energy conversions)
const KWH_PER_LITER_DIESEL = 10; // Approximate
const KWH_PER_LITER_PETROL = 9; // Approximate

// Average Prices (European Markets 2025 - for reference)
const AVG_DIESEL_PRICE_EUR = 1.6; // € per liter
const AVG_PETROL_PRICE_EUR = 1.7; // € per liter
const AVG_ELECTRICITY_EUR = 0.3; // € per kWh

// Solar System Efficiency
const SOLAR_EFFICIENCY_FACTOR = 0.8; // 80% (accounts for inverter, wiring, temperature, soiling losses)
const PANEL_STANDARD_WATTAGE = 400; // Watts (default recommendation)

// Seasonal Variations
const SUMMER_PRODUCTION_BOOST = 1.3; // 30% increase in summer
const WINTER_PRODUCTION_REDUCTION = 0.7; // 30% decrease in winter
const DEFAULT_OPERATING_MONTHS = 12; // Full year operation

// Vehicle Auxiliary Power Savings
const AUXILIARY_POWER_OFFSET = 0.15; // Up to 15% fuel savings for diesel/petrol
// (alternator, A/C, accessories powered by solar)

// Roof Space Calculations
const PANEL_AREA_M2 = 2.0; // Average area per 400W panel (m²)
const PANEL_WEIGHT_KG = 18; // Average weight per 400W panel (kg)
const ROOF_EFFICIENCY_FACTOR = 0.9; // 90% usable roof space

// Parking Type Sun Exposure Factors
const PARKING_FACTORS = {
  DEPOT: 1.0, // Full sun exposure
  CUSTOMER_SITE: 0.85, // Good exposure
  STREET: 0.7, // Reduced (urban shadows)
  MIXED: 0.85, // Average scenario
};
```
