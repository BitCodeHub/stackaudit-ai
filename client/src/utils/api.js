const API_BASE = '/api'

function getAuthHeaders() {
  const token = localStorage.getItem('stackaudit_token')
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }
}

export async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers
    }
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message)
  }
  
  return response.json()
}

export const api = {
  // Audits
  getAudits: () => apiRequest('/audits'),
  getAudit: (id) => apiRequest(`/audits/${id}`),
  createAudit: (data) => apiRequest('/audits', { method: 'POST', body: JSON.stringify(data) }),
  deleteAudit: (id) => apiRequest(`/audits/${id}`, { method: 'DELETE' }),
  
  // Recommendations
  getRecommendations: (auditId) => apiRequest(`/audits/${auditId}/recommendations`),
  
  // User
  updateProfile: (data) => apiRequest('/user/profile', { method: 'PUT', body: JSON.stringify(data) }),
  updateBilling: (data) => apiRequest('/user/billing', { method: 'PUT', body: JSON.stringify(data) }),
  
  // Tools catalog
  searchTools: (query) => apiRequest(`/tools/search?q=${encodeURIComponent(query)}`),
}

// Mock data for demo purposes
export const mockData = {
  audits: [
    {
      id: '1',
      name: 'Q4 2024 Stack Audit',
      createdAt: '2024-01-15T10:00:00Z',
      status: 'completed',
      totalSpend: 45230,
      potentialSavings: 12400,
      toolCount: 23,
      wastePercentage: 27
    },
    {
      id: '2',
      name: 'Engineering Tools Review',
      createdAt: '2024-01-10T14:30:00Z',
      status: 'completed',
      totalSpend: 28500,
      potentialSavings: 8200,
      toolCount: 15,
      wastePercentage: 29
    },
    {
      id: '3',
      name: 'Marketing Stack Analysis',
      createdAt: '2024-01-05T09:15:00Z',
      status: 'completed',
      totalSpend: 18750,
      potentialSavings: 4100,
      toolCount: 12,
      wastePercentage: 22
    }
  ],
  
  auditDetails: {
    id: '1',
    name: 'Q4 2024 Stack Audit',
    createdAt: '2024-01-15T10:00:00Z',
    status: 'completed',
    summary: {
      totalSpend: 45230,
      potentialSavings: 12400,
      toolCount: 23,
      activeUsers: 156,
      wastePercentage: 27,
      roiScore: 72
    },
    tools: [
      { id: '1', name: 'Slack', category: 'Communication', monthlyCost: 2400, users: 120, utilization: 95, status: 'healthy' },
      { id: '2', name: 'Salesforce', category: 'CRM', monthlyCost: 8500, users: 45, utilization: 68, status: 'warning' },
      { id: '3', name: 'Zoom', category: 'Communication', monthlyCost: 1200, users: 80, utilization: 42, status: 'danger' },
      { id: '4', name: 'HubSpot', category: 'Marketing', monthlyCost: 3200, users: 25, utilization: 78, status: 'healthy' },
      { id: '5', name: 'Jira', category: 'Project Management', monthlyCost: 1800, users: 65, utilization: 88, status: 'healthy' },
      { id: '6', name: 'Notion', category: 'Documentation', monthlyCost: 960, users: 100, utilization: 92, status: 'healthy' },
      { id: '7', name: 'Figma', category: 'Design', monthlyCost: 720, users: 15, utilization: 95, status: 'healthy' },
      { id: '8', name: 'AWS', category: 'Infrastructure', monthlyCost: 12500, users: 30, utilization: 72, status: 'warning' },
      { id: '9', name: 'Datadog', category: 'Monitoring', monthlyCost: 2800, users: 20, utilization: 85, status: 'healthy' },
      { id: '10', name: 'Intercom', category: 'Support', monthlyCost: 1500, users: 15, utilization: 55, status: 'warning' }
    ],
    spendByCategory: [
      { name: 'Infrastructure', value: 12500, color: '#0ea5e9' },
      { name: 'CRM', value: 8500, color: '#8b5cf6' },
      { name: 'Marketing', value: 3200, color: '#10b981' },
      { name: 'Communication', value: 3600, color: '#f59e0b' },
      { name: 'Monitoring', value: 2800, color: '#ef4444' },
      { name: 'Project Management', value: 1800, color: '#6366f1' },
      { name: 'Support', value: 1500, color: '#ec4899' },
      { name: 'Documentation', value: 960, color: '#14b8a6' },
      { name: 'Design', value: 720, color: '#84cc16' }
    ],
    monthlyTrend: [
      { month: 'Aug', spend: 38500, savings: 0 },
      { month: 'Sep', spend: 41200, savings: 2800 },
      { month: 'Oct', spend: 43100, savings: 5200 },
      { month: 'Nov', spend: 44800, savings: 8900 },
      { month: 'Dec', spend: 45230, savings: 12400 }
    ]
  },
  
  recommendations: [
    {
      id: '1',
      type: 'consolidation',
      priority: 'high',
      title: 'Consolidate Zoom into Google Meet',
      description: 'You have overlapping video conferencing tools. Google Meet is included in your Google Workspace subscription.',
      potentialSavings: 1200,
      effort: 'low',
      tools: ['Zoom', 'Google Meet']
    },
    {
      id: '2',
      type: 'rightsizing',
      priority: 'high',
      title: 'Reduce Salesforce licenses',
      description: '15 Salesforce licenses show less than 20% usage in the past 90 days. Consider downgrading to Essentials tier.',
      potentialSavings: 3200,
      effort: 'medium',
      tools: ['Salesforce']
    },
    {
      id: '3',
      type: 'optimization',
      priority: 'medium',
      title: 'Optimize AWS Reserved Instances',
      description: 'Moving 60% of your EC2 usage to Reserved Instances could save significantly on compute costs.',
      potentialSavings: 4500,
      effort: 'medium',
      tools: ['AWS']
    },
    {
      id: '4',
      type: 'elimination',
      priority: 'medium',
      title: 'Cancel unused Intercom features',
      description: 'Product Tours and Custom Bots features show zero usage. Downgrade to the Support plan.',
      potentialSavings: 600,
      effort: 'low',
      tools: ['Intercom']
    },
    {
      id: '5',
      type: 'negotiation',
      priority: 'low',
      title: 'Negotiate Datadog contract',
      description: 'Your contract renews in 45 days. Based on usage patterns, you qualify for volume discounts.',
      potentialSavings: 840,
      effort: 'medium',
      tools: ['Datadog']
    }
  ],
  
  toolCatalog: [
    { id: '1', name: 'Slack', category: 'Communication', logo: '💬' },
    { id: '2', name: 'Microsoft Teams', category: 'Communication', logo: '👥' },
    { id: '3', name: 'Zoom', category: 'Communication', logo: '📹' },
    { id: '4', name: 'Salesforce', category: 'CRM', logo: '☁️' },
    { id: '5', name: 'HubSpot', category: 'CRM', logo: '🧲' },
    { id: '6', name: 'Jira', category: 'Project Management', logo: '📋' },
    { id: '7', name: 'Asana', category: 'Project Management', logo: '✅' },
    { id: '8', name: 'Notion', category: 'Documentation', logo: '📝' },
    { id: '9', name: 'Confluence', category: 'Documentation', logo: '📖' },
    { id: '10', name: 'AWS', category: 'Infrastructure', logo: '☁️' },
    { id: '11', name: 'Google Cloud', category: 'Infrastructure', logo: '🌐' },
    { id: '12', name: 'Azure', category: 'Infrastructure', logo: '⚡' },
    { id: '13', name: 'Figma', category: 'Design', logo: '🎨' },
    { id: '14', name: 'Datadog', category: 'Monitoring', logo: '📊' },
    { id: '15', name: 'Intercom', category: 'Support', logo: '💬' }
  ]
}
