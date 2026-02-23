const API_URL = 'http://localhost:3001';

export async function getTemplates() {
  const res = await fetch(`${API_URL}/templates`);
  if (!res.ok) throw new Error('Failed to fetch templates');
  return res.json();
}

export async function getTemplate(id: string) {
  const res = await fetch(`${API_URL}/templates/${id}`);
  if (!res.ok) throw new Error('Failed to fetch template');
  return res.json();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createTemplate(data: any) {
  const res = await fetch(`${API_URL}/templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create template');
  return res.json();
}

export async function updateTemplate(
  id: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
) {
  const res = await fetch(`${API_URL}/templates/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update template');
  return res.json();
}

export async function deleteTemplate(id: string) {
  const res = await fetch(`${API_URL}/templates/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete template');
  return res.json();
}

export async function generateReport(
  templateId: string,
  values: Record<string, unknown>,
) {
  const res = await fetch(`${API_URL}/templates/${templateId}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ values }),
  });

  const data = await res.json();

  if (!res.ok) {
    // Return validation errors from backend
    return { errors: data.errors || [{ message: 'Generation failed' }] };
  }

  return data;
}
