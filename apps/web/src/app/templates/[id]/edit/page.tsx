'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Template,
  Block,
  BlockType,
  TextBlockSettings,
  NumberBlockSettings,
  OptionsBlockSettings,
  UnitBlockSettings,
} from '@scope/shared';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { getTemplate, updateTemplate } from '@/lib/api';
import { cn } from '@/lib/utils';
import { BlockCard } from '@/components/BlockCard';

export default function EditTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  useEffect(() => {
    getTemplate(params.id as string).then((t) => {
      setTemplate(t);
      setLoading(false);
    });
  }, [params.id]);

  const selectedBlock = template?.blocks.find(
    (b) => b.id === selectedBlockId,
  );

  const addBlock = (type: BlockType) => {
    if (!template) return;
    const id = `block-${Date.now()}`;
    let settings: any = {};

    if (type === 'text') {
      settings = {
        required: false,
        minLength: undefined,
        maxLength: undefined,
        placeholder: '',
      };
    } else if (type === 'number') {
      settings = { required: false, maxDecimalPlaces: undefined };
    } else if (type === 'options') {
      settings = {
        required: false,
        options: ['Option 1'],
        allowMultiple: false,
      };
    } else if (type === 'unit') {
      settings = { required: false, units: ['kg'], defaultUnit: 'kg' };
    }

    const block: Block = {
      id,
      type,
      label: `New ${type} block`,
      settings,
    };
    setTemplate({ ...template, blocks: [...template.blocks, block] });
    setSelectedBlockId(id);
  };

  const updateBlock = (blockId: string, updates: Partial<Block>) => {
    if (!template) return;
    setTemplate({
      ...template,
      blocks: template.blocks.map((b) =>
        b.id === blockId ? { ...b, ...updates } : b,
      ),
    });
  };

  const updateBlockSettings = (blockId: string, settingsUpdates: any) => {
    if (!template) return;
    setTemplate({
      ...template,
      blocks: template.blocks.map((b) =>
        b.id === blockId
          ? { ...b, settings: { ...b.settings, ...settingsUpdates } }
          : b,
      ),
    });
  };

  const removeBlock = (blockId: string) => {
    if (!template) return;
    if (selectedBlockId === blockId) setSelectedBlockId(null);
    setTemplate({
      ...template,
      blocks: template.blocks.filter((b) => b.id !== blockId),
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    if (!template) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = template.blocks.findIndex((b) => b.id === active.id);
    const newIndex = template.blocks.findIndex((b) => b.id === over.id);
    setTemplate({
      ...template,
      blocks: arrayMove(template.blocks, oldIndex, newIndex),
    });
  };

  const save = async () => {
    if (!template) return;
    setSaving(true);
    setSaved(false);
    await updateTemplate(template.id, template);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Render settings form for the selected block - intentionally inline and repetitive
  const renderBlockSettings = (block: Block) => {
    if (block.type === 'text') {
      const settings = block.settings as TextBlockSettings;
      return (
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.required || false}
              onChange={(e) =>
                updateBlockSettings(block.id, { required: e.target.checked })
              }
              className="rounded border-input"
            />
            <span className="text-sm">Required</span>
          </label>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">
              Placeholder
            </label>
            <input
              type="text"
              value={settings.placeholder || ''}
              onChange={(e) =>
                updateBlockSettings(block.id, { placeholder: e.target.value })
              }
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground block mb-1">
                Min Length
              </label>
              <input
                type="number"
                value={settings.minLength ?? ''}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    minLength: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1">
                Max Length
              </label>
              <input
                type="number"
                value={settings.maxLength ?? ''}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    maxLength: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              />
            </div>
          </div>
        </div>
      );
    }

    if (block.type === 'number') {
      const settings = block.settings as NumberBlockSettings;
      return (
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.required || false}
              onChange={(e) =>
                updateBlockSettings(block.id, { required: e.target.checked })
              }
              className="rounded border-input"
            />
            <span className="text-sm">Required</span>
          </label>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">
              Max Decimal Places
            </label>
            <input
              type="number"
              min="0"
              value={settings.maxDecimalPlaces ?? ''}
              onChange={(e) =>
                updateBlockSettings(block.id, {
                  maxDecimalPlaces: e.target.value
                    ? parseInt(e.target.value, 10)
                    : undefined,
                })
              }
              placeholder="No limit"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
            />
          </div>
        </div>
      );
    }

    if (block.type === 'options') {
      const settings = block.settings as OptionsBlockSettings;
      return (
        <div className="space-y-4">
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.required || false}
                onChange={(e) =>
                  updateBlockSettings(block.id, { required: e.target.checked })
                }
                className="rounded border-input"
              />
              <span className="text-sm">Required</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.allowMultiple || false}
                onChange={(e) =>
                  updateBlockSettings(block.id, {
                    allowMultiple: e.target.checked,
                  })
                }
                className="rounded border-input"
              />
              <span className="text-sm">Allow Multiple</span>
            </label>
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">
              Options
            </label>
            <div className="space-y-1.5">
              {settings.options.map((option, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...settings.options];
                      newOptions[idx] = e.target.value;
                      updateBlockSettings(block.id, { options: newOptions });
                    }}
                    className="flex h-9 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  />
                  <button
                    onClick={() => {
                      const newOptions = settings.options.filter(
                        (_, i) => i !== idx,
                      );
                      updateBlockSettings(block.id, { options: newOptions });
                    }}
                    className="text-destructive/60 hover:text-destructive text-sm px-2"
                  >
                    &#10005;
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() =>
                updateBlockSettings(block.id, {
                  options: [
                    ...settings.options,
                    `Option ${settings.options.length + 1}`,
                  ],
                })
              }
              className="text-primary hover:text-primary/80 text-sm mt-2"
            >
              + Add Option
            </button>
          </div>
        </div>
      );
    }

    if (block.type === 'unit') {
      const settings = block.settings as UnitBlockSettings;
      return (
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.required || false}
              onChange={(e) =>
                updateBlockSettings(block.id, { required: e.target.checked })
              }
              className="rounded border-input"
            />
            <span className="text-sm">Required</span>
          </label>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">
              Units
            </label>
            <div className="space-y-1.5">
              {settings.units.map((unit, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => {
                      const newUnits = [...settings.units];
                      newUnits[idx] = e.target.value;
                      updateBlockSettings(block.id, { units: newUnits });
                    }}
                    className="flex h-9 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  />
                  <button
                    onClick={() => {
                      const newUnits = settings.units.filter(
                        (_, i) => i !== idx,
                      );
                      updateBlockSettings(block.id, { units: newUnits });
                    }}
                    className="text-destructive/60 hover:text-destructive text-sm px-2"
                  >
                    &#10005;
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() =>
                updateBlockSettings(block.id, {
                  units: [...settings.units, 'unit'],
                })
              }
              className="text-primary hover:text-primary/80 text-sm mt-2"
            >
              + Add Unit
            </button>
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1">
              Default Unit
            </label>
            <select
              value={settings.defaultUnit || ''}
              onChange={(e) =>
                updateBlockSettings(block.id, { defaultUnit: e.target.value })
              }
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              <option value="">None</option>
              {settings.units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
        </div>
      );
    }

    return null;
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

  return (
    <div className="flex flex-col h-[calc(100vh-73px)] -my-8 -mx-6">
      {/* Header */}
      <div className="border-b bg-card px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            &larr; Back
          </button>
          <div className="h-4 w-px bg-border" />
          <h1 className="text-sm font-semibold">{template.name}</h1>
        </div>
        <div className="flex gap-2 items-center">
          {saved && <span className="text-sm text-green-600">Saved!</span>}
          <button
            onClick={save}
            disabled={saving}
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 rounded-md text-sm font-medium disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Main grid layout */}
      <div className="flex-1 grid grid-cols-12 gap-4 p-4 min-h-0 overflow-hidden">
        {/* Center panel - Canvas */}
        <div className="col-span-8 flex flex-col border rounded-lg bg-card overflow-hidden">
          {/* Template info header */}
          <div className="border-b px-4 py-3 bg-muted/50 shrink-0">
            <input
              type="text"
              value={template.name}
              onChange={(e) =>
                setTemplate({ ...template, name: e.target.value })
              }
              className="text-lg font-semibold bg-transparent border-none outline-none w-full placeholder:text-muted-foreground"
              placeholder="Template name"
            />
            <input
              type="text"
              value={template.description}
              onChange={(e) =>
                setTemplate({ ...template, description: e.target.value })
              }
              className="text-sm text-muted-foreground bg-transparent border-none outline-none w-full mt-1 placeholder:text-muted-foreground"
              placeholder="Add a description..."
            />
          </div>

          {/* Blocks canvas */}
          <div className="flex-1 overflow-y-auto p-4">
            {template.blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <div className="text-4xl mb-3">&#9634;</div>
                <p className="text-sm">No blocks yet</p>
                <p className="text-xs mt-1">
                  Add a block to get started
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis]}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={template.blocks.map((b) => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {template.blocks.map((block) => (
                      <BlockCard
                        key={block.id}
                        block={block}
                        isSelected={selectedBlockId === block.id}
                        onSelect={() => setSelectedBlockId(block.id)}
                        onRemove={() => removeBlock(block.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

        </div>

        {/* Right panel - Block Library + Properties */}
        <div className="col-span-4 flex flex-col border rounded-lg bg-card overflow-hidden">
          {/* Block Library */}
          <div className="border-b px-4 py-3 bg-muted/50 shrink-0">
            <h2 className="text-sm font-semibold">Block Library</h2>
          </div>
          <div className="px-4 py-3 border-b shrink-0">
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { type: 'text' as BlockType, label: 'Text', desc: 'Free text input', color: 'bg-emerald-100 text-emerald-700' },
                  { type: 'number' as BlockType, label: 'Number', desc: 'Numeric value', color: 'bg-blue-100 text-blue-700' },
                  { type: 'options' as BlockType, label: 'Options', desc: 'Select from list', color: 'bg-purple-100 text-purple-700' },
                  { type: 'unit' as BlockType, label: 'Unit', desc: 'Value with unit', color: 'bg-amber-100 text-amber-700' },
                ] as const
              ).map((item) => (
                <button
                  key={item.type}
                  onClick={() => addBlock(item.type)}
                  className="flex flex-col items-start p-2.5 border border-input rounded-md hover:bg-accent hover:border-muted-foreground/30 transition-colors text-left"
                >
                  <span
                    className={cn(
                      'text-xs font-medium px-1.5 py-0.5 rounded',
                      item.color,
                    )}
                  >
                    {item.label}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Properties / Settings */}
          <div className="flex-1 overflow-y-auto">
            {selectedBlock ? (
              <div>
                <div className="px-4 py-3 bg-muted/50 border-b">
                  <h2 className="text-sm font-semibold">Properties</h2>
                </div>
                <div className="p-4 space-y-4">
                  {/* Block label */}
                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">
                      Label
                    </label>
                    <input
                      type="text"
                      value={selectedBlock.label}
                      onChange={(e) =>
                        updateBlock(selectedBlock.id, {
                          label: e.target.value,
                        })
                      }
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                    />
                  </div>

                  {/* Block type */}
                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">
                      Type
                    </label>
                    <span className="inline-flex text-xs font-medium bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                      {selectedBlock.type}
                    </span>
                  </div>

                  {/* Settings */}
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-medium mb-3">Settings</h3>
                    {renderBlockSettings(selectedBlock)}
                  </div>

                  {/* Actions */}
                  <div className="border-t pt-4">
                    <button
                      onClick={() => removeBlock(selectedBlock.id)}
                      className="text-sm text-destructive hover:text-destructive/80"
                    >
                      Delete Block
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
                <p className="text-sm text-center">
                  Click a block to edit its settings, or add a new block from
                  the library above.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
