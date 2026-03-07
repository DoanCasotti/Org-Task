import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Task, TaskStatus } from "@shared/types";
import { TaskCard } from "./TaskCard";

interface KanbanBoardProps {
  tasks: Task[];
  onReorder: (
    tasks: { id: string; status: TaskStatus; order: number }[]
  ) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: "todo", title: "A Fazer", color: "border-yellow-400" },
  { id: "in_progress", title: "Em Progresso", color: "border-blue-400" },
  { id: "done", title: "Concluído", color: "border-green-400" },
];

export function KanbanBoard({
  tasks,
  onReorder,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}: KanbanBoardProps) {
  const getColumnTasks = (status: TaskStatus) =>
    tasks.filter(t => t.status === status).sort((a, b) => a.order - b.order);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const sourceStatus = source.droppableId as TaskStatus;
    const destStatus = destination.droppableId as TaskStatus;

    const sourceTasks = [...getColumnTasks(sourceStatus)];
    const destTasks =
      sourceStatus === destStatus
        ? sourceTasks
        : [...getColumnTasks(destStatus)];

    const [moved] = sourceTasks.splice(source.index, 1);

    if (sourceStatus === destStatus) {
      sourceTasks.splice(destination.index, 0, moved);
      const updates = sourceTasks.map((t, i) => ({
        id: t.id,
        status: sourceStatus,
        order: i,
      }));
      onReorder(updates);
    } else {
      destTasks.splice(destination.index, 0, { ...moved, status: destStatus });
      const sourceUpdates = sourceTasks.map((t, i) => ({
        id: t.id,
        status: sourceStatus,
        order: i,
      }));
      const destUpdates = destTasks.map((t, i) => ({
        id: t.id,
        status: destStatus,
        order: i,
      }));
      onReorder([...sourceUpdates, ...destUpdates]);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 h-full overflow-x-auto pb-4">
        {columns.map(col => {
          const colTasks = getColumnTasks(col.id);
          return (
            <div key={col.id} className="flex-1 min-w-[280px] flex flex-col">
              <div
                className={`flex items-center gap-2 mb-3 pb-2 border-b-2 ${col.color}`}
              >
                <h3 className="text-sm font-semibold text-gray-700">
                  {col.title}
                </h3>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  {colTasks.length}
                </span>
              </div>

              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 space-y-2 rounded-lg p-2 min-h-[100px] transition-colors ${
                      snapshot.isDraggingOver ? "bg-blue-50" : "bg-gray-50/50"
                    }`}
                  >
                    {colTasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`${snapshot.isDragging ? "shadow-lg rotate-2" : ""}`}
                          >
                            <TaskCard
                              task={task}
                              onEdit={() => onEditTask(task)}
                              onDelete={() => onDeleteTask(task.id)}
                              onStatusChange={status =>
                                onStatusChange(task.id, status)
                              }
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
