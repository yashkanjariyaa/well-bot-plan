import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DietPlan } from "@/types/health";
import { useToast } from "@/hooks/use-toast";

interface PlanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (plan: DietPlan) => void;
  editPlan?: DietPlan;
}

const PlanFormDialog = ({ open, onOpenChange, onSave, editPlan }: PlanFormDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<DietPlan>>({
    name: "",
    description: "",
    duration: 7,
    totalCalories: 2000,
    macros: { protein: 150, carbs: 250, fat: 67, fiber: 35 },
    meals: [],
    preferences: {
      vegetarian: false,
      vegan: false,
      halal: true,
      calorieLimit: 2200,
      excludeAllergies: []
    }
  });

  useEffect(() => {
    if (editPlan) {
      setFormData(editPlan);
    }
  }, [editPlan]);

  const handleSave = () => {
    if (!formData.name || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const plan: DietPlan = {
      id: editPlan?.id || `plan-${Date.now()}`,
      name: formData.name!,
      description: formData.description!,
      duration: formData.duration!,
      totalCalories: formData.totalCalories!,
      macros: formData.macros!,
      meals: formData.meals || [],
      preferences: formData.preferences!
    };

    onSave(plan);
    onOpenChange(false);
    
    toast({
      title: editPlan ? "Plan Updated" : "Plan Created",
      description: `${plan.name} has been ${editPlan ? 'updated' : 'created'} successfully`
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editPlan ? "Edit Diet Plan" : "Create New Diet Plan"}</DialogTitle>
          <DialogDescription>
            {editPlan ? "Update your diet plan details" : "Fill in the details to create a custom diet plan"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Plan Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Mediterranean Diet Plan"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your diet plan and its benefits"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (days)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 7 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="calories">Total Calories/Day</Label>
              <Input
                id="calories"
                type="number"
                value={formData.totalCalories}
                onChange={(e) => setFormData({ ...formData, totalCalories: parseInt(e.target.value) || 2000 })}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Macros (grams per day)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="protein" className="text-sm">Protein</Label>
                <Input
                  id="protein"
                  type="number"
                  value={formData.macros?.protein}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    macros: { ...formData.macros!, protein: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carbs" className="text-sm">Carbs</Label>
                <Input
                  id="carbs"
                  type="number"
                  value={formData.macros?.carbs}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    macros: { ...formData.macros!, carbs: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fat" className="text-sm">Fat</Label>
                <Input
                  id="fat"
                  type="number"
                  value={formData.macros?.fat}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    macros: { ...formData.macros!, fat: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fiber" className="text-sm">Fiber</Label>
                <Input
                  id="fiber"
                  type="number"
                  value={formData.macros?.fiber}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    macros: { ...formData.macros!, fiber: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Dietary Preferences</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="vegetarian" className="cursor-pointer">Vegetarian</Label>
                <Switch
                  id="vegetarian"
                  checked={formData.preferences?.vegetarian}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    preferences: { ...formData.preferences!, vegetarian: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="vegan" className="cursor-pointer">Vegan</Label>
                <Switch
                  id="vegan"
                  checked={formData.preferences?.vegan}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    preferences: { ...formData.preferences!, vegan: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="halal" className="cursor-pointer">Halal</Label>
                <Switch
                  id="halal"
                  checked={formData.preferences?.halal}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    preferences: { ...formData.preferences!, halal: checked }
                  })}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editPlan ? "Update Plan" : "Create Plan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanFormDialog;
