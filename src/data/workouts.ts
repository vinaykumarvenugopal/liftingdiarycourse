import { db } from "@/db";
import { workouts, workoutExercises, exercises } from "@/db/schema";
import { and, asc, desc, eq, gte, lt } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function insertWorkout(input: { name: string; startedAt: string }) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const result = await db
    .insert(workouts)
    .values({
      userId,
      name: input.name,
      startedAt: new Date(input.startedAt),
    })
    .returning({ id: workouts.id });

  return result[0];
}

export async function getWorkoutsForDate(date: Date, page = 1, pageSize = 5) {
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
    .orderBy(desc(workouts.createdAt), asc(workoutExercises.order));

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

  const allWorkouts = Array.from(workoutMap.values());
  const totalCount = allWorkouts.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const pageWorkouts = allWorkouts.slice((safePage - 1) * pageSize, safePage * pageSize);

  return { workouts: pageWorkouts, totalCount, totalPages, page: safePage };
}

type WorkoutEntry = {
  id: number;
  name: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  exercises: string[];
};

export async function getWorkoutsGroupedByName(page = 1, pageSize = 5) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

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
    .where(eq(workouts.userId, userId))
    .orderBy(asc(workouts.name), desc(workouts.createdAt), asc(workoutExercises.order));

  const workoutMap = new Map<number, WorkoutEntry>();

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

  const allWorkouts = Array.from(workoutMap.values());
  const totalCount = allWorkouts.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const pageWorkouts = allWorkouts.slice((safePage - 1) * pageSize, safePage * pageSize);

  const groupMap = new Map<string, WorkoutEntry[]>();
  for (const workout of pageWorkouts) {
    const key = workout.name ?? "Untitled";
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(workout);
  }

  const groups = Array.from(groupMap.entries()).map(([name, workouts]) => ({ name, workouts }));

  return { groups, totalCount, totalPages, page: safePage };
}
