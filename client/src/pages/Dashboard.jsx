import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import CapsuleCard from '../components/CapsuleCard'
import CapsuleForm from '../components/CapsuleForm'
import Modal from '../components/Modal'

export default function Dashboard() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [capsules, setCapsules] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal state
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)   // null = create, object = edit
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Toast
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ─── Load user + capsules ─────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const { data: me } = await axios.get('/api/me', { withCredentials: true })
        setUser(me)
      } catch {
        // Not authenticated — redirect to login
        navigate('/login')
        return
      }

      try {
        const { data } = await axios.get('/api/capsules', { withCredentials: true })
        setCapsules(data)
      } catch {
        setCapsules([])
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [navigate])

  // ─── CREATE ──────────────────────────────────────────────────────────────
  const handleCreate = async (formData) => {
    setSubmitting(true)
    try {
      await axios.post('/api/capsules', formData, { withCredentials: true })
      // Re-fetch full list so the card shows exact DB data
      const { data: fresh } = await axios.get('/api/capsules', { withCredentials: true })
      setCapsules(fresh)
      setShowForm(false)
      showToast('✅ Capsule saved!')
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.error || 'Failed to save capsule.'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── UPDATE ──────────────────────────────────────────────────────────────
  const handleUpdate = async (formData) => {
    setSubmitting(true)
    try {
      const { data } = await axios.put(`/api/capsules/${editTarget.id}`, formData, {
        withCredentials: true,
      })
      setCapsules((prev) => prev.map((c) => (c.id === data.id ? data : c)))
      setEditTarget(null)
      showToast('✅ Capsule updated!')
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.error || 'Failed to update capsule.'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── DELETE ──────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return
    setSubmitting(true)
    try {
      await axios.delete(`/api/capsules/${deleteTarget.id}`, { withCredentials: true })
      setCapsules((prev) => prev.filter((c) => c.id !== deleteTarget.id))
      setDeleteTarget(null)
      showToast('🗑️ Capsule deleted.')
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.error || 'Failed to delete capsule.'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Stats ────────────────────────────────────────────────────────────────
  const stats = {
    total: capsules.length,
    reviewed: capsules.filter((c) => c.reviewed).length,
    improved: capsules.filter((c) => c.improved).length,
    categories: new Set(capsules.map((c) => c.category).filter(Boolean)).size,
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p className="loading-text">Loading your capsules…</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <Navbar user={user} />

      <main className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h2>My Prompt Library</h2>
            <p>
              {capsules.length === 0
                ? 'No capsules yet — add your first one!'
                : `${capsules.length} capsule${capsules.length !== 1 ? 's' : ''} saved`}
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => { setEditTarget(null); setShowForm(true) }}
            id="add-capsule-btn"
          >
            ＋ New Capsule
          </button>
        </div>

        {/* Stats bar */}
        {capsules.length > 0 && (
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Prompts</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.reviewed}</div>
              <div className="stat-label">Reviewed</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.improved}</div>
              <div className="stat-label">Improved</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.categories}</div>
              <div className="stat-label">Categories</div>
            </div>
          </div>
        )}

        {/* Capsule grid */}
        <div className="capsules-grid">
          {capsules.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🧠</div>
              <h3>Your library is empty</h3>
              <p>Start capturing the prompts that work for you.</p>
              <button
                className="btn btn-primary"
                onClick={() => { setEditTarget(null); setShowForm(true) }}
                id="empty-add-btn"
              >
                ＋ Add Your First Capsule
              </button>
            </div>
          ) : (
            capsules.map((cap) => (
              <CapsuleCard
                key={cap.id}
                capsule={cap}
                onEdit={(c) => { setEditTarget(c); setShowForm(true) }}
                onDelete={(c) => setDeleteTarget(c)}
              />
            ))
          )}
        </div>
      </main>

      {/* ─── Create / Edit Modal ─────────────────────────────────── */}
      {showForm && (
        <Modal
          title={editTarget ? '✏️ Edit Capsule' : '＋ New Capsule'}
          onClose={() => { setShowForm(false); setEditTarget(null) }}
        >
          <CapsuleForm
            key={editTarget ? `edit-${editTarget.id}` : 'new'}
            initialData={editTarget}
            onSubmit={editTarget ? handleUpdate : handleCreate}
            onCancel={() => { setShowForm(false); setEditTarget(null) }}
            submitting={submitting}
          />
        </Modal>
      )}

      {/* ─── Delete Confirm Modal ────────────────────────────────── */}
      {deleteTarget && (
        <div className="modal-overlay confirm-modal" onClick={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null) }}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="confirm-body">
              <div className="confirm-icon">⚠️</div>
              <h3>Delete Capsule?</h3>
              <p>
                <strong>{deleteTarget.prompt_title}</strong> will be permanently removed.
                This action cannot be undone.
              </p>
              <div className="confirm-actions">
                <button
                  className="btn btn-ghost"
                  onClick={() => setDeleteTarget(null)}
                  id="delete-cancel-btn"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleDelete}
                  id="delete-confirm-btn"
                  disabled={submitting}
                >
                  {submitting ? 'Deleting…' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Toast ───────────────────────────────────────────────── */}
      {toast && (
        <div className={`toast toast-${toast.type}`} role="status">
          {toast.msg}
        </div>
      )}
    </div>
  )
}
