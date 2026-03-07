import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { MainContent } from '@/components/MainContent';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSelectProject = (projectId: string | null) => {
    setSelectedProjectId(projectId);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-white relative">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          selectedProjectId={selectedProjectId}
          onSelectProject={handleSelectProject}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="flex items-center gap-2 p-3 border-b border-gray-200 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="p-2"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <img src="/favicon.icon.png" alt="Logo" className="w-6 h-6" />
          <span className="font-semibold text-gray-900">Task Manager</span>
        </div>

        <MainContent selectedProjectId={selectedProjectId} />
      </div>
    </div>
  );
}
