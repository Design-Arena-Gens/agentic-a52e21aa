import { motion } from "framer-motion";
import clsx from "clsx";
import type { MessageRole } from "../lib/workflow-engine";
interface ChatBubbleProps {
  role: MessageRole;
  content: string;
}

const roleStyles: Record<MessageRole, string> = {
  user: "bg-primary-500 text-white ml-auto",
  assistant: "bg-slate-800 text-slate-100 mr-auto",
  system: "bg-slate-700 text-slate-200 mx-auto"
};

const roleLabels: Record<MessageRole, string> = {
  user: "You",
  assistant: "Flowbot",
  system: "System"
};

export function ChatBubble({ role, content }: ChatBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={clsx(
        "max-w-[85%] rounded-2xl px-4 py-3 shadow-lg ring-1 ring-white/5",
        roleStyles[role]
      )}
    >
      <div className="text-xs font-semibold uppercase tracking-wide text-white/70">
        {roleLabels[role]}
      </div>
      <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{content}</p>
    </motion.div>
  );
}
