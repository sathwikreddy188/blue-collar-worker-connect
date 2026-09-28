import { createContext, useContext, useEffect, useState } from 'react';
import { api, session } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(session.user);

  // api.js fires this event when the server rejects our token (expired/invalid)
  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener('bcwc-logout', onLogout);
    return () => window.removeEventListener('bcwc-logout', onLogout);
  }, []);

  async function login(email, password) {
    const { access_token, user: u } = await api.login(email, password);
    session.save(access_token, u);
    setUser(u);
    return u;
  }

  async function register(payload) {
    const { access_token, user: u } = await api.register(payload);
    session.save(access_token, u);
    setUser(u);
    return u;
  }

  function logout() {
    session.clear();
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
