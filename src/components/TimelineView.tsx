import { useStore } from '../store';

export default function TimelineView() {
  const { plannedMeats, targetDinnerTime, setTargetDinnerTime } = useStore();

  const getTimelineSteps = () => {
    const steps: { title: string; time: Date; notes: string; id: string }[] = [];
    const dinnerDate = new Date(targetDinnerTime);

    plannedMeats.forEach(meat => {
      const totalPrepTimeHours = meat.config.cookTimeHours + meat.config.restTimeHours;
      const startTime = new Date(dinnerDate.getTime() - (totalPrepTimeHours * 3600 * 1000));
      
      steps.push({
        id: `start-${meat.id}`,
        title: `Put ${meat.config.name} on`,
        time: startTime,
        notes: `Cook: ${meat.config.cookTimeHours}h | Rest: ${meat.config.restTimeHours}h. ${meat.config.wrapInstruction}`
      });

      if (meat.config.restTimeHours > 0) {
        const restTime = new Date(dinnerDate.getTime() - (meat.config.restTimeHours * 3600 * 1000));
        steps.push({
          id: `rest-${meat.id}`,
          title: `Take ${meat.config.name} off to rest`,
          time: restTime,
          notes: ''
        });
      }
    });

    steps.push({
      id: 'serve',
      title: 'Serve BBQ Dinner!',
      time: dinnerDate,
      notes: 'Enjoy!'
    });

    return steps.sort((a, b) => a.time.getTime() - b.time.getTime());
  };

  const steps = getTimelineSteps();

  // Helper to format Date to string for datetime-local input
  const formatForInput = (dateString: string) => {
    const d = new Date(dateString);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTargetDinnerTime(new Date(e.target.value).toISOString());
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Timeline</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontWeight: 'bold' }}>Target Dinner Time:</label>
          <input 
            type="datetime-local" 
            value={formatForInput(targetDinnerTime)}
            onChange={handleTimeChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
          />
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {steps.map(step => (
          <div key={step.id} style={{ padding: '15px', background: 'var(--card-bg)', borderRadius: '8px', borderLeft: '4px solid var(--primary)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '5px' }}>
              {step.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {step.title}
            </div>
            {step.notes && <div style={{ color: 'var(--text-muted)' }}>{step.notes}</div>}
            <div style={{ fontSize: '0.85rem', color: '#999', marginTop: '4px' }}>
              {step.time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
