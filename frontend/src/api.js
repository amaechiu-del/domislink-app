const API_BASE = import.meta.env.VITE_API_URL || '';

export async function fetchContent(filters = {}) {
  const params = new URLSearchParams(filters);
  const response = await fetch(`${API_BASE}/api/content?${params}`);
  if (!response.ok) throw new Error('Failed to fetch content');
  return response.json();
}

export async function fetchContentById(id) {
  const response = await fetch(`${API_BASE}/api/content/${id}`);
  if (!response.ok) throw new Error('Failed to fetch content');
  return response.json();
}

export async function createContent(data) {
  const response = await fetch(`${API_BASE}/api/content`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create content');
  }
  return response.json();
}

export async function updateContent(id, data) {
  const response = await fetch(`${API_BASE}/api/content/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update content');
  }
  return response.json();
}

export async function deleteContent(id) {
  const response = await fetch(`${API_BASE}/api/content/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete content');
  return response.json();
}
