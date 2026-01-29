import { Outlet } from 'react-router-dom'
import { TrendingDown, Shield, Zap, ArrowRight } from 'lucide-react'

const stats = [
  { value: '$4.2M', label: 'Savings identified', sublabel: 'for our customers' },
  { value: '2,400+', label: 'Audits completed', sublabel: 'this quarter' },
  { value: '34%', label: 'Average savings', sublabel: 'per company' },
]

const features = [
  { 
    icon: TrendingDown, 
    title: 'Identify waste', 
    description: 'Find unused licenses and duplicate tools instantly' 
  },
  { 
    icon: Shield, 
    title: 'Reduce risk', 
    description: 'Consolidate vendors and improve security posture' 
  },
  { 
    icon: Zap, 
    title: 'AI-powered', 
    description: 'Get intelligent recommendations in seconds' 
  },
]

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[50%] relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-neutral-900" />
        
        {/* Gradient overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse at top left, rgba(139, 92, 246, 0.4) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(6, 182, 212, 0.3) 0%, transparent 50%)'
          }}
        />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '64px 64px'
          }}
        />
        
        <div className="relative z-10 flex flex-col w-full p-12 xl:p-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-xl font-semibold text-white tracking-tight">StackAudit</span>
          </div>
          
          {/* Main content */}
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.15] tracking-tight">
              Stop overpaying for your 
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-accent-400"> SaaS stack</span>
            </h1>
            <p className="mt-5 text-lg text-neutral-400 leading-relaxed">
              Discover hidden costs, eliminate waste, and optimize your entire tech stack with AI-powered insights.
            </p>
            
            {/* Features */}
            <div className="mt-10 space-y-4">
              {features.map((feature) => (
                <div 
                  key={feature.title}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center shrink-0">
                    <feature.icon className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{feature.title}</h3>
                    <p className="text-sm text-neutral-400 mt-0.5">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl xl:text-3xl font-bold text-white tracking-tight">{stat.value}</div>
                <div className="text-sm text-neutral-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-[400px]">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
