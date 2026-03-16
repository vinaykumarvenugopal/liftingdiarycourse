import { notFound } from "next/navigation";
import { getWorkoutById } from "@/data/workouts";
import EditWorkoutForm from "./_components/EditWorkoutForm";

interface EditWorkoutPageProps {
  params: Promise<{ workoutId: string }>;
}

export default async function EditWorkoutPage({ params }: EditWorkoutPageProps) {
  const { workoutId } = await params;
  const id = Number(workoutId);

  if (isNaN(id)) {
    notFound();
  }

  const workout = await getWorkoutById(id);

  if (!workout) {
    notFound();
  }

  return (
    <EditWorkoutForm
      workoutId={workout.id}
      defaultName={workout.name ?? ""}
      defaultStartedAt={workout.startedAt ?? new Date()}
    />
  );
}
