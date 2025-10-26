import { useState, useEffect } from "react";
import { Plus, Search, Filter, Clock, Target, Users, Bell, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dietPlansStorage } from "@/utils/storage";
import { DietPlan } from "@/types/health";
import { useNotifications } from "@/hooks/useNotifications";
import PlanFormDialog from "./PlanFormDialog";
import ReminderDialog from "./ReminderDialog";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const DietPlans = () => {
  const [plans, setPlans] = useState<DietPlan[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<DietPlan | undefined>();
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [selectedPlanForReminder, setSelectedPlanForReminder] = useState<DietPlan | null>(null);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
  const { scheduleMealReminders, requestPermission, permission } = useNotifications();
  const { toast } = useToast();

  useEffect(() => {
    const savedPlans = dietPlansStorage.getAll();
    if (savedPlans.length === 0) {
      // Add sample plans if none exist
      const samplePlans: DietPlan[] = [
        {
          id: "mediterranean-plan",
          name: "Mediterranean Diet Plan",
          description: "Heart-healthy diet rich in vegetables, fruits, whole grains, and healthy fats. Perfect for reducing inflammation and supporting cardiovascular health.",
          duration: 7,
          totalCalories: 2000,
          macros: {
            protein: 150,
            carbs: 250,
            fat: 67,
            fiber: 35
          },
          meals: [],
          preferences: {
            vegetarian: false,
            vegan: false,
            halal: true,
            calorieLimit: 2200,
            excludeAllergies: []
          }
        },
        {
          id: "vegetarian-plan",
          name: "Plant-Based Wellness",
          description: "Nutritious vegetarian meal plan focused on whole foods, legumes, and plant proteins. Great for weight management and environmental sustainability.",
          duration: 7,
          totalCalories: 1800,
          macros: {
            protein: 120,
            carbs: 220,
            fat: 60,
            fiber: 40
          },
          meals: [],
          preferences: {
            vegetarian: true,
            vegan: false,
            halal: true,
            calorieLimit: 2000,
            excludeAllergies: []
          }
        },
        {
          id: "high-protein-plan",
          name: "High-Protein Fitness Plan",
          description: "Designed for active individuals looking to build muscle and support recovery. Includes lean proteins, complex carbs, and nutrient timing.",
          duration: 7,
          totalCalories: 2400,
          macros: {
            protein: 200,
            carbs: 240,
            fat: 80,
            fiber: 30
          },
          meals: [],
          preferences: {
            vegetarian: false,
            vegan: false,
            halal: true,
            calorieLimit: 2600,
            excludeAllergies: []
          }
        }
      ];

      samplePlans.forEach(plan => dietPlansStorage.add(plan));
      setPlans(samplePlans);
    } else {
      setPlans(savedPlans);
    }
  }, []);

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedFilter === "all") return matchesSearch;
    if (selectedFilter === "vegetarian") return matchesSearch && plan.preferences.vegetarian;
    if (selectedFilter === "vegan") return matchesSearch && plan.preferences.vegan;
    if (selectedFilter === "halal") return matchesSearch && plan.preferences.halal;
    if (selectedFilter === "low-calorie") return matchesSearch && plan.totalCalories < 2000;
    if (selectedFilter === "high-protein") return matchesSearch && plan.macros.protein > 150;
    
    return matchesSearch;
  });

  const getPlanTypeColor = (plan: DietPlan) => {
    if (plan.preferences.vegan) return "bg-green-100 text-green-800";
    if (plan.preferences.vegetarian) return "bg-green-100 text-green-700";
    if (plan.macros.protein > 150) return "bg-blue-100 text-blue-800";
    return "bg-primary/10 text-primary";
  };

  const getPlanTypeName = (plan: DietPlan) => {
    if (plan.preferences.vegan) return "Vegan";
    if (plan.preferences.vegetarian) return "Vegetarian";
    if (plan.macros.protein > 150) return "High Protein";
    return "Balanced";
  };

  const handleSavePlan = (plan: DietPlan) => {
    if (editingPlan) {
      dietPlansStorage.update(plan.id, plan);
      setPlans(plans.map(p => p.id === plan.id ? plan : p));
    } else {
      dietPlansStorage.add(plan);
      setPlans([...plans, plan]);
    }
    setEditingPlan(undefined);
  };

  const handleEditPlan = (plan: DietPlan) => {
    setEditingPlan(plan);
    setIsFormOpen(true);
  };

  const handleDeletePlan = (planId: string) => {
    dietPlansStorage.remove(planId);
    setPlans(plans.filter(p => p.id !== planId));
    setDeletingPlanId(null);
    toast({
      title: "Plan Deleted",
      description: "The diet plan has been removed",
      duration: 3000
    });
  };

  const handleSetCustomReminders = (plan: DietPlan) => {
    if (permission !== "granted") {
      requestPermission();
      return;
    }
    setSelectedPlanForReminder(plan);
    setReminderDialogOpen(true);
  };

  const handleReminderSet = (plan: DietPlan, customTimes: any) => {
    // Update meals with custom times
    const updatedMeals = plan.meals.map(meal => {
      const mealType = meal.type.toLowerCase();
      if (customTimes[mealType]) {
        return { ...meal, time: customTimes[mealType] };
      }
      return meal;
    });

    const updatedPlan = { ...plan, meals: updatedMeals };
    scheduleMealReminders(updatedPlan);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Diet Plans</h1>
          <p className="text-muted-foreground">Discover and manage your personalized nutrition plans</p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => {
            setEditingPlan(undefined);
            setIsFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Create New Plan
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search diet plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedFilter} onValueChange={setSelectedFilter}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter plans" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="vegetarian">Vegetarian</SelectItem>
            <SelectItem value="vegan">Vegan</SelectItem>
            <SelectItem value="halal">Halal</SelectItem>
            <SelectItem value="low-calorie">Low Calorie</SelectItem>
            <SelectItem value="high-protein">High Protein</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => (
          <Card key={plan.id} className="shadow-card hover:shadow-wellness transition-smooth cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{plan.name}</CardTitle>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={getPlanTypeColor(plan)}>
                      {getPlanTypeName(plan)}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {plan.duration} days
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">{plan.description}</p>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Nutrition Overview */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gradient-calm rounded-lg">
                    <div className="text-xl font-bold text-primary">{plan.totalCalories}</div>
                    <div className="text-xs text-muted-foreground">Calories/day</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-calm rounded-lg">
                    <div className="text-xl font-bold text-primary">{plan.macros.protein}g</div>
                    <div className="text-xs text-muted-foreground">Protein</div>
                  </div>
                </div>

                {/* Macros Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Carbs</span>
                    <span>{plan.macros.carbs}g</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Fat</span>
                    <span>{plan.macros.fat}g</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Fiber</span>
                    <span>{plan.macros.fiber}g</span>
                  </div>
                </div>

                {/* Dietary Preferences */}
                <div className="flex flex-wrap gap-1">
                  {plan.preferences.vegetarian && (
                    <Badge variant="outline" className="text-xs">Vegetarian</Badge>
                  )}
                  {plan.preferences.vegan && (
                    <Badge variant="outline" className="text-xs">Vegan</Badge>
                  )}
                  {plan.preferences.halal && (
                    <Badge variant="outline" className="text-xs">Halal</Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditPlan(plan)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setDeletingPlanId(plan.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="sm"
                    onClick={() => handleSetCustomReminders(plan)}
                  >
                    <Bell className="h-3 w-3 mr-2" />
                    Set Meal Reminders
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPlans.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No plans found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || selectedFilter !== "all" 
              ? "Try adjusting your search or filter criteria." 
              : "Create your first diet plan to get started."}
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Plan
          </Button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
        <Card className="text-center shadow-card">
          <CardContent className="pt-6">
            <Target className="h-8 w-8 mx-auto text-primary mb-2" />
            <div className="text-2xl font-bold">{plans.length}</div>
            <div className="text-sm text-muted-foreground">Total Plans</div>
          </CardContent>
        </Card>
        
        <Card className="text-center shadow-card">
          <CardContent className="pt-6">
            <Users className="h-8 w-8 mx-auto text-primary mb-2" />
            <div className="text-2xl font-bold">
              {plans.filter(p => p.preferences.vegetarian).length}
            </div>
            <div className="text-sm text-muted-foreground">Vegetarian Plans</div>
          </CardContent>
        </Card>
        
        <Card className="text-center shadow-card">
          <CardContent className="pt-6">
            <Clock className="h-8 w-8 mx-auto text-primary mb-2" />
            <div className="text-2xl font-bold">
              {Math.round(plans.reduce((acc, p) => acc + p.duration, 0) / plans.length || 0)}
            </div>
            <div className="text-sm text-muted-foreground">Avg Duration (days)</div>
          </CardContent>
        </Card>
      </div>

      <PlanFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSavePlan}
        editPlan={editingPlan}
      />

      {selectedPlanForReminder && (
        <ReminderDialog
          open={reminderDialogOpen}
          onOpenChange={setReminderDialogOpen}
          plan={selectedPlanForReminder}
          onSetReminders={handleReminderSet}
        />
      )}

      <AlertDialog open={!!deletingPlanId} onOpenChange={() => setDeletingPlanId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Diet Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this diet plan? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingPlanId && handleDeletePlan(deletingPlanId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DietPlans;
