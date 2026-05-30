import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Loader2, RefreshCcw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function VerifyOtp() {
  const navigate = useNavigate()
  const location = useLocation()
  const { verifyOtp, resendOtp } = useAuth()
  
  const email = location.state?.email
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(120)
  const inputRefs = useRef([])

  useEffect(() => {
    if (!email) {
      navigate('/signup')
      return
    }
    inputRefs.current[0]?.focus()
  }, [email, navigate])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown(c => c - 1), 1000)
      return () => clearInterval(timer)
    }
  }, [countdown])

  const handleChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.slice(0, 6).split('')
      const newOtp = [...otp]
      digits.forEach((digit, i) => {
        if (index + i < 6) newOtp[index + i] = digit
      })
      setOtp(newOtp)
      inputRefs.current[Math.min(index + digits.length, 5)]?.focus()
    } else {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus()
      }
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const otpCode = otp.join('')
    
    if (otpCode.length !== 6) {
      toast.error('Please enter the complete OTP')
      return
    }

    setLoading(true)
    try {
      await verifyOtp(email, otpCode)
      toast.success('Account created successfully!')
      navigate('/')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await resendOtp(email)
      toast.success('OTP resent successfully')
      setCountdown(120)
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setResending(false)
    }
  }

  if (!email) return null

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="card p-8">
          <div className="text-center mb-8">
            <Link to="/" className="text-3xl font-bold text-primary-600">Verve</Link>
            <h2 className="mt-4 text-2xl font-bold text-secondary-900">Verify your email</h2>
            <p className="mt-2 text-secondary-500">
              We&apos;ve sent a 6-digit code to<br />
              <span className="font-medium text-secondary-700">{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-xl font-semibold border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            {countdown > 0 ? (
              <p className="text-secondary-500">
                Resend code in {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-primary-600 hover:text-primary-500 font-medium flex items-center justify-center gap-2 mx-auto"
              >
                <RefreshCcw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
                {resending ? 'Resending...' : 'Resend OTP'}
              </button>
            )}
          </div>

          <p className="mt-6 text-center text-secondary-600">
            <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500">
              ← Back to signup
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
