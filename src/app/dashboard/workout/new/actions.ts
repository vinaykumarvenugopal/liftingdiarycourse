"use server";

import { z } from "zod";
import { insertWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1, "Workout name is required"),
  startedAt: z.string().min(1, "Date is required"),
});

type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

export async function createWorkout(input: CreateWorkoutInput): Promise<{ id: number }> {
  const validated = createWorkoutSchema.parse(input);
  return insertWorkout(validated);
}
