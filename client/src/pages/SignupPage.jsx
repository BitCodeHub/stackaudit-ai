import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Layers, User, Mail, Lock, Building, ArrowRight, Check } from 'lucide-react'
import Button from '../components/shared/Button'
import Input from '../components/shared/Input'

const features = [
  'Unlimited stack audits',
  'AI-powered recommendations',
  'Cost tracking & analytics',
  'Integration with 100+ tools'
]

export default function SignupPage() {
  const { signup } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      await signup(formData.name, formData.email, formData.password, formData.company)
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Mobile Logo */}
      <div className="lg:hidden flex justify-center mb-8">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">StackAudit.ai</span>
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
        <p className="text-gray-500 mt-2">Start optimizing your SaaS stack today</p>
      </div>

      {/* Features */}
      <div className="mb-6 p-4 bg-primary-50 rounded-lg">
        <div className="grid grid-cols-2 gap-2">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-primary-700">
              <Check className="w-4 h-4" />
              {feature}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <Input
            type="text"
            name="name"
            placeholder="Full name"
            value={formData.name}
            onChange={handleChange}
            required
            className="pl-10"
          />
        </div>

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <Input
            type="email"
            name="email"
            placeholder="Work email"
            value={formData.email}
            onChange={handleChange}
            required
            className="pl-10"
          />
        </div>

        <div className="relative">
          <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <Input
            type="text"
            name="company"
            placeholder="Company name"
            value={formData.company}
            onChange={handleChange}
            required
            className="pl-10"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <Input
            type="password"
            name="password"
            placeholder="Password (min. 8 characters)"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
            className="pl-10"
          />
        </div>

        <label className="flex items-start gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            required
            className="mt-1 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
          />
          <span className="text-sm text-gray-600">
            I agree to the{' '}
            <a href="#" className="text-primary-600 hover:text-primary-700">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-primary-600 hover:text-primary-700">Privacy Policy</a>
          </span>
        </label>

        <Button type="submit" loading={loading} className="w-full" icon={ArrowRight} iconPosition="right">
          Create account
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  )
}
