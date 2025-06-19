import { useState, useEffect } from 'react';

export default function AddTrackerForm({ onAddTracker, trackers, editInitial, isEditing, onCancelEdit }) {
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [jsonPath, setJsonPath] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editInitial) {
      setDescription(editInitial.description || '');
      setUrl(editInitial.url || '');
      setJsonPath(editInitial.jsonPath || '');
      setError('');
    } else {
      setDescription('');
      setUrl('');
      setJsonPath('');
      setError('');
    }
  }, [editInitial]);

  const isDuplicate = (desc, apiUrl) => {
    return trackers.some(
      t => t.description.trim().toLowerCase() === desc.trim().toLowerCase() ||
           t.url.trim() === apiUrl.trim()
    );
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim() || !url.trim() || !jsonPath.trim()) {
      setError('All fields are required.');
      return;
    }
    if (!isValidUrl(url)) {
      setError('Please enter a valid URL.');
      return;
    }
    if (!isEditing && isDuplicate(description, url)) {
      setError('Duplicate description or URL.');
      return;
    }
    onAddTracker({ description, url, jsonPath });
    if (!isEditing) {
      setDescription('');
      setUrl('');
      setJsonPath('');
      setError('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        required
        style={{ marginRight: 8 }}
      />
      <input
        type="url"
        placeholder="API URL"
        value={url}
        onChange={e => setUrl(e.target.value)}
        required
        style={{ marginRight: 8 }}
      />
      <input
        type="text"
        placeholder="JSON path (e.g. data.INR)"
        value={jsonPath}
        onChange={e => setJsonPath(e.target.value)}
        required
        style={{ marginRight: 8 }}
      />
      {isEditing ? (
        <>
          <button type="submit">Save</button>
          <button type="button" onClick={onCancelEdit} style={{ marginLeft: 8 }}>Cancel</button>
        </>
      ) : (
        <button type="submit">Add Tracker</button>
      )}
      <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
        Example: For USD to INR, path is <code>data.INR</code>
      </div>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </form>
  );
} 