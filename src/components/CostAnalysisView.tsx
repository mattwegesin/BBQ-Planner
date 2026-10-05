import { useStore, calculateRawAmountValue } from '../store';
import { ingredientTotalCost } from '../utils';

export default function CostAnalysisView() {
  const { settings, selectedMeatIDs, guestCount } = useStore();
  const activeConfigs = settings.meats.filter(m => selectedMeatIDs.has(m.id)).sort((a, b) => a.name.localeCompare(b.name));

  let expectedMeatCost = 0;
  let expectedIngredientsCost = 0;
  
  const meatRows = activeConfigs.map(config => {
      const amount = calculateRawAmountValue(config, guestCount);
      const cost = config.pricePerUnit * amount;
      expectedMeatCost += cost;
      return { name: config.name, cost };
  });

  const ingredientRows: { name: string, cost: number }[] = [];
  activeConfigs.forEach(config => {
      if (config.requiredIngredients.length > 0) {
          const meatAmount = calculateRawAmountValue(config, guestCount);
          config.requiredIngredients.forEach(ing => {
              const cost = ingredientTotalCost(ing, meatAmount);
              expectedIngredientsCost += cost;
              ingredientRows.push({ name: `${ing.name} (for ${config.name})`, cost });
          });
      }
  });

  const expectedMiscCost = settings.miscItems.reduce((sum, item) => sum + item.estimatedCost, 0);
  const totalExpectedCost = expectedMeatCost + expectedIngredientsCost + expectedMiscCost;
  const costPerPerson = guestCount > 0 ? totalExpectedCost / guestCount : 0;

  return (
    <div>
      <h2>Financial Analysis</h2>
      
      {meatRows.length > 0 && (
          <div style={{ marginBottom: '20px', background: 'var(--card-bg)', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
             <h3 style={{ marginTop: 0 }}>Menu Items (Proteins & Sides)</h3>
             {meatRows.map(r => (
                 <div key={r.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                     <span>{r.name}</span>
                     <span>${r.cost.toFixed(2)}</span>
                 </div>
             ))}
             <hr style={{ borderColor: 'var(--border)', margin: '10px 0', borderStyle: 'solid', borderWidth: '1px 0 0 0' }}/>
             <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                 <span>Menu Subtotal</span>
                 <span>${expectedMeatCost.toFixed(2)}</span>
             </div>
          </div>
      )}

      {ingredientRows.length > 0 && (
          <div style={{ marginBottom: '20px', background: 'var(--card-bg)', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
             <h3 style={{ marginTop: 0 }}>Ingredients</h3>
             {ingredientRows.map((r, i) => (
                 <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                     <span>{r.name}</span>
                     <span>${r.cost.toFixed(2)}</span>
                 </div>
             ))}
             <hr style={{ borderColor: 'var(--border)', margin: '10px 0', borderStyle: 'solid', borderWidth: '1px 0 0 0' }}/>
             <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                 <span>Ingredients Subtotal</span>
                 <span>${expectedIngredientsCost.toFixed(2)}</span>
             </div>
          </div>
      )}

      {settings.miscItems.length > 0 && (
          <div style={{ marginBottom: '20px', background: 'var(--card-bg)', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
             <h3 style={{ marginTop: 0 }}>Miscellaneous Items</h3>
             {settings.miscItems.map(m => (
                 <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                     <span>{m.name}</span>
                     <span>${m.estimatedCost.toFixed(2)}</span>
                 </div>
             ))}
             <hr style={{ borderColor: 'var(--border)', margin: '10px 0', borderStyle: 'solid', borderWidth: '1px 0 0 0' }}/>
             <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                 <span>Misc Subtotal</span>
                 <span>${expectedMiscCost.toFixed(2)}</span>
             </div>
          </div>
      )}

      <div style={{ background: 'var(--card-bg)', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
         <h3 style={{ marginTop: 0 }}>Expected Cost Summary</h3>
         <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '8px' }}>
             <span>Total Expected</span>
             <span>${totalExpectedCost.toFixed(2)}</span>
         </div>
         <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary)', fontWeight: 'bold' }}>
             <span>Cost Per Person</span>
             <span>${costPerPerson.toFixed(2)}</span>
         </div>
      </div>
    </div>
  );
}
