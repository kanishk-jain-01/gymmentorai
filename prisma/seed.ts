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
  
  // Generate workouts for the past 12 months
  const now = new Date();
  for (let i = 0; i < 100; i++) {
    // Random date within the past year
    const workoutDate = new Date(now);
    workoutDate.setDate(now.getDate() - Math.floor(Math.random() * 365));
    
    // Create a workout
    const workout = await prisma.workout.create({
      data: {
        name: `Workout ${i + 1}`,
        date: workoutDate,
        duration: Math.floor(Math.random() * 90) + 30, // 30-120 minutes
        notes: Math.random() > 0.7 ? `Felt ${['great', 'good', 'tired', 'energetic'][Math.floor(Math.random() * 4)]} today` : null,
        userId,
        rawInput: `Workout ${i + 1} on ${workoutDate.toLocaleDateString()}`,
        exercises: {
          create: Array(Math.floor(Math.random() * 5) + 1).fill(0).map(() => {
            const exercise = exercises[Math.floor(Math.random() * exercises.length)];
            
            // Different exercise types have different metrics
            if (['Running', 'Cycling'].includes(exercise)) {
              return {
                name: exercise,
                duration: Math.floor(Math.random() * 30) + 10, // 10-40 minutes
                distance: parseFloat((Math.random() * 10 + 1).toFixed(1)), // 1-11 miles/km
              };
            } else if (['Plank'].includes(exercise)) {
              return {
                name: exercise,
                duration: Math.floor(Math.random() * 120) + 30, // 30-150 seconds
                sets: Math.floor(Math.random() * 3) + 1, // 1-3 sets
              };
            } else if (['Pushups', 'Pullups'].includes(exercise)) {
              return {
                name: exercise,
                sets: Math.floor(Math.random() * 3) + 2, // 2-4 sets
                reps: Math.floor(Math.random() * 15) + 5, // 5-20 reps
              };
            } else {
              return {
                name: exercise,
                sets: Math.floor(Math.random() * 3) + 2, // 2-4 sets
                reps: Math.floor(Math.random() * 8) + 3, // 3-10 reps
                weight: Math.floor(Math.random() * 200) + 45, // 45-245 lbs
              };
            }
          }),
        },
      },
    });
    
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