import { Lock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PurchaseDialog({ open, onOpenChange }: PurchaseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden">
        <div className="flex flex-col items-center text-center p-12 space-y-6">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-10 w-10 text-primary" />
          </div>
          
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-3xl font-bold">
              Purchase to Unlock
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              Get full access to all diagnostic features
            </DialogDescription>
          </DialogHeader>
        </div>
      </DialogContent>
    </Dialog>
  );
}
