import { Activity, Heart, Target, TrendingUp, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-wellness.jpg";

interface DashboardProps {
  onNavigate: (section: string) => void;
}

const Dashboard = ({ onNavigate }: DashboardProps) => {
  const stats = [
    {
      title: "Daily Calories",
      value: "1,850",
      target: "/ 2,200",
      icon: Target,
      color: "text-primary",
    },
    {
      title: "Water Intake",
      value: "6.5",
      target: "/ 8 cups",
      icon: Activity,
      color: "text-accent-foreground",
    },
    {
      title: "Active Minutes",
      value: "45",
      target: "/ 60 min",
      icon: TrendingUp,
      color: "text-success",
    },
    {
      title: "Health Score",
      value: "85",
      target: "/ 100",
      icon: Heart,
      color: "text-warning-foreground",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-wellness shadow-wellness">
        <img 
          src={heroImage} 
          alt="Wellness lifestyle" 
          className="w-full h-64 object-cover opacity-20"
        />
        <div className="absolute inset-0 flex items-center justify-center text-center p-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome to Your Health Journey
            </h1>
            <p className="text-white/90 text-lg mb-6">
              Track your wellness, get personalized diet plans, and chat with our AI health assistant.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => onNavigate('chat')}
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                Start Health Chat
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => onNavigate('profile')}
                className="bg-transparent text-white border-white/50 hover:bg-white/10"
              >
                Complete Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-card hover:shadow-wellness transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.target}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-card hover:shadow-wellness transition-smooth cursor-pointer"
              onClick={() => onNavigate('chat')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Health Assistant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Get personalized health advice and answers to your nutrition questions.
            </p>
            <Button variant="outline" className="w-full">
              Start Chatting
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-wellness transition-smooth cursor-pointer"
              onClick={() => onNavigate('profile')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Health Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Complete your health profile for personalized recommendations.
            </p>
            <Button variant="outline" className="w-full">
              Update Profile
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-wellness transition-smooth cursor-pointer"
              onClick={() => onNavigate('plans')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Diet Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Browse and customize your personalized diet and meal plans.
            </p>
            <Button variant="outline" className="w-full">
              View Plans
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-wellness transition-smooth cursor-pointer"
              onClick={() => onNavigate('reminders')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Wellness Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Set up reminders for water intake, walks, and healthy habits.
            </p>
            <Button variant="outline" className="w-full">
              Manage Reminders
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Medical Disclaimer */}
      <Card className="bg-warning/10 border-warning/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Heart className="h-5 w-5 text-warning-foreground mt-0.5" />
            <div>
              <h3 className="font-semibold text-warning-foreground mb-2">
                Medical Disclaimer
              </h3>
              <p className="text-sm text-warning-foreground/80">
                This application provides general health and nutrition information for educational purposes only. 
                It is not intended to replace professional medical advice, diagnosis, or treatment. 
                Always consult with qualified healthcare providers for personalized medical guidance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;