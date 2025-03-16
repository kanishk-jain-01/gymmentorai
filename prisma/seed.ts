import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  // Get your user ID - either hardcode your test user ID or get the first user
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('No user found. Please create a user first by logging in to the application.');
    return;
  }
  
  const userId = user.id;
  console.log(`Generating workout data for user: ${user.name || user.email} (${userId})`);
  
  // Create workout data spanning multiple months
  const exercises = [
    'Bench Press', 'Squats', 'Deadlifts', 'Pullups', 'Pushups', 
    'Lunges', 'Shoulder Press', 'Bicep Curls', 'Tricep Extensions',
    'Leg Press', 'Lat Pulldown', 'Rows', 'Plank', 'Running', 'Cycling'
  ];
  
  // Generate workouts for the past 2 years
  const now = new Date();
  const twoYearsAgo = new Date(now);
  twoYearsAgo.setFullYear(now.getFullYear() - 2);
  
  // Create 150 workouts spread over 2 years
  const totalWorkouts = 150;
  
  for (let i = 0; i < totalWorkouts; i++) {
    // Calculate date with even distribution over 2 years
    const daysToSubtract = Math.floor((i / totalWorkouts) * 730); // 730 days ≈ 2 years
    const workoutDate = new Date(now);
    workoutDate.setDate(now.getDate() - daysToSubtract);
    
    // Add some randomness to avoid perfectly even spacing
    workoutDate.setDate(workoutDate.getDate() - Math.floor(Math.random() * 5));
    
    // Create a workout with exercises
    const workout = await prisma.workout.create({
      data: {
        name: `Workout ${i + 1}`,
        date: workoutDate,
        duration: Math.floor(Math.random() * 90) + 30, // 30-120 minutes
        notes: Math.random() > 0.7 ? `Felt ${['great', 'good', 'tired', 'energetic'][Math.floor(Math.random() * 4)]} today` : null,
        userId,
        rawInput: `Workout ${i + 1} on ${workoutDate.toLocaleDateString()}`,
      },
    });
    
    // Add 1-5 exercises to the workout
    const numExercises = Math.floor(Math.random() * 5) + 1;
    for (let j = 0; j < numExercises; j++) {
      const exerciseName = exercises[Math.floor(Math.random() * exercises.length)];
      
      // Create the exercise
      const exercise = await prisma.exercise.create({
        data: {
          name: exerciseName,
          workoutId: workout.id,
        },
      });
      
      // Add sets based on exercise type
      if (['Running', 'Cycling'].includes(exerciseName)) {
        // Cardio typically has one set with duration and distance
        await prisma.$executeRaw`
          INSERT INTO "Set" ("id", "duration", "distance", "exerciseId", "createdAt", "updatedAt")
          VALUES (${uuidv4()}, ${Math.floor(Math.random() * 1800) + 600}, ${parseFloat((Math.random() * 10 + 1).toFixed(1))}, ${exercise.id}, NOW(), NOW())
        `;
      } else if (['Plank'].includes(exerciseName)) {
        // Create 1-3 sets for plank
        const numSets = Math.floor(Math.random() * 3) + 1;
        for (let k = 0; k < numSets; k++) {
          await prisma.$executeRaw`
            INSERT INTO "Set" ("id", "duration", "exerciseId", "createdAt", "updatedAt")
            VALUES (${uuidv4()}, ${Math.floor(Math.random() * 120) + 30}, ${exercise.id}, NOW(), NOW())
          `;
        }
      } else if (['Pushups', 'Pullups'].includes(exerciseName)) {
        // Create 2-4 sets for bodyweight exercises
        const numSets = Math.floor(Math.random() * 3) + 2;
        for (let k = 0; k < numSets; k++) {
          await prisma.$executeRaw`
            INSERT INTO "Set" ("id", "reps", "exerciseId", "createdAt", "updatedAt")
            VALUES (${uuidv4()}, ${Math.floor(Math.random() * 15) + 5}, ${exercise.id}, NOW(), NOW())
          `;
        }
      } else {
        // Create 2-4 sets for weighted exercises
        const numSets = Math.floor(Math.random() * 3) + 2;
        for (let k = 0; k < numSets; k++) {
          await prisma.$executeRaw`
            INSERT INTO "Set" ("id", "reps", "weight", "exerciseId", "createdAt", "updatedAt")
            VALUES (${uuidv4()}, ${Math.floor(Math.random() * 8) + 3}, ${Math.floor(Math.random() * 200) + 45}, ${exercise.id}, NOW(), NOW())
          `;
        }
      }
    }
    
    console.log(`Created workout ${i + 1} with ID: ${workout.id} on ${workoutDate.toLocaleDateString()}`);
  }
  
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 