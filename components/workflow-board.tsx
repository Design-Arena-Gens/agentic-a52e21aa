import { formatDistanceToNow } from "date-fns";
import type { Workflow } from "../lib/workflow-engine";

interface WorkflowBoardProps {
  workflows: Workflow[];
  highlightedId?: string;
}

const statusBadge: Record<Workflow["status"], string> = {
  draft: "bg-slate-800 text-slate-200 border border-slate-700",
  active: "bg-primary-500/10 text-primary-200 border border-primary-400/40",
  completed: "bg-emerald-500/10 text-emerald-200 border border-emerald-400/40"
};

export function WorkflowBoard({ workflows, highlightedId }: WorkflowBoardProps) {
  return (
    <div className="space-y-4">
      {workflows.map((wf) => {
        const pendingCount = wf.steps.filter((step) => step.status !== "done").length;
        const progress = wf.steps.length > 0 ? ((wf.steps.length - pendingCount) / wf.steps.length) * 100 : 0;
        return (
          <article
            key={wf.id}
            className={`rounded-xl border border-white/5 bg-slate-900/60 p-5 shadow-xl backdrop-blur transition hover:border-primary-500/50 ${
              highlightedId === wf.id ? "ring-2 ring-primary-400/70" : ""
            }`}
          >
            <header className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">{wf.name}</h3>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusBadge[wf.status]}`}>
                {wf.status}
              </span>
            </header>
            <p className="mt-2 text-sm text-slate-300">{wf.description}</p>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>Owner: {wf.owner}</span>
              <span>Updated {formatDistanceToNow(wf.updatedAt, { addSuffix: true })}</span>
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
                  <div className="absolute inset-y-0 left-0 bg-primary-500" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-xs text-slate-400">{Math.round(progress)}%</span>
              </div>
              <ul className="mt-4 space-y-2">
                {wf.steps.map((step) => (
                  <li
                    key={step.id}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-slate-900/80 px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium text-slate-100">{step.title}</p>
                      {step.owner ? <p className="text-xs text-slate-400">{step.owner}</p> : null}
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${
                        step.status === "done"
                          ? "bg-emerald-500/20 text-emerald-200"
                          : step.status === "in-progress"
                          ? "bg-amber-500/20 text-amber-200"
                          : step.status === "blocked"
                          ? "bg-rose-500/20 text-rose-200"
                          : "bg-slate-700/70 text-slate-200"
                      }`}
                    >
                      {step.status.replace("-", " ")}
                    </span>
                  </li>
                ))}
                {wf.steps.length === 0 ? (
                  <li className="rounded-lg border border-dashed border-slate-700 bg-slate-900/50 px-3 py-2 text-xs text-slate-400">
                    No steps yet. Use the chat to add your first one.
                  </li>
                ) : null}
              </ul>
            </div>
            {wf.tags.length ? (
              <footer className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
                {wf.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-slate-700 px-3 py-1 uppercase tracking-wide">
                    #{tag}
                  </span>
                ))}
              </footer>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
