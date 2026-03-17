"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { logSet } from "../actions";

interface AddSetFormProps {
  workoutExerciseId: number;
}

export default function AddSetForm({ workoutExerciseId }: AddSetFormProps) {
  const router = useRouter();
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const repsNum = parseInt(reps, 10);
    if (isNaN(repsNum) || repsNum <= 0) {
      setError("Reps must be a positive number");
      return;
    }
    if (!weight || !/^\d{1,4}(\.\d{1,2})?$/.test(weight)) {
      setError("Enter a valid weight (e.g. 60 or 60.5)");
      return;
    }

    setIsPending(true);
    try {
      await logSet({ workoutExerciseId, reps: repsNum, weight });
      setReps("");
      setWeight("");
      router.refresh();
    } catch {
      setError("Failed to log set. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
      <Input
        type="number"
        placeholder="Reps"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        min={1}
        className="w-24"
      />
      <Input
        type="number"
        placeholder="kg"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        step="0.01"
        min={0}
        className="w-24"
      />
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Logging..." : "Log Set"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
