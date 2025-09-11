// Health & Diet Application Types

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // cm
  weight: number; // kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extremely_active';
  goals: string[];
  medicalHistory: string[];
  allergies: string[];
  dietaryPreferences: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  data?: ChatbotResponse;
}

export interface ChatbotResponse {
  type: 'text' | 'card' | 'chart' | 'plan' | 'ingredient' | 'quick_replies' | 'emergency';
  content: {
    text?: string;
    card?: HealthCard;
    chart?: HealthChart;
    plan?: DietPlan;
    ingredient?: IngredientInfo;
    quickReplies?: QuickReply[];
    emergency?: EmergencyResponse;
  };
}

export interface HealthCard {
  title: string;
  description: string;
  category: 'nutrition' | 'fitness' | 'wellness' | 'medical';
  metrics?: {
    label: string;
    value: string;
    unit?: string;
  }[];
  actions?: {
    label: string;
    action: string;
    data?: any;
  }[];
}

export interface HealthChart {
  type: 'line' | 'bar' | 'pie' | 'donut';
  title: string;
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string[];
      borderColor?: string;
    }[];
  };
}

export interface DietPlan {
  id: string;
  name: string;
  description: string;
  duration: number; // days
  totalCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  meals: Meal[];
  preferences: {
    vegetarian: boolean;
    vegan: boolean;
    halal: boolean;
    calorieLimit: number;
    excludeAllergies: string[];
  };
}

export interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  ingredients: IngredientInfo[];
  instructions: string[];
  prepTime: number; // minutes
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export interface IngredientInfo {
  id: string;
  name: string;
  amount: number;
  unit: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  micronutrients?: {
    [key: string]: {
      amount: number;
      unit: string;
      dailyValue?: number;
    };
  };
  healthBenefits: string[];
  alternatives?: string[];
  allergens: string[];
}

export interface QuickReply {
  id: string;
  text: string;
  action: string;
  data?: any;
}

export interface EmergencyResponse {
  severity: 'high' | 'medium' | 'low';
  message: string;
  recommendations: string[];
  emergencyContacts: {
    name: string;
    number: string;
    type: 'emergency' | 'medical' | 'poison_control';
  }[];
}

export interface FormData {
  step: number;
  completed: boolean;
  data: {
    personal?: {
      name: string;
      age: number;
      gender: string;
      height: number;
      weight: number;
    };
    health?: {
      activityLevel: string;
      goals: string[];
      medicalHistory: string[];
      medications: string[];
    };
    nutrition?: {
      allergies: string[];
      dietaryPreferences: string[];
      calorieGoal: number;
      mealsPerDay: number;
    };
  };
}

export interface HealthMetrics {
  date: string;
  weight: number;
  calories: number;
  water: number; // cups
  exercise: number; // minutes
  sleep: number; // hours
  mood: 1 | 2 | 3 | 4 | 5;
}

export interface NutritionAnalysis {
  totalCalories: number;
  macros: {
    protein: { amount: number; percentage: number; };
    carbs: { amount: number; percentage: number; };
    fat: { amount: number; percentage: number; };
    fiber: { amount: number; };
  };
  micronutrients: {
    [key: string]: {
      amount: number;
      unit: string;
      dailyValue: number;
      status: 'low' | 'adequate' | 'high';
    };
  };
  recommendations: string[];
}