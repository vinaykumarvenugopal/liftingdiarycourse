"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { addExerciseToWorkout } from "../actions";

interface AddExerciseDialogProps {
  workoutId: number;
  allExercises: { id: number; name: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddExerciseDialog({
  workoutId,
  allExercises,
  open,
  onOpenChange,
}: AddExerciseDialogProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<number | null>(null);

  async function handleSelect(exerciseId: number) {
    setPendingId(exerciseId);
    try {
      await addExerciseToWorkout({ workoutId, exerciseId });
      onOpenChange(false);
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-sm">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle>Add Exercise</DialogTitle>
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
                  onSelect={() => handleSelect(exercise.id)}
                  disabled={pendingId === exercise.id}
                >
                  {exercise.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
