import { useEffect } from 'react';
import { AppRouter } from './routes/AppRouter';
import { useAuthStore } from './store/authStore';
import { getMeApi } from './features/auth/api/authApi';

export function App() {
  const { setUser, logout } = useAuthStore();

  useEffect(() => {
    getMeApi()
      .then((user) => setUser(user))
      .catch(() => logout());
  }, [setUser, logout]);

  return <AppRouter />;
}

export default App;