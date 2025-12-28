import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export function useLinks() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLinks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getLinks();
      setLinks(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const addLink = async (link) => {
    const response = await api.createLink(link);
    setLinks((prev) => [response.data, ...prev]);
    return response.data;
  };

  const removeLink = async (id) => {
    await api.deleteLink(id);
    setLinks((prev) => prev.filter((link) => link.id !== id));
  };

  const trackClick = async (id) => {
    const response = await api.trackClick(id);
    setLinks((prev) =>
      prev.map((link) => (link.id === id ? response.data : link))
    );
  };

  return {
    links,
    loading,
    error,
    fetchLinks,
    addLink,
    removeLink,
    trackClick
  };
}
