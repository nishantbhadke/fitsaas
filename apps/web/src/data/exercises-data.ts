export type ExerciseCategory = "gym" | "calisthenics" | "weightlifting" | "cardio" | "custom";

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  description: string;
  muscles: string;
  icon: string; // SVG path data
}

export const categories: { id: ExerciseCategory; label: string; color: string; bgColor: string }[] = [
  { id: "gym", label: "Gym", color: "#6366f1", bgColor: "#eef2ff" },
  { id: "calisthenics", label: "Calisthenics", color: "#f59e0b", bgColor: "#fffbeb" },
  { id: "weightlifting", label: "Weight Lifting", color: "#ef4444", bgColor: "#fef2f2" },
  { id: "cardio", label: "Cardio", color: "#10b981", bgColor: "#ecfdf5" },
  { id: "custom", label: "Custom", color: "#8b5cf6", bgColor: "#f5f3ff" },
];

// SVG icon paths for each category
export const categoryIcons: Record<ExerciseCategory, string> = {
  gym: "M20.27 4.74a1 1 0 0 0-1.41 0l-2.12 2.12-1.42-1.42 2.12-2.12a1 1 0 0 0-1.41-1.41L13.91 4l-.71-.71a1 1 0 0 0-1.41 0L4.15 10.93a1 1 0 0 0 0 1.41l.71.71-2.12 2.12a1 1 0 1 0 1.41 1.41l2.12-2.12 1.42 1.42-2.12 2.12a1 1 0 1 0 1.41 1.41l2.12-2.12.71.71a1 1 0 0 0 1.41 0l7.64-7.64a1 1 0 0 0 0-1.41l-.71-.71 2.12-2.12a1 1 0 0 0 0-1.41z",
  calisthenics: "M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 10c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z",
  weightlifting: "M6.5 6.5h-3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3m11-11h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-3M9 3v18M15 3v18M9 12h6",
  cardio: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
  custom: "M12 4v16m8-8H4",
};

export const exercises: Exercise[] = [
  // GYM
  { id: "lat-pulldown", name: "Lat Pulldown", category: "gym", description: "Targets the latissimus dorsi for a wider back. Great for building pulling strength.", muscles: "Lats, Biceps, Rear Delts", icon: categoryIcons.gym },
  { id: "cable-fly", name: "Cable Fly", category: "gym", description: "Isolates the chest muscles with constant tension throughout the movement.", muscles: "Chest, Front Delts", icon: categoryIcons.gym },
  { id: "leg-press", name: "Leg Press", category: "gym", description: "Compound lower body exercise targeting quads, glutes and hamstrings.", muscles: "Quads, Glutes, Hamstrings", icon: categoryIcons.gym },
  { id: "seated-row", name: "Seated Row", category: "gym", description: "Builds mid-back thickness and improves posture.", muscles: "Mid Back, Biceps, Lats", icon: categoryIcons.gym },
  { id: "leg-curl", name: "Leg Curl", category: "gym", description: "Isolates the hamstrings for balanced leg development.", muscles: "Hamstrings", icon: categoryIcons.gym },
  
  // CALISTHENICS
  { id: "push-ups", name: "Push-ups", category: "calisthenics", description: "Foundational bodyweight exercise for upper body pushing strength.", muscles: "Chest, Triceps, Shoulders", icon: categoryIcons.calisthenics },
  { id: "pull-ups", name: "Pull-ups", category: "calisthenics", description: "King of bodyweight back exercises. Builds impressive upper body strength.", muscles: "Lats, Biceps, Core", icon: categoryIcons.calisthenics },
  { id: "dips", name: "Dips", category: "calisthenics", description: "Targets chest and triceps with bodyweight. Scalable difficulty.", muscles: "Chest, Triceps, Shoulders", icon: categoryIcons.calisthenics },
  { id: "plank", name: "Plank", category: "calisthenics", description: "Isometric core exercise that builds stability and endurance.", muscles: "Core, Shoulders, Back", icon: categoryIcons.calisthenics },
  { id: "muscle-up", name: "Muscle-up", category: "calisthenics", description: "Advanced movement combining a pull-up with a dip transition.", muscles: "Full Upper Body", icon: categoryIcons.calisthenics },

  // WEIGHT LIFTING
  { id: "bench-press", name: "Bench Press", category: "weightlifting", description: "The gold standard for chest development. Builds raw pushing power.", muscles: "Chest, Triceps, Front Delts", icon: categoryIcons.weightlifting },
  { id: "deadlift", name: "Deadlift", category: "weightlifting", description: "Full-body compound lift. Builds total-body strength like no other.", muscles: "Back, Glutes, Hamstrings, Core", icon: categoryIcons.weightlifting },
  { id: "squat", name: "Barbell Squat", category: "weightlifting", description: "King of all exercises. Builds legs, core and overall strength.", muscles: "Quads, Glutes, Core", icon: categoryIcons.weightlifting },
  { id: "overhead-press", name: "Overhead Press", category: "weightlifting", description: "Builds powerful shoulders and upper body pressing strength.", muscles: "Shoulders, Triceps, Upper Chest", icon: categoryIcons.weightlifting },
  { id: "barbell-row", name: "Barbell Row", category: "weightlifting", description: "Heavy compound back exercise for thickness and strength.", muscles: "Back, Biceps, Rear Delts", icon: categoryIcons.weightlifting },

  // CARDIO
  { id: "running", name: "Running", category: "cardio", description: "Classic cardiovascular exercise. Improves heart health and endurance.", muscles: "Heart, Legs, Core", icon: categoryIcons.cardio },
  { id: "cycling", name: "Cycling", category: "cardio", description: "Low-impact cardio that builds leg endurance and burns calories.", muscles: "Quads, Calves, Heart", icon: categoryIcons.cardio },
  { id: "jump-rope", name: "Jump Rope", category: "cardio", description: "High-intensity cardio that improves coordination and agility.", muscles: "Calves, Shoulders, Core", icon: categoryIcons.cardio },
  { id: "rowing", name: "Rowing", category: "cardio", description: "Full-body cardio that combines pushing and pulling movements.", muscles: "Full Body, Heart", icon: categoryIcons.cardio },
  { id: "hiit", name: "HIIT Session", category: "cardio", description: "High-Intensity Interval Training. Maximum calorie burn in minimum time.", muscles: "Full Body, Heart", icon: categoryIcons.cardio },
];
