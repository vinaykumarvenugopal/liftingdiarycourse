import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "./_components/DatePicker";
import { getWorkoutsForDate } from "@/data/workouts";

interface DashboardPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { date: dateParam } = await searchParams;
  const date = dateParam ? new Date(`${dateParam}T00:00:00`) : new Date();

  const workouts = await getWorkoutsForDate(date);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="mb-8 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>

        {/* Date Picker */}
        <div className="mb-8">
          <DatePicker selected={date} />
        </div>

        {/* Workout List */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Workouts for {format(date, "do MMM yyyy")}
          </h2>

          {workouts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-sm text-zinc-500">
                No workouts logged for this date.
              </CardContent>
            </Card>
          ) : (
            workouts.map((workout) => {
              const duration =
                workout.startedAt && workout.completedAt
                  ? `${Math.round((workout.completedAt.getTime() - workout.startedAt.getTime()) / 60000)} min`
                  : null;

              return (
                <Card key={workout.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{workout.name ?? "Untitled Workout"}</CardTitle>
                      {duration && (
                        <span className="text-xs text-zinc-500">{duration}</span>
                      )}
                    </div>
                    {workout.exercises.length > 0 && (
                      <CardDescription>
                        {workout.exercises.join(" · ")}
                      </CardDescription>
                    )}
                  </CardHeader>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
