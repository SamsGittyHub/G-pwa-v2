import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GlassCard } from '@/components/ui/glass-card';
import { ChevronLeft, Server, Key, User, Save, Check, Brain, Plus, Trash2, Palette, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { THEME_PRESETS } from '@/lib/themes';

const Settings = () => {
  const navigate = useNavigate();
  const { aiConfig, setAIConfig, aiModels, addAIModel, deleteAIModel, themeConfig, setThemeConfig } = useChat();
  const { user, logout } = useAuth();
  
  const [endpoint, setEndpoint] = useState(aiConfig.endpoint);
  const [apiKey, setApiKey] = useState(aiConfig.apiKey);
  const [modelName, setModelName] = useState(aiConfig.modelName);
  const [masterPrompt, setMasterPrompt] = useState(aiConfig.masterPrompt || '');
  const [saved, setSaved] = useState(false);

  // New model form
  const [showNewModel, setShowNewModel] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [newModelEndpoint, setNewModelEndpoint] = useState('');
  const [newModelApiKey, setNewModelApiKey] = useState('');

  useEffect(() => {
    setEndpoint(aiConfig.endpoint);
    setApiKey(aiConfig.apiKey);
    setModelName(aiConfig.modelName);
    setMasterPrompt(aiConfig.masterPrompt || '');
  }, [aiConfig]);

  const handleSave = () => {
    setAIConfig({
      endpoint: endpoint.trim(),
      apiKey: apiKey.trim(),
      modelName: modelName.trim() || 'Genius',
      masterPrompt: masterPrompt.trim(),
    });
    setSaved(true);
    toast.success('Settings saved');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddModel = () => {
    if (newModelName.trim()) {
      addAIModel({
        name: newModelName.trim(),
        endpoint: newModelEndpoint.trim(),
        apiKey: newModelApiKey.trim(),
      });
      setNewModelName('');
      setNewModelEndpoint('');
      setNewModelApiKey('');
      setShowNewModel(false);
      toast.success('Model added');
    }
  };

  const applyPreset = (preset: typeof THEME_PRESETS[0]) => {
    setThemeConfig(preset);
    toast.success(`${preset.name} theme applied`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-2xl border-b border-border/50">
        <div className="px-2 py-3 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Account Section */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">Account</h2>
          <GlassCard variant="solid" className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{user?.username || user?.email?.split('@')[0] || 'User'}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Theme Section */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">Theme</h2>
          <GlassCard variant="solid" className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Palette className="h-4 w-4 text-muted-foreground" />
                Color Presets
              </label>
              <div className="grid grid-cols-3 gap-2">
                {THEME_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className={`p-3 rounded-xl border transition-all ${
                      themeConfig.name === preset.name 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'border-border/50 hover:border-primary/50'
                    }`}
                    style={{ backgroundColor: `hsl(${preset.background})` }}
                  >
                    <div 
                      className="w-full h-2 rounded-full mb-2"
                      style={{ backgroundColor: `hsl(${preset.primary})` }}
                    />
                    <p className="text-xs" style={{ color: `hsl(${preset.foreground})` }}>
                      {preset.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Master Prompt Section */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">Master Prompt</h2>
          <GlassCard variant="solid" className="p-4 space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Global instructions that apply to all conversations..."
                value={masterPrompt}
                onChange={(e) => setMasterPrompt(e.target.value)}
                className="min-h-[120px] rounded-xl resize-none bg-background/50"
              />
              <p className="text-xs text-muted-foreground">
                This prompt is applied to every conversation across all projects and chats.
              </p>
            </div>
          </GlassCard>
        </section>

        {/* AI Models Section */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-sm font-medium text-muted-foreground">AI Models</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNewModel(!showNewModel)}
              className="h-7 px-2 text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Model
            </Button>
          </div>

          {showNewModel && (
            <GlassCard variant="frosted" className="p-4 space-y-3 mb-3">
              <Input
                placeholder="Model Name"
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
                className="h-10 rounded-xl bg-background/50"
              />
              <Input
                placeholder="API Endpoint"
                value={newModelEndpoint}
                onChange={(e) => setNewModelEndpoint(e.target.value)}
                className="h-10 rounded-xl bg-background/50"
              />
              <Input
                type="password"
                placeholder="API Key (optional)"
                value={newModelApiKey}
                onChange={(e) => setNewModelApiKey(e.target.value)}
                className="h-10 rounded-xl bg-background/50"
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowNewModel(false)} className="flex-1 rounded-xl">
                  Cancel
                </Button>
                <Button onClick={handleAddModel} className="flex-1 rounded-xl" disabled={!newModelName.trim()}>
                  Add
                </Button>
              </div>
            </GlassCard>
          )}

          <div className="space-y-2">
            {aiModels.map((model) => (
              <GlassCard key={model.id} variant="solid" className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Brain className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{model.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {model.endpoint || 'Default endpoint'}
                      </p>
                    </div>
                  </div>
                  {model.id !== 'default' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteAIModel(model.id)}
                      className="rounded-full text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Default AI Configuration Section */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">Default AI Configuration</h2>
          <GlassCard variant="solid" className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Server className="h-4 w-4 text-muted-foreground" />
                API Endpoint
              </label>
              <Input
                type="url"
                placeholder="http://localhost:8000/v1/chat/completions"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="h-12 rounded-xl bg-background/50"
              />
              <p className="text-xs text-muted-foreground">
                Your custom AI model endpoint (OpenAI compatible)
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Key className="h-4 w-4 text-muted-foreground" />
                API Key
              </label>
              <Input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="h-12 rounded-xl bg-background/50"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Required if your model needs authentication
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Model Name
              </label>
              <Input
                type="text"
                placeholder="Genius"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="h-12 rounded-xl bg-background/50"
              />
            </div>

            <Button
              onClick={handleSave}
              className="w-full h-12 rounded-xl"
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </>
              )}
            </Button>
          </GlassCard>
        </section>

        {/* Info Section */}
        <section>
          <GlassCard variant="frosted" className="p-4">
            <h3 className="font-medium text-foreground mb-2">About Custom AI Models</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Connect your own AI model running locally or in the cloud. Your endpoint should be OpenAI API compatible. Example: if running LM Studio, Ollama, or vLLM locally, use their respective API endpoints.
            </p>
          </GlassCard>
        </section>

        {/* Logout Section */}
        <section>
          <Button
            variant="destructive"
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            className="w-full h-12 rounded-xl"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>
        </section>

        <p className="text-center text-xs text-muted-foreground pt-4">
          TripleG Genius v1.0.0
        </p>
      </main>
    </div>
  );
};

export default Settings;