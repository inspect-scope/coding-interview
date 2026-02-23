'use client';

import { Block } from '@scope/shared';
import { TextBlock } from './TextBlock';
import { NumberBlock } from './NumberBlock';
import { OptionsBlock } from './OptionsBlock';
import { UnitBlock } from './UnitBlock';

interface BlockRendererProps {
  block: Block;
  value: any;
  onChange: (value: any) => void;
  errors: string[];
  onValidate: (errors: string[]) => void;
}

export function BlockRenderer({
  block,
  value,
  onChange,
  errors,
  onValidate,
}: BlockRendererProps) {
  switch (block.type) {
    case 'text':
      return (
        <TextBlock
          block={block}
          value={value}
          onChange={onChange}
          errors={errors}
          onValidate={onValidate}
        />
      );
    case 'number':
      return (
        <NumberBlock
          block={block}
          value={value}
          onChange={onChange}
          errors={errors}
          onValidate={onValidate}
        />
      );
    case 'options':
      return (
        <OptionsBlock
          block={block}
          value={value}
          onChange={onChange}
          errors={errors}
          onValidate={onValidate}
        />
      );
    case 'unit':
      return (
        <UnitBlock
          block={block}
          value={value}
          onChange={onChange}
          errors={errors}
          onValidate={onValidate}
        />
      );
    default:
      return (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          Unknown block type: {block.type}
        </div>
      );
  }
}
