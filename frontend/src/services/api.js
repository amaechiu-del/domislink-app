const API_URL = import.meta.env.VITE_API_URL || '';

async function request(endpoint, options = {}) {
  const url = `${API_URL}/api${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const api = {
  getLinks: () => request('/links'),
  getLink: (id) => request(`/links/${id}`),
  createLink: (link) =>
    request('/links', {
      method: 'POST',
      body: JSON.stringify(link)
    }),
  updateLink: (id, link) =>
    request(`/links/${id}`, {
      method: 'PUT',
      body: JSON.stringify(link)
    }),
  deleteLink: (id) =>
    request(`/links/${id}`, {
      method: 'DELETE'
    }),
  trackClick: (id) =>
    request(`/links/${id}/click`, {
      method: 'POST'
    }),
  getHealth: () => request('/health')
};
