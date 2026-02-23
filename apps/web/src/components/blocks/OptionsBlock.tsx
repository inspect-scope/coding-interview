'use client';

import { Block, OptionsBlockSettings } from '@scope/shared';
import { cn } from '@/lib/utils';

interface OptionsBlockProps {
  block: Block;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  errors: string[];
  onValidate: (errors: string[]) => void;
}

export function OptionsBlock({
  block,
  value,
  onChange,
  errors,
  onValidate,
}: OptionsBlockProps) {
  const settings = block.settings as OptionsBlockSettings;

  const validate = (val: string | string[]) => {
    const errs: string[] = [];
    if (settings.required) {
      if (
        !val ||
        (Array.isArray(val) && val.length === 0) ||
        val === ''
      ) {
        errs.push('Please select an option');
      }
    }
    onValidate(errs);
  };

  if (settings.allowMultiple) {
    const selectedValues = Array.isArray(value) ? value : [];
    return (
      <div className="mb-4">
        <label className="text-sm font-medium leading-none block mb-1.5">
          {block.label}
          {settings.required && (
            <span className="text-destructive ml-1">*</span>
          )}
        </label>
        <div className="space-y-2 rounded-md border border-input bg-background p-3">
          {settings.options.map((option) => (
            <label key={option} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedValues.includes(option)}
                onChange={(e) => {
                  const newValues = e.target.checked
                    ? [...selectedValues, option]
                    : selectedValues.filter((v) => v !== option);
                  onChange(newValues);
                  validate(newValues);
                }}
                className="rounded border-input"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
        {errors.map((err, i) => (
          <p key={i} className="text-sm text-destructive mt-1">
            {err}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-4">
      <label className="text-sm font-medium leading-none block mb-1.5">
        {block.label}
        {settings.required && (
          <span className="text-destructive ml-1">*</span>
        )}
      </label>
      <select
        value={(value as string) || ''}
        onChange={(e) => {
          onChange(e.target.value);
          validate(e.target.value);
        }}
        className={cn(
          'flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          errors.length > 0 ? 'border-destructive' : 'border-input',
        )}
      >
        <option value="">Select an option...</option>
        {settings.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {errors.map((err, i) => (
        <p key={i} className="text-sm text-destructive mt-1">
          {err}
        </p>
      ))}
    </div>
  );
}
