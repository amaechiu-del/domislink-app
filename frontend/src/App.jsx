import { useState, useEffect } from 'react'
import LinkForm from './components/LinkForm'
import LinkList from './components/LinkList'
import { getLinks, createLink, deleteLink } from './services/api'

function App() {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    fetchLinks()
  }, [])

  const fetchLinks = async () => {
    try {
      setLoading(true)
      const data = await getLinks()
      setLinks(data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch links. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateLink = async (linkData) => {
    try {
      const newLink = await createLink(linkData)
      setLinks([newLink, ...links])
      setSuccess('Link created successfully!')
      setError(null)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message || 'Failed to create link')
      setSuccess(null)
    }
  }

  const handleDeleteLink = async (id) => {
    try {
      await deleteLink(id)
      setLinks(links.filter(link => link.id !== id))
      setSuccess('Link deleted successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to delete link')
    }
  }

  return (
    <div className="container">
      <header>
        <h1>DomisLink</h1>
        <p>Shorten your URLs and track clicks</p>
      </header>

      <div className="card">
        <LinkForm onSubmit={handleCreateLink} />
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Your Links</h2>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <LinkList links={links} onDelete={handleDeleteLink} />
        )}
      </div>
    </div>
  )
}

export default App
