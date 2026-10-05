import { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import TimelineView from './components/TimelineView';
import ShoppingListView from './components/ShoppingListView';
import CostAnalysisView from './components/CostAnalysisView';
import FireBoardView from './components/FireBoardView';
import SettingsView from './components/SettingsView';

function App() {
  const [activeTab, setActiveTab] = useState<'timeline' | 'shopping' | 'cost' | 'fireboard' | 'settings'>('timeline');

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <nav className="tab-nav">
          <button 
            className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            ⏱️ Timeline
          </button>
          <button 
            className={`tab-btn ${activeTab === 'shopping' ? 'active' : ''}`}
            onClick={() => setActiveTab('shopping')}
          >
            🛒 Shopping
          </button>
          <button 
            className={`tab-btn ${activeTab === 'cost' ? 'active' : ''}`}
            onClick={() => setActiveTab('cost')}
          >
            💲 Costs
          </button>
          <button 
            className={`tab-btn ${activeTab === 'fireboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('fireboard')}
          >
            🔥 FireBoard
          </button>
          <button 
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Settings
          </button>
        </nav>
        
        <div className="tab-content">
          {activeTab === 'timeline' && <TimelineView />}
          {activeTab === 'shopping' && <ShoppingListView />}
          {activeTab === 'cost' && <CostAnalysisView />}
          {activeTab === 'fireboard' && <FireBoardView />}
          {activeTab === 'settings' && <SettingsView />}
        </div>
      </main>
    </div>
  );
}

export default App;
