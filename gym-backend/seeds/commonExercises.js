const commonExercises = {
  Biceps: [
    { name: "Barbell Curl", description: "Classic bicep builder with barbell" },
    { name: "Dumbbell Curl", description: "Alternating or simultaneous dumbbell curls" },
    { name: "Hammer Curl", description: "Neutral grip curl for brachialis" },
    { name: "Preacher Curl", description: "Isolated bicep curl on preacher bench" },
    { name: "Concentration Curl", description: "Single arm isolation curl" },
    { name: "Cable Curl", description: "Constant tension bicep curl" }
  ],
  Triceps: [
    { name: "Tricep Dips", description: "Bodyweight or weighted dips" },
    { name: "Close-Grip Bench Press", description: "Bench press with narrow grip" },
    { name: "Overhead Tricep Extension", description: "Overhead dumbbell or cable extension" },
    { name: "Tricep Pushdown", description: "Cable pushdown with rope or bar" },
    { name: "Skull Crushers", description: "Lying tricep extension with barbell" },
    { name: "Diamond Push-ups", description: "Push-ups with hands close together" }
  ],
  Back: [
    { name: "Deadlift", description: "Full body compound movement" },
    { name: "Pull-ups", description: "Bodyweight or weighted vertical pull" },
    { name: "Barbell Row", description: "Bent over barbell row" },
    { name: "Lat Pulldown", description: "Cable lat pulldown" },
    { name: "T-Bar Row", description: "T-bar or landmine row" },
    { name: "Seated Cable Row", description: "Cable rowing for mid back" },
    { name: "Face Pulls", description: "Cable face pulls for rear delts" },
    { name: "Dumbbell Row", description: "Single arm or bent over dumbbell row" }
  ],
  Wrists: [
    { name: "Wrist Curl", description: "Seated wrist curl with barbell or dumbbell" },
    { name: "Reverse Wrist Curl", description: "Forearm extensors exercise" },
    { name: "Farmer's Walk", description: "Heavy carry for grip strength" },
    { name: "Plate Pinch", description: "Pinch grip hold with weight plates" },
    { name: "Hammer Grip Curl", description: "Neutral grip for forearm development" }
  ],
  Chest: [
    { name: "Bench Press", description: "Flat barbell bench press" },
    { name: "Incline Bench Press", description: "Upper chest focused press" },
    { name: "Decline Bench Press", description: "Lower chest focused press" },
    { name: "Dumbbell Press", description: "Flat or incline dumbbell press" },
    { name: "Chest Fly", description: "Dumbbell or cable fly" },
    { name: "Push-ups", description: "Bodyweight chest exercise" },
    { name: "Dips", description: "Chest focused dips" },
    { name: "Cable Crossover", description: "Cable chest fly variation" }
  ],
  Shoulders: [
    { name: "Overhead Press", description: "Barbell or dumbbell shoulder press" },
    { name: "Lateral Raise", description: "Side delt isolation with dumbbells" },
    { name: "Front Raise", description: "Front delt raise" },
    { name: "Rear Delt Fly", description: "Bent over rear delt fly" },
    { name: "Arnold Press", description: "Rotating dumbbell press" },
    { name: "Upright Row", description: "Barbell or dumbbell upright row" },
    { name: "Face Pulls", description: "Cable rear delt exercise" },
    { name: "Shrugs", description: "Trap building shrugs" }
  ],
  Legs: [
    { name: "Squat", description: "Barbell back or front squat" },
    { name: "Leg Press", description: "Machine leg press" },
    { name: "Deadlift", description: "Romanian or conventional deadlift" },
    { name: "Lunges", description: "Walking or stationary lunges" },
    { name: "Leg Curl", description: "Hamstring curl machine" },
    { name: "Leg Extension", description: "Quadriceps extension machine" },
    { name: "Calf Raise", description: "Standing or seated calf raise" },
    { name: "Bulgarian Split Squat", description: "Single leg squat variation" },
    { name: "Hack Squat", description: "Machine hack squat" },
    { name: "Hip Thrust", description: "Glute focused hip thrust" }
  ]
};

module.exports = commonExercises;
