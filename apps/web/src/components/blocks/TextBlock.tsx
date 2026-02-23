'use client';

import { Block, TextBlockSettings } from '@scope/shared';
import { cn } from '@/lib/utils';

interface TextBlockProps {
  block: Block;
  value: string;
  onChange: (value: string) => void;
  errors: string[];
  onValidate: (errors: string[]) => void;
}

export function TextBlock({
  block,
  value,
  onChange,
  errors,
  onValidate,
}: TextBlockProps) {
  const settings = block.settings as TextBlockSettings;

  const validate = (val: string) => {
    const errs: string[] = [];
    if (settings.required && (!val || val.trim() === '')) {
      errs.push('This field is required');
    }
    if (
      val &&
      settings.minLength !== undefined &&
      val.length < settings.minLength
    ) {
      errs.push(`Must be at least ${settings.minLength} characters`);
    }
    if (
      val &&
      settings.maxLength !== undefined &&
      val.length > settings.maxLength
    ) {
      errs.push(`Must be no more than ${settings.maxLength} characters`);
    }
    onValidate(errs);
  };

  return (
    <div className="mb-4">
      <label className="text-sm font-medium leading-none block mb-1.5">
        {block.label}
        {settings.required && (
          <span className="text-destructive ml-1">*</span>
        )}
      </label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => validate(value)}
        placeholder={settings.placeholder}
        className={cn(
          'flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          errors.length > 0 ? 'border-destructive' : 'border-input',
        )}
      />
      {errors.map((err, i) => (
        <p key={i} className="text-sm text-destructive mt-1">
          {err}
        </p>
      ))}
    </div>
  );
}
