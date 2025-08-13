import { ReactNode, useState } from 'react';

interface SimpleSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
}

export function SimpleSelect({ value, onValueChange, children }: SimpleSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <SimpleSelectTrigger onClick={() => setIsOpen(!isOpen)}>
        <SimpleSelectValue value={value} />
      </SimpleSelectTrigger>
      {isOpen && (
        <SimpleSelectContent onClose={() => setIsOpen(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            {children}
          </div>
        </SimpleSelectContent>
      )}
    </div>
  );
}

interface SimpleSelectTriggerProps {
  children: ReactNode;
  onClick: () => void;
}

export function SimpleSelectTrigger({ children, onClick }: SimpleSelectTriggerProps) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm hover:border-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
      onClick={onClick}
    >
      {children}
      <span className="text-slate-400">▼</span>
    </button>
  );
}

interface SimpleSelectValueProps {
  value: string;
}

export function SimpleSelectValue({ value }: SimpleSelectValueProps) {
  return (
    <span className="block truncate">
      {value || 'Select an option'}
    </span>
  );
}

interface SimpleSelectContentProps {
  children: ReactNode;
  onClose: () => void;
}

export function SimpleSelectContent({ children, onClose }: SimpleSelectContentProps) {
  return (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white border border-slate-300 shadow-lg">
        {children}
      </div>
    </>
  );
}

interface SimpleSelectItemProps {
  value: string;
  onSelect: (value: string) => void;
  children: ReactNode;
}

export function SimpleSelectItem({ value, onSelect, children }: SimpleSelectItemProps) {
  return (
    <button
      type="button"
      className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-100 focus:bg-slate-100"
      onClick={() => onSelect(value)}
    >
      {children}
    </button>
  );
}