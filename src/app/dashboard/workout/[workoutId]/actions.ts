"use server";

import { z } from "zod";
import { updateWorkout } from "@/data/workouts";

const updateWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
  name: z.string().min(1, "Workout name is required"),
  startedAt: z.string().min(1, "Date is required"),
});

type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;

export async function editWorkout(input: UpdateWorkoutInput) {
  const validated = updateWorkoutSchema.parse(input);
  await updateWorkout(validated.workoutId, {
    name: validated.name,
    startedAt: validated.startedAt,
  });
}
