import { useState } from 'react';

export function LinkForm({ onSubmit }) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !url.trim()) {
      setError('Title and URL are required');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        title: title.trim(),
        url: url.trim(),
        short_code: shortCode.trim() || undefined
      });
      setTitle('');
      setUrl('');
      setShortCode('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="link-form" onSubmit={handleSubmit}>
      <h2>Add New Link</h2>

      {error && <div className="error">{error}</div>}

      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My Link"
        />
      </div>

      <div className="form-group">
        <label htmlFor="url">URL</label>
        <input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
        />
      </div>

      <div className="form-group">
        <label htmlFor="shortCode">Short Code (optional)</label>
        <input
          id="shortCode"
          type="text"
          value={shortCode}
          onChange={(e) => setShortCode(e.target.value)}
          placeholder="my-link"
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Adding...' : 'Add Link'}
      </button>
    </form>
  );
}
