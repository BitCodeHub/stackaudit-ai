import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Check } from 'lucide-react'
import Button from '../components/shared/Button'
import Input from '../components/shared/Input'

const requirements = [
  { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { id: 'number', label: 'Contains a number', test: (p) => /\d/.test(p) },
  { id: 'special', label: 'Contains a special character', test: (p) => /[!@#$%^&*]/.test(p) },
]

export default function SignupPage() {
  const { signup } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      await signup(name, email, password)
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const allRequirementsMet = requirements.every((req) => req.test(password))

  return (
    <div>
      {/* Mobile Logo */}
      <div className="lg:hidden flex justify-center mb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="text-xl font-semibold text-neutral-900 tracking-tight">StackAudit</span>
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-neutral-900 tracking-tight">Create your account</h2>
        <p className="text-neutral-500 mt-2 text-sm">Start optimizing your SaaS stack today</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-xl text-danger-700 text-sm flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-danger-100 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-danger-600 text-xs font-bold">!</span>
          </div>
          <div>{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Full Name"
          type="text"
          placeholder="Jane Smith"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={User}
          required
        />

        <Input
          label="Work Email"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={Mail}
          required
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={Lock}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Password requirements */}
        {password && (
          <div className="space-y-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
            {requirements.map((req) => {
              const met = req.test(password)
              return (
                <div 
                  key={req.id}
                  className={`flex items-center gap-2 text-sm ${met ? 'text-success-600' : 'text-neutral-500'}`}
                >
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    met ? 'bg-success-100' : 'bg-neutral-200'
                  }`}>
                    {met && <Check className="w-2.5 h-2.5" />}
                  </div>
                  {req.label}
                </div>
              )
            })}
          </div>
        )}

        <Button 
          type="submit" 
          loading={loading} 
          fullWidth
          size="lg"
          icon={ArrowRight} 
          iconPosition="right"
          disabled={!allRequirementsMet && password.length > 0}
        >
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-neutral-500 leading-relaxed">
        By signing up, you agree to our{' '}
        <a href="#" className="text-primary-600 hover:text-primary-700 transition-colors">Terms of Service</a>
        {' '}and{' '}
        <a href="#" className="text-primary-600 hover:text-primary-700 transition-colors">Privacy Policy</a>
      </p>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-neutral-400">or</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white border border-neutral-300 rounded-xl hover:bg-neutral-50 hover:border-neutral-400 transition-all shadow-xs">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-sm font-medium text-neutral-700">Google</span>
          </button>
          <button className="flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white border border-neutral-300 rounded-xl hover:bg-neutral-50 hover:border-neutral-400 transition-all shadow-xs">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span className="text-sm font-medium text-neutral-700">GitHub</span>
          </button>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-neutral-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}
