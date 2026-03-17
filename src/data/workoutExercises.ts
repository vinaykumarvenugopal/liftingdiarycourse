import { db } from "@/db";
import { workoutExercises, workouts } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq, max, sql } from "drizzle-orm";

export async function insertWorkoutExercise(input: {
  workoutId: number;
  exerciseId: number;
}) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify the workout belongs to this user
  const workout = await db
    .select({ id: workouts.id })
    .from(workouts)
    .where(and(eq(workouts.id, input.workoutId), eq(workouts.userId, userId)))
    .limit(1);

  if (!workout[0]) {
    throw new Error("Workout not found");
  }

  // Compute next order value
  const [{ maxOrder }] = await db
    .select({ maxOrder: max(workoutExercises.order) })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, input.workoutId));

  const nextOrder = (maxOrder ?? 0) + 1;

  await db.insert(workoutExercises).values({
    workoutId: input.workoutId,
    exerciseId: input.exerciseId,
    order: nextOrder,
  });
}

export async function updateWorkoutExercise(
  workoutExerciseId: number,
  exerciseId: number
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  await db
    .update(workoutExercises)
    .set({ exerciseId })
    .where(
      and(
        eq(workoutExercises.id, workoutExerciseId),
        sql`${workoutExercises.workoutId} IN (SELECT id FROM workouts WHERE user_id = ${userId})`
      )
    );
}

export async function deleteWorkoutExercise(workoutExerciseId: number) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  await db
    .delete(workoutExercises)
    .where(
      and(
        eq(workoutExercises.id, workoutExerciseId),
        sql`${workoutExercises.workoutId} IN (SELECT id FROM workouts WHERE user_id = ${userId})`
      )
    );
}
