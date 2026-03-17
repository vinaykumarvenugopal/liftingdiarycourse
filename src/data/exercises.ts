import { db } from "@/db";
import { exercises } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function getAllExercises() {
  return db
    .select({ id: exercises.id, name: exercises.name })
    .from(exercises)
    .orderBy(asc(exercises.name));
}
