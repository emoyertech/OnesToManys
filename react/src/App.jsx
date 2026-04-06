import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [dealerships, setDealerships] = useState([])
  const [cars, setCars] = useState([])
  const [status, setStatus] = useState('Loading...')
  const [relationship, setRelationship] = useState(null)
  const [relationshipId, setRelationshipId] = useState('')
  const [uploadFile, setUploadFile] = useState(null)

  const [dealershipForm, setDealershipForm] = useState({
    id: '',
    name: '',
    city: '',
    state: '',
  })

  const [carForm, setCarForm] = useState({
    id: '',
    make: '',
    model: '',
    year: '',
    price: '',
    vin: '',
    dealership_id: '',
  })

  async function api(path, options = {}) {
    const response = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(data.error || `Request failed: ${response.status}`)
    }
    return data
  }

  async function refreshData() {
    const [d, c] = await Promise.all([api('/dealerships'), api('/cars')])
    setDealerships(d)
    setCars(c)
  }

  useEffect(() => {
    let active = true

    Promise.all([api('/dealerships'), api('/cars')])
      .then(([d, c]) => {
        if (!active) {
          return
        }
        setDealerships(d)
        setCars(c)
        setStatus('Ready')
      })
      .catch((error) => {
        if (!active) {
          return
        }
        setStatus(error.message)
      })

    return () => {
      active = false
    }
  }, [])

  async function submitDealership(event) {
    event.preventDefault()
    try {
      const payload = {
        name: dealershipForm.name.trim(),
        city: dealershipForm.city.trim() || null,
        state: dealershipForm.state.trim() || null,
      }
      const method = dealershipForm.id ? 'PUT' : 'POST'
      const path = dealershipForm.id ? `/dealerships/${dealershipForm.id}` : '/dealerships'

      await api(path, { method, body: JSON.stringify(payload) })
      setStatus(`Dealership ${dealershipForm.id ? 'updated' : 'created'}`)
      setDealershipForm({ id: '', name: '', city: '', state: '' })
      await refreshData()
    } catch (error) {
      setStatus(error.message)
    }
  }

  async function submitCar(event) {
    event.preventDefault()
    try {
      const payload = {
        make: carForm.make.trim(),
        model: carForm.model.trim(),
        year: carForm.year ? Number(carForm.year) : null,
        price: carForm.price ? Number(carForm.price) : null,
        vin: carForm.vin.trim() || null,
        dealership_id: Number(carForm.dealership_id),
      }

      const method = carForm.id ? 'PUT' : 'POST'
      const path = carForm.id ? `/cars/${carForm.id}` : '/cars'

      await api(path, { method, body: JSON.stringify(payload) })
      setStatus(`Car ${carForm.id ? 'updated' : 'created'}`)
      setCarForm({
        id: '',
        make: '',
        model: '',
        year: '',
        price: '',
        vin: '',
        dealership_id: '',
      })
      await refreshData()
    } catch (error) {
      setStatus(error.message)
    }
  }

  async function deleteDealership(id) {
    try {
      await api(`/dealerships/${id}`, { method: 'DELETE' })
      setStatus(`Deleted dealership ${id}`)
      await refreshData()
    } catch (error) {
      setStatus(error.message)
    }
  }

  async function deleteCar(id) {
    try {
      await api(`/cars/${id}`, { method: 'DELETE' })
      setStatus(`Deleted car ${id}`)
      await refreshData()
    } catch (error) {
      setStatus(error.message)
    }
  }

  async function loadRelationship(event) {
    event.preventDefault()
    try {
      const data = await api(`/dealerships/${Number(relationshipId)}/cars`)
      setRelationship(data)
      setStatus(`Loaded cars for dealership ${relationshipId}`)
    } catch (error) {
      setRelationship(null)
      setStatus(error.message)
    }
  }

  async function uploadData() {
    if (!uploadFile) {
      setStatus('Choose a JSON file to upload first')
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', uploadFile, uploadFile.name || 'dealership-data.json')
      const response = await fetch('/import/file', { method: 'POST', body: formData })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || `Upload failed: ${response.status}`)
      }
      setStatus(`Imported ${data.counts.dealerships} dealerships and ${data.counts.cars} cars`)
      setUploadFile(null)
      await refreshData()
    } catch (error) {
      setStatus(error.message)
    }
  }

  async function downloadData() {
    try {
      const response = await fetch('/export/json')
      const data = await response.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'ones-to-manys-export.json'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      setStatus('Downloaded current dealership JSON')
    } catch (error) {
      setStatus(error.message)
    }
  }

  const relationshipCount = relationship?.cars?.length || 0

  return (
    <main className="page">
      <header className="hero panel">
        <div>
          <h1>Dealership and Cars Studio</h1>
          <p className="lede">
            Manage the full one-to-many dataset with create, edit, update, delete,
            relationship lookup, and JSON import/export in one polished interface.
          </p>
        </div>
        <div className="hero-actions">
          <a className="button secondary" href="/">Back Home</a>
          <a className="button secondary" href="/">Exit</a>
        </div>
      </header>

      <section className="grid">
        <div className="stack">
          <article className="panel">
            <h2 className="section-title">What you can do</h2>
            <div className="metrics">
              <div className="metric-card"><strong>{dealerships.length}</strong><small>Dealerships</small></div>
              <div className="metric-card"><strong>{cars.length}</strong><small>Cars</small></div>
              <div className="metric-card"><strong>{relationshipCount}</strong><small>Cars in view</small></div>
            </div>
          </article>

          <article className="panel">
            <h2 className="section-title">Quick entry points</h2>
            <div className="endpoint-grid">
              <div className="endpoint">
                <span><code>Workspace</code> Jump to the dealership form</span>
                <a className="button secondary" href="#dealership-form">Edit</a>
              </div>
              <div className="endpoint">
                <span><code>Inventory</code> Jump to the record lists</span>
                <a className="button secondary" href="#dealership-list">Delete</a>
              </div>
              <div className="endpoint">
                <span><code>Exit</code> Return to the home page</span>
                <a className="button secondary" href="/">Exit</a>
              </div>
            </div>
          </article>

          <article className="panel toolbar">
            <div>
              <h2>Data import and export</h2>
              <p className="muted">
                Upload a JSON file exported from this app, or download the current dealership data for
                backup and sharing.
              </p>
            </div>
            <div className="toolbar-actions">
              <label className="file-pill">
                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={(event) => setUploadFile(event.target.files?.[0] || null)}
                />
                <span>{uploadFile ? uploadFile.name : 'Choose JSON file'}</span>
              </label>
              <button type="button" onClick={uploadData}>Upload JSON</button>
              <button type="button" className="ghost" onClick={downloadData}>Download JSON</button>
            </div>
          </article>
        </div>

        <div className="stack">
          <article className="panel stack" id="dealership-form">
            <div className="section-head">
              <div>
                <h2>Dealerships</h2>
                <p className="muted">Master records for the dealership inventory.</p>
              </div>
            </div>
            <form className="form" onSubmit={submitDealership}>
              <input type="hidden" value={dealershipForm.id} readOnly />
              <label>
                Name
                <input
                  placeholder="Dealership name"
                  value={dealershipForm.name}
                  onChange={(e) => setDealershipForm({ ...dealershipForm, name: e.target.value })}
                  required
                />
              </label>
              <div className="two-col">
                <label>
                  City
                  <input
                    placeholder="Wilmington"
                    value={dealershipForm.city}
                    onChange={(e) => setDealershipForm({ ...dealershipForm, city: e.target.value })}
                  />
                </label>
                <label>
                  State
                  <input
                    placeholder="DE"
                    value={dealershipForm.state}
                    onChange={(e) => setDealershipForm({ ...dealershipForm, state: e.target.value })}
                  />
                </label>
              </div>
              <div className="row">
                <button type="submit">{dealershipForm.id ? 'Update' : 'Create'}</button>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => setDealershipForm({ id: '', name: '', city: '', state: '' })}
                >
                  Reset
                </button>
              </div>
            </form>
            <div id="dealership-list" className="list">
              {dealerships.length ? (
                dealerships.map((d) => {
                  const carCount = cars.filter((car) => car.dealership_id === d.id).length
                  return (
                    <article className="item" key={d.id}>
                      <div>
                        <strong>#{d.id} {d.name}</strong>
                        <div className="item-meta">{d.city || '-'}, {d.state || '-'}</div>
                        <div className="chip-row">
                          <span className="chip">{carCount} cars</span>
                          <span className="chip">ID {d.id}</span>
                        </div>
                      </div>
                      <div className="row">
                        <button
                          type="button"
                          onClick={() => setDealershipForm({ ...d, city: d.city || '', state: d.state || '' })}
                        >
                          Edit
                        </button>
                        <button type="button" className="danger" onClick={() => deleteDealership(d.id)}>Delete</button>
                      </div>
                    </article>
                  )
                })
              ) : (
                <div className="item">
                  <div>
                    <strong>No dealerships yet.</strong>
                    <div className="item-meta">Create one above or import a JSON file.</div>
                  </div>
                </div>
              )}
            </div>
          </article>

          <article className="panel stack">
            <div className="section-head">
              <div>
                <h2>Cars</h2>
                <p className="muted">Detail records linked to each dealership.</p>
              </div>
            </div>
            <form className="form" onSubmit={submitCar}>
              <div className="two-col">
                <label>
                  Make
                  <input
                    placeholder="Toyota"
                    value={carForm.make}
                    onChange={(e) => setCarForm({ ...carForm, make: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Model
                  <input
                    placeholder="Camry"
                    value={carForm.model}
                    onChange={(e) => setCarForm({ ...carForm, model: e.target.value })}
                    required
                  />
                </label>
              </div>
              <div className="two-col">
                <label>
                  Year
                  <input
                    placeholder="2024"
                    type="number"
                    value={carForm.year}
                    onChange={(e) => setCarForm({ ...carForm, year: e.target.value })}
                  />
                </label>
                <label>
                  Price
                  <input
                    placeholder="25000"
                    type="number"
                    step="0.01"
                    value={carForm.price}
                    onChange={(e) => setCarForm({ ...carForm, price: e.target.value })}
                  />
                </label>
              </div>
              <div className="two-col">
                <label>
                  VIN
                  <input
                    placeholder="VIN"
                    value={carForm.vin}
                    onChange={(e) => setCarForm({ ...carForm, vin: e.target.value })}
                  />
                </label>
                <label>
                  Dealership ID
                  <input
                    placeholder="1"
                    type="number"
                    value={carForm.dealership_id}
                    onChange={(e) => setCarForm({ ...carForm, dealership_id: e.target.value })}
                    required
                  />
                </label>
              </div>
              <div className="row">
                <button type="submit">{carForm.id ? 'Update' : 'Create'}</button>
                <button
                  type="button"
                  className="ghost"
                  onClick={() =>
                    setCarForm({
                      id: '',
                      make: '',
                      model: '',
                      year: '',
                      price: '',
                      vin: '',
                      dealership_id: '',
                    })
                  }
                >
                  Reset
                </button>
              </div>
            </form>
            <div id="car-list" className="list">
              {cars.length ? (
                cars.map((c) => (
                  <article className="item" key={c.id}>
                    <div>
                      <strong>#{c.id} {c.make} {c.model}</strong>
                      <div className="item-meta">
                        Year: {c.year || '-'} | Price: {c.price || '-'} | Dealer: {c.dealership_name || c.dealership_id}
                      </div>
                      <div className="chip-row">
                        <span className="chip">VIN {c.vin || 'N/A'}</span>
                        <span className="chip">ID {c.id}</span>
                      </div>
                    </div>
                    <div className="row">
                      <button
                        type="button"
                        onClick={() => setCarForm({ ...c, dealership_id: c.dealership_id || '' })}
                      >
                        Edit
                      </button>
                      <button type="button" className="danger" onClick={() => deleteCar(c.id)}>Delete</button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="item">
                  <div>
                    <strong>No cars yet.</strong>
                    <div className="item-meta">Add a detail record or import a JSON file.</div>
                  </div>
                </div>
              )}
            </div>
          </article>

          <article className="panel stack">
            <div className="section-head">
              <div>
                <h2>Relationship view</h2>
                <p className="muted">Load a dealership to see all of its cars.</p>
              </div>
            </div>
            <form className="inline-form" onSubmit={loadRelationship}>
              <label>
                Dealership ID
                <input
                  type="number"
                  placeholder="1"
                  value={relationshipId}
                  onChange={(e) => setRelationshipId(e.target.value)}
                  required
                />
              </label>
              <button type="submit">Load Cars</button>
            </form>
            {relationship && (
              <div className="relationship-result">
                <article className="relationship-summary">
                  <div className="chip-row">
                    <span className="chip">Dealership #{relationship.dealership?.id || relationshipId || '?'}</span>
                    <span className="chip">{relationship.dealership?.name || 'Unknown dealership'}</span>
                    <span className="chip">{relationship.cars?.length || 0} cars</span>
                  </div>
                  <p className="lede" style={{ marginTop: '0.65rem' }}>
                    {relationship.dealership?.city || '-'}, {relationship.dealership?.state || '-'}
                  </p>
                </article>
                <div className="relationship-cars">
                  {(relationship.cars || []).length ? (
                    relationship.cars.map((car) => (
                      <article className="item" key={car.id}>
                        <div>
                          <strong>#{car.id} {car.make} {car.model}</strong>
                          <div className="item-meta">Year: {car.year || '-'} | Price: {car.price || '-'}</div>
                          <div className="chip-row">
                            <span className="chip">VIN {car.vin || 'N/A'}</span>
                            <span className="chip">{car.dealership_name || relationship.dealership?.name || 'Assigned dealer'}</span>
                          </div>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="item">
                      <div>
                        <strong>No cars found.</strong>
                        <div className="item-meta">This dealership currently has no related cars.</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </article>
        </div>
      </section>

      <p className="status">{status}</p>
    </main>
  )
}

export default App
