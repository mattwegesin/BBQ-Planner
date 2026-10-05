export type YieldType = 'Pounds per Person' | 'Units per Person';
export type ItemCategory = 'Protein' | 'Side';

export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  estimatedCost: number;
  isCalculated: boolean;
  baseAmount: number;
  unitName: string;
  meatUnitsPerIngredient: number;
}

export interface MeatConfig {
  id: string;
  name: string;
  category?: ItemCategory;
  cookTimeHours: number;
  restTimeHours: number;
  wrapInstruction: string;
  yieldType: YieldType;
  amountPerPerson: number;
  shrinkagePercent: number;
  pricePerUnit: number;
  requiredIngredients: Ingredient[];
}

export interface MiscItem {
  id: string;
  name: string;
  estimatedCost: number;
}

export interface BBQSettings {
  meats: MeatConfig[];
  miscItems: MiscItem[];
}

export interface PlannedMeat {
  id: string;
  config: MeatConfig;
  targetTime: string; // ISO string representing Date
  guests: number;
}

export interface BBQSession {
  id: string;
  name: string;
  dateSaved: string; // ISO string
  guestCount: number;
  targetDinnerTime: string; // ISO string
  selectedMeatIDs: string[];
  actualCost?: number;
  fireboardSessionId?: number;
  fireboardSessionName?: string;
}

export interface FireBoardDevice {
  uuid: string;
  title: string;
  channels: FireBoardChannel[];
}

export interface FireBoardChannel {
  channel: number;
  label?: string;
  last_temp?: number;
}

export interface FireBoardTemp {
  channel: number;
  temp: number;
  created: string; // ISO string
}

export interface FireBoardSession {
  id: number;
  title?: string;
  created: string; // ISO string
}

export interface FireBoardChartDataPoint {
  x: string; // ISO string
  y?: number;
}

export interface FireBoardChartPoint {
  id: string;
  channel: number;
  label: string;
  temp: number;
  created: string; // ISO string
}
