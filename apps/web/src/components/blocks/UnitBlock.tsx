'use client';

import { Block, UnitBlockSettings } from '@scope/shared';
import { cn } from '@/lib/utils';

interface UnitBlockProps {
  block: Block;
  value: { value: string; unit: string };
  onChange: (value: { value: string; unit: string }) => void;
  errors: string[];
  onValidate: (errors: string[]) => void;
}

export function UnitBlock({
  block,
  value,
  onChange,
  errors,
  onValidate,
}: UnitBlockProps) {
  const settings = block.settings as UnitBlockSettings;
  const currentValue = value || {
    value: '',
    unit: settings.defaultUnit || settings.units[0] || '',
  };

  const validate = (val: { value: string; unit: string }) => {
    const errs: string[] = [];
    if (settings.required) {
      if (!val.value || val.value.trim() === '') {
        errs.push('This field is required');
      }
      if (!val.unit) {
        errs.push('Please select a unit');
      }
    }
    if (val.value && val.value.trim() !== '') {
      const num = parseFloat(val.value);
      if (isNaN(num)) {
        errs.push('Please enter a valid number');
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
      <div className="flex gap-2">
        <input
          type="number"
          value={currentValue.value}
          onChange={(e) =>
            onChange({ ...currentValue, value: e.target.value })
          }
          onBlur={() => validate(currentValue)}
          className={cn(
            'flex h-10 flex-1 rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            errors.length > 0 ? 'border-destructive' : 'border-input',
          )}
        />
        <select
          value={currentValue.unit}
          onChange={(e) => {
            const newVal = { ...currentValue, unit: e.target.value };
            onChange(newVal);
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {settings.units.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
      </div>
      {errors.map((err, i) => (
        <p key={i} className="text-sm text-destructive mt-1">
          {err}
        </p>
      ))}
    </div>
  );
}
