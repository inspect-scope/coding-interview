'use client';

import { Block } from '@scope/shared';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface BlockCardProps {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

const blockTypeColors: Record<string, string> = {
  text: 'bg-emerald-100 text-emerald-700',
  number: 'bg-blue-100 text-blue-700',
  options: 'bg-purple-100 text-purple-700',
  unit: 'bg-amber-100 text-amber-700',
};

export function BlockCard({
  block,
  isSelected,
  onSelect,
  onRemove,
}: BlockCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        'group relative rounded-lg border bg-card p-4 transition-colors cursor-pointer',
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50'
          : 'border-border hover:border-muted-foreground/30',
        isDragging && 'opacity-50 shadow-lg',
      )}
    >
      <div className="flex items-center gap-3">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground/40 hover:text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="3" r="1.5" />
            <circle cx="11" cy="3" r="1.5" />
            <circle cx="5" cy="8" r="1.5" />
            <circle cx="11" cy="8" r="1.5" />
            <circle cx="5" cy="13" r="1.5" />
            <circle cx="11" cy="13" r="1.5" />
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-md',
                blockTypeColors[block.type] ||
                  'bg-secondary text-secondary-foreground',
              )}
            >
              {block.type}
            </span>
            <span className="text-sm font-medium truncate">{block.label}</span>
          </div>
          {block.settings.required && (
            <span className="text-xs text-muted-foreground mt-1 block">
              Required
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive/60 hover:text-destructive text-sm px-2 py-1"
        >
          &#10005;
        </button>
      </div>
    </div>
  );
}
