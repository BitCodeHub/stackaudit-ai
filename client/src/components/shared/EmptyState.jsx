import { FileSearch } from 'lucide-react'
import Button from './Button'

export default function EmptyState({ 
  icon: Icon = FileSearch,
  title = 'No data found',
  description = 'Get started by creating your first item.',
  action,
  actionLabel = 'Get started'
}) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">{description}</p>
      {action && (
        <Button onClick={action}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
