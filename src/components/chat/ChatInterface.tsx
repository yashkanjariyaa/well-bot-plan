import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { chatStorage } from "@/utils/storage";
import { ChatMessage, ChatbotResponse } from "@/types/health";
import ChatMessageRenderer from "./ChatMessageRenderer";

const ChatInterface = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load chat history on component mount
  useEffect(() => {
    const history = chatStorage.get();
    setMessages(history);
  }, []);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Mock AI response generator (replace with actual AI integration)
  const generateAIResponse = async (userMessage: string): Promise<ChatbotResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Emergency detection
    const emergencyKeywords = ['chest pain', 'heart attack', 'can\'t breathe', 'emergency', 'severe pain'];
    const isEmergency = emergencyKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword)
    );

    if (isEmergency) {
      return {
        type: 'emergency',
        content: {
          emergency: {
            severity: 'high',
            message: 'I notice you may be experiencing a medical emergency. Please seek immediate medical attention.',
            recommendations: [
              'Call emergency services (911) immediately',
              'Do not drive yourself to the hospital',
              'Stay calm and follow emergency operator instructions'
            ],
            emergencyContacts: [
              { name: 'Emergency Services', number: '911', type: 'emergency' },
              { name: 'Poison Control', number: '1-800-222-1222', type: 'poison_control' }
            ]
          }
        }
      };
    }

    // Diet/nutrition related responses
    if (userMessage.toLowerCase().includes('diet') || userMessage.toLowerCase().includes('meal')) {
      return {
        type: 'plan',
        content: {
          plan: {
            id: 'sample-plan-' + Date.now(),
            name: 'Mediterranean Diet Plan',
            description: 'A heart-healthy diet rich in vegetables, fruits, whole grains, and healthy fats.',
            duration: 7,
            totalCalories: 2000,
            macros: {
              protein: 150,
              carbs: 250,
              fat: 67,
              fiber: 35
            },
            meals: [
              {
                id: 'breakfast-1',
                name: 'Greek Yogurt with Berries',
                type: 'breakfast',
                calories: 300,
                macros: { protein: 20, carbs: 35, fat: 8, fiber: 5 },
                ingredients: [
                  {
                    id: 'greek-yogurt',
                    name: 'Greek Yogurt',
                    amount: 200,
                    unit: 'g',
                    calories: 150,
                    macros: { protein: 15, carbs: 6, fat: 5, fiber: 0 },
                    healthBenefits: ['High in protein', 'Probiotics for gut health'],
                    alternatives: ['Regular yogurt', 'Plant-based yogurt'],
                    allergens: ['dairy']
                  }
                ],
                instructions: [
                  'Add yogurt to a bowl',
                  'Top with fresh berries',
                  'Sprinkle with granola if desired'
                ],
                prepTime: 5,
                difficulty: 'easy',
                tags: ['quick', 'healthy', 'breakfast']
              }
            ],
            preferences: {
              vegetarian: false,
              vegan: false,
              halal: true,
              calorieLimit: 2200,
              excludeAllergies: []
            }
          }
        }
      };
    }

    // Nutrition info responses
    if (userMessage.toLowerCase().includes('calories') || userMessage.toLowerCase().includes('nutrition')) {
      return {
        type: 'card',
        content: {
          card: {
            title: 'Daily Nutrition Overview',
            description: 'Based on your current intake and goals',
            category: 'nutrition',
            metrics: [
              { label: 'Calories', value: '1,850', unit: 'kcal' },
              { label: 'Protein', value: '125', unit: 'g' },
              { label: 'Carbs', value: '200', unit: 'g' },
              { label: 'Fat', value: '65', unit: 'g' }
            ],
            actions: [
              { label: 'View Detailed Breakdown', action: 'view_nutrition', data: {} },
              { label: 'Log Food', action: 'log_food', data: {} }
            ]
          }
        }
      };
    }

    // Default text response with quick replies
    return {
      type: 'quick_replies',
      content: {
        text: 'I\'m here to help you with your health and nutrition questions! I can provide personalized diet plans, nutrition information, and wellness advice.',
        quickReplies: [
          { id: '1', text: 'Create a meal plan', action: 'create_meal_plan', data: {} },
          { id: '2', text: 'Track my nutrition', action: 'track_nutrition', data: {} },
          { id: '3', text: 'Exercise recommendations', action: 'exercise_tips', data: {} },
          { id: '4', text: 'Healthy recipes', action: 'healthy_recipes', data: {} }
        ]
      }
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    };

    // Add user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    chatStorage.add(userMessage);
    setInputValue("");
    setIsLoading(true);

    try {
      // Generate AI response
      const aiResponseData = await generateAIResponse(inputValue);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponseData.content.text || 'I\'ve prepared a response for you.',
        timestamp: new Date().toISOString(),
        data: aiResponseData
      };

      setMessages(prev => [...prev, aiMessage]);
      chatStorage.add(aiMessage);
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble processing your request right now. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      chatStorage.add(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickReply = (action: string, data: any) => {
    setInputValue(action.replace('_', ' '));
    // Auto-send the quick reply
    setTimeout(() => handleSendMessage(), 100);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-w-4xl mx-auto">
      {/* Medical Disclaimer */}
      <Alert className="mb-4 bg-warning/10 border-warning/20">
        <AlertTriangle className="h-4 w-4 text-warning-foreground" />
        <AlertDescription className="text-warning-foreground">
          This AI assistant provides general health information only. Always consult healthcare professionals for medical advice.
        </AlertDescription>
      </Alert>

      {/* Chat Messages */}
      <Card className="flex-1 mb-4">
        <CardContent className="p-0">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-medium mb-2">Welcome to your Health Assistant!</h3>
                  <p>Ask me about nutrition, diet plans, healthy recipes, or any health-related questions.</p>
                </div>
              )}
              
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' ? 'bg-primary' : 'bg-accent'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="h-4 w-4 text-primary-foreground" />
                      ) : (
                        <Bot className="h-4 w-4 text-accent-foreground" />
                      )}
                    </div>
                    
                    <div className={`rounded-lg px-4 py-2 ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      {message.role === 'assistant' && message.data ? (
                        <ChatMessageRenderer message={message} onQuickReply={handleQuickReply} />
                      ) : (
                        <p>{message.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                      <Bot className="h-4 w-4 text-accent-foreground" />
                    </div>
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Input Area */}
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about nutrition, diet plans, recipes, or health questions..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={!inputValue.trim() || isLoading}
          className="px-4"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInterface;