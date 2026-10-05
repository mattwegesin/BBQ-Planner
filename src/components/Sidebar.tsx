import { useStore } from '../store';

export default function Sidebar() {
  const { guestCount, setGuestCount, settings, selectedMeatIDs, toggleMeat } = useStore();

  return (
    <aside className="sidebar">
      <h2>BBQ Planner</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
          Guest Count
        </label>
        <input 
          type="number" 
          value={guestCount} 
          onChange={(e) => setGuestCount(Number(e.target.value) || 0)}
          style={{ width: '100%', padding: '8px', fontSize: '1rem' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
          Menu Selection
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {settings.meats.map(meat => (
            <label key={meat.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={selectedMeatIDs.has(meat.id)}
                onChange={() => toggleMeat(meat.id)}
              />
              {meat.name}
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
