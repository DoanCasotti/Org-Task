import { useState, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MDEditor from '@uiw/react-md-editor';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Task, TaskStatus, TaskPriority, Profile, Project } from '@shared/types';
import { useTaskDetail } from '@/hooks/useTaskDetail';
import { ChevronRight, Plus } from 'lucide-react';

interface TaskDetailModalProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: Profile[];
  projects: Project[];
}

const statusLabels: Record<TaskStatus, string> = {
  todo: 'A Fazer',
  in_progress: 'Em Progresso',
  done: 'Concluído',
};

const priorityLabels: Record<TaskPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

const priorityColors: Record<TaskPriority, string> = {
  low: 'text-gray-500',
  medium: 'text-orange-500',
  high: 'text-red-500',
};

type Tab = 'detalhes' | 'subtarefas' | 'atividade';

export function TaskDetailModal({ task, open, onOpenChange, members, projects }: TaskDetailModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('detalhes');
  const { task: detail, subtasks, comments, activity, addSubtask, addComment, updateTask } =
    useTaskDetail(task?.id ?? null);

  const current = detail ?? task;
  const project = projects.find(p => p.id === current?.project_id);

  if (!current) return null;

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'detalhes', label: 'Detalhes' },
    { id: 'subtarefas', label: 'Subtarefas', count: subtasks.length },
    { id: 'atividade', label: 'Atividade', count: comments.length + activity.length },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-3xl w-[95vw] max-h-[90vh] p-0 flex flex-col overflow-hidden">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 px-6 pt-4 pb-3 text-xs text-gray-500 border-b border-gray-100 shrink-0">
          <span className="font-medium text-gray-700">{project?.name ?? 'Projeto'}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="truncate max-w-xs">{current.title}</span>
        </div>

        {/* Título */}
        <div className="px-6 pt-4 pb-2 shrink-0">
          <TitleEditor title={current.title} onSave={t => updateTask.mutate({ title: t })} />
        </div>

        {/* Abas */}
        <div className="flex gap-1 px-6 border-b border-gray-100 shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#07477c] text-[#07477c]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1.5 text-xs bg-gray-100 text-gray-500 rounded-full px-1.5 py-0.5">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeTab === 'detalhes' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <Select value={current.status} onValueChange={v => updateTask.mutate({ status: v as TaskStatus })}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(statusLabels) as TaskStatus[]).map(s => (
                        <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Prioridade</p>
                  <Select value={current.priority} onValueChange={v => updateTask.mutate({ priority: v as TaskPriority })}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(priorityLabels) as TaskPriority[]).map(p => (
                        <SelectItem key={p} value={p}>
                          <span className={priorityColors[p]}>{priorityLabels[p]}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Responsável</p>
                  <Select
                    value={current.assigned_to ?? 'none'}
                    onValueChange={v => updateTask.mutate({ assigned_to: v === 'none' ? null : v })}
                  >
                    <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Ninguém" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ninguém</SelectItem>
                      {members.map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.username}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Vencimento</p>
                  <input
                    type="date"
                    defaultValue={current.due_date ?? ''}
                    onBlur={e => updateTask.mutate({ due_date: e.target.value || null })}
                    className="h-8 text-sm border border-gray-200 rounded px-2 w-full"
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Descrição</p>
                <DescriptionSection
                  description={current.description}
                  onSave={d => updateTask.mutate({ description: d })}
                />
              </div>
            </div>
          )}

          {activeTab === 'subtarefas' && (
            <SubtasksSection
              subtasks={subtasks}
              members={members}
              projects={projects}
              onAdd={title => addSubtask.mutate(title)}
              isAdding={addSubtask.isPending}
            />
          )}

          {activeTab === 'atividade' && (
            <ActivityPanel
              activity={activity}
              comments={comments}
              members={members}
              onAddComment={content => addComment.mutate(content)}
              isSubmitting={addComment.isPending}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TitleEditor({ title, onSave }: { title: string; onSave: (t: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);
  if (editing) {
    return (
      <input
        autoFocus
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={() => { onSave(value); setEditing(false); }}
        onKeyDown={e => { if (e.key === 'Enter') { onSave(value); setEditing(false); } }}
        className="text-xl font-bold text-gray-900 w-full border-b-2 border-[#07477c] outline-none bg-transparent pb-1"
      />
    );
  }
  return (
    <h1
      className="text-xl font-bold text-gray-900 cursor-pointer hover:text-[#07477c] transition-colors"
      onClick={() => { setValue(title); setEditing(true); }}
      title="Clique para editar o título"
    >
      {title}
    </h1>
  );
}

function DescriptionSection({ description, onSave }: { description: string | null; onSave: (d: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(description ?? '');

  if (editing) {
    return (
      <div>
        <MDEditor value={value} onChange={v => setValue(v ?? '')} preview="edit" height={200} data-color-mode="light" />
        <div className="flex gap-2 mt-2">
          <button onClick={() => { onSave(value); setEditing(false); }} className="text-xs bg-[#07477c] text-white rounded px-3 py-1.5">
            Salvar
          </button>
          <button onClick={() => { setValue(description ?? ''); setEditing(false); }} className="text-xs border border-gray-200 rounded px-3 py-1.5 text-gray-600">
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => setEditing(true)}
      className="min-h-[80px] cursor-pointer rounded-lg border border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50 p-3 transition-colors"
    >
      {description ? (
        <MarkdownPreview source={description} style={{ background: 'transparent', fontSize: 14 }} />
      ) : (
        <p className="text-sm text-gray-400">Clique para adicionar uma descrição em Markdown...</p>
      )}
    </div>
  );
}

function SubtaskRow({ subtask, members, projects, depth = 0 }: {
  subtask: Task; members: Profile[]; projects: Project[]; depth?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const { subtasks: children, updateTask } = useTaskDetail(subtask.id);
  const hasChildren = children.length > 0;
  const assignee = members.find(m => m.id === subtask.assigned_to);

  return (
    <div style={{ marginLeft: depth * 20 }}>
      <div className="flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-gray-50 group border border-transparent hover:border-gray-100">
        <button
          onClick={() => setExpanded(e => !e)}
          className={`w-4 h-4 shrink-0 flex items-center justify-center text-gray-400 transition-transform ${hasChildren ? '' : 'invisible'} ${expanded ? 'rotate-90' : ''}`}
        >
          <ChevronRight className="w-3 h-3" />
        </button>

        <button
          onClick={() => updateTask.mutate({ status: subtask.status === 'done' ? 'todo' : 'done' })}
          className={`w-4 h-4 rounded-full border-2 shrink-0 transition-colors ${
            subtask.status === 'done' ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-400'
          }`}
        />

        <span
          onClick={() => setDetailOpen(true)}
          className={`flex-1 text-sm cursor-pointer hover:text-[#07477c] ${subtask.status === 'done' ? 'line-through text-gray-400' : 'text-gray-700'}`}
        >
          {subtask.title}
        </span>

        {assignee && (
          <div className="w-5 h-5 rounded-full bg-[#07477c]/10 flex items-center justify-center text-[10px] font-medium text-[#07477c] shrink-0">
            {(assignee.username ?? '?')[0].toUpperCase()}
          </div>
        )}

        <span className={`text-[10px] shrink-0 font-medium ${priorityColors[subtask.priority]}`}>
          {priorityLabels[subtask.priority]}
        </span>
      </div>

      {expanded && children.map(child => (
        <SubtaskRow key={child.id} subtask={child} members={members} projects={projects} depth={depth + 1} />
      ))}

      <TaskDetailModal task={subtask} open={detailOpen} onOpenChange={setDetailOpen} members={members} projects={projects} />
    </div>
  );
}

function SubtasksSection({ subtasks, members, projects, onAdd, isAdding }: {
  subtasks: Task[]; members: Profile[]; projects: Project[];
  onAdd: (title: string) => void; isAdding: boolean;
}) {
  const [newTitle, setNewTitle] = useState('');

  return (
    <div className="space-y-1">
      {subtasks.length === 0 && (
        <p className="text-sm text-gray-400 py-4 text-center">Nenhuma subtarefa ainda</p>
      )}
      {subtasks.map(s => (
        <SubtaskRow key={s.id} subtask={s} members={members} projects={projects} />
      ))}

      <div className="flex gap-2 pt-3">
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && newTitle.trim()) { onAdd(newTitle.trim()); setNewTitle(''); } }}
          placeholder="Nova subtarefa... (Enter para adicionar)"
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#07477c]/30 focus:border-[#07477c]"
        />
        <button
          onClick={() => { if (newTitle.trim()) { onAdd(newTitle.trim()); setNewTitle(''); } }}
          disabled={!newTitle.trim() || isAdding}
          className="px-3 py-2 bg-[#07477c] text-white rounded-lg text-sm disabled:opacity-50 hover:bg-[#07477c]/90 flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Adicionar
        </button>
      </div>
    </div>
  );
}

function ActivityPanel({ activity, comments, members, onAddComment, isSubmitting }: {
  activity: any[]; comments: any[]; members: Profile[];
  onAddComment: (content: string) => void; isSubmitting: boolean;
}) {
  const [comment, setComment] = useState('');
  const [mentionSuggestions, setMentionSuggestions] = useState<{ id: string; username: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setComment(val);
    const atIndex = val.lastIndexOf('@');
    if (atIndex !== -1) {
      const after = val.slice(atIndex + 1);
      if (after === '' || /^\w+$/.test(after)) {
        const filtered = members.filter(m => m.username?.toLowerCase().startsWith(after.toLowerCase()));
        setMentionSuggestions(filtered.map(m => ({ id: m.id, username: m.username ?? '' })));
        setShowSuggestions(filtered.length > 0);
        return;
      }
    }
    setShowSuggestions(false);
  };

  const insertMention = (username: string) => {
    const atIndex = comment.lastIndexOf('@');
    setComment(comment.slice(0, atIndex) + `@${username} `);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  const handleSend = () => {
    if (comment.trim() && !isSubmitting) { onAddComment(comment.trim()); setComment(''); }
  };

  const timeline = [
    ...activity.map((a: any) => ({ type: 'log' as const, data: a, date: a.created_at })),
    ...comments.map((c: any) => ({ type: 'comment' as const, data: c, date: c.created_at })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const actionLabel: Record<string, string> = { create: 'criou', update: 'atualizou', delete: 'deletou' };

  return (
    <div className="space-y-4">
      <div className="relative">
        {showSuggestions && (
          <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
            {mentionSuggestions.map(s => (
              <button key={s.id} onMouseDown={e => { e.preventDefault(); insertMention(s.username); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-gray-700">
                @{s.username}
              </button>
            ))}
          </div>
        )}
        <textarea
          ref={textareaRef}
          value={comment}
          onChange={handleChange}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !showSuggestions) { e.preventDefault(); handleSend(); } }}
          placeholder="Escreva um comentário... (@ para mencionar, Enter para enviar)"
          rows={3}
          className="w-full text-sm border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#07477c]/30 focus:border-[#07477c]"
        />
        <button
          onClick={handleSend}
          disabled={!comment.trim() || isSubmitting}
          className="mt-2 px-4 py-1.5 bg-[#07477c] text-white text-sm rounded-lg disabled:opacity-50 hover:bg-[#07477c]/90"
        >
          Enviar
        </button>
      </div>

      <div className="space-y-3 pt-2 border-t border-gray-100">
        {timeline.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Nenhuma atividade ainda</p>}
        {timeline.map((item, i) => {
          const profile = item.data.profiles;
          const username = profile?.username ?? 'Usuário';
          const ago = formatDistanceToNow(new Date(item.date), { addSuffix: true, locale: ptBR });

          if (item.type === 'log') {
            return (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500 shrink-0">
                  {username[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-800">{username}</span>{' '}
                    {actionLabel[item.data.action] ?? item.data.action} esta tarefa
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{ago}</p>
                </div>
              </div>
            );
          }

          return (
            <div key={i} className="flex gap-3 items-start">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} className="w-6 h-6 rounded-full object-cover shrink-0" alt="" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#07477c]/10 flex items-center justify-center text-xs font-medium text-[#07477c] shrink-0">
                  {username[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-700 mb-1">
                  {username} <span className="font-normal text-gray-400">{ago}</span>
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.data.content}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
