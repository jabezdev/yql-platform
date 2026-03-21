export type PipelineStage =
    | "round1" | "round2" | "round3" | "round4" | "round5" | "round6"
    | "accepted" | "rejected" | "withdrawn";

export const PIPELINE_STAGES: PipelineStage[] = [
    "round1", "round2", "round3", "round4", "round5", "round6",
    "accepted", "rejected", "withdrawn",
];

export const ACTIVE_STAGES: PipelineStage[] = [
    "round1", "round2", "round3", "round4", "round5", "round6",
];

export const TERMINAL_STAGES: PipelineStage[] = ["accepted", "rejected", "withdrawn"];

export const STAGE_LABELS: Record<PipelineStage, string> = {
    round1: "Round 1",
    round2: "Round 2",
    round3: "Round 3",
    round4: "Round 4",
    round5: "Round 5",
    round6: "Round 6",
    accepted: "Accepted",
    rejected: "Rejected",
    withdrawn: "Withdrawn",
};

export const NEXT_STAGE: Partial<Record<PipelineStage, PipelineStage>> = {
    round1: "round2",
    round2: "round3",
    round3: "round4",
    round4: "round5",
    round5: "round6",
    round6: "accepted",
};
