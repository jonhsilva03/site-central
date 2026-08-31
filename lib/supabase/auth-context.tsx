'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from './client';

interface AuthUser {
  id: string;
  email: string;
  nome: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    nome: string
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

const DEMO_USER_KEY = 'central_phones_demo_auth';
const LOCAL_ADMINS_KEY = 'central_phones_local_admins';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkSession() {
      try {
        if (isSupabaseConfigured && supabase) {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user) {
            // Verificar se o usuário está na tabela admin_users
            const { data: adminData } = await supabase
              .from('admin_users')
              .select('id, nome, email')
              .eq('id', session.user.id)
              .maybeSingle();

            if (adminData) {
              setUser({
                id: adminData.id,
                email: adminData.email,
                nome: adminData.nome,
              });
              setIsAdmin(true);
            } else {
              // Usuário autenticado mas não cadastrado em admin_users
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                nome: 'Usuário',
              });
              setIsAdmin(false);
            }
          } else {
            setUser(null);
            setIsAdmin(false);
          }

          // Listener de mudanças de auth no Supabase
          const {
            data: { subscription },
          } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
              const { data: adminData } = await supabase!
                .from('admin_users')
                .select('id, nome, email')
                .eq('id', session.user.id)
                .maybeSingle();

              setUser({
                id: session.user.id,
                email: session.user.email || '',
                nome: adminData?.nome || 'Administrador',
              });
              setIsAdmin(Boolean(adminData));
            } else {
              setUser(null);
              setIsAdmin(false);
            }
          });

          setLoading(false);
          return () => subscription.unsubscribe();
        } else {
          // Modo local/demonstração
          const savedDemo = localStorage.getItem(DEMO_USER_KEY);
          if (savedDemo) {
            const parsed = JSON.parse(savedDemo);
            setUser(parsed);
            setIsAdmin(true);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Error checking auth session', err);
        setLoading(false);
      }
    }

    checkSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('id, nome, email')
          .eq('id', data.user.id)
          .maybeSingle();

        if (!adminData) {
          await supabase.auth.signOut();
          return {
            error:
              'Acesso restrito: este e-mail não possui permissão de administrador na Central Phones.',
          };
        }

        setUser({
          id: adminData.id,
          email: adminData.email,
          nome: adminData.nome,
        });
        setIsAdmin(true);
        return { error: null };
      }
    }

    // Modo Demonstração / Fallback
    if (password.length >= 6) {
      // Verificar se existe nos administradores locais
      let adminNome = 'Administrador Central Phones';
      try {
        const localAdmins = JSON.parse(localStorage.getItem(LOCAL_ADMINS_KEY) || '[]');
        const found = localAdmins.find((a: { email: string; nome: string }) => a.email.toLowerCase() === email.toLowerCase());
        if (found) {
          adminNome = found.nome;
        }
      } catch (e) {
        console.error(e);
      }

      const demoUser: AuthUser = {
        id: `admin-${Date.now()}`,
        email,
        nome: adminNome,
      };
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
      setUser(demoUser);
      setIsAdmin(true);
      return { error: null };
    }

    return { error: 'Senha incorreta. (Mínimo de 6 caracteres)' };
  };

  const signUp = async (email: string, password: string, nome: string) => {
    if (!email || !password || !nome) {
      return { error: 'Preencha nome, e-mail e senha.' };
    }
    if (password.length < 6) {
      return { error: 'A senha deve ter no mínimo 6 caracteres.' };
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { nome },
          },
        });

        if (error) {
          return { error: error.message };
        }

        if (data.user) {
          // Inserir registro na tabela admin_users para autorização RLS
          const { error: adminErr } = await supabase.from('admin_users').upsert({
            id: data.user.id,
            email,
            nome,
            created_at: new Date().toISOString(),
          });

          if (adminErr) {
            console.error('Erro ao registrar admin_users:', adminErr);
          }

          setUser({
            id: data.user.id,
            email,
            nome,
          });
          setIsAdmin(true);
          return { error: null };
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erro ao criar conta.';
        return { error: msg };
      }
    }

    // Modo local / Fallback
    try {
      const localAdmins = JSON.parse(localStorage.getItem(LOCAL_ADMINS_KEY) || '[]');
      const newAdmin = {
        id: `admin-${Date.now()}`,
        email,
        nome,
        created_at: new Date().toISOString(),
      };
      localAdmins.push(newAdmin);
      localStorage.setItem(LOCAL_ADMINS_KEY, JSON.stringify(localAdmins));

      const authUser: AuthUser = {
        id: newAdmin.id,
        email,
        nome,
      };
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(authUser));
      setUser(authUser);
      setIsAdmin(true);
      return { error: null };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro ao salvar novo administrador.';
      return { error: msg };
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(DEMO_USER_KEY);
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, isAdmin, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
