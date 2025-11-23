# Expense Tracker

A modern, professional expense tracking web application built with Next.js 14, TypeScript, and Tailwind CSS. Manage your personal finances with an intuitive interface, powerful filtering, and insightful analytics.

## Features

### Core Functionality
- ✅ **Add Expenses** - Record expenses with date, amount, category, and description
- ✅ **View Expenses** - Clean, organized list view with responsive design
- ✅ **Edit & Delete** - Update or remove existing expenses
- ✅ **Filter & Search** - Filter by date range, category, and search by description
- ✅ **Dashboard Analytics** - Spending summaries, charts, and insights
- ✅ **CSV Export** - Export your expenses data to CSV format

### Categories
- Food 🍔
- Transportation 🚗
- Entertainment 🎬
- Shopping 🛍️
- Bills 📄
- Other 📦

### Dashboard Features
- **Summary Cards** - Total spending, monthly spending, top category, and expense count
- **Category Breakdown** - Bar chart showing spending by category
- **Spending Over Time** - Line chart displaying spending trends over the last 30 days
- **Recent Expenses** - Quick view of your latest expenses

### Design & UX
- Modern, clean interface with professional color scheme
- Fully responsive design (mobile, tablet, desktop)
- Intuitive navigation with mobile hamburger menu
- Form validation with helpful error messages
- Visual feedback for all user actions
- Loading states and error handling

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Date Picker**: React Datepicker
- **Icons**: Lucide React
- **Data Persistence**: localStorage (client-side only)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone or navigate to the project directory:
```bash
cd expense-tracker-ai
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
expense-tracker-ai/
├── app/
│   ├── dashboard/         # Dashboard page with analytics
│   ├── expenses/          # Expenses list page
│   ├── add-expense/       # Add expense page
│   ├── layout.tsx         # Root layout with navigation
│   ├── page.tsx           # Home page (redirects to dashboard)
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Textarea.tsx
│   │   ├── Navigation.tsx
│   │   └── Toast.tsx
│   ├── expenses/          # Expense-specific components
│   │   ├── ExpenseForm.tsx
│   │   ├── ExpenseList.tsx
│   │   └── ExpenseFilters.tsx
│   └── dashboard/         # Dashboard components
│       ├── SummaryCards.tsx
│       └── ExpenseCharts.tsx
├── lib/
│   ├── types/             # TypeScript types
│   │   └── expense.ts
│   ├── utils/             # Utility functions
│   │   ├── storage.ts     # localStorage operations
│   │   ├── formatters.ts  # Currency, date formatting
│   │   ├── export.ts      # CSV export
│   │   ├── validation.ts  # Zod schemas
│   │   └── cn.ts          # Class name utility
│   └── hooks/             # Custom React hooks
│       ├── useExpenses.ts
│       └── useExpenseFilters.ts
├── public/                # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Usage Guide

### Adding an Expense

1. Navigate to "Add Expense" from the navigation menu
2. Fill in the form:
   - **Date**: Select the date of the expense
   - **Amount**: Enter the expense amount (supports decimals)
   - **Category**: Choose from available categories
   - **Description**: Add a brief description
3. Click "Add Expense" to save

### Viewing Expenses

1. Go to "Expenses" in the navigation
2. Use filters to narrow down results:
   - Search by description or category
   - Filter by date range
   - Select specific categories
3. View expenses in a clean table (desktop) or card layout (mobile)

### Dashboard Analytics

The dashboard provides:
- **Summary Cards**: Quick overview of your spending
- **Category Chart**: Visual breakdown of spending by category
- **Time Series Chart**: Spending trends over the last 30 days
- **Recent Expenses**: Latest 5 expenses with quick actions

### Editing an Expense

1. From the expenses list or dashboard, click the edit icon (pencil)
2. Modify the expense details
3. Click "Update Expense" to save changes

### Deleting an Expense

1. Click the delete icon (trash) on any expense
2. Confirm the deletion in the dialog

### Exporting Data

1. Click the "Export CSV" button on the dashboard or expenses page
2. A CSV file will be downloaded with all your expenses
3. The file includes: Date, Amount, Category, and Description

## Data Storage

This application uses **localStorage** to persist data in your browser. This means:
- ✅ Your data is stored locally on your device
- ✅ No account or server required
- ⚠️ Data is browser-specific (not synced across devices)
- ⚠️ Clearing browser data will remove your expenses

**Note**: This is a demo application. For production use, consider implementing a backend database for data persistence and sync across devices.

## Form Validation

The application includes comprehensive form validation:
- **Date**: Required field
- **Amount**: Must be a positive number greater than 0
- **Category**: Must be one of the predefined categories
- **Description**: Required, 1-500 characters

## Error Handling

The application handles various error scenarios:
- localStorage quota exceeded
- Invalid data formats
- Network errors (if extended with API)
- Form validation errors
- Empty state handling

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Customization

#### Colors
Edit `tailwind.config.ts` to customize the color scheme.

#### Categories
Modify `lib/types/expense.ts` to add or change expense categories.

#### Date Format
Update formatters in `lib/utils/formatters.ts` to change date display format.

## License

ISC

## Contributing

This is a personal project. Feel free to fork and modify for your own use.

## Future Enhancements

Potential improvements for production use:
- Backend API integration
- User authentication
- Multi-currency support
- Recurring expenses
- Budget tracking
- Data backup/restore
- Dark mode
- Advanced analytics and reports

---

Built with ❤️ using Next.js and TypeScript

