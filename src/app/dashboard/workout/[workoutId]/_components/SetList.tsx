"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { deleteSetAction, updateSetAction } from "../actions";

interface Set {
  id: number;
  setNumber: number;
  reps: number | null;
  weight: string | null;
}

interface SetListProps {
  sets: Set[];
}

export default function SetList({ sets }: SetListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editReps, setEditReps] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);

  function startEdit(set: Set) {
    setEditingId(set.id);
    setEditReps(set.reps?.toString() ?? "");
    setEditWeight(set.weight ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function handleSave(setId: number) {
    const repsNum = parseInt(editReps, 10);
    if (isNaN(repsNum) || repsNum <= 0) return;
    if (!editWeight || !/^\d{1,4}(\.\d{1,2})?$/.test(editWeight)) return;

    setSavingId(setId);
    try {
      await updateSetAction({ setId, reps: repsNum, weight: editWeight });
      setEditingId(null);
      router.refresh();
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(setId: number) {
    setDeletingId(setId);
    try {
      await deleteSetAction({ setId });
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  if (sets.length === 0) {
    return <p className="text-sm text-muted-foreground">No sets logged yet.</p>;
  }

  return (
    <div className="space-y-1">
      {sets.map((set) =>
        editingId === set.id ? (
          <div key={set.id} className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm w-12">Set {set.setNumber}</span>
            <Input
              type="number"
              value={editReps}
              onChange={(e) => setEditReps(e.target.value)}
              min={1}
              placeholder="Reps"
              className="h-7 w-20 text-sm"
            />
            <Input
              type="number"
              value={editWeight}
              onChange={(e) => setEditWeight(e.target.value)}
              step="0.01"
              min={0}
              placeholder="kg"
              className="h-7 w-20 text-sm"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-green-600"
              onClick={() => handleSave(set.id)}
              disabled={savingId === set.id}
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground"
              onClick={cancelEdit}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <div key={set.id} className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground w-12">Set {set.setNumber}</span>
            <span className="w-16">{set.reps ?? "-"} reps</span>
            <span className="w-16">{set.weight ?? "-"} kg</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => startEdit(set)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
              onClick={() => handleDelete(set.id)}
              disabled={deletingId === set.id}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )
      )}
    </div>
  );
}
