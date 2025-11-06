import { useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import { useBalances } from "../../hooks/useBalances";
import { usePrices } from "../../hooks/usePrices";
import { useDarkMode } from "../../contexts/DarkModeContext";
import { SUPPORTED_TOKENS } from "../../types/database";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  LogOut,
  Moon,
  Sun,
  Copy,
  QrCode,
  X,
  History,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "../../lib/supabase";
import { haptics } from "../../lib/haptics";
import { toast } from "sonner";
import { DashboardSkeleton } from "../ui/SkeletonLoader";

export function Dashboard() {
  const { user, profile, isAdmin } = useUser();
  const { balances, loading: balancesLoading } = useBalances(user?.id ?? "");
  const { prices, loading: pricesLoading } = usePrices();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [showQR, setShowQR] = useState(false);

  const getBalance = (token: string) => {
    const balance = balances.find((b) => b.token === token);
    return balance ? parseFloat(balance.amount) : 0;
  };

  const getUsdValue = (token: string, amount: number) => {
    const price = prices[token]?.usd || 0;
    return amount * price;
  };

  const totalUsd = SUPPORTED_TOKENS.reduce((sum, token) => {
    const amount = getBalance(token);
    return sum + getUsdValue(token, amount);
  }, 0);

  const handleSignOut = async () => {
    haptics.medium();
    await supabase.auth.signOut();
  };

  const handleCopyUID = () => {
    if (profile?.uid) {
      navigator.clipboard.writeText(profile.uid);
      toast.success("UID copied to clipboard!");
      haptics.light();
    }
  };

  const handleShowQR = () => {
    setShowQR(true);
    haptics.light();
  };

  if (!profile) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-black text-gray-900 dark:text-white transition-colors">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img
              src="/logo.png"
              alt="Safvacut"
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h1 className="text-2xl font-bold">Safvacut V3</h1>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-400">{profile.uid}</p>
                <button
                  onClick={handleCopyUID}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                  aria-label="Copy UID"
                  title="Copy UID"
                >
                  <Copy className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                </button>
                <button
                  onClick={handleShowQR}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                  aria-label="Show QR Code"
                  title="Show Profile QR"
                >
                  <QrCode className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                haptics.light();
                toggleDarkMode();
              }}
              className="p-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {isAdmin && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-6">
            <p className="text-orange-600 dark:text-orange-400 font-semibold">
              🔑 Admin Panel Access
            </p>
          </div>
        )}

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 mb-6 shadow-xl">
          <p className="text-orange-100 text-sm mb-2">Total Portfolio Value</p>
          {balancesLoading || pricesLoading ? (
            <div className="h-10 w-48 bg-orange-400/30 rounded animate-pulse"></div>
          ) : (
            <motion.h2
              className="text-4xl font-bold"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={totalUsd}
            >
              $
              {totalUsd.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </motion.h2>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Link
            to="/deposit"
            onClick={() => haptics.light()}
            className="bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg p-6 transition-colors flex flex-col items-center gap-3"
          >
            <div className="bg-green-500/20 p-3 rounded-full">
              <ArrowDownLeft className="w-6 h-6 text-green-500" />
            </div>
            <span className="font-semibold">Deposit</span>
          </Link>

          <Link
            to="/withdraw"
            onClick={() => haptics.light()}
            className="bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg p-6 transition-colors flex flex-col items-center gap-3"
          >
            <div className="bg-red-500/20 p-3 rounded-full">
              <ArrowUpRight className="w-6 h-6 text-red-500" />
            </div>
            <span className="font-semibold">Withdraw</span>
          </Link>

          <Link
            to="/history"
            onClick={() => haptics.light()}
            className="bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg p-6 transition-colors flex flex-col items-center gap-3 md:col-span-1 col-span-2"
          >
            <div className="bg-blue-500/20 p-3 rounded-full">
              <History className="w-6 h-6 text-blue-500" />
            </div>
            <span className="font-semibold">History</span>
          </Link>
        </div>

        <div className="bg-gray-200 dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Assets</h3>
            <RefreshCw className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>

          <div className="space-y-3">
            {SUPPORTED_TOKENS.map((token) => {
              const amount = getBalance(token);
              const usdValue = getUsdValue(token, amount);
              const price = prices[token]?.usd || 0;

              return (
                <div
                  key={token}
                  className="bg-gray-100 dark:bg-gray-900/50 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-bold">
                      {token.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold">{token}</p>
                      {pricesLoading ? (
                        <div className="h-4 w-16 bg-gray-700 rounded animate-pulse mt-1"></div>
                      ) : (
                        <p className="text-sm text-gray-400">
                          $
                          {price.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {balancesLoading ? (
                      <div className="h-5 w-24 bg-gray-700 rounded animate-pulse"></div>
                    ) : (
                      <>
                        <motion.p
                          className="font-semibold"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          key={amount}
                        >
                          {amount.toFixed(8)} {token}
                        </motion.p>
                        <p className="text-sm text-gray-400">
                          $
                          {usdValue.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {isAdmin && (
          <div className="mt-6">
            <Link
              to="/admin"
              className="block bg-orange-500 hover:bg-orange-600 text-white text-center font-semibold py-3 rounded-lg transition-colors"
            >
              🔐 Admin Panel
            </Link>
          </div>
        )}
      </div>

      {showQR && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowQR(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-sm w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold mb-2">Profile QR Code</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Share this QR code for your profile UID
            </p>

            <div className="bg-white p-6 rounded-xl flex items-center justify-center mb-4">
              <QRCodeSVG
                value={profile?.uid ?? ""}
                size={200}
                level="H"
                includeMargin={true}
              />

            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Your UID
              </p>
              <p className="font-mono font-bold text-lg">{profile.uid}</p>
            </div>

            <button
              onClick={handleCopyUID}
              className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy UID
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
