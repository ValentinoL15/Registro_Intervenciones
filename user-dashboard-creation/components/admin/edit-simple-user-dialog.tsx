"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, UserCircle } from "lucide-react";
import { User } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onConfirm: (data: any) => Promise<void>;
}

export function EditSimpleUserDialog({ open, onOpenChange, user, onConfirm }: Props) {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [hourly, setHourly] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && user) {
      setName(user.name || "");
      setLastname(user.lastname || "");
      setHourly(user.hourly || "");
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirm({ name, lastname, hourly });
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
  <UserCircle className="w-5 h-5 text-blue-600" /> 
  Editar Perfil de {user?.role === "MANTENIMIENTO" ? "Personal de Mantenimiento" : "Cocinero"}
</DialogTitle>
          <DialogDescription>
            Actualiza los datos básicos de {user?.name} {user?.lastname}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastname">Apellido</Label>
            <Input id="lastname" value={lastname} onChange={(e) => setLastname(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hourly">Carga Horaria (hs)</Label>
            <Input id="hourly" type="number" value={hourly} onChange={(e) => setHourly(e.target.value)} required />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}