import { notFound } from "next/navigation";
import { getWorkoutById, getWorkoutWithExercisesAndSets } from "@/data/workouts";
import { getAllExercises } from "@/data/exercises";
import EditWorkoutForm from "./_components/EditWorkoutForm";
import WorkoutExerciseList from "./_components/WorkoutExerciseList";

interface EditWorkoutPageProps {
  params: Promise<{ workoutId: string }>;
}

export default async function EditWorkoutPage({ params }: EditWorkoutPageProps) {
  const { workoutId } = await params;
  const id = Number(workoutId);

  if (isNaN(id)) {
    notFound();
  }

  const [workout, workoutDetail, allExercises] = await Promise.all([
    getWorkoutById(id),
    getWorkoutWithExercisesAndSets(id),
    getAllExercises(),
  ]);

  if (!workout) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <EditWorkoutForm
          workoutId={workout.id}
          defaultName={workout.name ?? ""}
          defaultStartedAt={workout.startedAt ?? new Date()}
        />
        <WorkoutExerciseList
          workoutId={id}
          workoutExercises={workoutDetail?.workoutExercises ?? []}
          allExercises={allExercises}
        />
      </div>
    </div>
  );
}
