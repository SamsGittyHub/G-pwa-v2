import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { ConversationItem } from '@/components/chat/ConversationItem';
import { ProjectItem } from '@/components/chat/ProjectItem';
import { ProjectDialog } from '@/components/dialogs/ProjectDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Settings, LogOut, FolderPlus, Sparkles } from 'lucide-react';
import { Project } from '@/types/chat';
import logo from '@/assets/logo.png';

const Home = () => {
  const { user, logout } = useAuth();
  const { 
    conversations, 
    projects,
    createConversation, 
    selectConversation, 
    deleteConversation,
    createProject,
    updateProject,
    deleteProject,
  } = useChat();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Filter standalone conversations (not in any project)
  const standaloneConversations = conversations.filter(conv => 
    !conv.projectId &&
    (conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.preview.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filter projects
  const filteredProjects = projects.filter(proj =>
    proj.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewChat = async (projectId?: string) => {
    await createConversation(projectId);
    navigate('/chat');
  };

  const handleSelectChat = async (id: string) => {
    await selectConversation(id);
    navigate('/chat');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCreateProject = (name: string, primaryPrompt: string) => {
    createProject(name, primaryPrompt);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectDialogOpen(true);
  };

  const handleSaveProject = (name: string, primaryPrompt: string) => {
    if (editingProject) {
      updateProject(editingProject.id, { name, primaryPrompt });
      setEditingProject(null);
    } else {
      createProject(name, primaryPrompt);
    }
  };

  const getProjectConversations = (projectId: string) => {
    return conversations.filter(conv => conv.projectId === projectId);
  };

  // Get display name from user
  const displayName = user?.username || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-2xl border-b border-border/50 safe-area-top">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="TripleG" className="w-10 h-10 rounded-xl" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Chats</h1>
              <p className="text-xs text-muted-foreground">{displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/settings')}
              className="rounded-full"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="rounded-full text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-accent/30 border-0 focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto px-4 py-2">
        {/* Projects Section */}
        {filteredProjects.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="text-sm font-medium text-muted-foreground">Projects</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setEditingProject(null); setProjectDialogOpen(true); }}
                className="h-7 px-2 text-xs"
              >
                <FolderPlus className="h-3.5 w-3.5 mr-1" />
                New
              </Button>
            </div>
            <div className="space-y-1">
              {filteredProjects.map((project) => (
                <ProjectItem
                  key={project.id}
                  project={project}
                  conversations={getProjectConversations(project.id)}
                  onSelectChat={handleSelectChat}
                  onDeleteChat={deleteConversation}
                  onNewChat={() => handleNewChat(project.id)}
                  onEditProject={() => handleEditProject(project)}
                  onDeleteProject={() => deleteProject(project.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Standalone Chats Section */}
        {(standaloneConversations.length > 0 || filteredProjects.length === 0) && (
          <div>
            {filteredProjects.length > 0 && (
              <h2 className="text-sm font-medium text-muted-foreground mb-2 px-1">Chats</h2>
            )}
            {standaloneConversations.length === 0 && filteredProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 rounded-2xl bg-accent/50 flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-1">No conversations yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Start a new chat with Genius</p>
                <div className="flex gap-2">
                  <Button onClick={() => handleNewChat()} className="rounded-xl">
                    <Plus className="h-4 w-4 mr-2" />
                    New Chat
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => { setEditingProject(null); setProjectDialogOpen(true); }}
                    className="rounded-xl"
                  >
                    <FolderPlus className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {standaloneConversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    onClick={() => handleSelectChat(conv.id)}
                    onDelete={() => deleteConversation(conv.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Action Buttons */}
      {(standaloneConversations.length > 0 || filteredProjects.length > 0) && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-3">
          <Button
            onClick={() => { setEditingProject(null); setProjectDialogOpen(true); }}
            variant="outline"
            className="w-12 h-12 rounded-full shadow-lg"
          >
            <FolderPlus className="h-5 w-5" />
          </Button>
          <Button
            onClick={() => handleNewChat()}
            className="w-14 h-14 rounded-full shadow-xl bg-primary hover:bg-primary/90"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Project Dialog */}
      <ProjectDialog
        open={projectDialogOpen}
        onOpenChange={(open) => {
          setProjectDialogOpen(open);
          if (!open) setEditingProject(null);
        }}
        project={editingProject}
        onSave={handleSaveProject}
      />
    </div>
  );
};

export default Home;
