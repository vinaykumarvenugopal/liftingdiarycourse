"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { WorkoutExerciseWithSets } from "@/data/workouts";
import { removeExerciseFromWorkout, swapExercise } from "../actions";
import SetList from "./SetList";
import AddSetForm from "./AddSetForm";

interface ExerciseCardProps {
  workoutExercise: WorkoutExerciseWithSets;
  allExercises: { id: number; name: string }[];
}

export default function ExerciseCard({ workoutExercise, allExercises }: ExerciseCardProps) {
  const router = useRouter();
  const [isRemoving, setIsRemoving] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [swappingId, setSwappingId] = useState<number | null>(null);

  async function handleRemove() {
    setIsRemoving(true);
    try {
      await removeExerciseFromWorkout({ workoutExerciseId: workoutExercise.id });
      router.refresh();
    } finally {
      setIsRemoving(false);
    }
  }

  async function handleSwap(exerciseId: number) {
    setSwappingId(exerciseId);
    try {
      await swapExercise({ workoutExerciseId: workoutExercise.id, exerciseId });
      setEditDialogOpen(false);
      router.refresh();
    } finally {
      setSwappingId(null);
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">{workoutExercise.exercise.name}</CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setEditDialogOpen(true)}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={handleRemove}
              disabled={isRemoving}
            >
              {isRemoving ? "Removing..." : "Remove"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <SetList sets={workoutExercise.sets} />
          <AddSetForm workoutExerciseId={workoutExercise.id} />
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="p-0 gap-0 max-w-sm">
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle>Change Exercise</DialogTitle>
          </DialogHeader>
          <Command>
            <CommandInput placeholder="Search exercises..." />
            <CommandList>
              <CommandEmpty>No exercises found.</CommandEmpty>
              <CommandGroup>
                {allExercises.map((exercise) => (
                  <CommandItem
                    key={exercise.id}
                    value={exercise.name}
                    onSelect={() => handleSwap(exercise.id)}
                    disabled={swappingId === exercise.id}
                  >
                    {exercise.name}
                    {exercise.id === workoutExercise.exercise.id && (
                      <span className="ml-auto text-xs text-muted-foreground">current</span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
