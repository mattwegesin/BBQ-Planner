import type { Ingredient } from './types';

export const displayIngredientAmount = (ingredient: Ingredient, meatAmount: number): string => {
    if (ingredient.isCalculated) {
        const needed = Math.ceil(meatAmount / Math.max(0.1, ingredient.meatUnitsPerIngredient)) * ingredient.baseAmount;
        return Number.isInteger(needed) ? needed.toString() : needed.toFixed(2);
    } else {
        return ingredient.amount;
    }
};

export const ingredientTotalCost = (ingredient: Ingredient, meatAmount: number): number => {
    if (ingredient.isCalculated) {
        const needed = Math.ceil(meatAmount / Math.max(0.1, ingredient.meatUnitsPerIngredient)) * ingredient.baseAmount;
        return needed * ingredient.estimatedCost;
    } else {
        return ingredient.estimatedCost;
    }
};
