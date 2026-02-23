import {
  Block,
  NumberBlockSettings,
  OptionsBlockSettings,
  TextBlockSettings,
  UnitBlockSettings,
  ValidationError,
} from '@scope/shared';

export function validateReport(
  blocks: Block[],
  values: Record<string, any>,
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const block of blocks) {
    const value = values[block.id];

    if (block.type === 'text') {
      const settings = block.settings as TextBlockSettings;

      if (settings.required && (!value || String(value).trim() === '')) {
        errors.push({
          blockId: block.id,
          message: `${block.label} is required`,
        });
      }

      if (
        value &&
        settings.minLength !== undefined &&
        String(value).length < settings.minLength
      ) {
        errors.push({
          blockId: block.id,
          message: `${block.label} must be at least ${settings.minLength} characters long`,
        });
      }

      if (
        value &&
        settings.maxLength !== undefined &&
        String(value).length > settings.maxLength
      ) {
        errors.push({
          blockId: block.id,
          message: `${block.label} must be no longer than ${settings.maxLength} characters`,
        });
      }
    }

    if (block.type === 'number') {
      const settings = block.settings as NumberBlockSettings;

      if (
        settings.required &&
        (value === undefined || value === null || value === '')
      ) {
        errors.push({
          blockId: block.id,
          message: `${block.label} is required`,
        });
      }

      if (value !== undefined && value !== null && value !== '') {
        const num = Number(value);
        if (isNaN(num)) {
          errors.push({
            blockId: block.id,
            message: `${block.label} must be a number`,
          });
        } else {
          if (settings.maxDecimalPlaces !== undefined) {
            const decimalPart = String(value).split('.')[1];
            if (decimalPart && decimalPart.length > settings.maxDecimalPlaces) {
              errors.push({
                blockId: block.id,
                message: `${block.label} must have no more than ${settings.maxDecimalPlaces} decimal places`,
              });
            }
          }
        }
      }
    }

    if (block.type === 'options') {
      const settings = block.settings as OptionsBlockSettings;

      if (settings.required) {
        if (!value || (Array.isArray(value) && value.length === 0)) {
          errors.push({
            blockId: block.id,
            message: `${block.label} is required`,
          });
        }
      }

      // Validate that selected options are valid
      if (value) {
        const selectedValues = Array.isArray(value) ? value : [value];
        for (const selected of selectedValues) {
          if (!settings.options.includes(selected)) {
            errors.push({
              blockId: block.id,
              message: `"${selected}" is not a valid option for ${block.label}`,
            });
          }
        }
      }
    }

    if (block.type === 'unit') {
      const settings = block.settings as UnitBlockSettings;

      if (settings.required) {
        if (
          !value ||
          !value.value ||
          String(value.value).trim() === ''
        ) {
          errors.push({
            blockId: block.id,
            message: `${block.label} value is required`,
          });
        }
        if (!value || !value.unit) {
          errors.push({
            blockId: block.id,
            message: `A unit must be selected for ${block.label}`,
          });
        }
      }

      if (value && value.value && String(value.value).trim() !== '') {
        const num = Number(value.value);
        if (isNaN(num)) {
          errors.push({
            blockId: block.id,
            message: `${block.label} must be a valid number`,
          });
        }
      }

      if (value && value.unit && !settings.units.includes(value.unit)) {
        errors.push({
          blockId: block.id,
          message: `"${value.unit}" is not a valid unit for ${block.label}`,
        });
      }
    }
  }

  return errors;
}
