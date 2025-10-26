import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { chatStorage, dietPlansStorage } from "@/utils/storage";
import { ChatMessage, ChatbotResponse, DietPlan } from "@/types/health";
import ChatMessageRenderer from "./ChatMessageRenderer";
import { chatWithGemini } from "@/services/geminiService";
import { toast } from "sonner";

const ChatInterface = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history on component mount
  useEffect(() => {
    const history = chatStorage.get();
    setMessages(history);
  }, []);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // AI response generator using Gemini API
  const generateAIResponse = async (userMessage: string): Promise<ChatbotResponse> => {
    try {
      // Build conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await chatWithGemini(userMessage, conversationHistory);
      return response;
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      toast.error("Failed to get AI response", {
        description: "Please check your internet connection and try again"
      });
      
      // Return fallback response
      return {
        type: 'quick_replies',
        content: {
          text: 'I\'m having trouble connecting right now. Please try again in a moment.',
          quickReplies: [
            { id: '1', text: 'Retry', action: 'retry', data: {} }
          ]
        }
      };
    }
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

  const handleQuickReply = async (action: string, data: any) => {
    console.log("Quick reply action:", action, data);
    
    let messageToSend = "";
    
    // Handle different actions
    switch (action) {
      case 'save_plan':
        // Find the plan in the last assistant message and save it
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.data?.content?.plan) {
          const plan = lastMessage.data.content.plan as DietPlan;
          dietPlansStorage.add(plan);
          toast.success("Plan Saved", {
            description: `${plan.name} has been saved to your diet plans`
          });
        }
        return;
      
      // Meal plan related actions
      case 'create_meal_plan':
        messageToSend = "Create a personalized meal plan for me";
        break;
      case 'customize_plan':
        messageToSend = "I'd like to customize this plan";
        break;
      case 'adjust_calories':
        messageToSend = "Can you adjust the calorie count in this plan?";
        break;
      case 'make_vegetarian':
        messageToSend = "Make this plan vegetarian";
        break;
      case 'show_shopping_list':
        messageToSend = "Show me a shopping list for this plan";
        break;
      
      // Nutrition tracking
      case 'track_nutrition':
        messageToSend = "Help me track my nutrition";
        break;
      case 'calculate_needs':
        messageToSend = "Calculate my daily nutritional needs";
        break;
      case 'show_macros':
        messageToSend = "Show me how to balance my macros";
        break;
      
      // Protein related
      case 'increase_protein':
        messageToSend = "How can I increase my protein intake?";
        break;
      case 'protein_sources':
        messageToSend = "What are good sources of protein?";
        break;
      
      // Recipe and ingredient related
      case 'recipes_with_ingredient':
        messageToSend = "Show me recipes with this ingredient";
        break;
      case 'show_examples':
        messageToSend = "Show me some meal examples";
        break;
      case 'find_alternatives':
        messageToSend = "What are some alternatives for this ingredient?";
        break;
      case 'compare_nutrition':
        messageToSend = "Compare the nutrition of similar ingredients";
        break;
      
      // Macro adjustments
      case 'reduce_carbs':
        messageToSend = "How can I reduce my carb intake?";
        break;
      case 'add_fiber':
        messageToSend = "How can I add more fiber to my diet?";
        break;
      case 'healthy_fats':
        messageToSend = "What are healthy sources of fats?";
        break;
      
      // Exercise and fitness
      case 'exercise_tips':
        messageToSend = "Give me exercise tips";
        break;
      case 'workout_plan':
        messageToSend = "Create a workout plan for me";
        break;
      case 'cardio_tips':
        messageToSend = "What cardio exercises do you recommend?";
        break;
      
      // Weight management
      case 'weight_loss_tips':
        messageToSend = "Give me weight loss tips";
        break;
      case 'muscle_gain_tips':
        messageToSend = "How can I gain muscle mass?";
        break;
      case 'maintenance_tips':
        messageToSend = "How do I maintain my current weight?";
        break;
      
      // General diet
      case 'diet_tips':
        messageToSend = "Give me general diet tips";
        break;
      case 'meal_timing':
        messageToSend = "What's the best meal timing for my goals?";
        break;
      case 'supplement_advice':
        messageToSend = "What supplements should I consider?";
        break;
      
      // More information
      case 'tell_more':
      case 'learn_more':
      case 'detailed_info':
        messageToSend = "Tell me more about this";
        break;
      case 'ask_more':
        messageToSend = "I have another question";
        break;
      
      default:
        messageToSend = `Tell me more about ${action.replace(/_/g, ' ')}`;
    }
    
    // Send the message directly without putting it in the input box
    if (messageToSend && !isLoading) {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: messageToSend,
        timestamp: new Date().toISOString()
      };

      // Add user message
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      chatStorage.add(userMessage);
      setIsLoading(true);

      try {
        // Generate AI response
        const aiResponseData = await generateAIResponse(messageToSend);
        
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
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] max-w-4xl mx-auto">
      {/* Medical Disclaimer */}
      <Alert className="mb-4 bg-warning/10 border-warning/20 flex-shrink-0">
        <AlertTriangle className="h-4 w-4 text-warning-foreground" />
        <AlertDescription className="text-warning-foreground">
          This AI assistant provides general health information only. Always consult healthcare professionals for medical advice.
        </AlertDescription>
      </Alert>

      {/* Chat Messages */}
      <Card className="flex-1 mb-4 overflow-hidden flex flex-col">
        <CardContent className="p-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="space-y-4 p-4">
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
              
              {/* Invisible element to scroll to */}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Input Area - Fixed at bottom */}
      <div className="flex gap-2 flex-shrink-0">
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