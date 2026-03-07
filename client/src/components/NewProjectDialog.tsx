import { useApp } from '@/contexts/AppContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const colors = [
  '#FF6B35', '#FF8C42', '#FFA500', '#FFD700',
  '#4A90E2', '#357ABD', '#2E5C8A', '#1E3A5F',
  '#50C878', '#2ECC71', '#27AE60', '#1E8449',
  '#E74C3C', '#C0392B', '#A93226', '#922B21',
];

export function NewProjectDialog({ open, onOpenChange }: NewProjectDialogProps) {
  const { addProject } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  const handleCreate = () => {
    if (name.trim()) {
      addProject(name, description);
      setName('');
      setDescription('');
      setSelectedColor(colors[0]);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Projeto</DialogTitle>
          <DialogDescription>
            Crie um novo projeto para organizar suas tarefas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="projectName">Nome do Projeto</Label>
            <Input
              id="projectName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Website Redesign"
              className="mt-1"
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="projectDescription">Descrição (opcional)</Label>
            <Input
              id="projectDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes do projeto"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Cor do Projeto</Label>
            <div className="grid grid-cols-8 gap-2 mt-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-lg transition-transform ${
                    selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} className="bg-orange-600 hover:bg-orange-700">
            Criar Projeto
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
