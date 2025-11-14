import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Bell, Droplets, Footprints, Plus, Trash2, Mail } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { userEmailStorage } from "@/utils/storage";

const WellnessReminders = () => {
  const { scheduleWaterReminders, scheduleWalkReminders, requestPermission, sendTestNotification, permission } = useNotifications();
  const { toast } = useToast();
  
  const [waterInterval, setWaterInterval] = useState(2);
  const [waterStartHour, setWaterStartHour] = useState(8);
  const [waterEndHour, setWaterEndHour] = useState(20);
  
  const [walkTimes, setWalkTimes] = useState<string[]>(["07:00", "17:00"]);
  const [newWalkTime, setNewWalkTime] = useState("12:00");
  
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const savedEmail = userEmailStorage.get();
    if (savedEmail) {
      setUserEmail(savedEmail);
    }
  }, []);

  const handleSetWaterReminders = () => {
    if (permission !== "granted") {
      requestPermission();
      return;
    }

    if (waterStartHour >= waterEndHour) {
      toast({
        title: "Invalid Time Range",
        description: "Start hour must be before end hour",
        variant: "destructive"
      });
      return;
    }

    scheduleWaterReminders(waterInterval, waterStartHour, waterEndHour);
  };

  const handleSetWalkReminders = () => {
    if (permission !== "granted") {
      requestPermission();
      return;
    }

    if (walkTimes.length === 0) {
      toast({
        title: "No Walk Times",
        description: "Please add at least one walk time",
        variant: "destructive"
      });
      return;
    }

    scheduleWalkReminders(walkTimes);
  };

  const handleAddWalkTime = () => {
    if (walkTimes.includes(newWalkTime)) {
      toast({
        title: "Duplicate Time",
        description: "This walk time already exists",
        variant: "destructive"
      });
      return;
    }

    setWalkTimes([...walkTimes, newWalkTime]);
    toast({
      title: "Walk Time Added",
      description: `Walk reminder added for ${newWalkTime}`,
    });
  };

  const handleRemoveWalkTime = (time: string) => {
    setWalkTimes(walkTimes.filter(t => t !== time));
    toast({
      title: "Walk Time Removed",
      description: `Walk reminder for ${time} has been removed`,
    });
  };

  const handleSaveEmail = () => {
    if (!userEmail || !userEmail.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    userEmailStorage.set(userEmail);
    toast({
      title: "Email Saved",
      description: "You'll now receive email notifications for reminders",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Wellness Reminders</h1>
        <p className="text-muted-foreground">Set up reminders for hydration and daily walks</p>
      </div>

      {/* Email Notification Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Enter your email to receive reminder notifications via email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="your.email@example.com"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSaveEmail}>
              Save Email
            </Button>
          </div>
          {userEmail && userEmailStorage.get() === userEmail && (
            <p className="text-sm text-muted-foreground">
              ✅ Email notifications enabled for: <strong>{userEmail}</strong>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Notification Permission Status */}
      {permission !== "granted" && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-amber-600" />
              <div className="flex-1">
                <p className="font-medium text-amber-900 dark:text-amber-100">
                  Browser Notifications Not Enabled
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Enable browser notifications to receive in-app reminders
                </p>
              </div>
              <Button onClick={requestPermission} size="sm" variant="outline">
                Enable
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification Test (when enabled) */}
      {permission === "granted" && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-green-900 dark:text-green-100">
                  ✅ Notifications Enabled
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  You're all set to receive reminders
                </p>
              </div>
              <Button onClick={sendTestNotification} size="sm" variant="outline">
                Test Notification
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Water Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-blue-500" />
            Water Reminders
          </CardTitle>
          <CardDescription>
            Stay hydrated throughout the day with regular reminders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="water-interval">Interval (hours)</Label>
                <Input
                  id="water-interval"
                  type="number"
                  min="1"
                  max="6"
                  value={waterInterval}
                  onChange={(e) => setWaterInterval(parseInt(e.target.value) || 2)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="water-start">Start Hour</Label>
                <Input
                  id="water-start"
                  type="number"
                  min="0"
                  max="23"
                  value={waterStartHour}
                  onChange={(e) => setWaterStartHour(parseInt(e.target.value) || 8)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="water-end">End Hour</Label>
                <Input
                  id="water-end"
                  type="number"
                  min="0"
                  max="23"
                  value={waterEndHour}
                  onChange={(e) => setWaterEndHour(parseInt(e.target.value) || 20)}
                />
              </div>
            </div>

            <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
              <p>
                💡 You'll receive a reminder every <strong>{waterInterval} hour(s)</strong> from{" "}
                <strong>{waterStartHour}:00</strong> to <strong>{waterEndHour}:00</strong>
              </p>
            </div>
          </div>

          <Button onClick={handleSetWaterReminders} className="w-full">
            <Bell className="h-4 w-4 mr-2" />
            Set Water Reminders
          </Button>
        </CardContent>
      </Card>

      {/* Walk Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Footprints className="h-5 w-5 text-green-500" />
            Walk Reminders
          </CardTitle>
          <CardDescription>
            Schedule daily walk reminders to stay active
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Scheduled Walk Times</Label>
              <Badge variant="secondary">{walkTimes.length} time(s)</Badge>
            </div>

            <div className="space-y-2">
              {walkTimes.map((time) => (
                <div key={time} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Footprints className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{time}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveWalkTime(time)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="new-walk-time">Add New Walk Time</Label>
              <div className="flex gap-2">
                <Input
                  id="new-walk-time"
                  type="time"
                  value={newWalkTime}
                  onChange={(e) => setNewWalkTime(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddWalkTime} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
              <p>💡 Walk reminders will be scheduled for the next 2 days. Reset reminders daily for continued notifications.</p>
            </div>
          </div>

          <Button onClick={handleSetWalkReminders} className="w-full">
            <Bell className="h-4 w-4 mr-2" />
            Set Walk Reminders
          </Button>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <Droplets className="h-8 w-8 mx-auto text-blue-500 mb-2" />
            <div className="text-2xl font-bold">
              {Math.ceil((waterEndHour - waterStartHour) / waterInterval)}
            </div>
            <div className="text-sm text-muted-foreground">Water Reminders/Day</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <Footprints className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <div className="text-2xl font-bold">{walkTimes.length}</div>
            <div className="text-sm text-muted-foreground">Walk Reminders/Day</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WellnessReminders;
