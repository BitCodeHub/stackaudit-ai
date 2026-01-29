# StackAudit.ai - Frontend Dashboard

A modern React dashboard for SaaS stack intelligence and optimization.

## Features

- 🔐 **Authentication** - Login/Signup with demo mode support
- 📊 **Dashboard** - Overview of SaaS spend, savings, and trends
- 🔍 **Audit Wizard** - Step-by-step tool analysis workflow
- 📈 **Visualizations** - Interactive charts (spend trends, category breakdown, ROI gauge)
- 💡 **Recommendations** - AI-powered optimization suggestions
- ⚙️ **Settings** - Profile, company, billing, notifications, and security

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Recharts** - Chart visualizations
- **Lucide React** - Icons

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
client/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── auth/           # Auth layout
│   │   ├── dashboard/      # Dashboard layout
│   │   ├── charts/         # Chart components
│   │   └── shared/         # Reusable UI components
│   ├── context/
│   │   └── AuthContext.jsx # Authentication state
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── NewAuditPage.jsx
│   │   ├── AuditResultsPage.jsx
│   │   ├── RecommendationsPage.jsx
│   │   └── SettingsPage.jsx
│   ├── utils/
│   │   ├── api.js          # API client & mock data
│   │   └── formatters.js   # Utility formatters
│   ├── styles/
│   │   └── index.css       # Tailwind imports & custom styles
│   ├── App.jsx             # Routes & app structure
│   └── main.jsx            # Entry point
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Pages

### Login/Signup
- Social login buttons (Google, GitHub)
- Remember me functionality
- Password recovery link

### Dashboard
- 4-stat summary cards (spend, savings, tools, users)
- Spend trend chart
- Quick actions panel
- Recent audits table

### New Audit (Wizard)
1. **Select Tools** - Search and select from tool catalog
2. **Add Costs** - Enter monthly costs per tool
3. **Usage Data** - Add user counts and utilization estimates
4. **Review** - Confirm and run analysis

### Audit Results
- ROI score gauge
- Spend by category pie chart
- Tool utilization table
- Savings breakdown
- Implementation timeline

### Recommendations
- Filterable by priority
- Expandable details
- Mark complete functionality
- Effort estimates

### Settings
- Profile management
- Company information
- Billing & plans
- Notification preferences
- Security (password, 2FA)

## API Integration

The frontend uses a mock data layer (`utils/api.js`) for demo purposes. To connect to a real backend:

1. Update the `API_BASE` in `utils/api.js`
2. Configure the proxy in `vite.config.js`
3. Implement actual API calls in place of mock returns

## Customization

### Colors
Edit `tailwind.config.js` to customize the primary and accent color palettes.

### Components
All shared components are in `src/components/shared/` with consistent props:
- `Card`, `CardHeader`, `CardTitle`, `CardContent`
- `Button` (variants: primary, secondary, danger, ghost, link)
- `Input`, `Select`, `Textarea`
- `Badge` (variants: default, primary, success, warning, danger, info)
- `Modal`
- `EmptyState`

## License

MIT
