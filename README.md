# School Payment Dashboard Frontend

A modern, responsive React frontend for the School Payment and Dashboard application. Built with React, TypeScript, Tailwind CSS, and integrated with the backend API.

## 🚀 Live Demo

**Frontend URL**: [http://localhost:5173](http://localhost:5173) (Development)
**Backend API**: [https://school-payment-api-4.onrender.com](https://school-payment-api-4.onrender.com)

## ✨ Features

### 🎨 **Modern UI/UX**

- **Dark Mode Support** - Toggle between light and dark themes
- **Modern Design** - Clean, professional interface with Tailwind CSS
- **Interactive Components** - Smooth animations and transitions

### 🔐 **Authentication**

- **User Registration** - Create new accounts with role-based access
- **Secure Login** - JWT-based authentication
- **Protected Routes** - Automatic redirect to login for unauthorized users
- **User Profile** - Display user information and role

### 📊 **Dashboard Features**

- **Transaction Overview** - Real-time statistics and metrics
- **Recent Transactions** - Quick view of latest payment activities
- **Visual Charts** - Data visualization for better insights
- **Status Indicators** - Color-coded status badges

### 📋 **Transaction Management**

- **Complete Transaction List** - View all transactions with pagination
- **Advanced Filtering** - Filter by status, school, date range
- **Search Functionality** - Search transactions by ID or details
- **Column Sorting** - Sort by any column (ascending/descending)
- **URL Persistence** - Filters persist in URL for sharing

### 🏫 **School-Specific Views**

- **School Selection** - Dropdown to select specific schools
- **School Transactions** - View transactions for selected school only
- **School Statistics** - Metrics specific to each school

### 🔍 **Status Checking**

- **Individual Transaction Lookup** - Search by transaction ID
- **Detailed Transaction View** - Complete transaction information
- **Status Tracking** - Real-time status updates

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom components
- **State Management**: React Context API
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Icons**: Heroicons
- **Notifications**: react-toastify
- **Date Handling**: date-fns

## 📁 Project Structure

```
src/
├── assets/             # Static assets
│   └── react.svg      # React logo
├── components/         # Reusable UI components
│   ├── Layout.tsx     # Main layout with sidebar
│   └── ProtectedRoute.tsx # Route protection wrapper
├── context/           # React Context providers
│   ├── AuthContext.tsx # Authentication state
│   └── ThemeContext.tsx # Dark mode state
├── pages/             # Page components
│   ├── Dashboard.tsx  # Main dashboard
│   ├── Login.tsx      # Login page
│   ├── Register.tsx   # Registration page
│   ├── StatusCheck.tsx # Transaction status lookup
│   └── TransactionDetails.tsx # Individual transaction details
├── services/          # API services
│   └── api.ts        # Axios configuration and API calls
├── types/             # TypeScript type definitions
│   └── index.ts      # All type definitions
├── utils/             # Utility functions
│   └── format.ts     # Formatting helpers
├── App.tsx           # Main app component
├── App.css           # App-specific styles
├── index.css         # Global styles
├── main.tsx          # Application entry point
└── vite-env.d.ts     # Vite environment types
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running (see backend README)

### Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd school-payment-frontend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   ```bash
   # Create .env file
   echo "VITE_API_URL=https://school-payment-api-4.onrender.com" > .env
   ```

4. **Start the development server**:

   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:5173](http://localhost:5173)

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Backend API URL
VITE_API_URL=https://school-payment-api-4.onrender.com
```

### API Integration

The frontend automatically connects to the backend API. Make sure the backend is running and accessible at the configured URL.

## 📱 Pages Overview

### 🏠 **Dashboard** (`/`)

- **Statistics Cards** - Total transactions, amounts, success rates
- **Recent Transactions** - Latest 10 transactions
- **Quick Actions** - Easy navigation to other sections
- **Real-time Updates** - Live data from backend

### 📊 **Transactions** (`/transactions`)

- **Complete List** - All transactions with pagination
- **Advanced Filters**:
  - Status (Success, Pending, Failed)
  - School ID selection
  - Date range filtering
  - Search by transaction ID
- **Column Sorting** - Click headers to sort
- **Export Options** - Download transaction data

### 🏫 **School Transactions** (`/transactions/school`)

- **School Selection** - Choose from available schools
- **Filtered View** - Only transactions for selected school
- **School Statistics** - Metrics specific to school
- **Same Filtering** - All transaction filters available

### 🔍 **Status Check** (`/status-check`)

- **Transaction Lookup** - Search by transaction ID
- **Detailed View** - Complete transaction information
- **Status Indicators** - Visual status representation
- **Student Details** - Associated student information

## 🎨 UI Components

### **Layout Components**

- **Sidebar Navigation** - Persistent navigation menu
- **Top Bar** - Theme toggle and user info
- **Responsive Design** - Mobile-friendly layout

### **Data Components**

- **Data Tables** - Sortable, filterable tables
- **Status Badges** - Color-coded status indicators
- **Pagination** - Navigate through large datasets
- **Loading States** - Smooth loading indicators

### **Form Components**

- **Input Fields** - Styled input components
- **Buttons** - Primary and secondary button styles
- **Select Dropdowns** - Custom styled selects
- **Search Bars** - Integrated search functionality

## 🌙 Dark Mode

The application includes a complete dark mode implementation:

- **Automatic Detection** - Respects system preference
- **Manual Toggle** - Theme switcher in top bar
- **Persistent Setting** - Remembers user preference
- **Smooth Transitions** - Animated theme changes

## 🔐 Authentication Flow

1. **Registration** - Create new user account
2. **Login** - Authenticate with email/password
3. **Token Storage** - JWT stored in localStorage
4. **Auto-login** - Persistent sessions
5. **Protected Routes** - Automatic redirects
6. **Logout** - Clear tokens and redirect


## 🚀 Deployment

### **Build for Production**

```bash
npm run build
```

### **Preview Production Build**

```bash
npm run preview
```

### **Deploy to Vercel/Netlify**

1. Connect your repository
2. Set environment variables
3. Deploy automatically

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript checks
- `npm run lint` - Run ESLint

