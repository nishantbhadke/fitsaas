export type ExerciseCategory = "gym" | "calisthenics" | "weightlifting" | "cardio" | "yoga" | "pilates" | "meditation" | "custom";

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
  { id: "yoga", label: "Yoga & Flexibility", color: "#0d9488", bgColor: "#f0fdfa" },
  { id: "pilates", label: "Pilates & Core", color: "#db2777", bgColor: "#fdf2f8" },
  { id: "meditation", label: "Meditation & Mindfulness", color: "#8b5cf6", bgColor: "#f5f3ff" },
  { id: "custom", label: "Custom", color: "#8b5cf6", bgColor: "#f5f3ff" },
];

// SVG icon paths for each category
export const categoryIcons: Record<ExerciseCategory, string> = {
  gym: "M20.27 4.74a1 1 0 0 0-1.41 0l-2.12 2.12-1.42-1.42 2.12-2.12a1 1 0 0 0-1.41-1.41L13.91 4l-.71-.71a1 1 0 0 0-1.41 0L4.15 10.93a1 1 0 0 0 0 1.41l.71.71-2.12 2.12a1 1 0 1 0 1.41 1.41l2.12-2.12 1.42 1.42-2.12 2.12a1 1 0 1 0 1.41 1.41l2.12-2.12.71.71a1 1 0 0 0 1.41 0l7.64-7.64a1 1 0 0 0 0-1.41l-.71-.71 2.12-2.12a1 1 0 0 0 0-1.41z",
  calisthenics: "M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 10c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z",
  weightlifting: "M6.5 6.5h-3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3m11-11h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-3M9 3v18M15 3v18M9 12h6",
  cardio: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
  yoga: "M12 6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm5.8 4.2a1 1 0 0 0-1.4 0l-2.4 2.4-2-2a1 1 0 0 0-1.4 0L7.6 13.6a1 1 0 1 0 1.4 1.4L11 13v6a1 1 0 0 0 2 0v-6l2 2a1 1 0 0 0 1.4-1.4L14.6 11l2.4-2.4a1 1 0 0 0 0-1.4z",
  pilates: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm0-4h-2V7h2v8z",
  meditation: "M12 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 13.5c-2.4 0-4.7-1.1-6.1-3.1-.4-.6-.2-1.4.4-1.8.6-.4 1.4-.2 1.8.4 1 .9 2.5 1.5 3.9 1.5s2.9-.6 3.9-1.5c.4-.6 1.2-.8 1.8-.4.6.4.8 1.2.4 1.8-1.4 2-3.7 3.1-6.1 3.1zM21 12c0 1.2-.5 2.3-1.4 3.1-.6.5-1.4.3-1.9-.3-.5-.6-.3-1.4.3-1.9.4-.3.6-.8.6-1.3 0-1.1-.9-2-2-2h-1V8.5c0-.8-.7-1.5-1.5-1.5h-1c-.8 0-1.5.7-1.5 1.5V9H7c-1.1 0-2 .9-2 2 0 .5.2 1 .6 1.3.6.5.8 1.3.3 1.9-.5.6-1.3.8-1.9.3C3.5 14.3 3 13.2 3 12c0-2.8 2.2-5 5-5h8c2.8 0 5 2.2 5 5z",
  custom: "M12 4v16m8-8H4",
};

export const exercises: Exercise[] = [
  // GYM
  { id: "lat-pulldown", name: "Lat Pulldown", category: "gym", description: "Targets the latissimus dorsi for a wider back. Great for building pulling strength.", muscles: "Back, Lats, Biceps, Rear Delts", icon: categoryIcons.gym },
  { id: "cable-fly", name: "Cable Fly", category: "gym", description: "Isolates the chest muscles with constant tension throughout the movement.", muscles: "Chest, Front Delts, Shoulders", icon: categoryIcons.gym },
  { id: "leg-press", name: "Leg Press", category: "gym", description: "Compound lower body exercise targeting quads, glutes and hamstrings.", muscles: "Legs, Quads, Glutes, Hamstrings", icon: categoryIcons.gym },
  { id: "seated-row", name: "Seated Row", category: "gym", description: "Builds mid-back thickness and improves posture.", muscles: "Back, Mid Back, Biceps, Lats", icon: categoryIcons.gym },
  { id: "leg-curl", name: "Leg Curl", category: "gym", description: "Isolates the hamstrings for balanced leg development.", muscles: "Legs, Hamstrings, Calves", icon: categoryIcons.gym },
  
  // CALISTHENICS
  { id: "push-ups", name: "Push-ups", category: "calisthenics", description: "Foundational bodyweight exercise for upper body pushing strength.", muscles: "Chest, Arms, Triceps, Shoulders, Front Delts", icon: categoryIcons.calisthenics },
  { id: "pull-ups", name: "Pull-ups", category: "calisthenics", description: "King of bodyweight back exercises. Builds impressive upper body strength.", muscles: "Back, Lats, Biceps, Core, Arms", icon: categoryIcons.calisthenics },
  { id: "dips", name: "Dips", category: "calisthenics", description: "Targets chest and triceps with bodyweight. Scalable difficulty.", muscles: "Chest, Arms, Triceps, Shoulders", icon: categoryIcons.calisthenics },
  { id: "plank", name: "Plank", category: "calisthenics", description: "Isometric core exercise that builds stability and endurance.", muscles: "Core, Abs, Shoulders, Back", icon: categoryIcons.calisthenics },
  { id: "muscle-up", name: "Muscle-up", category: "calisthenics", description: "Advanced movement combining a pull-up with a dip transition.", muscles: "Full Body, Back, Chest, Shoulders, Arms, Core", icon: categoryIcons.calisthenics },

  // WEIGHT LIFTING
  { id: "bench-press", name: "Bench Press", category: "weightlifting", description: "The gold standard for chest development. Builds raw pushing power.", muscles: "Chest, Arms, Triceps, Front Delts, Shoulders", icon: categoryIcons.weightlifting },
  { id: "deadlift", name: "Deadlift", category: "weightlifting", description: "Full-body compound lift. Builds total-body strength like no other.", muscles: "Back, Glutes, Hamstrings, Core, Legs", icon: categoryIcons.weightlifting },
  { id: "squat", name: "Barbell Squat", category: "weightlifting", description: "King of all exercises. Builds legs, core and overall strength.", muscles: "Legs, Quads, Glutes, Hamstrings, Core", icon: categoryIcons.weightlifting },
  { id: "overhead-press", name: "Overhead Press", category: "weightlifting", description: "Builds powerful shoulders and upper body pressing strength.", muscles: "Shoulders, Arms, Triceps, Front Delts", icon: categoryIcons.weightlifting },
  { id: "barbell-row", name: "Barbell Row", category: "weightlifting", description: "Heavy compound back exercise for thickness and strength.", muscles: "Back, Biceps, Rear Delts, Shoulders", icon: categoryIcons.weightlifting },

  // CARDIO
  { id: "running", name: "Running", category: "cardio", description: "Classic cardiovascular exercise. Improves heart health and endurance.", muscles: "Legs, Heart, Calves, Quads", icon: categoryIcons.cardio },
  { id: "cycling", name: "Cycling", category: "cardio", description: "Low-impact cardio that builds leg endurance and burns calories.", muscles: "Legs, Quads, Hamstrings, Calves, Heart", icon: categoryIcons.cardio },
  { id: "jump-rope", name: "Jump Rope", category: "cardio", description: "High-intensity cardio that improves coordination and agility.", muscles: "Legs, Calves, Shoulders, Core, Heart", icon: categoryIcons.cardio },
  { id: "rowing", name: "Rowing", category: "cardio", description: "Full-body cardio that combines pushing and pulling movements.", muscles: "Full Body, Back, Lats, Arms, Legs, Heart", icon: categoryIcons.cardio },
  { id: "hiit", name: "HIIT Session", category: "cardio", description: "High-Intensity Interval Training. Maximum calorie burn in minimum time.", muscles: "Full Body, Heart, Core, Legs", icon: categoryIcons.cardio },
  { id: "power-walk", name: "Outdoor Power Walk", category: "cardio", description: "A steady-state low-impact cardiorespiratory walk that promotes circulation, active recovery, and fat oxidation.", muscles: "Legs, Hamstrings, Calves, Glutes, Heart", icon: categoryIcons.cardio },
  { id: "treadmill-steady", name: "Treadmill Steady Cardio", category: "cardio", description: "Aerobic cardiovascular training running or walking at a constant speed to improve lung capacity and metabolic health.", muscles: "Legs, Quads, Calves, Heart, Core", icon: categoryIcons.cardio },
  { id: "elliptical", name: "Elliptical Trainer", category: "cardio", description: "Low-impact full body aerobic conditioning that targets the legs and upper body simultaneously.", muscles: "Legs, Arms, Quads, Hamstrings, Glutes, Lats, Heart", icon: categoryIcons.cardio },

  // YOGA
  { id: "vinyasa-yoga", name: "Vinyasa Flow (Yoga)", category: "yoga", description: "Dynamic movements synchronized with breath. Links yoga postures fluidly to build heat, balance, and agility.", muscles: "Core, Abs, Back, Shoulders, Spine, Full Body", icon: categoryIcons.yoga },
  { id: "hatha-yoga", name: "Hatha Alignment (Yoga)", category: "yoga", description: "A foundational yoga practice focusing on posture alignment, static stretches, breathing techniques, and mindfulness.", muscles: "Legs, Hamstrings, Back, Shoulders, Hips, Spine, Full Body", icon: categoryIcons.yoga },
  { id: "yin-yoga", name: "Yin Restoration (Yoga)", category: "yoga", description: "Slow-paced passive yoga holding deep postures for longer intervals (3-5 mins) to target deep connective tissues and fascia.", muscles: "Back, Lower Back, Glutes, Legs, Hamstrings, Connective Tissues, Spine", icon: categoryIcons.yoga },
  { id: "power-yoga", name: "Power Vinyasa (Yoga)", category: "yoga", description: "A vigorous, fitness-based athletic yoga flow that builds physical stamina, lean muscular endurance, and upper body power.", muscles: "Core, Abs, Shoulders, Chest, Arms, Legs, Quads", icon: categoryIcons.yoga },

  // PILATES
  { id: "home-pilates", name: "Mat Home Pilates", category: "pilates", description: "Core-focused bodyweight conditioning on a mat, focusing on pelvic alignment, deep abdominal strength, and postural control.", muscles: "Core, Abs, Obliques, Back, Lower Back, Glutes", icon: categoryIcons.pilates },
  { id: "pro-pilates", name: "Reformer Pro Pilates", category: "pilates", description: "Professional athletic Pilates utilizing spring-based reformer machines to create constant eccentric resistance and lengthen muscles.", muscles: "Core, Abs, Legs, Glutes, Back, Spine, Adductors, Full Body", icon: categoryIcons.pilates },

  // MEDITATION & MINDFULNESS
  { id: "mindful-breathing", name: "Mindful Breathing (Anapanasati)", category: "meditation", description: "Focus on breath flow to calm the nervous system, release stress, lower cortisol, and bring back daily presence.", muscles: "Mind, Brain, Lungs, Heart, Nervous System", icon: categoryIcons.meditation },
  { id: "deep-zen", name: "Deep Zen Meditation (Zazen)", category: "meditation", description: "Traditional quiet sitting to improve executive focus, metabolic stability, blood pressure regulation, and deep mental focus.", muscles: "Mind, Brain, Heart, Posture, Spine", icon: categoryIcons.meditation },
  { id: "body-scan", name: "Body Scan Sleep Meditation", category: "meditation", description: "Systematic relaxation shifting through physical centers to optimize physiological recovery, sleep quality, and active rest.", muscles: "Full Body, Brain, Nervous System, Heart", icon: categoryIcons.meditation },
];
