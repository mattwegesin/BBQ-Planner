import { useState } from 'react';
import { useStore } from '../store';
import { v4 as uuidv4 } from 'uuid';
import { Ingredient } from '../types';

export default function SettingsView() {
  const { settings, addMeat, updateMeat, deleteMeat, addMiscItem, updateMiscItem, deleteMiscItem } = useStore();
  const [selectedMeatID, setSelectedMeatID] = useState<string | null>(null);

  const selectedMeat = settings.meats.find(m => m.id === selectedMeatID);

  const handleIngredientUpdate = (ingredientId: string, updates: Partial<Ingredient>) => {
      if (!selectedMeat) return;
      const updatedIngredients = selectedMeat.requiredIngredients.map(ing => 
          ing.id === ingredientId ? { ...ing, ...updates } : ing
      );
      updateMeat(selectedMeat.id, { requiredIngredients: updatedIngredients });
  };

  const handleAddIngredient = () => {
      if (!selectedMeat) return;
      const newIng: Ingredient = {
          id: uuidv4(),
          name: "New Item",
          amount: "1",
          estimatedCost: 0.0,
          isCalculated: false,
          baseAmount: 1,
          unitName: "",
          meatUnitsPerIngredient: 1
      };
      updateMeat(selectedMeat.id, { requiredIngredients: [...selectedMeat.requiredIngredients, newIng] });
  };

  const handleDeleteIngredient = (ingredientId: string) => {
      if (!selectedMeat) return;
      updateMeat(selectedMeat.id, { 
          requiredIngredients: selectedMeat.requiredIngredients.filter(i => i.id !== ingredientId) 
      });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Meats Section (Master/Detail) */}
      <div style={{ background: 'white', borderRadius: '8px', display: 'flex', overflow: 'hidden', minHeight: '500px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {/* Master List */}
          <div style={{ width: '250px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '15px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0 }}>Meats</h3>
                  <div style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={() => addMeat('Protein')} title="Add Protein" style={{ cursor: 'pointer' }}>+P</button>
                      <button onClick={() => addMeat('Side')} title="Add Side" style={{ cursor: 'pointer' }}>+S</button>
                  </div>
              </div>
              <div style={{ overflowY: 'auto', flex: 1 }}>
                  {settings.meats.map(meat => (
                      <div 
                          key={meat.id}
                          onClick={() => setSelectedMeatID(meat.id)}
                          style={{
                              padding: '12px 15px',
                              cursor: 'pointer',
                              background: selectedMeatID === meat.id ? 'var(--primary)' : 'transparent',
                              color: selectedMeatID === meat.id ? 'white' : 'inherit',
                              borderBottom: '1px solid #f0f0f0',
                              display: 'flex',
                              justifyContent: 'space-between'
                          }}
                      >
                          <span>{meat.name}</span>
                          <button 
                              onClick={(e) => { e.stopPropagation(); deleteMeat(meat.id); if(selectedMeatID === meat.id) setSelectedMeatID(null); }}
                              style={{ background: 'none', border: 'none', color: selectedMeatID === meat.id ? 'white' : 'red', cursor: 'pointer' }}
                          >
                              ✕
                          </button>
                      </div>
                  ))}
              </div>
          </div>

          {/* Detail View */}
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
              {selectedMeat ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {/* 1. Identification */}
                      <div style={{ padding: '15px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                          <h4 style={{ margin: '0 0 15px 0' }}>Item Identification</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                              <label>
                                  Name:
                                  <input type="text" value={selectedMeat.name} onChange={e => updateMeat(selectedMeat.id, { name: e.target.value })} style={{ width: '100%', padding: '5px' }} />
                              </label>
                              <label>
                                  Category:
                                  <select value={selectedMeat.category || 'Protein'} onChange={e => updateMeat(selectedMeat.id, { category: e.target.value as any })} style={{ width: '100%', padding: '5px' }}>
                                      <option value="Protein">Protein</option>
                                      <option value="Side">Side</option>
                                  </select>
                              </label>
                              <label style={{ gridColumn: 'span 2' }}>
                                  Wrap/Prep Instruction:
                                  <input type="text" value={selectedMeat.wrapInstruction} onChange={e => updateMeat(selectedMeat.id, { wrapInstruction: e.target.value })} style={{ width: '100%', padding: '5px' }} />
                              </label>
                          </div>
                      </div>

                      {/* 2. Timing */}
                      <div style={{ padding: '15px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                          <h4 style={{ margin: '0 0 15px 0' }}>Cooking Times (Hours)</h4>
                          <div style={{ display: 'flex', gap: '20px' }}>
                              <label>Cook Time: <input type="number" step="0.5" value={selectedMeat.cookTimeHours} onChange={e => updateMeat(selectedMeat.id, { cookTimeHours: Number(e.target.value) })} style={{ width: '60px' }}/></label>
                              <label>Rest Time: <input type="number" step="0.5" value={selectedMeat.restTimeHours} onChange={e => updateMeat(selectedMeat.id, { restTimeHours: Number(e.target.value) })} style={{ width: '60px' }}/></label>
                          </div>
                      </div>

                      {/* 3. Math & Cost */}
                      <div style={{ padding: '15px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                          <h4 style={{ margin: '0 0 15px 0' }}>Yield & Base Cost</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                              <label>
                                  Yield Type:
                                  <select value={selectedMeat.yieldType} onChange={e => updateMeat(selectedMeat.id, { yieldType: e.target.value as any })} style={{ width: '100%', padding: '5px' }}>
                                      <option value="Pounds per Person">Pounds per Person</option>
                                      <option value="Units per Person">Units per Person</option>
                                  </select>
                              </label>
                              <label>
                                  Cost per {selectedMeat.yieldType === 'Pounds per Person' ? 'Pound' : 'Unit'} ($):
                                  <input type="number" step="0.01" value={selectedMeat.pricePerUnit} onChange={e => updateMeat(selectedMeat.id, { pricePerUnit: Number(e.target.value) })} style={{ width: '100%', padding: '5px' }} />
                              </label>
                              
                              {selectedMeat.yieldType === 'Pounds per Person' ? (
                                  <>
                                      <label>Amount Per Person (lbs): <input type="number" step="0.05" value={selectedMeat.amountPerPerson} onChange={e => updateMeat(selectedMeat.id, { amountPerPerson: Number(e.target.value) })} style={{ width: '100%', padding: '5px' }} /></label>
                                      <label>Shrinkage %: <input type="number" value={selectedMeat.shrinkagePercent} onChange={e => updateMeat(selectedMeat.id, { shrinkagePercent: Number(e.target.value) })} style={{ width: '100%', padding: '5px' }} /></label>
                                  </>
                              ) : (
                                  <label>Amount Per Person (Units): <input type="number" step="0.1" value={selectedMeat.amountPerPerson} onChange={e => updateMeat(selectedMeat.id, { amountPerPerson: Number(e.target.value) })} style={{ width: '100%', padding: '5px' }} /></label>
                              )}
                          </div>
                      </div>

                      {/* 4. Ingredients */}
                      <div style={{ padding: '15px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                          <h4 style={{ margin: '0 0 15px 0' }}>Required Ingredients</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {selectedMeat.requiredIngredients.map(ing => (
                                  <div key={ing.id} style={{ background: 'var(--bg-color)', padding: '10px', borderRadius: '4px', position: 'relative' }}>
                                      <button onClick={() => handleDeleteIngredient(ing.id)} style={{ position: 'absolute', top: '10px', right: '10px', color: 'red', cursor: 'pointer', border: 'none', background: 'none' }}>✕</button>
                                      
                                      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                                          <input type="text" placeholder="Ingredient Name" value={ing.name} onChange={e => handleIngredientUpdate(ing.id, { name: e.target.value })} style={{ padding: '4px' }} />
                                          <label style={{ fontSize: '0.9rem' }}>
                                              <input type="checkbox" checked={ing.isCalculated} onChange={e => handleIngredientUpdate(ing.id, { isCalculated: e.target.checked })} /> Auto-Calc
                                          </label>
                                      </div>

                                      {ing.isCalculated ? (
                                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.9rem' }}>
                                              Need <input type="number" value={ing.baseAmount} onChange={e => handleIngredientUpdate(ing.id, { baseAmount: Number(e.target.value) })} style={{ width: '40px' }}/> 
                                              per <input type="number" value={ing.meatUnitsPerIngredient} onChange={e => handleIngredientUpdate(ing.id, { meatUnitsPerIngredient: Number(e.target.value) })} style={{ width: '40px' }}/>
                                              lbs/units
                                              | Cost: $<input type="number" step="0.1" value={ing.estimatedCost} onChange={e => handleIngredientUpdate(ing.id, { estimatedCost: Number(e.target.value) })} style={{ width: '60px' }}/>
                                          </div>
                                      ) : (
                                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.9rem' }}>
                                              Amount: <input type="text" value={ing.amount} onChange={e => handleIngredientUpdate(ing.id, { amount: e.target.value })} style={{ width: '80px' }}/>
                                              Cost: $<input type="number" step="0.1" value={ing.estimatedCost} onChange={e => handleIngredientUpdate(ing.id, { estimatedCost: Number(e.target.value) })} style={{ width: '60px' }}/>
                                          </div>
                                      )}
                                  </div>
                              ))}
                              <button onClick={handleAddIngredient} style={{ alignSelf: 'flex-start', padding: '5px 10px', cursor: 'pointer' }}>+ Add Ingredient</button>
                          </div>
                      </div>

                  </div>
              ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                      Select a meat configuration to edit.
                  </div>
              )}
          </div>
      </div>

      {/* Misc Items Section */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0 }}>Miscellaneous Items</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {settings.miscItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input type="text" value={item.name} onChange={e => updateMiscItem(item.id, { name: e.target.value })} style={{ padding: '5px', flex: 1 }} />
                      $<input type="number" step="0.1" value={item.estimatedCost} onChange={e => updateMiscItem(item.id, { estimatedCost: Number(e.target.value) })} style={{ padding: '5px', width: '80px' }} />
                      <button onClick={() => deleteMiscItem(item.id)} style={{ color: 'red', cursor: 'pointer', border: 'none', background: 'none' }}>✕</button>
                  </div>
              ))}
              <button onClick={addMiscItem} style={{ alignSelf: 'flex-start', padding: '5px 10px', cursor: 'pointer' }}>+ Add Misc Item</button>
          </div>
      </div>

    </div>
  );
}
