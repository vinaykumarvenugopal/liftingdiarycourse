import { db } from "@/db";
import { sets, workoutExercises, workouts } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq, max, sql } from "drizzle-orm";

export async function insertSet(input: {
  workoutExerciseId: number;
  reps: number;
  weight: string;
}) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify ownership via workoutExercise → workout → userId
  const we = await db
    .select({ id: workoutExercises.id })
    .from(workoutExercises)
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .where(
      and(
        eq(workoutExercises.id, input.workoutExerciseId),
        eq(workouts.userId, userId)
      )
    )
    .limit(1);

  if (!we[0]) {
    throw new Error("Workout exercise not found");
  }

  // Compute next set number
  const [{ maxSetNumber }] = await db
    .select({ maxSetNumber: max(sets.setNumber) })
    .from(sets)
    .where(eq(sets.workoutExerciseId, input.workoutExerciseId));

  const nextSetNumber = (maxSetNumber ?? 0) + 1;

  await db.insert(sets).values({
    workoutExerciseId: input.workoutExerciseId,
    setNumber: nextSetNumber,
    reps: input.reps,
    weight: input.weight,
  });
}

export async function updateSet(
  setId: number,
  input: { reps: number; weight: string }
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  await db
    .update(sets)
    .set({ reps: input.reps, weight: input.weight })
    .where(
      and(
        eq(sets.id, setId),
        sql`${sets.workoutExerciseId} IN (
          SELECT we.id FROM workout_exercises we
          INNER JOIN workouts w ON w.id = we.workout_id
          WHERE w.user_id = ${userId}
        )`
      )
    );
}

export async function deleteSet(setId: number) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  await db
    .delete(sets)
    .where(
      and(
        eq(sets.id, setId),
        sql`${sets.workoutExerciseId} IN (
          SELECT we.id FROM workout_exercises we
          INNER JOIN workouts w ON w.id = we.workout_id
          WHERE w.user_id = ${userId}
        )`
      )
    );
}
