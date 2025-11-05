import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'
import { CheckCircle, Loader2, DollarSign } from 'lucide-react'
import type { Withdrawal, Profile } from '../../types/database'

interface WithdrawalWithProfile extends Withdrawal {
  profile?: Profile
}

export function AdminPanel() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<number | null>(null)
  
  // Credit deposit form state
  const [creditForm, setCreditForm] = useState({
    target_user_id: '',
    token: 'BTC',
    amount: '',
    tx_hash: '',
  })
  const [crediting, setCrediting] = useState(false)

  useEffect(() => {
    loadWithdrawals()
    
    // Subscribe to withdrawal changes
    const channel = supabase
      .channel('admin_withdrawals')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'withdrawals',
      }, () => {
        loadWithdrawals()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function loadWithdrawals() {
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select(`
          *,
          profile:profiles(id, uid, email)
        `)
        .order('requested_at', { ascending: false })

      if (error) throw error
      
      setWithdrawals(data || [])
    } catch (error) {
      console.error('Error loading withdrawals:', error)
      toast.error('Failed to load withdrawals')
    } finally {
      setLoading(false)
    }
  }

  async function approveWithdrawal(withdrawalId: number, txHash: string) {
    if (!txHash.trim()) {
      toast.error('Transaction hash is required')
      return
    }

    setProcessing(withdrawalId)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/approve_withdrawal`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            withdrawal_id: withdrawalId,
            tx_hash: txHash,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to approve withdrawal')
      }

      toast.success('Withdrawal approved successfully')
      loadWithdrawals()
    } catch (error: any) {
      console.error('Error approving withdrawal:', error)
      toast.error(error.message || 'Failed to approve withdrawal')
    } finally {
      setProcessing(null)
    }
  }

  async function creditDeposit() {
    if (!creditForm.target_user_id || !creditForm.amount || !creditForm.tx_hash) {
      toast.error('All fields are required')
      return
    }

    setCrediting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/credit_deposit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(creditForm),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to credit deposit')
      }

      toast.success('Deposit credited successfully')
      setCreditForm({ target_user_id: '', token: 'BTC', amount: '', tx_hash: '' })
    } catch (error: any) {
      console.error('Error crediting deposit:', error)
      toast.error(error.message || 'Failed to credit deposit')
    } finally {
      setCrediting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <div className="text-sm text-gray-400">
            {pendingWithdrawals.length} pending withdrawal(s)
          </div>
        </div>

        {/* Credit Deposit Form */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-semibold text-white">Credit Deposit</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                User ID
              </label>
              <input
                type="text"
                value={creditForm.target_user_id}
                onChange={(e) => setCreditForm({ ...creditForm, target_user_id: e.target.value })}
                placeholder="User UUID or UID"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Token
              </label>
              <select
                value={creditForm.token}
                onChange={(e) => setCreditForm({ ...creditForm, token: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="USDT">Tether (USDT)</option>
                <option value="USDC">USD Coin (USDC)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount
              </label>
              <input
                type="number"
                step="0.00000001"
                value={creditForm.amount}
                onChange={(e) => setCreditForm({ ...creditForm, amount: e.target.value })}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Transaction Hash
              </label>
              <input
                type="text"
                value={creditForm.tx_hash}
                onChange={(e) => setCreditForm({ ...creditForm, tx_hash: e.target.value })}
                placeholder="0x..."
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          
          <button
            onClick={creditDeposit}
            disabled={crediting}
            className="mt-4 w-full md:w-auto px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-600/50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {crediting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              'Credit Deposit'
            )}
          </button>
        </div>

        {/* Pending Withdrawals */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-6">Pending Withdrawals</h2>
          
          {pendingWithdrawals.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-400">No pending withdrawals</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Token</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">To Address</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Requested</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingWithdrawals.map((withdrawal) => (
                    <WithdrawalRow
                      key={withdrawal.id}
                      withdrawal={withdrawal}
                      processing={processing === withdrawal.id}
                      onApprove={(txHash) => approveWithdrawal(withdrawal.id, txHash)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* All Withdrawals */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-6">All Withdrawals</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Token</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Requested</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">TX Hash</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="border-b border-slate-700/50">
                    <td className="py-3 px-4 text-sm text-white">
                      {withdrawal.profile?.uid || withdrawal.user_id.slice(0, 8)}
                    </td>
                    <td className="py-3 px-4 text-sm text-white">{withdrawal.token}</td>
                    <td className="py-3 px-4 text-sm text-white">{withdrawal.amount}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        withdrawal.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        withdrawal.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {withdrawal.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-400">
                      {new Date(withdrawal.requested_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-400 font-mono">
                      {withdrawal.tx_hash ? withdrawal.tx_hash.slice(0, 10) + '...' : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function WithdrawalRow({ 
  withdrawal, 
  processing, 
  onApprove 
}: { 
  withdrawal: WithdrawalWithProfile
  processing: boolean
  onApprove: (txHash: string) => void
}) {
  const [txHash, setTxHash] = useState('')
  const [showInput, setShowInput] = useState(false)

  return (
    <tr className="border-b border-slate-700/50 hover:bg-slate-700/30">
      <td className="py-3 px-4 text-sm text-white">
        {withdrawal.profile?.uid || withdrawal.user_id.slice(0, 8)}
      </td>
      <td className="py-3 px-4 text-sm text-white">{withdrawal.token}</td>
      <td className="py-3 px-4 text-sm text-white">{withdrawal.amount}</td>
      <td className="py-3 px-4 text-sm text-gray-400 font-mono text-xs">
        {withdrawal.to_address.slice(0, 12)}...
      </td>
      <td className="py-3 px-4 text-sm text-gray-400">
        {new Date(withdrawal.requested_at).toLocaleDateString()}
      </td>
      <td className="py-3 px-4">
        {showInput ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="0x..."
              className="px-3 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
            <button
              onClick={() => onApprove(txHash)}
              disabled={processing || !txHash}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white text-sm rounded transition-colors"
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
            </button>
            <button
              onClick={() => setShowInput(false)}
              className="px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white text-sm rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowInput(true)}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Approve
          </button>
        )}
      </td>
    </tr>
  )
}
