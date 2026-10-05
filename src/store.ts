import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { BBQSettings, BBQSession, PlannedMeat, MeatConfig, FireBoardDevice, FireBoardSession, FireBoardChartPoint } from './types';

// Default settings ported from Swift
const DEFAULT_SETTINGS: BBQSettings = {
    meats: [
        {
            id: uuidv4(), name: "Brisket", category: "Protein", cookTimeHours: 12, restTimeHours: 2, wrapInstruction: "Wrap at 165°F (approx. 6 hrs in)", yieldType: "Pounds per Person", amountPerPerson: 0.25, shrinkagePercent: 30, pricePerUnit: 5.99, 
            requiredIngredients: [
                { id: uuidv4(), name: "Salt (Kosher)", amount: "1/2 Cup", estimatedCost: 0.50, isCalculated: false, baseAmount: 1, unitName: "", meatUnitsPerIngredient: 1 },
                { id: uuidv4(), name: "Coarse Black Pepper", amount: "1/2 Cup", estimatedCost: 2.00, isCalculated: false, baseAmount: 1, unitName: "", meatUnitsPerIngredient: 1 },
                { id: uuidv4(), name: "Butcher Paper", amount: "1 Roll", estimatedCost: 15.00, isCalculated: false, baseAmount: 1, unitName: "", meatUnitsPerIngredient: 1 }
            ]
        },
        {
            id: uuidv4(), name: "Pork Shoulder", category: "Protein", cookTimeHours: 9, restTimeHours: 1, wrapInstruction: "Wrap at 165°F in foil with apple juice", yieldType: "Pounds per Person", amountPerPerson: 0.25, shrinkagePercent: 30, pricePerUnit: 2.49, 
            requiredIngredients: [
                { id: uuidv4(), name: "Sweet BBQ Rub", amount: "1 Cup", estimatedCost: 4.50, isCalculated: false, baseAmount: 1, unitName: "", meatUnitsPerIngredient: 1 },
                { id: uuidv4(), name: "Apple Cider Vinegar", amount: "1 Bottle", estimatedCost: 3.00, isCalculated: false, baseAmount: 1, unitName: "", meatUnitsPerIngredient: 1 }
            ]
        },
        {
            id: uuidv4(), name: "Ribs", category: "Protein", cookTimeHours: 6, restTimeHours: 0.5, wrapInstruction: "3-2-1 Method: Wrap after 3 hrs", yieldType: "Units per Person", amountPerPerson: 0.25, shrinkagePercent: 0, pricePerUnit: 12.99, 
            requiredIngredients: [
                { id: uuidv4(), name: "Pork Rub", amount: "1/2 Cup", estimatedCost: 2.50, isCalculated: false, baseAmount: 1, unitName: "", meatUnitsPerIngredient: 1 },
                { id: uuidv4(), name: "BBQ Sauce", amount: "1 Bottle", estimatedCost: 4.00, isCalculated: false, baseAmount: 1, unitName: "", meatUnitsPerIngredient: 1 }
            ]
        }
    ],
    miscItems: [
        { id: uuidv4(), name: "Charcoal / Wood", estimatedCost: 20.00 },
        { id: uuidv4(), name: "Plates & Napkins", estimatedCost: 10.00 }
    ]
};

// Math helpers ported from Swift
export const calculateRawAmountValue = (config: MeatConfig, guests: number): number => {
    if (config.yieldType === 'Pounds per Person') {
        const multiplier = (100.0 - config.shrinkagePercent) / 100.0;
        return (config.amountPerPerson * guests) / multiplier;
    } else {
        return Math.ceil(guests * config.amountPerPerson);
    }
};

export const calculateRawAmountString = (config: MeatConfig, guests: number): string => {
    const value = calculateRawAmountValue(config, guests);
    if (config.yieldType === 'Pounds per Person') {
        return `${value.toFixed(2)} lbs`;
    } else {
        return `${Math.round(value)} unit(s)`;
    }
};

interface AppState {
    guestCount: number;
    targetDinnerTime: string; // ISO string
    settings: BBQSettings;
    selectedMeatIDs: Set<string>;
    plannedMeats: PlannedMeat[];
    history: BBQSession[];
    activeSessionId?: string;

    // Fireboard Data
    fireBoardDevices: FireBoardDevice[];
    latestTemps: Record<number, number>;
    selectedDeviceUUID?: string;
    availableFireBoardSessions: FireBoardSession[];
    historicalChartData: FireBoardChartPoint[];

    // Actions
    setGuestCount: (count: number) => void;
    setTargetDinnerTime: (time: string) => void;
    toggleMeat: (id: string) => void;
    saveCurrentSession: (name: string) => void;
    updateActiveSessionActualCost: (cost: number | undefined) => void;
    deleteSession: (id: string) => void;
    loadSession: (session: BBQSession) => void;
    recalculatePlan: () => void;
}

export const useStore = create<AppState>((set, get) => ({
    guestCount: 50,
    targetDinnerTime: new Date(new Date().setHours(17, 0, 0, 0)).toISOString(), // Default 5 PM today
    settings: DEFAULT_SETTINGS, // In a real app we'd load this from localStorage
    selectedMeatIDs: new Set(DEFAULT_SETTINGS.meats.map(m => m.id)),
    plannedMeats: [],
    history: [],
    
    fireBoardDevices: [],
    latestTemps: {},
    availableFireBoardSessions: [],
    historicalChartData: [],

    setGuestCount: (count) => {
        set({ guestCount: count });
        get().recalculatePlan();
    },

    setTargetDinnerTime: (time) => {
        set({ targetDinnerTime: time });
        get().recalculatePlan();
    },

    toggleMeat: (id) => {
        const current = new Set(get().selectedMeatIDs);
        if (current.has(id)) {
            current.delete(id);
        } else {
            current.add(id);
        }
        set({ selectedMeatIDs: current });
        get().recalculatePlan();
    },

    recalculatePlan: () => {
        const { settings, selectedMeatIDs, targetDinnerTime, guestCount } = get();
        
        const selectedConfigs = settings.meats.filter(m => selectedMeatIDs.has(m.id));
        const planned: PlannedMeat[] = selectedConfigs.map(config => ({
            id: uuidv4(),
            config,
            targetTime: targetDinnerTime,
            guests: guestCount
        }));

        set({ plannedMeats: planned });
    },

    saveCurrentSession: (name) => {
        const { guestCount, targetDinnerTime, selectedMeatIDs, history } = get();
        const session: BBQSession = {
            id: uuidv4(),
            name,
            dateSaved: new Date().toISOString(),
            guestCount,
            targetDinnerTime,
            selectedMeatIDs: Array.from(selectedMeatIDs),
        };
        set({ history: [session, ...history], activeSessionId: session.id });
    },

    updateActiveSessionActualCost: (cost) => {
        const { activeSessionId, history } = get();
        if (!activeSessionId) return;

        const updatedHistory = history.map(s => 
            s.id === activeSessionId ? { ...s, actualCost: cost } : s
        );
        set({ history: updatedHistory });
    },

    deleteSession: (id) => {
        const { activeSessionId, history } = get();
        set({
            history: history.filter(s => s.id !== id),
            activeSessionId: activeSessionId === id ? undefined : activeSessionId
        });
    },

    loadSession: (session) => {
        set({
            guestCount: session.guestCount,
            targetDinnerTime: session.targetDinnerTime,
            selectedMeatIDs: new Set(session.selectedMeatIDs),
            activeSessionId: session.id
        });
        get().recalculatePlan();
    }
}));

// Initialize the plan immediately
useStore.getState().recalculatePlan();
