"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const MOCK_WORKOUTS = [
  {
    id: 1,
    name: "Morning Push Session",
    exercises: ["Bench Press", "Overhead Press", "Tricep Dips"],
    duration: "52 min",
  },
  {
    id: 2,
    name: "Leg Day",
    exercises: ["Squat", "Romanian Deadlift", "Leg Press"],
    duration: "65 min",
  },
];

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date());

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="mb-8 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>

        {/* Date Picker */}
        <div className="mb-8">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[220px] justify-start gap-2 text-left font-normal">
                <CalendarIcon className="h-4 w-4 text-zinc-500" />
                {format(date, "do MMM yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Workout List */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Workouts for {format(date, "do MMM yyyy")}
          </h2>

          {MOCK_WORKOUTS.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-sm text-zinc-500">
                No workouts logged for this date.
              </CardContent>
            </Card>
          ) : (
            MOCK_WORKOUTS.map((workout) => (
              <Card key={workout.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{workout.name}</CardTitle>
                    <span className="text-xs text-zinc-500">{workout.duration}</span>
                  </div>
                  <CardDescription>
                    {workout.exercises.join(" · ")}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
