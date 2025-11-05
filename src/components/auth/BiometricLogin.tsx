import { useState } from 'react'
import { Fingerprint } from 'lucide-react'
import { toast } from 'sonner'

export function BiometricLogin() {
  const [loading, setLoading] = useState(false)

  async function handleBiometricLogin() {
    setLoading(true)

    try {
      if (!window.PublicKeyCredential) {
        toast.error('Biometric authentication is not supported on this device')
        return
      }

      toast.info('Biometric authentication coming soon!')
    } catch (error: any) {
      toast.error('Biometric authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <button
        onClick={handleBiometricLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <Fingerprint className="w-5 h-5" />
        {loading ? 'Authenticating...' : 'Login with Biometrics'}
      </button>
      <p className="text-xs text-center text-gray-500 mt-2">
        Use fingerprint or face recognition
      </p>
    </div>
  )
}
