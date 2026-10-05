import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { FireBoardService } from '../services/FireBoardService';

export default function FireBoardView() {
  const { 
      fireBoardToken, 
      setFireBoardToken, 
      fireBoardDevices, 
      setFireBoardDevices, 
      selectedDeviceUUID, 
      setSelectedDeviceUUID,
      latestTemps,
      updateTemps
  } = useStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Poll for temps if we have a device selected
  useEffect(() => {
      if (!fireBoardToken || !selectedDeviceUUID) return;

      const fetchTemps = async () => {
          try {
              const temps = await FireBoardService.fetchLatestTemps(fireBoardToken, selectedDeviceUUID);
              const tempsMap: Record<number, number> = {};
              temps.forEach(t => tempsMap[t.channel] = t.temp);
              updateTemps(tempsMap);
          } catch (e) {
              console.error("Failed polling temps", e);
          }
      };

      fetchTemps(); // initial fetch
      const interval = setInterval(fetchTemps, 30000); // Poll every 30s
      return () => clearInterval(interval);
  }, [fireBoardToken, selectedDeviceUUID, updateTemps]);

  const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);

      try {
          const token = await FireBoardService.login(username, password);
          setFireBoardToken(token);
          
          // Fetch devices immediately after login
          const devices = await FireBoardService.fetchDevices(token);
          setFireBoardDevices(devices);
          if (devices.length > 0) {
              setSelectedDeviceUUID(devices[0].uuid);
          }
      } catch (err: any) {
          setError(err.message || 'An error occurred during login');
      } finally {
          setIsLoading(false);
      }
  };

  const handleLogout = () => {
      setFireBoardToken(undefined);
      setFireBoardDevices([]);
      setSelectedDeviceUUID(undefined);
  };

  if (!fireBoardToken) {
      return (
          <div style={{ maxWidth: '400px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ marginTop: 0, textAlign: 'center' }}>FireBoard Login</h2>
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '20px' }}>
                  Authenticate to sync your live temperatures and historical session charts.
              </p>
              
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <input 
                      type="email" 
                      placeholder="Email" 
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      required
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border)' }}
                  />
                  <input 
                      type="password" 
                      placeholder="Password" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border)' }}
                  />
                  
                  {error && <div style={{ color: 'red', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
                  
                  <button 
                      type="submit" 
                      disabled={isLoading}
                      style={{ 
                          padding: '12px', 
                          background: 'var(--primary)', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          cursor: isLoading ? 'wait' : 'pointer',
                          opacity: isLoading ? 0.7 : 1
                      }}
                  >
                      {isLoading ? 'Authenticating...' : 'Login'}
                  </button>
              </form>
          </div>
      );
  }

  const selectedDevice = fireBoardDevices.find(d => d.uuid === selectedDeviceUUID);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>FireBoard Dashboard</h2>
          <button onClick={handleLogout} style={{ padding: '8px 15px', background: 'white', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer' }}>
              Logout
          </button>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
          <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Selected Device:</label>
          <select 
              value={selectedDeviceUUID || ''} 
              onChange={e => setSelectedDeviceUUID(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
          >
              <option value="" disabled>Select a device</option>
              {fireBoardDevices.map(d => (
                  <option key={d.uuid} value={d.uuid}>{d.title}</option>
              ))}
          </select>
      </div>

      {selectedDevice && (
          <div>
              <h3>Live Temperatures</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                  {selectedDevice.channels.map(channel => {
                      // FireBoard temps are often stored in the object, but if polling we use our state
                      const temp = latestTemps[channel.channel] ?? channel.last_temp;
                      
                      return (
                          <div key={channel.channel} style={{ background: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderTop: '4px solid var(--primary)' }}>
                              <div style={{ color: 'var(--text-muted)', marginBottom: '5px' }}>
                                  CH {channel.channel} - {channel.label || 'Probe'}
                              </div>
                              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                                  {temp !== undefined ? `${temp.toFixed(1)}°` : '--'}
                              </div>
                          </div>
                      )
                  })}
              </div>
          </div>
      )}
    </div>
  );
}
