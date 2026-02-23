'use client';

import { Block, NumberBlockSettings } from '@scope/shared';
import { cn } from '@/lib/utils';

interface NumberBlockProps {
  block: Block;
  value: string;
  onChange: (value: string) => void;
  errors: string[];
  onValidate: (errors: string[]) => void;
}

export function NumberBlock({
  block,
  value,
  onChange,
  errors,
  onValidate,
}: NumberBlockProps) {
  const settings = block.settings as NumberBlockSettings;

  const validate = (val: string) => {
    const errs: string[] = [];
    if (
      settings.required &&
      (val === undefined || val === null || val === '')
    ) {
      errs.push('This field is required');
    }
    if (val !== '' && val !== undefined && val !== null) {
      const num = parseFloat(val);
      if (isNaN(num)) {
        errs.push('Please enter a valid number');
      } else {
        if (settings.maxDecimalPlaces !== undefined) {
          const decimalPart = val.split('.')[1];
          if (decimalPart && decimalPart.length > settings.maxDecimalPlaces) {
            errs.push(
              `Must have no more than ${settings.maxDecimalPlaces} decimal places`,
            );
          }
        }
      }
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
        type="number"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => validate(value)}
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
