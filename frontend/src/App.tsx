import { useState } from 'react';
import { LandingPage } from './pages/LandingPage';
import { IntakeForm } from './components/IntakeForm';

type View = 'landing' | 'audit';

function App() {
  const [currentView, setCurrentView] = useState<View>('landing');

  return (
    <div className="min-h-screen">
      {currentView === 'landing' ? (
        <LandingPage onStartAudit={() => setCurrentView('audit')} />
      ) : (
        <>
          <nav className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <button
                onClick={() => setCurrentView('landing')}
                className="text-2xl font-bold text-blue-600 hover:text-blue-700"
              >
                StackAudit.ai
              </button>
              <button
                onClick={() => setCurrentView('landing')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Home
              </button>
            </div>
          </nav>
          <div className="py-8">
            <IntakeForm />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
