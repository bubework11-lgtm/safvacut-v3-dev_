# Safvacut V3 - Modern Web3 Wallet (Replit Project)

## Overview
Safvacut V3 is a cryptocurrency wallet and trading platform being transformed from vanilla JS + Firebase into a modern React + TypeScript + Supabase production PWA.

## Tech Stack (Phase 1, 2 & 3 Complete)
- **Frontend**: React 19 + TypeScript + Vite
- **Routing**: React Router v6 with protected routes
- **Styling**: Tailwind CSS 3.4 + shadcn/ui
- **State**: TanStack Query
- **Authentication**: Supabase Auth with email/password
- **Web3**: wagmi + viem + RainbowKit 2.3
- **Backend**: Supabase (schema + edge functions ready)
- **UI Components**: Framer Motion, Sonner, Lucide React, Recharts
- **Build**: Vite 7 with Hot Module Replacement

## Project Structure
```
/
├── src/
│   ├── App.tsx              # Main app with React Router & protected routes
│   ├── main.tsx             # Entry point
│   ├── index.css            # Tailwind + global styles
│   ├── lib/
│   │   ├── utils.ts         # Utility functions (cn, etc.)
│   │   └── supabase.ts      # Supabase client configuration
│   ├── hooks/
│   │   └── useUser.ts       # Auth state, profile & admin check hook
│   └── components/
│       ├── auth/
│       │   ├── Login.tsx    # Login component with routing
│       │   ├── Signup.tsx   # Signup component with routing
│       │   └── BiometricLogin.tsx # Biometric auth placeholder
│       ├── OnboardingCarousel.tsx # Welcome carousel
│       └── ui/              # shadcn components (to be added)
├── supabase/
│   ├── migrations/
│   │   └── 001_init.sql     # Database schema with RLS
│   └── functions/
│       ├── credit_deposit/  # Admin deposit crediting
│       └── approve_withdrawal/ # Admin withdrawal approval
├── public/
│   ├── logo.png             # Safvacut logo
│   └── images/              # Crypto images (BTC, ETH, etc.)
├── vite.config.ts           # Vite config with aliases & port 5000
├── tailwind.config.js       # Tailwind config
├── components.json          # shadcn/ui config
└── package.json             # All dependencies listed
```

## Port Configuration
- **Dev Server**: 0.0.0.0:5000 (Replit webview compatible)
- **Workflow**: vite-dev running `npm run dev`

## Recent Changes

### 2025-11-05: PHASE 3 - Auth & User Flow ✓
1. ✅ Configured Supabase credentials (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
2. ✅ Created Supabase client with environment variables
3. ✅ Built useUser hook with:
   - Auth state management
   - Profile loading with auto-creation
   - Admin role checking
   - Session persistence
4. ✅ Implemented authentication UI:
   - Login component with email/password
   - Signup component with validation
   - OnboardingCarousel with animated slides
   - BiometricLogin placeholder component
5. ✅ Set up React Router v6:
   - Protected routes for authenticated users
   - Public routes for auth pages
   - Automatic routing after login/signup
   - Loading states and error handling
6. ✅ Created Dashboard displaying:
   - User email and unique UID
   - Admin status indicator
   - Sign out functionality
7. ✅ Code review passed - auth flow fully functional

### 2025-11-04: PHASE 2 - Supabase Schema & Backend ✓
1. ✅ Created database schema with production-ready security:
   - Tables: profiles, balances, transactions, withdrawals, deposit_addresses, admins
   - Row Level Security (RLS) with proper WITH CHECK clauses
   - Admin helper function for role verification
   - Comprehensive indexes for performance
2. ✅ Built secure Edge Functions with JWT authentication:
   - credit_deposit: Admin-only deposit crediting
   - approve_withdrawal: Admin-only withdrawal approval
   - Both validate authorization headers and derive user from JWT
   - Comprehensive error handling
3. ✅ Configured environment variables (.env.example)
4. ✅ Vite dev server running on port 5000
5. ✅ All dependencies installed successfully
6. ✅ Security review passed - production-ready

### 2025-11-04: PHASE 1 - Setup React Stack ✓
1. ✅ Created Vite React TypeScript project
2. ✅ Added all required dependencies
3. ✅ Configured Tailwind CSS 3 with PostCSS
4. ✅ Set up shadcn/ui configuration
5. ✅ Preserved assets from original project

## Next Steps - PHASE 4

**Before starting Phase 4, you must:**
1. Deploy the Supabase migration to your Supabase project
2. Deploy the Edge Functions (credit_deposit, approve_withdrawal)
3. Create your first admin user in the `admins` table

**Key Phase 4 Tasks:**
1. Build wallet dashboard with:
   - Balance display for multiple tokens
   - Transaction history
   - Deposit addresses generation
2. Implement deposit flow:
   - Display deposit addresses per token
   - Show pending deposits
   - Admin approval interface
3. Implement withdrawal flow:
   - Withdrawal request form
   - Pending withdrawal list
   - Admin approval interface
4. Create admin panel:
   - User management
   - Deposit crediting
   - Withdrawal approval
   - Transaction monitoring
