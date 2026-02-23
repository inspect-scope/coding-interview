export type BlockType = 'text' | 'options' | 'number' | 'unit';

export interface TextBlockSettings {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  placeholder?: string;
}

export interface OptionsBlockSettings {
  required?: boolean;
  options: string[];
  allowMultiple?: boolean;
}

export interface NumberBlockSettings {
  required?: boolean;
  maxDecimalPlaces?: number;
}

export interface UnitBlockSettings {
  required?: boolean;
  units: string[];
  defaultUnit?: string;
}

export type BlockSettings =
  | TextBlockSettings
  | OptionsBlockSettings
  | NumberBlockSettings
  | UnitBlockSettings;

export interface Block {
  id: string;
  type: BlockType;
  label: string;
  settings: BlockSettings;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  blocks: Block[];
  createdAt: string;
  updatedAt: string;
}

export interface UnitValue {
  value: string;
  unit: string;
}

export interface ReportValues {
  [blockId: string]: string | string[] | UnitValue;
}

export interface Report {
  id: string;
  templateId: string;
  templateName: string;
  values: ReportValues;
  createdAt: string;
}

export interface ValidationError {
  blockId: string;
  message: string;
}
