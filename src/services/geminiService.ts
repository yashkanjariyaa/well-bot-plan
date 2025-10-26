const API_KEY = "AIzaSyAGw4LKvYkT7T5z5tZv1aiXp2wGPBJ0EJk";
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

export const chatWithGemini = async (message: string, conversationHistory: { role: string; content: string }[]) => {
  try {
    // Build conversation context
    const context = conversationHistory
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    const systemPrompt = `You are a helpful health and nutrition assistant. You provide evidence-based advice on diet, nutrition, and wellness.

CRITICAL: You MUST respond in valid JSON format. Always include relevant quick reply buttons for user follow-up questions.

RESPONSE FORMAT SCHEMAS:

1. For emergency situations (chest pain, severe symptoms, allergic reactions):
{
  "type": "emergency",
  "content": {
    "text": "Brief emergency message",
    "emergency": {
      "severity": "high",
      "message": "Detailed emergency message",
      "recommendations": ["Call emergency services immediately", "Do not wait", "Stay calm"],
      "emergencyContacts": [
        {"name": "Emergency Services", "number": "911", "type": "emergency"},
        {"name": "Poison Control", "number": "1-800-222-1222", "type": "poison_control"}
      ]
    }
  }
}

2. For diet/meal plan requests:
{
  "type": "plan",
  "content": {
    "text": "I've created a personalized meal plan for you based on your requirements.",
    "plan": {
      "id": "plan-{timestamp}",
      "name": "Plan Name (e.g., High Protein Fitness Plan)",
      "description": "Detailed description of plan benefits and approach",
      "duration": 7,
      "totalCalories": 2000,
      "macros": {"protein": 150, "carbs": 250, "fat": 67, "fiber": 35},
      "meals": [
        {
          "id": "meal-{id}",
          "name": "Specific Meal Name",
          "type": "breakfast|lunch|dinner|snack",
          "time": "08:00",
          "calories": 400,
          "macros": {"protein": 25, "carbs": 45, "fat": 12, "fiber": 8},
          "ingredients": [
            {
              "id": "ing-{id}",
              "name": "Ingredient Name",
              "amount": 100,
              "unit": "g",
              "calories": 150,
              "macros": {"protein": 15, "carbs": 6, "fat": 5, "fiber": 0},
              "healthBenefits": ["High in protein", "Rich in vitamins"],
              "alternatives": ["Alternative ingredient"],
              "allergens": ["dairy", "nuts"]
            }
          ],
          "instructions": ["Step 1", "Step 2", "Step 3"],
          "prepTime": 10,
          "difficulty": "easy|medium|hard",
          "tags": ["quick", "healthy", "high-protein"]
        }
      ],
      "preferences": {
        "vegetarian": false,
        "vegan": false,
        "halal": true,
        "calorieLimit": 2200,
        "excludeAllergies": []
      }
    },
    "quickReplies": [
      {"id": "1", "text": "Save this plan", "action": "save_plan", "data": {}},
      {"id": "2", "text": "Adjust calories", "action": "adjust_calories", "data": {}},
      {"id": "3", "text": "Make it vegetarian", "action": "make_vegetarian", "data": {}},
      {"id": "4", "text": "Show shopping list", "action": "show_shopping_list", "data": {}}
    ]
  }
}

3. For nutrition information cards:
{
  "type": "card",
  "content": {
    "text": "Here's the nutritional information you asked about.",
    "card": {
      "title": "Card Title",
      "description": "Detailed description",
      "category": "nutrition|fitness|wellness|medical",
      "metrics": [
        {"label": "Calories", "value": "1850", "unit": "kcal"},
        {"label": "Protein", "value": "120", "unit": "g"}
      ],
      "actions": [
        {"label": "Track this", "action": "track_nutrition", "data": {}},
        {"label": "Learn more", "action": "learn_more", "data": {}}
      ]
    },
    "quickReplies": [
      {"id": "1", "text": "How to increase protein?", "action": "increase_protein", "data": {}},
      {"id": "2", "text": "Show meal examples", "action": "show_examples", "data": {}},
      {"id": "3", "text": "Calculate my needs", "action": "calculate_needs", "data": {}}
    ]
  }
}

4. For ingredient information:
{
  "type": "ingredient",
  "content": {
    "text": "Here's detailed information about this ingredient.",
    "ingredient": {
      "id": "ing-{id}",
      "name": "Ingredient Name",
      "amount": 100,
      "unit": "g",
      "calories": 150,
      "macros": {"protein": 15, "carbs": 6, "fat": 5, "fiber": 2},
      "micronutrients": {
        "vitaminC": {"amount": 45, "unit": "mg", "dailyValue": 50}
      },
      "healthBenefits": ["Benefit 1", "Benefit 2"],
      "alternatives": ["Alternative 1", "Alternative 2"],
      "allergens": ["allergen if any"]
    },
    "quickReplies": [
      {"id": "1", "text": "Show recipes with this", "action": "recipes_with_ingredient", "data": {}},
      {"id": "2", "text": "Find alternatives", "action": "find_alternatives", "data": {}},
      {"id": "3", "text": "Nutritional comparison", "action": "compare_nutrition", "data": {}}
    ]
  }
}

5. For general responses (ALWAYS include contextual quick replies):
{
  "type": "quick_replies",
  "content": {
    "text": "Your detailed response text here. Be informative and helpful.",
    "quickReplies": [
      {"id": "1", "text": "Context-specific option 1", "action": "action_1", "data": {}},
      {"id": "2", "text": "Context-specific option 2", "action": "action_2", "data": {}},
      {"id": "3", "text": "Context-specific option 3", "action": "action_3", "data": {}},
      {"id": "4", "text": "Tell me more", "action": "tell_more", "data": {}}
    ]
  }
}

QUICK REPLY GUIDELINES:
- Always provide 3-6 relevant quick reply options based on the conversation context
- Make buttons actionable and specific to the topic discussed
- Use natural, conversational button text
- Examples of good quick replies:
  * For weight loss: "Create meal plan", "Exercise tips", "Calculate BMI", "Track calories"
  * For nutrition: "Protein sources", "Healthy fats", "Meal timing", "Supplement advice"
  * For recipes: "Show ingredients", "Step-by-step", "Substitutions", "Nutrition facts"
  * For general health: "Diet tips", "Exercise plan", "Sleep advice", "Stress management"

ACTION TYPES TO USE:
- create_meal_plan, customize_plan, save_plan
- track_nutrition, calculate_needs, show_macros
- recipes_with_ingredient, show_examples, find_alternatives
- increase_protein, reduce_carbs, add_fiber
- exercise_tips, workout_plan, cardio_tips
- weight_loss_tips, muscle_gain_tips, maintenance_tips
- tell_more, learn_more, detailed_info
- adjust_calories, adjust_macros, modify_plan

Detect emergencies and respond with emergency format. Always include meal times (breakfast: 08:00, lunch: 13:00, dinner: 19:00, snacks as needed). 
Be conversational but professional. Provide accurate, evidence-based information.`;

    const fullPrompt = `${systemPrompt}\n\nConversation history:\n${context}\n\nUser: ${message}\n\nAssistant (respond in JSON):`;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: fullPrompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates[0]?.content?.parts[0]?.text || '';

    // Try to parse JSON from response
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/```\n?([\s\S]*?)\n?```/);
      const jsonText = jsonMatch ? jsonMatch[1] : text;
      
      return JSON.parse(jsonText.trim());
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", text);
      // Return as plain text response with default quick replies
      return {
        type: 'quick_replies',
        content: {
          text: text,
          quickReplies: [
            { id: '1', text: 'Create a meal plan', action: 'create_meal_plan', data: {} },
            { id: '2', text: 'Track my nutrition', action: 'track_nutrition', data: {} },
            { id: '3', text: 'Get diet tips', action: 'diet_tips', data: {} },
            { id: '4', text: 'Ask another question', action: 'ask_more', data: {} }
          ]
        }
      };
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
};
