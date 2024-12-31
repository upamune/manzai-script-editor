import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

interface TitleEditorProps {
  title: string;
  onUpdate: (title: string) => void;
}

export function TitleEditor({ title, onUpdate }: TitleEditorProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);

  useEffect(() => {
    setValue(title);
  }, [title]);

  const handleBlur = () => {
    setEditing(false);
    if (value.trim() !== title) {
      onUpdate(value.trim() || '無題の台本');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === 'Escape') {
      setEditing(false);
      setValue(title);
    }
  };

  if (!editing) {
    return (
      <h1
        className="text-2xl font-bold cursor-pointer p-2"
        onClick={() => setEditing(true)}
      >
        {title}
      </h1>
    );
  }

  return (
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="text-2xl font-bold w-auto"
      autoFocus
    />
  );
}
