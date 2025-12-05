"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface User {
  id: string;
  full_name: string;
  email: string;
  user_roles: { role: string; is_active: boolean }[];
}

interface UserManagementProps {
  users: User[];
}

export default function UserManagement({ users }: UserManagementProps) {
  const roleLabels: Record<string, string> = {
    admin: "Administrador",
    client: "Cliente",
    nutritionist: "Nutricionista",
    supplier: "Fornecedor",
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle>Usuários ({users.length})</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between border-b pb-4 last:border-0"
            >
              <div>
                <p className="font-medium">{user.full_name || "Sem nome"}</p>
                <p className="text-sm text-muted-foreground">{user.id}</p>
                <div className="flex gap-2 mt-2">
                  {user.user_roles?.map((role) => (
                    <Badge key={role.role} variant="secondary">
                      {roleLabels[role.role] || role.role}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

