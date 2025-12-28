import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchContent, deleteContent } from '../api'

function ContentList() {
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadContent()
  }, [])

  async function loadContent() {
    try {
      setLoading(true)
      const data = await fetchContent()
      setContent(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this content?')) return

    try {
      await deleteContent(id)
      setContent(content.filter(item => item.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <div className="card">Loading...</div>

  return (
    <div>
      <div className="card">
        <h2>Content Dashboard</h2>
        <p>Manage your content pages and posts.</p>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>All Content</h3>
          <Link to="/content/new" className="btn btn-primary">Add New</Link>
        </div>

        {content.length === 0 ? (
          <p>No content yet. Create your first page or post!</p>
        ) : (
          <ul className="content-list">
            {content.map(item => (
              <li key={item.id} className="content-item">
                <div className="content-info">
                  <h3>{item.title}</h3>
                  <p>
                    <span className={`status-badge status-${item.status}`}>
                      {item.status}
                    </span>
                    {' '} | {item.content_type} | /{item.slug}
                  </p>
                </div>
                <div className="actions">
                  <Link to={`/content/${item.id}`} className="btn btn-secondary">Edit</Link>
                  <button onClick={() => handleDelete(item.id)} className="btn btn-danger">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default ContentList
