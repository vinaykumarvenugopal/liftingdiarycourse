import { format } from "date-fns";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getWorkoutsGroupedByName } from "@/data/workouts";
import { PaginationControls } from "./PaginationControls";

interface WorkoutTypeViewProps {
  page: number;
}

export async function WorkoutTypeView({ page }: WorkoutTypeViewProps) {
  const { groups, totalPages, page: currentPage } = await getWorkoutsGroupedByName(page);

  if (groups.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-zinc-500">
          No workouts logged yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <PaginationControls page={currentPage} totalPages={totalPages} />

      <div className="space-y-8">
        {groups.map((group) => (
          <div key={group.name}>
            <h2 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {group.name}
            </h2>
            <div className="space-y-3">
              {group.workouts.map((workout) => {
                const duration =
                  workout.startedAt && workout.completedAt
                    ? `${Math.round((workout.completedAt.getTime() - workout.startedAt.getTime()) / 60000)} min`
                    : null;

                return (
                  <Link key={workout.id} href={`/dashboard/workout/${workout.id}`} className="block">
                    <Card className="hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            {workout.startedAt ? format(workout.startedAt, "do MMM yyyy") : "Unknown date"}
                          </CardTitle>
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
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <PaginationControls page={currentPage} totalPages={totalPages} />
    </div>
  );
}
