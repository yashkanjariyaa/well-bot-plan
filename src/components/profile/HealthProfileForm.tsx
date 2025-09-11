import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { userProfileStorage, formDataStorage } from "@/utils/storage";
import { UserProfile, FormData } from "@/types/health";

interface HealthProfileFormProps {
  existingProfile?: UserProfile | null;
  onComplete: (profile: UserProfile) => void;
  onCancel: () => void;
}

const HealthProfileForm = ({ existingProfile, onComplete, onCancel }: HealthProfileFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    step: 1,
    completed: false,
    data: {}
  });

  const totalSteps = 3;

  useEffect(() => {
    // Load existing form data or profile data
    if (existingProfile) {
      setFormData({
        step: 1,
        completed: false,
        data: {
          personal: {
            name: existingProfile.name,
            age: existingProfile.age,
            gender: existingProfile.gender,
            height: existingProfile.height,
            weight: existingProfile.weight,
          },
          health: {
            activityLevel: existingProfile.activityLevel,
            goals: existingProfile.goals,
            medicalHistory: existingProfile.medicalHistory,
            medications: [], // Not in original profile
          },
          nutrition: {
            allergies: existingProfile.allergies,
            dietaryPreferences: existingProfile.dietaryPreferences,
            calorieGoal: 2000, // Default
            mealsPerDay: 3, // Default
          }
        }
      });
    } else {
      const savedFormData = formDataStorage.get();
      if (savedFormData) {
        setFormData(savedFormData);
        setCurrentStep(savedFormData.step);
      }
    }
  }, [existingProfile]);

  const updateFormData = (stepData: any) => {
    const updatedFormData = {
      ...formData,
      step: currentStep,
      data: {
        ...formData.data,
        ...stepData,
      }
    };
    setFormData(updatedFormData);
    formDataStorage.set(updatedFormData);
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (!formData.data.personal || !formData.data.health || !formData.data.nutrition) {
      return;
    }

    const profile: UserProfile = {
      id: existingProfile?.id || Date.now().toString(),
      name: formData.data.personal.name,
      age: formData.data.personal.age,
      gender: formData.data.personal.gender as 'male' | 'female' | 'other',
      height: formData.data.personal.height,
      weight: formData.data.personal.weight,
      activityLevel: formData.data.health.activityLevel as UserProfile['activityLevel'],
      goals: formData.data.health.goals,
      medicalHistory: formData.data.health.medicalHistory,
      allergies: formData.data.nutrition.allergies,
      dietaryPreferences: formData.data.nutrition.dietaryPreferences,
      createdAt: existingProfile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    userProfileStorage.set(profile);
    formDataStorage.clear();
    onComplete(profile);
  };

  const personalOptions = {
    genders: ['male', 'female', 'other'],
  };

  const healthOptions = {
    activityLevels: [
      { value: 'sedentary', label: 'Sedentary (Little to no exercise)' },
      { value: 'light', label: 'Light (Light exercise 1-3 days/week)' },
      { value: 'moderate', label: 'Moderate (Moderate exercise 3-5 days/week)' },
      { value: 'very_active', label: 'Very Active (Hard exercise 6-7 days/week)' },
      { value: 'extremely_active', label: 'Extremely Active (Very hard exercise, physical job)' },
    ],
    goals: [
      'Lose weight', 'Gain weight', 'Maintain weight', 'Build muscle',
      'Improve cardiovascular health', 'Lower cholesterol', 'Manage diabetes',
      'Increase energy', 'Better sleep', 'Reduce stress'
    ],
    medicalConditions: [
      'Diabetes', 'Hypertension', 'Heart disease', 'High cholesterol',
      'Thyroid disorders', 'PCOS', 'Food intolerances', 'Digestive issues',
      'Arthritis', 'Osteoporosis'
    ]
  };

  const nutritionOptions = {
    allergies: [
      'Nuts', 'Peanuts', 'Dairy', 'Eggs', 'Soy', 'Gluten/Wheat',
      'Shellfish', 'Fish', 'Sesame', 'Sulfites'
    ],
    dietaryPreferences: [
      'Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Keto', 'Paleo',
      'Mediterranean', 'Low-carb', 'Low-fat', 'Intermittent fasting'
    ]
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.data.personal?.name || ''}
                  onChange={(e) => updateFormData({
                    personal: { ...formData.data.personal, name: e.target.value }
                  })}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.data.personal?.age || ''}
                    onChange={(e) => updateFormData({
                      personal: { ...formData.data.personal, age: parseInt(e.target.value) || 0 }
                    })}
                    placeholder="Your age"
                  />
                </div>

                <div>
                  <Label>Gender</Label>
                  <RadioGroup
                    value={formData.data.personal?.gender || ''}
                    onValueChange={(value) => updateFormData({
                      personal: { ...formData.data.personal, gender: value }
                    })}
                  >
                    {personalOptions.genders.map((gender) => (
                      <div key={gender} className="flex items-center space-x-2">
                        <RadioGroupItem value={gender} id={gender} />
                        <Label htmlFor={gender} className="capitalize">{gender}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.data.personal?.height || ''}
                    onChange={(e) => updateFormData({
                      personal: { ...formData.data.personal, height: parseInt(e.target.value) || 0 }
                    })}
                    placeholder="Height in centimeters"
                  />
                </div>

                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.data.personal?.weight || ''}
                    onChange={(e) => updateFormData({
                      personal: { ...formData.data.personal, weight: parseInt(e.target.value) || 0 }
                    })}
                    placeholder="Weight in kilograms"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Health & Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Activity Level</Label>
                <RadioGroup
                  value={formData.data.health?.activityLevel || ''}
                  onValueChange={(value) => updateFormData({
                    health: { ...formData.data.health, activityLevel: value }
                  })}
                >
                  {healthOptions.activityLevels.map((level) => (
                    <div key={level.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={level.value} id={level.value} />
                      <Label htmlFor={level.value}>{level.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label>Health Goals (Select all that apply)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {healthOptions.goals.map((goal) => (
                    <div key={goal} className="flex items-center space-x-2">
                      <Checkbox
                        id={goal}
                        checked={formData.data.health?.goals?.includes(goal) || false}
                        onCheckedChange={(checked) => {
                          const currentGoals = formData.data.health?.goals || [];
                          const updatedGoals = checked
                            ? [...currentGoals, goal]
                            : currentGoals.filter(g => g !== goal);
                          updateFormData({
                            health: { ...formData.data.health, goals: updatedGoals }
                          });
                        }}
                      />
                      <Label htmlFor={goal} className="text-sm">{goal}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Medical History (Select any that apply)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {healthOptions.medicalConditions.map((condition) => (
                    <div key={condition} className="flex items-center space-x-2">
                      <Checkbox
                        id={condition}
                        checked={formData.data.health?.medicalHistory?.includes(condition) || false}
                        onCheckedChange={(checked) => {
                          const currentHistory = formData.data.health?.medicalHistory || [];
                          const updatedHistory = checked
                            ? [...currentHistory, condition]
                            : currentHistory.filter(h => h !== condition);
                          updateFormData({
                            health: { ...formData.data.health, medicalHistory: updatedHistory }
                          });
                        }}
                      />
                      <Label htmlFor={condition} className="text-sm">{condition}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Nutrition & Dietary Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Food Allergies (Select any that apply)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {nutritionOptions.allergies.map((allergy) => (
                    <div key={allergy} className="flex items-center space-x-2">
                      <Checkbox
                        id={allergy}
                        checked={formData.data.nutrition?.allergies?.includes(allergy) || false}
                        onCheckedChange={(checked) => {
                          const currentAllergies = formData.data.nutrition?.allergies || [];
                          const updatedAllergies = checked
                            ? [...currentAllergies, allergy]
                            : currentAllergies.filter(a => a !== allergy);
                          updateFormData({
                            nutrition: { ...formData.data.nutrition, allergies: updatedAllergies }
                          });
                        }}
                      />
                      <Label htmlFor={allergy} className="text-sm">{allergy}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Dietary Preferences (Select all that apply)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {nutritionOptions.dietaryPreferences.map((preference) => (
                    <div key={preference} className="flex items-center space-x-2">
                      <Checkbox
                        id={preference}
                        checked={formData.data.nutrition?.dietaryPreferences?.includes(preference) || false}
                        onCheckedChange={(checked) => {
                          const currentPreferences = formData.data.nutrition?.dietaryPreferences || [];
                          const updatedPreferences = checked
                            ? [...currentPreferences, preference]
                            : currentPreferences.filter(p => p !== preference);
                          updateFormData({
                            nutrition: { ...formData.data.nutrition, dietaryPreferences: updatedPreferences }
                          });
                        }}
                      />
                      <Label htmlFor={preference} className="text-sm">{preference}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="calorieGoal">Daily Calorie Goal</Label>
                  <Input
                    id="calorieGoal"
                    type="number"
                    value={formData.data.nutrition?.calorieGoal || 2000}
                    onChange={(e) => updateFormData({
                      nutrition: { ...formData.data.nutrition, calorieGoal: parseInt(e.target.value) || 2000 }
                    })}
                    placeholder="2000"
                  />
                </div>

                <div>
                  <Label htmlFor="mealsPerDay">Meals Per Day</Label>
                  <Input
                    id="mealsPerDay"
                    type="number"
                    min="1"
                    max="6"
                    value={formData.data.nutrition?.mealsPerDay || 3}
                    onChange={(e) => updateFormData({
                      nutrition: { ...formData.data.nutrition, mealsPerDay: parseInt(e.target.value) || 3 }
                    })}
                    placeholder="3"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.data.personal?.name && 
               formData.data.personal?.age && 
               formData.data.personal?.gender &&
               formData.data.personal?.height &&
               formData.data.personal?.weight;
      case 2:
        return formData.data.health?.activityLevel;
      case 3:
        return true; // Optional step
      default:
        return false;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
          <span className="text-sm text-muted-foreground">
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Content */}
      {renderStep()}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onCancel : handlePrevious}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          {currentStep === 1 ? 'Cancel' : 'Previous'}
        </Button>

        <Button
          onClick={currentStep === totalSteps ? handleComplete : handleNext}
          disabled={!isStepValid()}
          className="flex items-center gap-2"
        >
          {currentStep === totalSteps ? (
            <>
              <Check className="h-4 w-4" />
              Complete Profile
            </>
          ) : (
            <>
              Next
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default HealthProfileForm;