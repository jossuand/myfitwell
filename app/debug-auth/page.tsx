"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DebugAuthPage() {
  const [sessionData, setSessionData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [rolesData, setRolesData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      try {
        // Obter sessão
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        setSessionData({ session, sessionError });

        // Obter usuário
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        setUserData({ user, userError });

        if (user) {
          // Obter perfil
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          setProfileData({ profile, profileError });

          // Obter roles
          const { data: roles, error: rolesError } = await supabase
            .from("user_roles")
            .select("*")
            .eq("user_id", user.id);

          setRolesData({ roles, rolesError });
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [supabase]);

  const handleTestLogin = async () => {
    const email = prompt("Digite seu email:");
    const password = prompt("Digite sua senha:");

    if (!email || !password) return;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(`Erro: ${error.message}`);
    } else {
      alert("Login realizado! Recarregue a página.");
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Debug - Autenticação (Cliente)</h1>
        <Button onClick={handleTestLogin}>Testar Login</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sessão (getSession)</CardTitle>
          <CardDescription>
            Dados da sessão atual no cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded overflow-auto text-xs max-h-96">
            {JSON.stringify(sessionData, null, 2)}
          </pre>
          {sessionData?.session ? (
            <p className="mt-2 text-sm text-green-600">✅ Sessão existe</p>
          ) : (
            <p className="mt-2 text-sm text-red-600">❌ Sessão não encontrada</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuário (getUser)</CardTitle>
          <CardDescription>
            Dados do usuário autenticado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded overflow-auto text-xs max-h-96">
            {JSON.stringify(userData, null, 2)}
          </pre>
          {userData?.user ? (
            <p className="mt-2 text-sm text-green-600">✅ Usuário autenticado</p>
          ) : (
            <p className="mt-2 text-sm text-red-600">❌ Usuário não autenticado</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>
            Dados do perfil na tabela profiles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded overflow-auto text-xs max-h-96">
            {JSON.stringify(profileData, null, 2)}
          </pre>
          {profileData?.profile ? (
            <p className="mt-2 text-sm text-green-600">✅ Perfil existe</p>
          ) : (
            <p className="mt-2 text-sm text-red-600">❌ Perfil não encontrado</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
          <CardDescription>
            Roles do usuário na tabela user_roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded overflow-auto text-xs max-h-96">
            {JSON.stringify(rolesData, null, 2)}
          </pre>
          {rolesData?.roles && rolesData.roles.length > 0 ? (
            <p className="mt-2 text-sm text-green-600">
              ✅ {rolesData.roles.length} role(s) encontrada(s)
            </p>
          ) : (
            <p className="mt-2 text-sm text-red-600">❌ Nenhuma role encontrada</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cookies</CardTitle>
          <CardDescription>
            Cookies relacionados ao Supabase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded overflow-auto text-xs max-h-96">
            {JSON.stringify(
              document.cookie
                .split("; ")
                .filter((c) => c.includes("supabase") || c.includes("sb-"))
                .reduce((acc, cookie) => {
                  const [name, value] = cookie.split("=");
                  acc[name] = value?.substring(0, 50) + "...";
                  return acc;
                }, {} as Record<string, string>),
              null,
              2
            )}
          </pre>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button
          onClick={() => {
            supabase.auth.signOut();
            window.location.reload();
          }}
          variant="outline"
        >
          Fazer Logout
        </Button>
        <Button onClick={() => window.location.reload()}>
          Recarregar Página
        </Button>
        <Button
          onClick={() => (window.location.href = "/dashboard")}
          variant="secondary"
        >
          Tentar Acessar Dashboard
        </Button>
      </div>
    </div>
  );
}

