"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { WorkoutExerciseWithSets } from "@/data/workouts";
import ExerciseCard from "./ExerciseCard";
import AddExerciseDialog from "./AddExerciseDialog";

interface WorkoutExerciseListProps {
  workoutId: number;
  workoutExercises: WorkoutExerciseWithSets[];
  allExercises: { id: number; name: string }[];
}

export default function WorkoutExerciseList({
  workoutId,
  workoutExercises,
  allExercises,
}: WorkoutExerciseListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Exercises</h2>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Exercise
        </Button>
      </div>

      {workoutExercises.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No exercises added yet. Click &quot;Add Exercise&quot; to get started.
        </p>
      ) : (
        <div className="space-y-3">
          {workoutExercises.map((we) => (
            <ExerciseCard key={we.id} workoutExercise={we} allExercises={allExercises} />
          ))}
        </div>
      )}

      <AddExerciseDialog
        workoutId={workoutId}
        allExercises={allExercises}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
