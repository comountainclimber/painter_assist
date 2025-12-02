# Painter Assist

A professional painting estimation tool for creating standardized project estimates. Built with Next.js, TypeScript, and Vercel Postgres.

## Features

- **Nested Dropdown Selection**: Select Project Type → Surface → Scenario/Condition for standardized estimates
- **Automatic Output Calculation**: Automatically calculates days needed based on size and pre-configured outputs
- **Materials Management**: Add materials to each estimate item with quantities
- **Builder Trend Export**: Export estimates to CSV format for Builder Trend upload
- **Admin Panel**: Manage project types, surfaces, scenarios, outputs, and materials
- **Database-Driven**: All configuration stored in Vercel Postgres for easy updates

## Setup

### Prerequisites

- Node.js 18+
- A Vercel account (for database)
- pnpm (required)

### Installation

1. Install pnpm if you haven't already:

```bash
# Using npm (if you have npm installed)
npm install -g pnpm

# Or using Homebrew (macOS)
brew install pnpm

# Or using the standalone script
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

2. Clone the repository and install dependencies:

```bash
git clone https://github.com/comountainclimber/painter_assist.git
cd painter_assist
pnpm install
```

3. Set up Vercel Postgres:

   - Go to your Vercel dashboard
   - Create a new Postgres database
   - Copy the connection strings

4. Set up environment variables:

Create a `.env.local` file:

```env
POSTGRES_URL=your_postgres_url
POSTGRES_URL_NON_POOLING=your_postgres_url_non_pooling
ADMIN_PASSWORD=your_admin_password
```

5. Run the database schema:

   - In your Vercel dashboard, go to your database
   - Run the SQL from `schema.sql` in the SQL editor

6. Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Mobile-First Design

This application is optimized for mobile use in the field by contractors:

- **Large Touch Targets**: All buttons and inputs are sized for easy tapping (minimum 44px height)
- **Single Column Layout**: Optimized for portrait mobile screens
- **Sticky Header**: Quick access to export and admin functions
- **No Zoom on Input**: Inputs use 16px font size to prevent iOS auto-zoom
- **Collapsible Materials**: Materials section can be toggled to save screen space
- **Touch-Optimized**: All interactive elements use `touch-manipulation` for better responsiveness
- **Responsive Design**: Works great on phones, tablets, and desktops

## Usage

### Creating an Estimate

1. On the home page, select:
   - **Project Type** (e.g., Interior Repaint, New Construction)
   - **Surface** (e.g., Ceilings, Walls)
   - **Scenario/Condition** (e.g., Low Volume Nine or Ten Foot Ceiling Repaint)
2. Enter the **Size** (in the unit specified by the output)
3. Optionally add a **Cost Code**
4. Optionally add **Materials** with quantities
5. Click **Add Item** to add to your estimate
6. Click **Export to Builder Trend** to download a CSV file

### Admin Panel

Access the admin panel at `/admin` to:

- **Project Types**: Add new project types (e.g., InteriorRepaint, NewConstruction)
- **Surfaces**: Add surfaces for each project type
- **Scenarios**: Add scenarios/conditions for each surface
- **Outputs**: Configure output values (units per day) for each scenario
- **Materials**: Add materials that can be used in estimates

## Database Schema

The application uses the following main tables:

- `project_types`: Top-level project categories
- `surfaces`: Surfaces within each project type
- `scenarios`: Specific scenarios/conditions for each surface
- `outputs`: Output values (units per day) for each scenario
- `materials`: Available materials
- `estimates`: Estimate records
- `estimate_items`: Items within each estimate
- `estimate_item_materials`: Materials associated with each item

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The database schema will need to be run manually in the Vercel Postgres SQL editor.

## Development

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type checking

## Project Structure

```
painter_assist/
├── app/
│   ├── api/              # API routes
│   ├── admin/            # Admin panel
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── lib/
│   ├── db.ts            # Database functions
│   └── types.ts         # TypeScript types
├── schema.sql           # Database schema
└── package.json
```

## Notes

- The application uses in-memory storage when `POSTGRES_URL` is not set (for local development without a database)
- Admin authentication uses a simple password check (set `ADMIN_PASSWORD` environment variable)
- In development mode, admin panel is auto-authenticated
