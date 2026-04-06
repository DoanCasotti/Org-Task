import { useState, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Task } from "@shared/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const priorityDot: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-orange-400",
  low: "bg-gray-400",
};

export function CalendarView({ tasks, onTaskClick }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { locale: ptBR });
    const calEnd = endOfWeek(monthEnd, { locale: ptBR });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach(task => {
      if (task.due_date) {
        const key = format(new Date(task.due_date), "yyyy-MM-dd");
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(task);
      }
    });
    return map;
  }, [tasks]);

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
        </h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
          >
            Hoje
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden flex-1">
        {weekDays.map(day => (
          <div
            key={day}
            className="bg-gray-50 p-2 text-center text-xs font-medium text-gray-500"
          >
            {day}
          </div>
        ))}

        {days.map(day => {
          const key = format(day, "yyyy-MM-dd");
          const dayTasks = tasksByDate.get(key) || [];
          const inMonth = isSameMonth(day, currentMonth);

          return (
            <div
              key={key}
              className={`bg-white p-1.5 min-h-[80px] md:min-h-[100px] ${
                !inMonth ? "opacity-40" : ""
              } ${isToday(day) ? "ring-2 ring-inset ring-[#07477c]/30" : ""}`}
            >
              <span
                className={`text-xs font-medium ${
                  isToday(day) ? "text-[#07477c] font-bold" : "text-gray-700"
                }`}
              >
                {format(day, "d")}
              </span>

              <div className="mt-1 space-y-0.5">
                {dayTasks.slice(0, 3).map(task => (
                  <button
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="w-full text-left flex items-center gap-1 px-1 py-0.5 rounded text-[10px] md:text-xs hover:bg-gray-50 truncate"
                    title={task.title}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityDot[task.priority]}`}
                    />
                    <span
                      className={`truncate ${task.status === "done" ? "line-through text-gray-400" : "text-gray-700"}`}
                    >
                      {task.title}
                    </span>
                  </button>
                ))}
                {dayTasks.length > 3 && (
                  <span className="text-[10px] text-gray-400 pl-1">
                    +{dayTasks.length - 3} mais
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
