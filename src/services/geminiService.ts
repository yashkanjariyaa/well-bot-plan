const API_KEY = "AIzaSyAGw4LKvYkT7T5z5tZv1aiXp2wGPBJ0EJk";
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

export const chatWithGemini = async (message: string, conversationHistory: { role: string; content: string }[]) => {
  try {
    // Build conversation context
    const context = conversationHistory
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    const systemPrompt = `You are a helpful health and nutrition assistant. You provide evidence-based advice on diet, nutrition, and wellness.

IMPORTANT: You must respond in valid JSON format following these schemas:

For emergency situations (chest pain, severe symptoms):
{
  "type": "emergency",
  "content": {
    "emergency": {
      "severity": "high",
      "message": "Emergency message",
      "recommendations": ["action 1", "action 2"],
      "emergencyContacts": [{"name": "Emergency Services", "number": "911", "type": "emergency"}]
    }
  }
}

For diet/meal plans:
{
  "type": "plan",
  "content": {
    "plan": {
      "id": "unique-id",
      "name": "Plan Name",
      "description": "Description",
      "duration": 7,
      "totalCalories": 2000,
      "macros": {"protein": 150, "carbs": 250, "fat": 67, "fiber": 35},
      "meals": [
        {
          "id": "meal-id",
          "name": "Meal Name",
          "type": "breakfast",
          "time": "08:00",
          "calories": 400,
          "macros": {"protein": 25, "carbs": 45, "fat": 12, "fiber": 8},
          "ingredients": [
            {
              "id": "ing-id",
              "name": "Ingredient",
              "amount": 100,
              "unit": "g",
              "calories": 150,
              "macros": {"protein": 15, "carbs": 6, "fat": 5, "fiber": 0},
              "healthBenefits": ["benefit 1"],
              "alternatives": ["alt 1"],
              "allergens": ["dairy"]
            }
          ],
          "instructions": ["step 1", "step 2"],
          "prepTime": 10,
          "difficulty": "easy",
          "tags": ["quick", "healthy"]
        }
      ],
      "preferences": {
        "vegetarian": false,
        "vegan": false,
        "halal": true,
        "calorieLimit": 2200,
        "excludeAllergies": []
      }
    }
  }
}

For nutrition info cards:
{
  "type": "card",
  "content": {
    "card": {
      "title": "Title",
      "description": "Description",
      "category": "nutrition",
      "metrics": [{"label": "Calories", "value": "1850", "unit": "kcal"}],
      "actions": [{"label": "Action", "action": "action_type", "data": {}}]
    }
  }
}

For regular responses with quick replies:
{
  "type": "quick_replies",
  "content": {
    "text": "Your response text here",
    "quickReplies": [
      {"id": "1", "text": "Button text", "action": "action_type", "data": {}}
    ]
  }
}

Detect emergencies and respond with emergency format. Provide meal times (breakfast: 08:00, lunch: 13:00, dinner: 19:00, snacks as needed).`;

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
      // Return as plain text response
      return {
        type: 'quick_replies',
        content: {
          text: text,
          quickReplies: [
            { id: '1', text: 'Create a meal plan', action: 'create_meal_plan', data: {} },
            { id: '2', text: 'Nutrition info', action: 'track_nutrition', data: {} }
          ]
        }
      };
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
};
