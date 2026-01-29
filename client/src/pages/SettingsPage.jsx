import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { 
  User, 
  Building, 
  CreditCard, 
  Bell, 
  Shield, 
  Key,
  Check,
  AlertTriangle,
  Zap,
  Users,
  BarChart3,
  Layers
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, Select } from '../components/shared'
import clsx from 'clsx'

const tabs = [
  { id: 'profile', name: 'Profile', icon: User },
  { id: 'company', name: 'Company', icon: Building },
  { id: 'billing', name: 'Billing', icon: CreditCard },
  { id: 'notifications', name: 'Notifications', icon: Bell },
  { id: 'security', name: 'Security', icon: Shield }
]

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: ['3 audits/month', 'Basic recommendations', 'Email support'],
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49,
    features: ['Unlimited audits', 'Advanced AI insights', 'Priority support', 'Team collaboration', 'Custom reports'],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    features: ['Everything in Pro', 'SSO/SAML', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee'],
    popular: false
  }
]

export default function SettingsPage() {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    timezone: 'America/Los_Angeles',
    language: 'en'
  })

  const [companyData, setCompanyData] = useState({
    name: user?.company || '',
    size: '50-100',
    industry: 'Technology'
  })

  const [notifications, setNotifications] = useState({
    weeklyReport: true,
    newRecommendations: true,
    savingsAlerts: true,
    productUpdates: false,
    marketingEmails: false
  })

  const handleSave = async () => {
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    updateUser({ name: profileData.name })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account preferences and billing</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <tab.icon className="w-5 h-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card className="p-6">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {profileData.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <Button variant="secondary" size="sm">Change Photo</Button>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG, or GIF. Max 2MB.</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  />
                  <Select
                    label="Timezone"
                    value={profileData.timezone}
                    onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                  >
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="Europe/London">London (GMT)</option>
                  </Select>
                  <Select
                    label="Language"
                    value={profileData.language}
                    onChange={(e) => setProfileData({ ...profileData, language: e.target.value })}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </Select>
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <Button onClick={handleSave} loading={saving}>
                    {saved ? 'Saved!' : 'Save Changes'}
                  </Button>
                  {saved && (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Changes saved successfully
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Company Tab */}
          {activeTab === 'company' && (
            <Card className="p-6">
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Company Name"
                  value={companyData.name}
                  onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Select
                    label="Company Size"
                    value={companyData.size}
                    onChange={(e) => setCompanyData({ ...companyData, size: e.target.value })}
                  >
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="50-100">50-100 employees</option>
                    <option value="100-500">100-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </Select>
                  <Select
                    label="Industry"
                    value={companyData.industry}
                    onChange={(e) => setCompanyData({ ...companyData, industry: e.target.value })}
                  >
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Retail">Retail</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Other">Other</option>
                  </Select>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSave} loading={saving}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <>
              {/* Current Plan */}
              <Card className="p-6">
                <CardHeader>
                  <CardTitle>Current Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                        <Zap className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">Pro Plan</h3>
                          <Badge variant="primary">Active</Badge>
                        </div>
                        <p className="text-sm text-gray-500">$49/month • Renews Jan 15, 2025</p>
                      </div>
                    </div>
                    <Button variant="secondary">Manage</Button>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4 mt-6">
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <BarChart3 className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">12</div>
                      <div className="text-sm text-gray-500">Audits this month</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <Users className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">3</div>
                      <div className="text-sm text-gray-500">Team members</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <Layers className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">47</div>
                      <div className="text-sm text-gray-500">Tools tracked</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Available Plans */}
              <Card className="p-6">
                <CardHeader>
                  <CardTitle>Available Plans</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {plans.map((plan) => (
                      <div 
                        key={plan.id}
                        className={clsx(
                          'relative p-4 border rounded-xl transition-all',
                          plan.popular 
                            ? 'border-primary-500 ring-1 ring-primary-500' 
                            : 'border-gray-200 hover:border-gray-300',
                          user?.plan === plan.id && 'bg-gray-50'
                        )}
                      >
                        {plan.popular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <Badge variant="primary">Most Popular</Badge>
                          </div>
                        )}
                        <div className="text-center mb-4">
                          <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                          <div className="mt-2">
                            {plan.price !== null ? (
                              <>
                                <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                                <span className="text-gray-500">/mo</span>
                              </>
                            ) : (
                              <span className="text-2xl font-bold text-gray-900">Custom</span>
                            )}
                          </div>
                        </div>
                        <ul className="space-y-2 mb-4">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <Button 
                          variant={user?.plan === plan.id ? 'secondary' : plan.popular ? 'primary' : 'secondary'}
                          className="w-full"
                          disabled={user?.plan === plan.id}
                        >
                          {user?.plan === plan.id ? 'Current Plan' : plan.price === null ? 'Contact Sales' : 'Upgrade'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="p-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Payment Method</CardTitle>
                  <Button variant="secondary" size="sm">Add New</Button>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">
                        VISA
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">•••• •••• •••• 4242</div>
                        <div className="text-sm text-gray-500">Expires 12/26</div>
                      </div>
                    </div>
                    <Badge variant="success">Default</Badge>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card className="p-6">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'weeklyReport', label: 'Weekly Stack Report', description: 'Receive a summary of your SaaS spend and savings opportunities' },
                  { key: 'newRecommendations', label: 'New Recommendations', description: 'Get notified when we discover new optimization opportunities' },
                  { key: 'savingsAlerts', label: 'Savings Alerts', description: 'Alert when potential savings exceed $500/month' },
                  { key: 'productUpdates', label: 'Product Updates', description: 'Learn about new features and improvements' },
                  { key: 'marketingEmails', label: 'Marketing Emails', description: 'Tips, best practices, and industry insights' }
                ].map((item) => (
                  <div key={item.key} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{item.label}</div>
                      <div className="text-sm text-gray-500">{item.description}</div>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                      className={clsx(
                        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                        notifications[item.key] ? 'bg-primary-600' : 'bg-gray-200'
                      )}
                    >
                      <span
                        className={clsx(
                          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                          notifications[item.key] ? 'translate-x-5' : 'translate-x-0'
                        )}
                      />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <>
              <Card className="p-6">
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input label="Current Password" type="password" />
                  <Input label="New Password" type="password" />
                  <Input label="Confirm New Password" type="password" />
                  <Button>Update Password</Button>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <div>
                        <div className="font-medium text-yellow-800">2FA is not enabled</div>
                        <div className="text-sm text-yellow-600">Add an extra layer of security to your account</div>
                      </div>
                    </div>
                    <Button icon={Key}>Enable 2FA</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6 border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-600">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Delete Account</div>
                      <div className="text-sm text-gray-500">Permanently delete your account and all data</div>
                    </div>
                    <Button variant="danger">Delete Account</Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
