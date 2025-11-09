"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { motion } from "framer-motion";
import { nanoid } from "nanoid/non-secure";
import { ChatBubble } from "../components/chat-bubble";
import { WorkflowBoard } from "../components/workflow-board";
import {
  initialState as initialWorkflowState,
  processMessage,
  type ChatMessage,
  type WorkflowState
} from "../lib/workflow-engine";

interface AppState {
  workflowState: WorkflowState;
  messages: ChatMessage[];
  highlightedWorkflowId?: string;
}

type AppAction =
  | { type: "user-message"; content: string }
  | { type: "assistant-message"; message: string; highlightedId?: string; nextWorkflowState: WorkflowState }
  | { type: "reset-highlight" };

const systemGreeting = `I'm Flowbot, your workflow copilot. Ask me to create workflows, add steps, or run them when you're ready.`;

const initialMessages: ChatMessage[] = [
  {
    id: nanoid(),
    role: "system",
    content: systemGreeting,
    timestamp: Date.now()
  }
];

const reducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "user-message": {
      const message: ChatMessage = {
        id: nanoid(),
        role: "user",
        content: action.content,
        timestamp: Date.now()
      };
      return {
        ...state,
        messages: [...state.messages, message]
      };
    }
    case "assistant-message": {
      const message: ChatMessage = {
        id: nanoid(),
        role: "assistant",
        content: action.message,
        timestamp: Date.now()
      };
      return {
        workflowState: action.nextWorkflowState,
        messages: [...state.messages, message],
        highlightedWorkflowId: action.highlightedId
      };
    }
    case "reset-highlight": {
      return {
        ...state,
        highlightedWorkflowId: undefined
      };
    }
    default:
      return state;
  }
};

export default function HomePage() {
  const [state, dispatch] = useReducer(reducer, {
    workflowState: initialWorkflowState,
    messages: initialMessages,
    highlightedWorkflowId: initialWorkflowState.selectedWorkflowId
  });
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const suggestions = useMemo(
    () => [
      "list workflows",
      "create workflow Launch Campaign",
      "add step to Launch Campaign: Prepare email sequence",
      "run workflow Product Release QA"
    ],
    []
  );

  useEffect(() => {
    if (!messagesEndRef.current) return;
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [state.messages]);

  useEffect(() => {
    if (!state.highlightedWorkflowId) return;
    const timeout = setTimeout(() => dispatch({ type: "reset-highlight" }), 1800);
    return () => clearTimeout(timeout);
  }, [state.highlightedWorkflowId]);

  const handleSend = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || isProcessing) return;

    dispatch({ type: "user-message", content: trimmed });
    setInput("");
    setIsProcessing(true);

    setTimeout(() => {
      const result = processMessage(state.workflowState, trimmed);
      dispatch({
        type: "assistant-message",
        message: result.reply,
        highlightedId: result.highlightedWorkflow?.id,
        nextWorkflowState: result.state
      });
      setIsProcessing(false);
    }, 160);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 pb-16 pt-14">
      <header className="space-y-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="text-4xl font-bold text-white sm:text-5xl"
        >
          Workflow Command Center
        </motion.h1>
        <p className="max-w-2xl text-slate-300">
          Design, inspect, and run your operational workflows in a conversational interface. Ask Flowbot to track
          step-by-step progress, change statuses, and surface the next best action.
        </p>
      </header>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="flex h-[70vh] flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 shadow-2xl">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-6">
            {state.messages.map((message) => (
              <ChatBubble key={message.id} role={message.role} content={message.content} />
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="border-t border-white/10 bg-slate-950/60 p-4">
            <div className="flex flex-wrap gap-2 pb-3">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="rounded-full border border-white/10 bg-slate-800/60 px-3 py-1 text-xs text-slate-300 transition hover:border-primary-400/60 hover:text-white"
                  onClick={() => handleSend(suggestion)}
                  disabled={isProcessing}
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <form
              className="flex gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                handleSend(input);
              }}
            >
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Type a workflow command..."
                className="flex-1 rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-500/40"
              />
              <button
                type="submit"
                className="rounded-2xl bg-primary-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isProcessing || !input.trim()}
              >
                {isProcessing ? "Thinking" : "Send"}
              </button>
            </form>
          </div>
        </div>

        <aside className="max-h-[70vh] overflow-y-auto rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Workflows</h2>
            <span className="text-xs uppercase tracking-widest text-slate-400">
              {state.workflowState.workflows.length} active
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Need ideas? Ask Flowbot to create workflows, add steps, or mark progress. The board updates instantly.
          </p>
          <div className="mt-5 space-y-4">
            <WorkflowBoard
              workflows={state.workflowState.workflows}
              highlightedId={state.highlightedWorkflowId ?? state.workflowState.selectedWorkflowId}
            />
          </div>
        </aside>
      </section>
    </main>
  );
}
