import { useState, useEffect } from "react";
import { User, Heart, Activity, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { userProfileStorage, formDataStorage } from "@/utils/storage";
import { UserProfile } from "@/types/health";
import HealthProfileForm from "./HealthProfileForm";

const HealthProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const existingProfile = userProfileStorage.get();
    if (existingProfile) {
      setProfile(existingProfile);
    } else {
      // Check if there's incomplete form data
      const formData = formDataStorage.get();
      if (formData && !formData.completed) {
        setShowForm(true);
      }
    }
  }, []);

  const handleProfileComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    setShowForm(false);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowForm(true);
  };

  const calculateBMI = (weight: number, height: number) => {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "Underweight", color: "text-warning" };
    if (bmi < 25) return { label: "Normal", color: "text-success" };
    if (bmi < 30) return { label: "Overweight", color: "text-warning" };
    return { label: "Obese", color: "text-destructive" };
  };

  if (showForm || !profile) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isEditing ? 'Edit Health Profile' : 'Complete Your Health Profile'}
          </h1>
          <p className="text-muted-foreground">
            Help us personalize your health recommendations by completing your profile.
          </p>
        </div>
        <HealthProfileForm 
          existingProfile={profile}
          onComplete={handleProfileComplete}
          onCancel={() => {
            setShowForm(false);
            setIsEditing(false);
          }}
        />
      </div>
    );
  }

  const bmi = parseFloat(calculateBMI(profile.weight, profile.height));
  const bmiCategory = getBMICategory(bmi);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Health Profile</h1>
          <p className="text-muted-foreground">Your personalized health information</p>
        </div>
        <Button onClick={handleEdit} variant="outline">
          Edit Profile
        </Button>
      </div>

      {/* Basic Information */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-lg font-semibold">{profile.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Age</label>
              <p className="text-lg font-semibold">{profile.age} years</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Gender</label>
              <p className="text-lg font-semibold capitalize">{profile.gender}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Physical Stats */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Physical Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Height</label>
              <p className="text-lg font-semibold">{profile.height} cm</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Weight</label>
              <p className="text-lg font-semibold">{profile.weight} kg</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">BMI</label>
              <p className="text-lg font-semibold">{bmi}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Category</label>
              <p className={`text-lg font-semibold ${bmiCategory.color}`}>
                {bmiCategory.label}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity & Goals */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Activity & Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Activity Level</label>
              <p className="text-lg font-semibold capitalize">{profile.activityLevel.replace('_', ' ')}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Health Goals</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.goals.map((goal, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {goal}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dietary Information */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Dietary Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Dietary Preferences</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.dietaryPreferences.length > 0 ? (
                  profile.dietaryPreferences.map((pref, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {pref}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground">No specific preferences</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Food Allergies</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.allergies.length > 0 ? (
                  profile.allergies.map((allergy, index) => (
                    <Badge key={index} variant="destructive" className="text-sm">
                      {allergy}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground">No known allergies</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical History */}
      {profile.medicalHistory.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Medical History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.medicalHistory.map((condition, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {condition}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Stats */}
      <Card className="shadow-card bg-gradient-calm">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Profile Completed</p>
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {new Date(profile.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthProfile;