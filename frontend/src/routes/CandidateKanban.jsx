import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getCandidates, updateCandidateStage } from "../lib/api";

const stages = [
  { key: "applied", color: "#3498db" },
  { key: "screen", color: "#9b59b6" },
  { key: "tech", color: "#e67e22" },
  { key: "offer", color: "#2ecc71" },
  { key: "hired", color: "#27ae60" },
  { key: "rejected", color: "#e74c3c" },
];

export default function CandidateKanban() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      const res = await getCandidates({ page: 1, pageSize: 1000 });
      setCandidates(res.data);
      setLoading(false);
    };
    fetchCandidates();
  }, []);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const [candidateId, destStage] = over.id.split("|");
    const candidate = candidates.find((c) => c.id === Number(candidateId));
    if (candidate.stage === destStage) return;

    const updatedCandidates = candidates.map((c) =>
      c.id === candidate.id ? { ...c, stage: destStage } : c
    );
    setCandidates(updatedCandidates);

    try {
      await updateCandidateStage(candidate.id, destStage);
    } catch (err) {
      alert("Failed to update stage, rolling back");
      setCandidates(candidates);
    }
  };

  if (loading)
    return <div className="container">Loading candidates...</div>;

  return (
    <div
      style={{
        display: "flex",
        gap: "1rem",
        overflowX: "auto",
        padding: "1rem",
      }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        {stages.map((stage) => (
          <StageColumn
            key={stage.key}
            stage={stage.key}
            color={stage.color}
            candidates={candidates.filter((c) => c.stage === stage.key)}
          />
        ))}
      </DndContext>
    </div>
  );
}

function StageColumn({ stage, color, candidates }) {
  return (
    <div
      style={{
        minWidth: 240,
        flex: "0 0 240px",
        border: `2px solid ${color}`,
        padding: "1rem",
        borderRadius: 10,
        maxHeight: "80vh",
        overflowY: "auto",
        background: "#fdfdfd",
        boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h3
        style={{
          textAlign: "center",
          marginBottom: "1rem",
          color,
          fontSize: "1.1rem",
          fontWeight: 600,
        }}
      >
        {stage.toUpperCase()}
      </h3>
      <SortableContext
        items={candidates.map((c) => `${c.id}|${stage}`)}
        strategy={verticalListSortingStrategy}
      >
        {candidates.map((c) => (
          <CandidateCard key={c.id} candidate={c} color={color} stage={stage} />
        ))}
      </SortableContext>
    </div>
  );
}

function CandidateCard({ candidate, stage, color }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: `${candidate.id}|${stage}`,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: "12px",
    marginBottom: "12px",
    borderRadius: 8,
    background: "#fff",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    cursor: "grab",
    userSelect: "none",
    borderLeft: `4px solid ${color}`,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  };

  const nameStyle = {
    fontWeight: 600,
    fontSize: "1rem",
    marginBottom: 4,
  };

  const emailStyle = {
    fontSize: "0.85rem",
    color: "#555",
  };

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={style}>
      <span style={nameStyle}>{candidate.name}</span>
      <span style={emailStyle}>{candidate.email}</span>
    </div>
  );
}
