"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { editWorkout } from "../actions";

interface EditWorkoutFormProps {
  workoutId: number;
  defaultName: string;
  defaultStartedAt: Date;
}

export default function EditWorkoutForm({
  workoutId,
  defaultName,
  defaultStartedAt,
}: EditWorkoutFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Format the date for the datetime-local input in UTC (YYYY-MM-DDTHH:mm)
  const defaultStartedAtValue = defaultStartedAt.toISOString().slice(0, 16);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const startedAt = (form.elements.namedItem("startedAt") as HTMLInputElement).value;

    try {
      await editWorkout({ workoutId, name, startedAt });
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setPending(false);
    }
  }

  return (
    <Card>
        <CardHeader>
          <CardTitle>Edit Workout</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Workout Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Upper Body Strength"
                defaultValue={defaultName}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startedAt">Date &amp; Time</Label>
              <Input
                id="startedAt"
                name="startedAt"
                type="datetime-local"
                defaultValue={defaultStartedAtValue}
                required
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard")}
                disabled={pending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
  );
}
