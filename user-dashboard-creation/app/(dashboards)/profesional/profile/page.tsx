"use client"

import { ProfesionalHeader } from "@/components/profesional/profesional-header";
import { Profile } from "@/components/profesional/profile";
import { useAuth } from "@/lib/auth-context";

export default function ProfilePage({ }) {
  const { user, isLoading } = useAuth();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ProfesionalHeader userName={`${user?.name} ${user?.lastname}`} />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="flex w-full max-w-4xl justify-center">
          <Profile user={user}/>
        </div>
      </main>
    </div>
  );
}