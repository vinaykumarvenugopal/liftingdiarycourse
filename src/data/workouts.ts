import { db } from "@/db";
import { exercises, sets, workoutExercises, workouts } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, asc, desc, eq, gte, lt, sql } from "drizzle-orm";

const PAGE_SIZE = 5;

export async function getWorkoutsForDate(date: Date, page: number) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const offset = (page - 1) * PAGE_SIZE;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(workouts)
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.startedAt, startOfDay),
        lt(workouts.startedAt, endOfDay)
      )
    );

  // Paginate on workouts first, then fetch exercises separately
  const workoutRows = await db
    .select({
      id: workouts.id,
      name: workouts.name,
      startedAt: workouts.startedAt,
      completedAt: workouts.completedAt,
    })
    .from(workouts)
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.startedAt, startOfDay),
        lt(workouts.startedAt, endOfDay)
      )
    )
    .orderBy(desc(workouts.startedAt))
    .limit(PAGE_SIZE)
    .offset(offset);

  const workoutIds = workoutRows.map((w) => w.id);

  const exerciseRows =
    workoutIds.length > 0
      ? await db
          .select({
            workoutId: workoutExercises.workoutId,
            exerciseName: exercises.name,
          })
          .from(workoutExercises)
          .innerJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
          .where(sql`${workoutExercises.workoutId} = ANY(ARRAY[${sql.join(workoutIds.map((id) => sql`${id}`), sql`, `)}]::int[])`)
      : [];

  const exercisesByWorkoutId = new Map<number, string[]>();
  for (const row of exerciseRows) {
    if (!exercisesByWorkoutId.has(row.workoutId)) {
      exercisesByWorkoutId.set(row.workoutId, []);
    }
    exercisesByWorkoutId.get(row.workoutId)!.push(row.exerciseName);
  }

  return {
    page,
    totalPages: Math.max(1, Math.ceil(count / PAGE_SIZE)),
    workouts: workoutRows.map((w) => ({
      ...w,
      exercises: exercisesByWorkoutId.get(w.id) ?? [],
    })),
  };
}

export async function insertWorkout(input: { name: string; startedAt: string }) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const [inserted] = await db
    .insert(workouts)
    .values({
      userId,
      name: input.name,
      startedAt: new Date(input.startedAt + "Z"),
    })
    .returning({ id: workouts.id });

  return inserted;
}

export async function getWorkoutsGroupedByName(page: number) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const offset = (page - 1) * PAGE_SIZE;

  // Get distinct workout names (groups) ordered by most recently added workout
  const nameRows = await db
    .select({ name: workouts.name })
    .from(workouts)
    .where(eq(workouts.userId, userId))
    .groupBy(workouts.name)
    .orderBy(desc(sql`max(${workouts.createdAt})`))
    .limit(PAGE_SIZE)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(distinct coalesce(name, ''))::int` })
    .from(workouts)
    .where(eq(workouts.userId, userId));

  const groups = await Promise.all(
    nameRows.map(async ({ name }) => {
      const rows = await db
        .select({
          id: workouts.id,
          name: workouts.name,
          startedAt: workouts.startedAt,
          completedAt: workouts.completedAt,
          exerciseName: exercises.name,
        })
        .from(workouts)
        .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
        .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
        .where(and(eq(workouts.userId, userId), eq(workouts.name, name ?? "")))
        .orderBy(desc(workouts.startedAt));

      const workoutMap = new Map<
        number,
        { id: number; name: string | null; startedAt: Date | null; completedAt: Date | null; exercises: string[] }
      >();

      for (const row of rows) {
        if (!workoutMap.has(row.id)) {
          workoutMap.set(row.id, {
            id: row.id,
            name: row.name,
            startedAt: row.startedAt,
            completedAt: row.completedAt,
            exercises: [],
          });
        }
        if (row.exerciseName) {
          workoutMap.get(row.id)!.exercises.push(row.exerciseName);
        }
      }

      return {
        name: name ?? "Untitled Workout",
        workouts: Array.from(workoutMap.values()),
      };
    })
  );

  return {
    page,
    totalPages: Math.max(1, Math.ceil(count / PAGE_SIZE)),
    groups,
  };
}

export async function getWorkoutById(workoutId: number) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const result = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .limit(1);

  return result[0] ?? null;
}

export type WorkoutExerciseWithSets = {
  id: number;
  order: number;
  exercise: { id: number; name: string };
  sets: Array<{
    id: number;
    setNumber: number;
    reps: number | null;
    weight: string | null;
  }>;
};

export async function getWorkoutWithExercisesAndSets(workoutId: number) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const workoutRows = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .limit(1);

  if (!workoutRows[0]) {
    return null;
  }

  const workout = workoutRows[0];

  const rows = await db
    .select({
      weId: workoutExercises.id,
      weOrder: workoutExercises.order,
      exerciseId: exercises.id,
      exerciseName: exercises.name,
      setId: sets.id,
      setNumber: sets.setNumber,
      reps: sets.reps,
      weight: sets.weight,
    })
    .from(workoutExercises)
    .innerJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(eq(workoutExercises.workoutId, workoutId))
    .orderBy(asc(workoutExercises.order), asc(sets.setNumber));

  const weMap = new Map<number, WorkoutExerciseWithSets>();
  for (const row of rows) {
    if (!weMap.has(row.weId)) {
      weMap.set(row.weId, {
        id: row.weId,
        order: row.weOrder,
        exercise: { id: row.exerciseId, name: row.exerciseName },
        sets: [],
      });
    }
    if (row.setId !== null) {
      weMap.get(row.weId)!.sets.push({
        id: row.setId,
        setNumber: row.setNumber!,
        reps: row.reps,
        weight: row.weight,
      });
    }
  }

  return {
    id: workout.id,
    name: workout.name,
    startedAt: workout.startedAt,
    completedAt: workout.completedAt,
    workoutExercises: Array.from(weMap.values()),
  };
}

export async function updateWorkout(
  workoutId: number,
  input: { name: string; startedAt: string }
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  await db
    .update(workouts)
    .set({
      name: input.name,
      startedAt: new Date(input.startedAt + "Z"),
    })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
