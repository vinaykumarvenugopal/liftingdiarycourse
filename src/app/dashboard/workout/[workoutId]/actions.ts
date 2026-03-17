"use server";

import { z } from "zod";
import { updateWorkout } from "@/data/workouts";
import { insertWorkoutExercise, deleteWorkoutExercise, updateWorkoutExercise } from "@/data/workoutExercises";
import { insertSet, deleteSet, updateSet } from "@/data/sets";

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

const addExerciseToWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
  exerciseId: z.number().int().positive(),
});

type AddExerciseToWorkoutInput = z.infer<typeof addExerciseToWorkoutSchema>;

export async function addExerciseToWorkout(input: AddExerciseToWorkoutInput) {
  const validated = addExerciseToWorkoutSchema.parse(input);
  await insertWorkoutExercise({ workoutId: validated.workoutId, exerciseId: validated.exerciseId });
}

const removeExerciseFromWorkoutSchema = z.object({
  workoutExerciseId: z.number().int().positive(),
});

type RemoveExerciseFromWorkoutInput = z.infer<typeof removeExerciseFromWorkoutSchema>;

export async function removeExerciseFromWorkout(input: RemoveExerciseFromWorkoutInput) {
  const validated = removeExerciseFromWorkoutSchema.parse(input);
  await deleteWorkoutExercise(validated.workoutExerciseId);
}

const logSetSchema = z.object({
  workoutExerciseId: z.number().int().positive(),
  reps: z.number().int().positive(),
  weight: z.string().regex(/^\d{1,4}(\.\d{1,2})?$/, "Invalid weight format"),
});

type LogSetInput = z.infer<typeof logSetSchema>;

export async function logSet(input: LogSetInput) {
  const validated = logSetSchema.parse(input);
  await insertSet({ workoutExerciseId: validated.workoutExerciseId, reps: validated.reps, weight: validated.weight });
}

const deleteSetSchema = z.object({
  setId: z.number().int().positive(),
});

type DeleteSetInput = z.infer<typeof deleteSetSchema>;

export async function deleteSetAction(input: DeleteSetInput) {
  const validated = deleteSetSchema.parse(input);
  await deleteSet(validated.setId);
}

const updateSetSchema = z.object({
  setId: z.number().int().positive(),
  reps: z.number().int().positive(),
  weight: z.string().regex(/^\d{1,4}(\.\d{1,2})?$/, "Invalid weight format"),
});

type UpdateSetInput = z.infer<typeof updateSetSchema>;

export async function updateSetAction(input: UpdateSetInput) {
  const validated = updateSetSchema.parse(input);
  await updateSet(validated.setId, { reps: validated.reps, weight: validated.weight });
}

const swapExerciseSchema = z.object({
  workoutExerciseId: z.number().int().positive(),
  exerciseId: z.number().int().positive(),
});

type SwapExerciseInput = z.infer<typeof swapExerciseSchema>;

export async function swapExercise(input: SwapExerciseInput) {
  const validated = swapExerciseSchema.parse(input);
  await updateWorkoutExercise(validated.workoutExerciseId, validated.exerciseId);
}
