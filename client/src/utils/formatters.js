export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatRelativeTime(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return formatDate(dateString)
}

export function formatPercentage(value, decimals = 0) {
  return `${value.toFixed(decimals)}%`
}

export function getStatusColor(status) {
  switch (status) {
    case 'healthy':
      return 'text-green-600 bg-green-100'
    case 'warning':
      return 'text-yellow-600 bg-yellow-100'
    case 'danger':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export function getPriorityColor(priority) {
  switch (priority) {
    case 'high':
      return 'text-red-600 bg-red-100'
    case 'medium':
      return 'text-yellow-600 bg-yellow-100'
    case 'low':
      return 'text-blue-600 bg-blue-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export function getEffortBadge(effort) {
  switch (effort) {
    case 'low':
      return { text: 'Quick win', color: 'text-green-600 bg-green-100' }
    case 'medium':
      return { text: 'Moderate', color: 'text-yellow-600 bg-yellow-100' }
    case 'high':
      return { text: 'Complex', color: 'text-red-600 bg-red-100' }
    default:
      return { text: effort, color: 'text-gray-600 bg-gray-100' }
  }
}
