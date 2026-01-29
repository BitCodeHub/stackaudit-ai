import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
  LayoutDashboard, 
  PlusCircle, 
  Lightbulb, 
  Settings, 
  LogOut,
  ChevronDown,
  Menu,
  X,
  Search,
  Bell,
  HelpCircle,
  Command
} from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'New Audit', href: '/audit/new', icon: PlusCircle },
  { name: 'Recommendations', href: '/recommendations', icon: Lightbulb },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  
  // Get current page title
  const getCurrentTitle = () => {
    const path = location.pathname
    if (path === '/dashboard') return 'Dashboard'
    if (path === '/audit/new') return 'New Audit'
    if (path.startsWith('/audit/')) return 'Audit Results'
    if (path === '/recommendations') return 'Recommendations'
    if (path === '/settings') return 'Settings'
    return 'StackAudit'
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={clsx(
        "fixed top-0 left-0 z-50 h-screen w-[260px] bg-white border-r border-neutral-200/80",
        "transform transition-transform duration-300 ease-out-expo lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-5 border-b border-neutral-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="text-base font-semibold text-neutral-900 tracking-tight">StackAudit</span>
            </div>
            <button 
              className="lg:hidden p-1.5 -mr-1.5 hover:bg-neutral-100 rounded-lg text-neutral-500 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Quick search */}
          <div className="px-4 pt-4">
            <button className="w-full flex items-center gap-3 px-3 py-2 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 rounded-lg text-sm text-neutral-400 transition-colors group">
              <Search className="w-4 h-4" />
              <span className="flex-1 text-left">Search...</span>
              <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 bg-white border border-neutral-200 rounded text-[10px] font-medium text-neutral-400 shadow-xs">
                <Command className="w-2.5 h-2.5" />K
              </kbd>
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            <p className="px-3 py-2 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Main
            </p>
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                )}
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.name}
              </NavLink>
            ))}
          </nav>
          
          {/* Bottom section */}
          <div className="p-3 border-t border-neutral-100">
            {/* Help link */}
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors mb-2">
              <HelpCircle className="w-[18px] h-[18px]" />
              Help & Support
            </button>
            
            {/* User section */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-accent-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-medium text-neutral-900 truncate">{user?.name}</div>
                  <div className="text-xs text-neutral-500 truncate">{user?.email}</div>
                </div>
                <ChevronDown className={clsx(
                  "w-4 h-4 text-neutral-400 transition-transform duration-200",
                  userMenuOpen && "rotate-180"
                )} />
              </button>
              
              {userMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-large border border-neutral-200 py-1.5 animate-slide-up">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <div className="lg:pl-[260px]">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-neutral-200/80">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 hover:bg-neutral-100 rounded-lg text-neutral-600 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-neutral-900 tracking-tight">
                {getCurrentTitle()}
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <button className="relative p-2 hover:bg-neutral-100 rounded-lg text-neutral-600 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
              </button>
              
              {/* Mobile user avatar */}
              <div className="lg:hidden w-8 h-8 bg-gradient-to-br from-primary-400 to-accent-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="p-4 lg:p-8 max-w-[1400px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
