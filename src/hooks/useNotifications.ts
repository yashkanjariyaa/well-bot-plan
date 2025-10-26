import { useEffect } from "react";
import { DietPlan } from "@/types/health";
import { toast } from "sonner";

export const useNotifications = () => {
  useEffect(() => {
    // Request notification permission on mount
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const scheduleNotification = (title: string, body: string, triggerTime: Date) => {
    const now = new Date();
    const delay = triggerTime.getTime() - now.getTime();

    if (delay <= 0) {
      // Time has passed, skip
      return;
    }

    setTimeout(() => {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, {
          body,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          tag: `meal-reminder-${triggerTime.getTime()}`,
        });
      }
      
      // Also show toast notification
      toast.success(title, {
        description: body,
        duration: 5000,
      });
    }, delay);
  };

  const scheduleMealReminders = (plan: DietPlan) => {
    if (!plan.meals || plan.meals.length === 0) {
      toast.info("This plan doesn't have scheduled meals yet");
      return;
    }

    const now = new Date();
    let scheduledCount = 0;

    plan.meals.forEach((meal) => {
      if (!meal.time) return;

      // Parse meal time (format: "HH:MM")
      const [hours, minutes] = meal.time.split(':').map(Number);
      
      // Schedule for today and next 7 days
      for (let day = 0; day < 7; day++) {
        const mealTime = new Date(now);
        mealTime.setDate(now.getDate() + day);
        mealTime.setHours(hours, minutes, 0, 0);

        // Schedule reminder 15 minutes before
        const reminderTime = new Date(mealTime.getTime() - 15 * 60 * 1000);

        if (reminderTime > now) {
          scheduleNotification(
            `${meal.type.charAt(0).toUpperCase() + meal.type.slice(1)} Reminder`,
            `Time for ${meal.name}! ${meal.calories} calories, ${meal.macros.protein}g protein`,
            reminderTime
          );
          scheduledCount++;
        }
      }
    });

    toast.success("Meal Reminders Scheduled", {
      description: `${scheduledCount} notifications set for the next week`,
      duration: 4000,
    });
  };

  const requestPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        toast.success("Notifications enabled!");
      } else {
        toast.error("Notifications blocked. Enable them in your browser settings.");
      }
    } else {
      toast.error("Your browser doesn't support notifications");
    }
  };

  return {
    scheduleMealReminders,
    requestPermission,
    isSupported: "Notification" in window,
    permission: "Notification" in window ? Notification.permission : "denied",
  };
};
