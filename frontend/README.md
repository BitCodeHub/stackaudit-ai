# StackAudit.ai Frontend

Modern, professional frontend for the StackAudit.ai AI tool spending audit platform.

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **TypeScript** - Type safety
- **TailwindCSS** - Styling

## Project Structure

```
src/
├── components/       # Reusable UI components
│   └── IntakeForm.tsx   # Main audit form with dynamic tool entry
├── pages/           # Page-level components
│   └── LandingPage.tsx  # Marketing landing page
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
├── types/           # TypeScript type definitions
│   └── index.ts        # Core types (AuditFormData, AITool, etc.)
├── App.tsx          # Main app component with view routing
├── main.tsx         # App entry point
└── index.css        # Global styles + Tailwind directives
```

## Getting Started

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173)

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Features Implemented

### Landing Page
- **Hero Section** - Clear value prop with market stats
- **Trust Signals** - Forbes/MIT data showing AI waste problem
- **How It Works** - 3-step process explanation
- **Use Cases** - Target personas (CTOs, Finance Leaders, Founders, IT Managers)
- **Pricing Tiers** - Free, Pro ($49), Team ($149)
- **FAQ Section** - Common questions answered
- **CTA Sections** - Multiple conversion points

### Intake Form
- **Company Information**
  - Company name (required)
  - Company size dropdown (1-10, 11-50, 51-200, 201-500, 500+)

- **Dynamic Tool Entry**
  - Add/remove tools dynamically
  - Tool name input
  - Monthly cost input
  - Number of seats input
  - Use case checkboxes:
    - Writing
    - Code
    - Image Gen
    - Data Analysis
    - Customer Support
    - Research
    - Other

- **Summary & Validation**
  - Total monthly spend calculation
  - Tool count display
  - Form validation (required fields)
  - Submit button

## Styling

Uses TailwindCSS with a custom theme:

- **Primary Color**: Blue (#3b82f6 and variants)
- **Component Classes**: `.btn-primary`, `.btn-secondary`, `.input-field`, `.card`
- **Responsive Design**: Mobile-first with breakpoints
- **Modern UI**: Clean, professional, high-converting design

## Next Steps (Backend Integration)

The form is ready for API integration:

1. Update `IntakeForm.tsx` `handleSubmit` to POST to `/api/audits`
2. Add loading states during analysis
3. Create results/report page
4. Integrate Stripe checkout for paid tiers

## TypeScript Types

All core types are defined in `src/types/index.ts`:
- `CompanySize` - Company size options
- `UseCase` - AI tool use cases
- `AITool` - Individual tool data structure
- `AuditFormData` - Complete audit form data

## Design Philosophy

- **Conversion-focused**: Clear CTAs, trust signals, social proof
- **Professional**: Clean, modern design suitable for B2B
- **User-friendly**: Intuitive form flow, helpful validation
- **Fast**: Vite for instant HMR, optimized builds

## Contributing

This is the MVP implementation. Future enhancements:
- Save/resume audit progress
- Email capture & authentication
- Results page with visualizations
- PDF report generation (frontend)
- Benchmark comparisons
