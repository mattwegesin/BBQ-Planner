import { useStore, calculateRawAmountString, calculateRawAmountValue } from '../store';
import { displayIngredientAmount } from '../utils';

export default function ShoppingListView() {
  const { settings, selectedMeatIDs, guestCount } = useStore();
  const activeConfigs = settings.meats
    .filter(m => selectedMeatIDs.has(m.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  const configsWithIngredients = activeConfigs.filter(c => c.requiredIngredients.length > 0);

  return (
    <div>
      <h2>Shopping List</h2>
      
      {activeConfigs.length > 0 && (
        <div style={{ marginBottom: '20px', background: 'white', padding: '15px', borderRadius: '8px' }}>
          <h3>Meats</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeConfigs.map(config => (
              <div key={config.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontWeight: '500' }}>{config.name}</span>
                <span style={{ color: 'var(--text-muted)' }}>
                  {calculateRawAmountString(config, guestCount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {configsWithIngredients.length > 0 && (
        <div style={{ marginBottom: '20px', background: 'white', padding: '15px', borderRadius: '8px' }}>
          <h3>Associated Ingredients</h3>
          {configsWithIngredients.map(config => {
            const meatAmount = calculateRawAmountValue(config, guestCount);
            return (
              <div key={config.id} style={{ marginBottom: '15px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: 'var(--primary)' }}>{config.name}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {config.requiredIngredients.map(ing => (
                    <div key={ing.id} style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '10px' }}>
                      <span>{ing.name}</span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {displayIngredientAmount(ing, meatAmount)} {ing.unitName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {settings.miscItems.length > 0 && (
        <div style={{ background: 'white', padding: '15px', borderRadius: '8px' }}>
          <h3>Miscellaneous Items</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {settings.miscItems.map(item => (
              <div key={item.id} style={{ padding: '5px 0' }}>
                {item.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
