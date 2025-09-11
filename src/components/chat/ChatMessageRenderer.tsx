import { AlertTriangle, Phone, Heart, Clock, Users, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChatMessage } from "@/types/health";

interface ChatMessageRendererProps {
  message: ChatMessage;
  onQuickReply: (action: string, data: any) => void;
}

const ChatMessageRenderer = ({ message, onQuickReply }: ChatMessageRendererProps) => {
  if (!message.data) return <p>{message.content}</p>;

  const { type, content } = message.data;

  switch (type) {
    case 'emergency':
      if (!content.emergency) return <p>{message.content}</p>;
      
      return (
        <Alert className="bg-destructive/10 border-destructive">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription>
            <div className="space-y-4">
              <p className="font-semibold text-destructive">{content.emergency.message}</p>
              
              <div>
                <h4 className="font-medium mb-2">Immediate Actions:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {content.emergency.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm">{rec}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Emergency Contacts:</h4>
                <div className="grid grid-cols-1 gap-2">
                  {content.emergency.emergencyContacts.map((contact, index) => (
                    <Button
                      key={index}
                      variant="destructive"
                      size="sm"
                      className="justify-start"
                      onClick={() => window.open(`tel:${contact.number}`)}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      {contact.name}: {contact.number}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      );

    case 'card':
      if (!content.card) return <p>{message.content}</p>;
      
      return (
        <Card className="max-w-md shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              {content.card.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{content.card.description}</p>
          </CardHeader>
          <CardContent>
            {content.card.metrics && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                {content.card.metrics.map((metric, index) => (
                  <div key={index} className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{metric.value}</div>
                    <div className="text-sm text-muted-foreground">
                      {metric.label} {metric.unit && `(${metric.unit})`}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {content.card.actions && (
              <div className="space-y-2">
                {content.card.actions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => onQuickReply(action.action, action.data)}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      );

    case 'plan':
      if (!content.plan) return <p>{message.content}</p>;
      
      return (
        <Card className="max-w-2xl shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {content.plan.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{content.plan.description}</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-gradient-calm rounded-lg">
                <div className="text-2xl font-bold text-primary">{content.plan.duration}</div>
                <div className="text-sm text-muted-foreground">Days</div>
              </div>
              <div className="text-center p-3 bg-gradient-calm rounded-lg">
                <div className="text-2xl font-bold text-primary">{content.plan.totalCalories}</div>
                <div className="text-sm text-muted-foreground">Calories</div>
              </div>
              <div className="text-center p-3 bg-gradient-calm rounded-lg">
                <div className="text-2xl font-bold text-primary">{content.plan.macros.protein}g</div>
                <div className="text-sm text-muted-foreground">Protein</div>
              </div>
              <div className="text-center p-3 bg-gradient-calm rounded-lg">
                <div className="text-2xl font-bold text-primary">{content.plan.macros.carbs}g</div>
                <div className="text-sm text-muted-foreground">Carbs</div>
              </div>
            </div>

            {content.plan.meals && content.plan.meals.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium">Sample Meals:</h4>
                {content.plan.meals.slice(0, 3).map((meal, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">{meal.name}</h5>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{meal.type}</Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {meal.prepTime}min
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {meal.calories} calories • {meal.macros.protein}g protein
                    </p>
                    {meal.ingredients && meal.ingredients.length > 0 && (
                      <div className="text-sm">
                        <strong>Key ingredient:</strong> {meal.ingredients[0].name} 
                        ({meal.ingredients[0].amount}{meal.ingredients[0].unit})
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 space-y-2">
              <Button 
                className="w-full" 
                onClick={() => onQuickReply('save_plan', { planId: content.plan?.id })}
              >
                Save This Plan
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => onQuickReply('customize_plan', { planId: content.plan?.id })}
              >
                Customize Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      );

    case 'quick_replies':
      return (
        <div className="space-y-4">
          {content.text && <p>{content.text}</p>}
          
          {content.quickReplies && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {content.quickReplies.map((reply) => (
                <Button
                  key={reply.id}
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => onQuickReply(reply.action, reply.data)}
                >
                  {reply.text}
                </Button>
              ))}
            </div>
          )}
        </div>
      );

    case 'ingredient':
      if (!content.ingredient) return <p>{message.content}</p>;
      
      return (
        <Card className="max-w-md shadow-card">
          <CardHeader>
            <CardTitle>{content.ingredient.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {content.ingredient.amount}{content.ingredient.unit} • {content.ingredient.calories} calories
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-2 bg-muted/50 rounded">
                <div className="font-bold text-primary">{content.ingredient.macros.protein}g</div>
                <div className="text-xs text-muted-foreground">Protein</div>
              </div>
              <div className="text-center p-2 bg-muted/50 rounded">
                <div className="font-bold text-primary">{content.ingredient.macros.carbs}g</div>
                <div className="text-xs text-muted-foreground">Carbs</div>
              </div>
            </div>

            {content.ingredient.healthBenefits && content.ingredient.healthBenefits.length > 0 && (
              <div className="mb-4">
                <h5 className="font-medium mb-2">Health Benefits:</h5>
                <ul className="text-sm space-y-1">
                  {content.ingredient.healthBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Heart className="h-3 w-3 text-success" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {content.ingredient.alternatives && content.ingredient.alternatives.length > 0 && (
              <div>
                <h5 className="font-medium mb-2">Alternatives:</h5>
                <div className="flex flex-wrap gap-1">
                  {content.ingredient.alternatives.map((alt, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {alt}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      );

    default:
      return <p>{message.content}</p>;
  }
};

export default ChatMessageRenderer;