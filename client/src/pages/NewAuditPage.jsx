import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Search, 
  Plus, 
  X,
  Layers,
  DollarSign,
  Users,
  Zap
} from 'lucide-react'
import { Card, Button, Input, Badge } from '../components/shared'
import { mockData } from '../utils/api'
import clsx from 'clsx'

const steps = [
  { id: 1, name: 'Select Tools', icon: Layers },
  { id: 2, name: 'Add Costs', icon: DollarSign },
  { id: 3, name: 'Usage Data', icon: Users },
  { id: 4, name: 'Review', icon: Zap }
]

export default function NewAuditPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [auditName, setAuditName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTools, setSelectedTools] = useState([])
  const [toolData, setToolData] = useState({})
  const [loading, setLoading] = useState(false)

  const filteredTools = mockData.toolCatalog.filter(tool =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleToolSelect = (tool) => {
    if (selectedTools.find(t => t.id === tool.id)) {
      setSelectedTools(selectedTools.filter(t => t.id !== tool.id))
      const newData = { ...toolData }
      delete newData[tool.id]
      setToolData(newData)
    } else {
      setSelectedTools([...selectedTools, tool])
      setToolData({
        ...toolData,
        [tool.id]: { monthlyCost: '', users: '', utilization: '' }
      })
    }
  }

  const handleToolDataChange = (toolId, field, value) => {
    setToolData({
      ...toolData,
      [toolId]: {
        ...toolData[toolId],
        [field]: value
      }
    })
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setLoading(false)
    navigate('/audit/1')
  }

  const totalCost = Object.values(toolData).reduce((sum, data) => {
    return sum + (parseFloat(data.monthlyCost) || 0)
  }, 0)

  const totalUsers = Object.values(toolData).reduce((sum, data) => {
    return sum + (parseInt(data.users) || 0)
  }, 0)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create New Audit</h1>
        <p className="text-gray-500 mt-1">Analyze your SaaS stack and discover optimization opportunities</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={clsx(
                'flex items-center gap-2',
                step.id === currentStep && 'text-primary-600',
                step.id < currentStep && 'text-green-600',
                step.id > currentStep && 'text-gray-400'
              )}>
                <div className={clsx(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium',
                  step.id === currentStep && 'bg-primary-100 text-primary-600',
                  step.id < currentStep && 'bg-green-100 text-green-600',
                  step.id > currentStep && 'bg-gray-100 text-gray-400'
                )}>
                  {step.id < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span className="hidden sm:block font-medium">{step.name}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={clsx(
                  'hidden sm:block w-20 lg:w-32 h-0.5 mx-4',
                  step.id < currentStep ? 'bg-green-500' : 'bg-gray-200'
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="p-6 mb-6">
        {/* Step 1: Select Tools */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Select Your Tools</h2>
              <p className="text-gray-500">Choose the SaaS tools you want to include in this audit</p>
            </div>

            <Input
              label="Audit Name"
              placeholder="e.g., Q1 2024 Stack Review"
              value={auditName}
              onChange={(e) => setAuditName(e.target.value)}
            />

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {selectedTools.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected ({selectedTools.length})
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedTools.map(tool => (
                    <Badge 
                      key={tool.id}
                      variant="primary"
                      className="flex items-center gap-1 cursor-pointer"
                      onClick={() => handleToolSelect(tool)}
                    >
                      <span>{tool.logo}</span>
                      {tool.name}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredTools.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => handleToolSelect(tool)}
                  className={clsx(
                    'p-4 border rounded-lg text-left transition-all',
                    selectedTools.find(t => t.id === tool.id)
                      ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{tool.logo}</span>
                    <div>
                      <div className="font-medium text-gray-900">{tool.name}</div>
                      <div className="text-sm text-gray-500">{tool.category}</div>
                    </div>
                    {selectedTools.find(t => t.id === tool.id) && (
                      <Check className="w-5 h-5 text-primary-500 ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <button className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium">
              <Plus className="w-4 h-4" />
              Add custom tool
            </button>
          </div>
        )}

        {/* Step 2: Add Costs */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Add Cost Information</h2>
              <p className="text-gray-500">Enter the monthly cost for each selected tool</p>
            </div>

            <div className="space-y-4">
              {selectedTools.map(tool => (
                <div key={tool.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <span className="text-2xl">{tool.logo}</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{tool.name}</div>
                    <div className="text-sm text-gray-500">{tool.category}</div>
                  </div>
                  <div className="w-40">
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={toolData[tool.id]?.monthlyCost || ''}
                        onChange={(e) => handleToolDataChange(tool.id, 'monthlyCost', e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">per month</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-primary-50 rounded-lg flex items-center justify-between">
              <span className="font-medium text-primary-700">Total Monthly Cost</span>
              <span className="text-2xl font-bold text-primary-700">
                ${totalCost.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Step 3: Usage Data */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Add Usage Information</h2>
              <p className="text-gray-500">Help us calculate ROI by adding user counts and utilization estimates</p>
            </div>

            <div className="space-y-4">
              {selectedTools.map(tool => (
                <div key={tool.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{tool.logo}</span>
                    <div>
                      <div className="font-medium text-gray-900">{tool.name}</div>
                      <div className="text-sm text-gray-500">
                        ${toolData[tool.id]?.monthlyCost || 0}/mo
                      </div>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Licensed Users
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g., 50"
                        value={toolData[tool.id]?.users || ''}
                        onChange={(e) => handleToolDataChange(tool.id, 'users', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Utilization (%)
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g., 75"
                        min="0"
                        max="100"
                        value={toolData[tool.id]?.utilization || ''}
                        onChange={(e) => handleToolDataChange(tool.id, 'utilization', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-600">Total Licensed Users</span>
                <div className="text-2xl font-bold text-blue-700">{totalUsers}</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <span className="text-sm text-green-600">Avg. Utilization</span>
                <div className="text-2xl font-bold text-green-700">
                  {selectedTools.length > 0
                    ? Math.round(
                        Object.values(toolData).reduce((sum, d) => sum + (parseInt(d.utilization) || 0), 0) /
                        selectedTools.length
                      )
                    : 0}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Review Your Audit</h2>
              <p className="text-gray-500">Confirm the details before running the analysis</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-1">{auditName || 'Untitled Audit'}</h3>
              <p className="text-sm text-gray-500">{selectedTools.length} tools • ${totalCost.toLocaleString()}/mo • {totalUsers} users</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Tools Included</h4>
              <div className="space-y-2">
                {selectedTools.map(tool => (
                  <div key={tool.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{tool.logo}</span>
                      <div>
                        <div className="font-medium text-gray-900">{tool.name}</div>
                        <div className="text-sm text-gray-500">{tool.category}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        ${toolData[tool.id]?.monthlyCost || 0}/mo
                      </div>
                      <div className="text-sm text-gray-500">
                        {toolData[tool.id]?.users || 0} users • {toolData[tool.id]?.utilization || 0}% utilized
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-primary-50 rounded-lg">
              <div className="flex items-center gap-2 text-primary-700 mb-2">
                <Zap className="w-5 h-5" />
                <span className="font-medium">What happens next?</span>
              </div>
              <p className="text-sm text-primary-600">
                Our AI will analyze your stack for redundancies, underutilization, and cost optimization opportunities. 
                You'll receive detailed recommendations within seconds.
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={handleBack}
          disabled={currentStep === 1}
          icon={ArrowLeft}
        >
          Back
        </Button>

        {currentStep < 4 ? (
          <Button
            onClick={handleNext}
            disabled={
              (currentStep === 1 && selectedTools.length === 0) ||
              (currentStep === 2 && Object.values(toolData).some(d => !d.monthlyCost))
            }
            icon={ArrowRight}
            iconPosition="right"
          >
            Continue
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            loading={loading}
            icon={Zap}
          >
            Run Analysis
          </Button>
        )}
      </div>
    </div>
  )
}
