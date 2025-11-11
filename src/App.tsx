import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { Login } from "./components/auth/Login";
import { Signup } from "./components/auth/Signup";
import { OnboardingCarousel } from "./components/OnboardingCarousel";
import { BiometricLogin } from "./components/auth/BiometricLogin";
import { Dashboard } from "./components/dashboard/Dashboard";
import { Deposit } from "./components/wallet/Deposit";
import { Withdraw } from "./components/wallet/Withdraw";
import { AdminPanel } from "./components/admin/AdminPanel";
import { UserList } from "./components/admin/UserList";
import { TransactionHistory } from "./components/wallet/TransactionHistory";
import ErrorBoundary from "./components/ErrorBoundary";

function LoginWithBiometric() {
  return (
    <div className="relative">
      <Login />
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md px-8">
        <BiometricLogin />
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster position="top-center" richColors expand={true} />
        <Routes>
          <Route path="/" element={<OnboardingCarousel />} />
          <Route path="/login" element={<LoginWithBiometric />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/deposit" element={<Deposit />} />
          <Route path="/withdraw" element={<Withdraw />} />
          <Route path="/history" element={<TransactionHistory />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/users" element={<UserList />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
