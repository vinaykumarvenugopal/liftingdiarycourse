import { db } from "@/db";
import { workouts, workoutExercises, exercises } from "@/db/schema";
import { and, eq, gte, lt } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function getWorkoutsForDate(date: Date) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const rows = await db
    .select({
      workoutId: workouts.id,
      workoutName: workouts.name,
      startedAt: workouts.startedAt,
      completedAt: workouts.completedAt,
      exerciseName: exercises.name,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.startedAt, startOfDay),
        lt(workouts.startedAt, endOfDay)
      )
    )
    .orderBy(workouts.startedAt, workoutExercises.order);

  const workoutMap = new Map<
    number,
    {
      id: number;
      name: string | null;
      startedAt: Date | null;
      completedAt: Date | null;
      exercises: string[];
    }
  >();

  for (const row of rows) {
    if (!workoutMap.has(row.workoutId)) {
      workoutMap.set(row.workoutId, {
        id: row.workoutId,
        name: row.workoutName,
        startedAt: row.startedAt,
        completedAt: row.completedAt,
        exercises: [],
      });
    }
    if (row.exerciseName) {
      workoutMap.get(row.workoutId)!.exercises.push(row.exerciseName);
    }
  }

  return Array.from(workoutMap.values());
}
