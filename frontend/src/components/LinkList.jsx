function LinkList({ links, onDelete }) {
  if (links.length === 0) {
    return (
      <div className="empty-state">
        <p>No links yet. Create your first short link above!</p>
      </div>
    )
  }

  const getShortUrl = (shortCode) => {
    const baseUrl = import.meta.env.VITE_API_URL || window.location.origin
    return `${baseUrl}/${shortCode}`
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <ul className="links-list">
      {links.map((link) => (
        <li key={link.id} className="link-item">
          <div className="link-info">
            <h3>{link.title || 'Untitled Link'}</h3>
            <a
              href={getShortUrl(link.short_code)}
              target="_blank"
              rel="noopener noreferrer"
              className="short-url"
              onClick={(e) => {
                e.preventDefault()
                copyToClipboard(getShortUrl(link.short_code))
                alert('Link copied to clipboard!')
              }}
            >
              {getShortUrl(link.short_code)}
            </a>
            <p className="original-url">{link.original_url}</p>
          </div>
          <div className="link-stats">
            <span className="clicks-badge">{link.clicks} clicks</span>
            <button
              className="btn btn-danger"
              onClick={() => onDelete(link.id)}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default LinkList
