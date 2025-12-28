import { useState } from 'react'

function LinkForm({ onSubmit }) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [customCode, setCustomCode] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!url.trim()) return

    setSubmitting(true)
    try {
      await onSubmit({
        original_url: url,
        title: title || undefined,
        custom_code: customCode || undefined
      })
      setUrl('')
      setTitle('')
      setCustomCode('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="url">URL to shorten *</label>
        <input
          type="url"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/very/long/url"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="title">Title (optional)</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My awesome link"
        />
      </div>

      <div className="form-group">
        <label htmlFor="customCode">Custom short code (optional)</label>
        <input
          type="text"
          id="customCode"
          value={customCode}
          onChange={(e) => setCustomCode(e.target.value)}
          placeholder="my-link"
          pattern="[a-zA-Z0-9-_]+"
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Creating...' : 'Shorten URL'}
      </button>
    </form>
  )
}

export default LinkForm
