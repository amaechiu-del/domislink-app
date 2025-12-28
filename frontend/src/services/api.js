const API_URL = import.meta.env.VITE_API_URL || ''

export async function getLinks() {
  const response = await fetch(`${API_URL}/api/links`)
  if (!response.ok) {
    throw new Error('Failed to fetch links')
  }
  return response.json()
}

export async function createLink(linkData) {
  const response = await fetch(`${API_URL}/api/links`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(linkData)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create link')
  }

  return response.json()
}

export async function deleteLink(id) {
  const response = await fetch(`${API_URL}/api/links/${id}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    throw new Error('Failed to delete link')
  }

  return response.json()
}

export async function getLinkStats(id) {
  const response = await fetch(`${API_URL}/api/links/${id}/stats`)
  if (!response.ok) {
    throw new Error('Failed to fetch statistics')
  }
  return response.json()
}
