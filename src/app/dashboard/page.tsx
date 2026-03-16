import { format } from "date-fns";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePicker } from "./_components/DatePicker";
import { TabSwitcher } from "./_components/TabSwitcher";
import { ViewSwitcher } from "./_components/ViewSwitcher";
import { WorkoutTypeView } from "./_components/WorkoutTypeView";
import { PaginationControls } from "./_components/PaginationControls";
import { getWorkoutsForDate } from "@/data/workouts";

interface DashboardPageProps {
  searchParams: Promise<{ date?: string; tab?: string; page?: string; view?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { date: dateParam, tab, page: pageParam, view } = await searchParams;
  const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;
  const activeTab = tab === "type" ? "type" : "date";
  const activeView = view === "tile" ? "tile" : "list";
  const date = dateParam ? new Date(`${dateParam}T00:00:00`) : new Date();

  const dateViewData = activeTab === "date" ? await getWorkoutsForDate(date, page) : null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Dashboard
          </h1>
          <Button asChild>
            <Link href="/dashboard/workout/new">Log New Workout</Link>
          </Button>
        </div>

        <div className="mb-8">
          <TabSwitcher activeTab={activeTab} />
        </div>

        {activeTab === "date" && dateViewData ? (
          <>
            <div className="mb-8 flex items-center justify-between">
              <DatePicker selected={date} />
              <ViewSwitcher activeView={activeView} />
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Workouts for {format(date, "do MMM yyyy")}
              </h2>

              <PaginationControls page={dateViewData.page} totalPages={dateViewData.totalPages} />

              {dateViewData.workouts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-sm text-zinc-500">
                    No workouts logged for this date.
                  </CardContent>
                </Card>
              ) : activeView === "tile" ? (
                <div className="grid grid-cols-2 gap-4">
                  {dateViewData.workouts.map((workout) => {
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
                  })}
                </div>
              ) : (
                dateViewData.workouts.map((workout) => {
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

              <PaginationControls page={dateViewData.page} totalPages={dateViewData.totalPages} />
            </div>
          </>
        ) : (
          <WorkoutTypeView page={page} />
        )}
      </div>
    </div>
  );
}
