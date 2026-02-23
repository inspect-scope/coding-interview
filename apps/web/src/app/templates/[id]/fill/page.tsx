'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Template,
  Block,
  TextBlockSettings,
  NumberBlockSettings,
  OptionsBlockSettings,
  UnitBlockSettings,
  Report,
} from '@scope/shared';
import { getTemplate, generateReport } from '@/lib/api';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';

export default function FillTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const [template, setTemplate] = useState<Template | null>(null);
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [serverErrors, setServerErrors] = useState<
    { blockId: string; message: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTemplate(params.id as string).then((t) => {
      setTemplate(t);
      setLoading(false);
      // Set default values for unit blocks
      const defaults: Record<string, any> = {};
      t.blocks.forEach((block: Block) => {
        if (block.type === 'unit') {
          const settings = block.settings as UnitBlockSettings;
          defaults[block.id] = {
            value: '',
            unit: settings.defaultUnit || settings.units[0],
          };
        }
      });
      setValues(defaults);
    });
  }, [params.id]);

  // Client-side validation before sending to backend
  // NOTE: This duplicates validation from individual block components
  // and also duplicates what the backend does
  const validateAllBlocks = (): boolean => {
    if (!template) return false;
    let hasErrors = false;
    const newErrors: Record<string, string[]> = {};

    for (const block of template.blocks) {
      const value = values[block.id];
      const blockErrors: string[] = [];

      if (block.type === 'text') {
        const settings = block.settings as TextBlockSettings;
        if (settings.required && (!value || value.trim() === '')) {
          blockErrors.push('This field is required');
        }
        if (
          value &&
          settings.minLength !== undefined &&
          value.length < settings.minLength
        ) {
          blockErrors.push(
            `Must be at least ${settings.minLength} characters`,
          );
        }
        if (
          value &&
          settings.maxLength !== undefined &&
          value.length > settings.maxLength
        ) {
          blockErrors.push(
            `Must be no more than ${settings.maxLength} characters`,
          );
        }
      }

      if (block.type === 'number') {
        const settings = block.settings as NumberBlockSettings;
        if (
          settings.required &&
          (value === undefined || value === null || value === '')
        ) {
          blockErrors.push('This field is required');
        }
        if (value !== '' && value !== undefined && value !== null) {
          const num = parseFloat(value);
          if (isNaN(num)) {
            blockErrors.push('Please enter a valid number');
          } else {
            if (settings.maxDecimalPlaces !== undefined) {
              const decimalPart = String(value).split('.')[1];
              if (
                decimalPart &&
                decimalPart.length > settings.maxDecimalPlaces
              ) {
                blockErrors.push(
                  `Must have no more than ${settings.maxDecimalPlaces} decimal places`,
                );
              }
            }
          }
        }
      }

      if (block.type === 'options') {
        const settings = block.settings as OptionsBlockSettings;
        if (settings.required) {
          if (
            !value ||
            (Array.isArray(value) && value.length === 0) ||
            value === ''
          ) {
            blockErrors.push('Please select an option');
          }
        }
      }

      if (block.type === 'unit') {
        const settings = block.settings as UnitBlockSettings;
        const unitVal = value || { value: '', unit: '' };
        if (settings.required) {
          if (!unitVal.value || unitVal.value.trim() === '') {
            blockErrors.push('This field is required');
          }
          if (!unitVal.unit) {
            blockErrors.push('Please select a unit');
          }
        }
        if (unitVal.value && unitVal.value.trim() !== '') {
          const num = parseFloat(unitVal.value);
          if (isNaN(num)) {
            blockErrors.push('Please enter a valid number');
          }
        }
      }

      if (blockErrors.length > 0) hasErrors = true;
      newErrors[block.id] = blockErrors;
    }

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleGenerate = async () => {
    if (!validateAllBlocks()) return;

    setGenerating(true);
    setServerErrors([]);
    setReport(null);

    const result = await generateReport(params.id as string, values);

    setGenerating(false);

    if (result.errors) {
      setServerErrors(result.errors);
    } else {
      setReport(result.report);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">Loading...</div>
    );
  }

  if (!template) {
    return (
      <div className="text-center py-12 text-destructive">
        Template not found
      </div>
    );
  }

  // Show the generated report
  if (report) {
    return (
      <div>
        <button
          onClick={() => router.push('/')}
          className="text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          &larr; Back to Templates
        </button>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
          <div className="bg-primary text-primary-foreground px-8 py-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              Report Generated
            </h1>
            <p className="text-primary-foreground/70 text-sm mt-1">
              {report.templateName} &mdash;{' '}
              {new Date(report.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="px-8 py-6 space-y-4">
            {template.blocks.map((block) => {
              const value = report.values[block.id];
              let displayValue = '';

              if (block.type === 'text' || block.type === 'number') {
                displayValue = String(value || '\u2014');
              } else if (block.type === 'options') {
                displayValue = Array.isArray(value)
                  ? value.join(', ')
                  : String(value || '\u2014');
              } else if (block.type === 'unit') {
                const unitVal = value as { value: string; unit: string };
                displayValue = unitVal
                  ? `${unitVal.value} ${unitVal.unit}`
                  : '\u2014';
              }

              return (
                <div key={block.id} className="border-b pb-3">
                  <div className="text-sm text-muted-foreground">
                    {block.label}
                  </div>
                  <div className="text-lg font-medium">{displayValue}</div>
                </div>
              );
            })}
          </div>
          <div className="px-8 py-4 bg-muted text-sm text-muted-foreground">
            Report ID: {report.id}
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              setReport(null);
              // Reset values with unit defaults
              const defaults: Record<string, any> = {};
              template.blocks.forEach((block) => {
                if (block.type === 'unit') {
                  const settings = block.settings as UnitBlockSettings;
                  defaults[block.id] = {
                    value: '',
                    unit: settings.defaultUnit || settings.units[0],
                  };
                }
              });
              setValues(defaults);
              setErrors({});
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md text-sm font-medium"
          >
            Fill Again
          </button>
          <button
            onClick={() => router.push('/')}
            className="border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 rounded-md text-sm font-medium"
          >
            Back to Templates
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => router.push('/')}
        className="text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        &larr; Back to Templates
      </button>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">
          {template.name}
        </h1>
        {template.description && (
          <p className="text-sm text-muted-foreground">
            {template.description}
          </p>
        )}
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        {template.blocks.map((block) => (
          <BlockRenderer
            key={block.id}
            block={block}
            value={values[block.id]}
            onChange={(val) =>
              setValues((prev) => ({ ...prev, [block.id]: val }))
            }
            errors={errors[block.id] || []}
            onValidate={(errs) =>
              setErrors((prev) => ({ ...prev, [block.id]: errs }))
            }
          />
        ))}

        {serverErrors.length > 0 && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 mb-4">
            <h3 className="text-destructive font-medium mb-2">
              Server Validation Errors
            </h3>
            <ul className="list-disc list-inside text-sm text-destructive">
              {serverErrors.map((err, i) => (
                <li key={i}>{err.message}</li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full bg-green-600 text-white hover:bg-green-700 h-12 rounded-md text-sm font-medium disabled:opacity-50 mt-4"
        >
          {generating ? 'Generating...' : 'Generate Report'}
        </button>
      </div>
    </div>
  );
}
