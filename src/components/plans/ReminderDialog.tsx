import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DietPlan, Meal } from "@/types/health";
import { useToast } from "@/hooks/use-toast";
import { Bell, Plus, Trash2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: DietPlan;
  onSetReminders: (plan: DietPlan, meals: Meal[]) => void;
}

const ReminderDialog = ({ open, onOpenChange, plan, onSetReminders }: ReminderDialogProps) => {
  const { toast } = useToast();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [newMealName, setNewMealName] = useState("");
  const [newMealType, setNewMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [newMealTime, setNewMealTime] = useState("08:00");

  useEffect(() => {
    // Initialize with existing meals or create default ones
    if (plan.meals && plan.meals.length > 0) {
      setMeals([...plan.meals]);
    } else {
      setMeals([
        {
          id: `meal-breakfast-${Date.now()}`,
          name: "Breakfast",
          type: 'breakfast',
          time: "08:00",
          calories: Math.round(plan.totalCalories * 0.3),
          macros: {
            protein: Math.round(plan.macros.protein * 0.3),
            carbs: Math.round(plan.macros.carbs * 0.3),
            fat: Math.round(plan.macros.fat * 0.3),
            fiber: Math.round(plan.macros.fiber * 0.3)
          },
          ingredients: [],
          instructions: [],
          prepTime: 15,
          difficulty: 'easy',
          tags: []
        },
        {
          id: `meal-lunch-${Date.now() + 1}`,
          name: "Lunch",
          type: 'lunch',
          time: "13:00",
          calories: Math.round(plan.totalCalories * 0.4),
          macros: {
            protein: Math.round(plan.macros.protein * 0.4),
            carbs: Math.round(plan.macros.carbs * 0.4),
            fat: Math.round(plan.macros.fat * 0.4),
            fiber: Math.round(plan.macros.fiber * 0.4)
          },
          ingredients: [],
          instructions: [],
          prepTime: 30,
          difficulty: 'medium',
          tags: []
        },
        {
          id: `meal-dinner-${Date.now() + 2}`,
          name: "Dinner",
          type: 'dinner',
          time: "19:00",
          calories: Math.round(plan.totalCalories * 0.3),
          macros: {
            protein: Math.round(plan.macros.protein * 0.3),
            carbs: Math.round(plan.macros.carbs * 0.3),
            fat: Math.round(plan.macros.fat * 0.3),
            fiber: Math.round(plan.macros.fiber * 0.3)
          },
          ingredients: [],
          instructions: [],
          prepTime: 40,
          difficulty: 'medium',
          tags: []
        }
      ]);
    }
  }, [plan, open]);


  const handleUpdateMealTime = (mealId: string, time: string) => {
    setMeals(meals.map(meal => 
      meal.id === mealId ? { ...meal, time } : meal
    ));
  };

  const handleUpdateMealName = (mealId: string, name: string) => {
    setMeals(meals.map(meal => 
      meal.id === mealId ? { ...meal, name } : meal
    ));
  };

  const handleAddMeal = () => {
    if (!newMealName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a meal name",
        variant: "destructive"
      });
      return;
    }

    const newMeal: Meal = {
      id: `meal-${newMealType}-${Date.now()}`,
      name: newMealName,
      type: newMealType,
      time: newMealTime,
      calories: Math.round(plan.totalCalories * 0.25),
      macros: {
        protein: Math.round(plan.macros.protein * 0.25),
        carbs: Math.round(plan.macros.carbs * 0.25),
        fat: Math.round(plan.macros.fat * 0.25),
        fiber: Math.round(plan.macros.fiber * 0.25)
      },
      ingredients: [],
      instructions: [],
      prepTime: 20,
      difficulty: 'easy',
      tags: []
    };

    setMeals([...meals, newMeal]);
    setNewMealName("");
    setNewMealTime("08:00");
    
    toast({
      title: "Meal Added",
      description: `${newMealName} has been added to your meal schedule`,
    });
  };

  const handleDeleteMeal = (mealId: string) => {
    setMeals(meals.filter(meal => meal.id !== mealId));
    toast({
      title: "Meal Removed",
      description: "The meal has been removed from your schedule",
    });
  };

  const handleSetReminders = () => {
    if (meals.length === 0) {
      toast({
        title: "No Meals",
        description: "Please add at least one meal to set reminders",
        variant: "destructive"
      });
      return;
    }

    onSetReminders(plan, meals);
    onOpenChange(false);
    
    toast({
      title: "Reminders Set",
      description: `${meals.length} meal reminder(s) have been scheduled for ${plan.name}`,
      duration: 3000
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Manage Meal Reminders
          </DialogTitle>
          <DialogDescription>
            Add, edit, or remove meal reminders for {plan.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Meals */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Scheduled Meals</Label>
              <Badge variant="secondary">{meals.length} meal(s)</Badge>
            </div>
            
            {meals.length === 0 ? (
              <Card className="bg-muted/50">
                <CardContent className="pt-6 pb-6 text-center text-sm text-muted-foreground">
                  No meals scheduled yet. Add your first meal below.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {meals.map((meal) => (
                  <Card key={meal.id} className="border-2">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-primary mt-1" />
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize">
                              {meal.type}
                            </Badge>
                            <Input
                              value={meal.name}
                              onChange={(e) => handleUpdateMealName(meal.id, e.target.value)}
                              className="flex-1"
                              placeholder="Meal name"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-sm min-w-[60px]">Time:</Label>
                            <Input
                              type="time"
                              value={meal.time || "08:00"}
                              onChange={(e) => handleUpdateMealTime(meal.id, e.target.value)}
                              className="flex-1"
                            />
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {meal.calories} cal • {meal.macros.protein}g protein
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMeal(meal.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Add New Meal */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Add New Meal</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="meal-name" className="text-sm">Meal Name</Label>
                <Input
                  id="meal-name"
                  value={newMealName}
                  onChange={(e) => setNewMealName(e.target.value)}
                  placeholder="e.g., Protein Shake"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meal-type" className="text-sm">Type</Label>
                <select
                  id="meal-type"
                  value={newMealType}
                  onChange={(e) => setNewMealType(e.target.value as any)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="meal-time" className="text-sm">Time</Label>
              <Input
                id="meal-time"
                type="time"
                value={newMealTime}
                onChange={(e) => setNewMealTime(e.target.value)}
              />
            </div>
            <Button onClick={handleAddMeal} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Meal
            </Button>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
            <p>💡 Reminders will be sent 15 minutes before each meal time for the next 2 days. Reset reminders daily for continued notifications.</p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSetReminders}>
              <Bell className="h-4 w-4 mr-2" />
              Set Reminders
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReminderDialog;
