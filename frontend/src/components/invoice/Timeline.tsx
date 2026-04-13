import React from "react";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  title: string;
  time: string;
  isCompleted: boolean;
}

interface TimelineProps {
  events: TimelineEvent[];
}

export const Timeline = ({ events }: TimelineProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xs uppercase tracking-widest text-zinc-400 font-bold border-b border-zinc-100 pb-3">Timeline</h3>
      <div className="space-y-4 pt-1">
        {events.map((event, idx) => (
          <div key={idx} className="flex items-start gap-5">
            <div className="relative flex flex-col items-center">
              <div className={cn(
                "w-2 h-2 rounded-full mt-1.5",
                event.isCompleted ? "bg-zinc-900 shadow-[0_0_10px_rgba(0,0,0,0.1)]" : "bg-zinc-200"
              )}></div>
              {idx !== events.length - 1 && (
                <div className="w-px h-8 bg-zinc-100 mt-1"></div>
              )}
            </div>
            <div className="space-y-0.5">
              <p className={cn(
                "text-xs font-semibold",
                event.isCompleted ? "text-zinc-900" : "text-zinc-400"
              )}>
                {event.title}
              </p>
              <p className="text-[10px] text-zinc-400 uppercase tracking-tight">{event.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
