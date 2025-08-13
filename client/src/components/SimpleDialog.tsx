import { ReactNode } from 'react';

interface SimpleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function SimpleDialog({ open, onOpenChange, children }: SimpleDialogProps) {
  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={() => onOpenChange(false)}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl max-h-[90vh] overflow-y-auto w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

interface SimpleDialogHeaderProps {
  children: ReactNode;
}

export function SimpleDialogHeader({ children }: SimpleDialogHeaderProps) {
  return (
    <div className="p-6 pb-4 border-b border-gray-200">
      {children}
    </div>
  );
}

interface SimpleDialogTitleProps {
  children: ReactNode;
}

export function SimpleDialogTitle({ children }: SimpleDialogTitleProps) {
  return (
    <h2 className="text-2xl font-bold text-slate-900">
      {children}
    </h2>
  );
}

interface SimpleDialogContentProps {
  children: ReactNode;
}

export function SimpleDialogContent({ children }: SimpleDialogContentProps) {
  return (
    <div className="p-6">
      {children}
    </div>
  );
}