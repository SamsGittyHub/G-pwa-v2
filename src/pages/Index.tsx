import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles } from 'lucide-react';

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigate('/home');
      } else {
        navigate('/login');
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/20 to-background">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary/60 mb-6 shadow-xl animate-pulse">
          <Sparkles className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">TripleG Genius</h1>
        <p className="text-muted-foreground mt-2">Loading...</p>
      </div>
    </div>
  );
};

export default Index;
