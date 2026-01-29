import { Outlet } from 'react-router-dom'
import { Layers } from 'lucide-react'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">StackAudit.ai</span>
          </div>
        </div>
        
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Stop overpaying for your SaaS stack.
          </h1>
          <p className="text-lg text-primary-100">
            Discover hidden costs, eliminate waste, and optimize your tech stack with AI-powered insights.
          </p>
          
          <div className="grid grid-cols-3 gap-4 pt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold text-white">$2.4M</div>
              <div className="text-sm text-primary-200">Waste identified</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold text-white">847</div>
              <div className="text-sm text-primary-200">Audits completed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold text-white">32%</div>
              <div className="text-sm text-primary-200">Avg. savings</div>
            </div>
          </div>
        </div>
        
        <div className="text-primary-200 text-sm">
          Trusted by 500+ companies worldwide
        </div>
      </div>
      
      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
