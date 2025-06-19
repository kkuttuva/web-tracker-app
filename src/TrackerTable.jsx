import { useEffect, useState } from 'react';

function Spinner() {
  return <span className="spinner" style={{ display: 'inline-block', width: 18, height: 18, border: '3px solid #ccc', borderTop: '3px solid #333', borderRadius: '50%', animation: 'spin 1s linear infinite', verticalAlign: 'middle' }} />;
}

// Helper to split path on dots, but keep quoted segments together
function parsePath(path) {
  const parts = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < path.length; i++) {
    const c = path[i];
    if (c === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (c === '.' && !inQuotes) {
      parts.push(current);
      current = '';
    } else {
      current += c;
    }
  }
  if (current) parts.push(current);
  return parts;
}

// Helper to extract value from JSON using dot/bracket path, supporting quoted keys
function getValueByPath(obj, path) {
  if (!path) return undefined;
  try {
    return parsePath(path).reduce((acc, part) => {
      if (acc === undefined || acc === null) return undefined;
      // Remove quotes if present
      part = part.replace(/^"|"$/g, '');
      // Dynamic key support
      if (part === '$first' && typeof acc === 'object' && acc !== null) {
        const keys = Object.keys(acc);
        if (keys.length === 0) return undefined;
        return acc[keys[0]];
      }
      if (part === '$last' && typeof acc === 'object' && acc !== null) {
        const keys = Object.keys(acc);
        if (keys.length === 0) return undefined;
        return acc[keys[keys.length - 1]];
      }
      // Support array index: result.0.price
      if (/^\d+$/.test(part)) return acc[parseInt(part, 10)];
      return acc[part];
    }, obj);
  } catch {
    return undefined;
  }
}

export default function TrackerTable({ trackers, onDelete, onEdit, onDuplicate, refreshKey }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const promises = trackers.map(async (tracker) => {
      try {
        const res = await fetch(tracker.url);
        let data;
        try {
          data = await res.json();
        } catch (jsonErr) {
          return { value: null, error: 'Invalid JSON', raw: null };
        }
        return { value: data, error: null, raw: data };
      } catch (e) {
        if (e.message.includes('Failed to fetch')) {
          return { value: null, error: 'Network or CORS error', raw: null };
        }
        return { value: null, error: e.message, raw: null };
      }
    });
    const values = await Promise.all(promises);
    setResults(values);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, [trackers, refreshKey]);

  return (
    <div style={{ overflowX: 'auto' }}>
      <table border="1" cellPadding="8" style={{ width: '100%', minWidth: 400, borderCollapse: 'collapse', fontSize: 15 }}>
        <thead style={{ background: '#f0f0f0' }}>
          <tr>
            <th>Description</th>
            <th>API URL</th>
            <th>JSON Path</th>
            <th>Value</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {trackers.map((tracker, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
              <td>{tracker.description}</td>
              <td>{(() => {
                try {
                  const u = new URL(tracker.url);
                  return <span title={tracker.url}>{u.hostname}</span>;
                } catch {
                  return <span title={tracker.url}>{tracker.url}</span>;
                }
              })()}</td>
              <td>{(() => {
                const path = tracker.jsonPath || '';
                const shortPath = path.length > 10 ? path.slice(0, 10) + '...' : path;
                return <span title={path}>{shortPath}</span>;
              })()}</td>
              <td style={{ maxWidth: 200, wordBreak: 'break-all' }}>
                {results[i]?.error
                  ? <span style={{ color: 'red' }}>{results[i].error}</span>
                  : results[i]?.value
                    ? (() => {
                        const val = getValueByPath(results[i].value, tracker.jsonPath);
                        return val === undefined ? <span style={{ color: '#888' }}>Not found</span> : String(val);
                      })()
                    : <Spinner />}
              </td>
              <td>
                <button onClick={() => onEdit(i)} style={{ color: 'white', background: 'orange', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', marginRight: 6 }}>Edit</button>
                <button onClick={() => onDuplicate(i)} style={{ color: 'white', background: 'blue', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', marginRight: 6 }}>Duplicate</button>
                <button onClick={() => onDelete(i)} style={{ color: 'white', background: 'red', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Spinner animation
// Add this to App.css:
// @keyframes spin { 100% { transform: rotate(360deg); } } 