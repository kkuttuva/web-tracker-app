import { useState, useEffect, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import AddTrackerForm from './AddTrackerForm'
import TrackerTable from './TrackerTable'
import './App.css'

const STORAGE_KEY = 'trackers'

function App() {
  const [trackers, setTrackers] = useState([])
  const [editIndex, setEditIndex] = useState(null)
  const [editInitial, setEditInitial] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const fileInputRef = useRef()

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setTrackers(JSON.parse(saved))
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trackers))
  }, [trackers])

  const handleAddTracker = (tracker) => {
    if (editIndex !== null) {
      // Edit mode
      setTrackers(trackers.map((t, i) => (i === editIndex ? tracker : t)))
      setEditIndex(null)
      setEditInitial(null)
    } else {
      setTrackers([...trackers, tracker])
    }
  }

  const handleDeleteTracker = (index) => {
    setTrackers(trackers.filter((_, i) => i !== index))
    if (editIndex === index) {
      setEditIndex(null)
      setEditInitial(null)
    }
  }

  const handleEditTracker = (index) => {
    setEditIndex(index)
    setEditInitial(trackers[index])
  }

  const handleDuplicateTracker = (index) => {
    const orig = trackers[index];
    const random = Math.random().toString(36).slice(2, 8);
    const newTracker = {
      ...orig,
      description: orig.description + '_' + random
    };
    setTrackers([...trackers, newTracker]);
  };

  // Export trackers as JSON
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(trackers, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'trackers.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Import trackers from JSON
  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result)
        if (Array.isArray(data)) setTrackers(data)
        else alert('Invalid file format')
      } catch {
        alert('Invalid JSON file')
      }
    }
    reader.readAsText(file)
  }

  // Refresh all trackers
  const handleRefreshAll = () => {
    setRefreshKey(k => k + 1)
  }

  return (
    <div className="App" style={{ maxWidth: 900, margin: '20px auto', padding: 10 }}>
      <h1 style={{ margin: '10px 0', fontSize: 24 }}>API Tracker Dashboard</h1>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <button onClick={handleExport}>Export Trackers</button>
        <button onClick={() => fileInputRef.current.click()}>Import Trackers</button>
        <button onClick={handleRefreshAll}>Refresh All</button>
        <input type="file" accept="application/json" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImport} />
      </div>
      <AddTrackerForm
        onAddTracker={handleAddTracker}
        trackers={trackers}
        editInitial={editInitial}
        isEditing={editIndex !== null}
        onCancelEdit={() => { setEditIndex(null); setEditInitial(null); }}
      />
      <TrackerTable
        trackers={trackers}
        onDelete={handleDeleteTracker}
        onEdit={handleEditTracker}
        onDuplicate={handleDuplicateTracker}
        refreshKey={refreshKey}
      />
    </div>
  )
}

export default App
