import { useEffect } from "react";
import { DietPlan } from "@/types/health";
import { toast } from "sonner";
import emailjs from "@emailjs/browser";
import { userEmailStorage } from "@/utils/storage";

// EmailJS Configuration
const EMAILJS_CONFIG = {
  serviceId: "service_bitzmas",
  templateId: "template_pydhguo",
  publicKey: "xSYRHTDo2gIZZeefz",
};

// Initialize EmailJS
emailjs.init(EMAILJS_CONFIG.publicKey);

export const useNotifications = () => {
  useEffect(() => {
    // Request notification permission on mount
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const sendEmailNotification = async (title: string, body: string, scheduledTime: Date) => {
    const userEmail = userEmailStorage.get();
    
    if (!userEmail) {
      console.log("📧 No email configured for notifications");
      toast.warning("Email not configured", {
        description: "Add your email in Wellness Reminders to receive email notifications",
        duration: 4000,
      });
      return;
    }

    console.log(`📧 Attempting to send email to ${userEmail}...`);
    
    try {
      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        {
          to_email: userEmail,
          user_name: "User",
          reminder_type: title,
          reminder_message: body,
          scheduled_time: scheduledTime.toLocaleString(),
        }
      );
      console.log(`✅ Email notification sent successfully:`, response);
      return response;
    } catch (error: any) {
      console.error("❌ Failed to send email notification:", error);
      toast.error("Email notification failed", {
        description: error?.text || "Please check your EmailJS configuration",
        duration: 5000,
      });
      throw error;
    }
  };

  const scheduleNotification = (title: string, body: string, triggerTime: Date) => {
    const now = new Date();
    const delay = triggerTime.getTime() - now.getTime();

    // Skip if time has passed
    if (delay <= 0) {
      console.log(`⏭️ Skipping past notification: ${title} (was ${new Date(triggerTime).toLocaleString()})`);
      return false;
    }

    // setTimeout has a max delay of ~24.8 days (2^31-1 milliseconds)
    const MAX_TIMEOUT = 2147483647;
    
    if (delay > MAX_TIMEOUT) {
      console.warn(`⚠️ Notification delay too large: ${title} (${Math.round(delay / 86400000)} days away)`);
      return false;
    }

    console.log(`📅 Scheduling notification: ${title} at ${triggerTime.toLocaleString()} (in ${Math.round(delay / 60000)} minutes)`);

    setTimeout(() => {
      console.log(`🔔 Firing notification: ${title}`);
      
      // Browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, {
          body,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          tag: `reminder-${triggerTime.getTime()}`,
          requireInteraction: false,
        });
      } else {
        console.warn(`⚠️ Notification permission not granted: ${Notification.permission}`);
      }
      
      // Email notification (don't await to avoid blocking)
      sendEmailNotification(title, body, triggerTime).catch(err => {
        console.error("Email notification error:", err);
      });
      
      // Toast notification
      toast.success(title, {
        description: body,
        duration: 5000,
      });
    }, delay);

    return true;
  };

  const scheduleMealReminders = (plan: DietPlan) => {
    if (!plan.meals || plan.meals.length === 0) {
      toast.error("No Scheduled Meals", {
        description: "Please add meals with times before setting reminders",
        duration: 4000,
      });
      return;
    }

    console.log(`🍽️ Scheduling meal reminders for plan: ${plan.name}`);
    console.log(`📊 Notification permission: ${Notification.permission}`);

    const now = new Date();
    let scheduledCount = 0;
    let skippedCount = 0;

    plan.meals.forEach((meal) => {
      if (!meal.time) {
        console.warn(`⚠️ Meal "${meal.name}" has no time set`);
        return;
      }

      // Parse meal time (format: "HH:MM")
      const [hours, minutes] = meal.time.split(':').map(Number);
      
      // Only schedule for next 2 days (to stay within setTimeout limit)
      for (let day = 0; day < 2; day++) {
        const mealTime = new Date(now);
        mealTime.setDate(now.getDate() + day);
        mealTime.setHours(hours, minutes, 0, 0);

        // Schedule reminder 15 minutes before
        const reminderTime = new Date(mealTime.getTime() - 15 * 60 * 1000);

        if (reminderTime > now) {
          const success = scheduleNotification(
            `🍽️ ${meal.type.charAt(0).toUpperCase() + meal.type.slice(1)} Reminder`,
            `Time for ${meal.name}! ${meal.calories} calories, ${meal.macros.protein}g protein`,
            reminderTime
          );
          if (success) {
            scheduledCount++;
          } else {
            skippedCount++;
          }
        }
      }
    });

    console.log(`✅ Scheduled: ${scheduledCount}, ⏭️ Skipped: ${skippedCount}`);

    if (scheduledCount > 0) {
      toast.success("Meal Reminders Scheduled", {
        description: `${scheduledCount} notifications set for the next 2 days`,
        duration: 4000,
      });
    } else {
      toast.info("No Upcoming Meals", {
        description: "All meal times have passed for today. Set reminders again tomorrow.",
        duration: 4000,
      });
    }
  };

  const requestPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      console.log(`🔔 Notification permission: ${permission}`);
      
      if (permission === "granted") {
        toast.success("Notifications enabled!");
        
        // Send a test notification
        setTimeout(() => {
          new Notification("✅ Notifications Working!", {
            body: "You'll now receive reminders for meals, water, and walks.",
            icon: "/favicon.ico",
          });
        }, 1000);
      } else if (permission === "denied") {
        toast.error("Notifications blocked. Enable them in your browser settings.", {
          description: "Check your browser's site settings to allow notifications.",
          duration: 6000,
        });
      } else {
        toast.warning("Notification permission dismissed. Click again to enable.");
      }
    } else {
      toast.error("Your browser doesn't support notifications");
    }
  };

  const sendTestNotification = async () => {
    const userEmail = userEmailStorage.get();
    
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("🧪 Test Notification", {
        body: "This is a test notification. If you see this, notifications are working!",
        icon: "/favicon.ico",
        requireInteraction: false,
      });
      
      toast.success("Test notification sent!", {
        description: "Check if you received a browser notification.",
        duration: 3000,
      });
    } else if ("Notification" in window && Notification.permission === "denied") {
      toast.error("Notifications are blocked", {
        description: "Enable notifications in your browser settings first.",
        duration: 5000,
      });
    } else if ("Notification" in window) {
      toast.warning("Please enable notifications first", {
        description: "Click the 'Enable' button to allow notifications.",
        duration: 5000,
      });
    } else {
      toast.error("Your browser doesn't support notifications");
    }

    // Test email notification
    if (userEmail) {
      console.log(`📧 Sending test email to ${userEmail}...`);
      try {
        await sendEmailNotification(
          "🧪 Test Email Notification",
          "This is a test email. If you received this, email notifications are working!",
          new Date()
        );
        toast.success("Test email sent!", {
          description: `Check your inbox at ${userEmail}`,
          duration: 4000,
        });
      } catch (error) {
        // Error already handled in sendEmailNotification
      }
    } else {
      toast.info("Email test skipped", {
        description: "Add your email in Wellness Reminders to test email notifications",
        duration: 4000,
      });
    }
  };

  const scheduleWaterReminders = (intervalHours: number = 2, startHour: number = 8, endHour: number = 20) => {
    console.log(`💧 Scheduling water reminders: Every ${intervalHours}h from ${startHour}:00 to ${endHour}:00`);
    console.log(`📊 Notification permission: ${Notification.permission}`);

    const now = new Date();
    let scheduledCount = 0;
    let skippedCount = 0;

    // Only schedule for next 2 days (to stay within setTimeout limit)
    for (let day = 0; day < 2; day++) {
      for (let hour = startHour; hour <= endHour; hour += intervalHours) {
        const reminderTime = new Date(now);
        reminderTime.setDate(now.getDate() + day);
        reminderTime.setHours(hour, 0, 0, 0);

        if (reminderTime > now) {
          const success = scheduleNotification(
            "💧 Hydration Reminder",
            "Time to drink water! Stay hydrated for better health.",
            reminderTime
          );
          if (success) {
            scheduledCount++;
          } else {
            skippedCount++;
          }
        }
      }
    }

    console.log(`✅ Scheduled: ${scheduledCount}, ⏭️ Skipped: ${skippedCount}`);

    if (scheduledCount > 0) {
      toast.success("Water Reminders Scheduled", {
        description: `${scheduledCount} hydration reminders set for the next 2 days`,
        duration: 4000,
      });
    } else {
      toast.info("No Upcoming Water Reminders", {
        description: "All reminder times have passed for today. Set reminders again tomorrow.",
        duration: 4000,
      });
    }

    return scheduledCount;
  };

  const scheduleWalkReminders = (times: string[] = ["07:00", "17:00"]) => {
    console.log(`🚶 Scheduling walk reminders for times: ${times.join(', ')}`);
    console.log(`📊 Notification permission: ${Notification.permission}`);

    const now = new Date();
    let scheduledCount = 0;
    let skippedCount = 0;

    times.forEach((timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);

      // Only schedule for next 2 days (to stay within setTimeout limit)
      for (let day = 0; day < 2; day++) {
        const reminderTime = new Date(now);
        reminderTime.setDate(now.getDate() + day);
        reminderTime.setHours(hours, minutes, 0, 0);

        if (reminderTime > now) {
          const success = scheduleNotification(
            "🚶 Walk Reminder",
            "Time for your daily walk! A little movement goes a long way.",
            reminderTime
          );
          if (success) {
            scheduledCount++;
          } else {
            skippedCount++;
          }
        }
      }
    });

    console.log(`✅ Scheduled: ${scheduledCount}, ⏭️ Skipped: ${skippedCount}`);

    if (scheduledCount > 0) {
      toast.success("Walk Reminders Scheduled", {
        description: `${scheduledCount} walk reminders set for the next 2 days`,
        duration: 4000,
      });
    } else {
      toast.info("No Upcoming Walk Reminders", {
        description: "All walk times have passed for today. Set reminders again tomorrow.",
        duration: 4000,
      });
    }

    return scheduledCount;
  };

  return {
    scheduleMealReminders,
    scheduleWaterReminders,
    scheduleWalkReminders,
    requestPermission,
    sendTestNotification,
    isSupported: "Notification" in window,
    permission: "Notification" in window ? Notification.permission : "denied",
  };
};
