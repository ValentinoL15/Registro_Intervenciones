import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, FileText } from "lucide-react";

export function ViewObs({ intervencion }: { intervencion: any }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2 text-primary hover:text-primary-foreground hover:bg-primary transition-all"
        >
          <Eye className="w-4 h-4" />
          <span className="font-medium">Ver</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-muted-foreground" />
            Observaciones de la Intervención
          </DialogTitle>
          <DialogDescription>
            Detalle registrado por el profesional para esta intervención.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 p-4 rounded-lg bg-muted/50 border text-sm leading-relaxed whitespace-pre-wrap">
          {intervencion.observaciones}
        </div>
      </DialogContent>
    </Dialog>
  );
}