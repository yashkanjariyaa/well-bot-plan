import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DietPlan } from "@/types/health";
import { useToast } from "@/hooks/use-toast";
import { Bell } from "lucide-react";

interface ReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: DietPlan;
  onSetReminders: (plan: DietPlan, customTimes: { breakfast: string; lunch: string; dinner: string; snack?: string }) => void;
}

const ReminderDialog = ({ open, onOpenChange, plan, onSetReminders }: ReminderDialogProps) => {
  const { toast } = useToast();
  const [reminderTimes, setReminderTimes] = useState({
    breakfast: "08:00",
    lunch: "13:00",
    dinner: "19:00",
    snack: "15:30"
  });

  const handleSetReminders = () => {
    onSetReminders(plan, reminderTimes);
    onOpenChange(false);
    
    toast({
      title: "Reminders Set",
      description: `Meal reminders have been scheduled for ${plan.name}`,
      duration: 3000
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Set Meal Reminders
          </DialogTitle>
          <DialogDescription>
            Customize your meal reminder times for {plan.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="breakfast">Breakfast Time</Label>
            <Input
              id="breakfast"
              type="time"
              value={reminderTimes.breakfast}
              onChange={(e) => setReminderTimes({ ...reminderTimes, breakfast: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lunch">Lunch Time</Label>
            <Input
              id="lunch"
              type="time"
              value={reminderTimes.lunch}
              onChange={(e) => setReminderTimes({ ...reminderTimes, lunch: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dinner">Dinner Time</Label>
            <Input
              id="dinner"
              type="time"
              value={reminderTimes.dinner}
              onChange={(e) => setReminderTimes({ ...reminderTimes, dinner: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="snack">Snack Time (Optional)</Label>
            <Input
              id="snack"
              type="time"
              value={reminderTimes.snack}
              onChange={(e) => setReminderTimes({ ...reminderTimes, snack: e.target.value })}
            />
          </div>

          <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
            <p>Reminders will be sent 15 minutes before each meal time for the next 7 days.</p>
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
