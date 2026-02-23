'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Template } from '@scope/shared';
import { getTemplates, createTemplate, deleteTemplate } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTemplates().then((data) => {
      setTemplates(data);
      setLoading(false);
    });
  }, []);

  const handleCreate = async () => {
    const template = await createTemplate({
      name: 'New Template',
      description: '',
    });
    router.push(`/templates/${template.id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    await deleteTemplate(id);
    setTemplates(templates.filter((t) => t.id !== id));
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">Loading...</div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
        <button
          onClick={handleCreate}
          className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md text-sm font-medium"
        >
          Create Template
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground rounded-lg border border-dashed bg-card">
          No templates yet. Create one to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="rounded-lg border bg-card text-card-foreground shadow-sm p-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold leading-none tracking-tight">
                    {template.name}
                  </h2>
                  {template.description && (
                    <p className="text-sm text-muted-foreground mt-1.5">
                      {template.description}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    {template.blocks.length} block
                    {template.blocks.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      router.push(`/templates/${template.id}/edit`)
                    }
                    className="border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 rounded-md text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      router.push(`/templates/${template.id}/fill`)
                    }
                    className="bg-green-600 text-white hover:bg-green-700 h-9 px-3 rounded-md text-sm font-medium"
                  >
                    Fill & Generate
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="border border-input text-destructive hover:bg-destructive hover:text-destructive-foreground h-9 px-3 rounded-md text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
