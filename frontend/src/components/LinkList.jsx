export function LinkList({ links, loading, error, onDelete, onTrackClick }) {
  if (loading) {
    return <div className="loading">Loading links...</div>;
  }

  if (error) {
    return <div className="error">Error loading links: {error}</div>;
  }

  const handleLinkClick = (link) => {
    onTrackClick(link.id);
  };

  return (
    <div className="links-list">
      <h2>Your Links ({links.length})</h2>

      {links.length === 0 ? (
        <div className="empty-state">
          <p>No links yet. Add your first link above!</p>
        </div>
      ) : (
        links.map((link) => (
          <div key={link.id} className="link-item">
            <div className="link-info">
              <h3>{link.title}</h3>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleLinkClick(link)}
              >
                {link.url}
              </a>
              <div className="link-stats">
                {link.short_code && <span>Short: {link.short_code} | </span>}
                <span>Clicks: {link.clicks}</span>
              </div>
            </div>
            <div className="link-actions">
              <button
                className="btn btn-danger"
                onClick={() => onDelete(link.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
