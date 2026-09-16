import { useState } from 'react'

const CATEGORIES = ['Coding', 'Writing', 'Research', 'Debugging', 'Study', 'Other']
const USEFULNESS = ['Good', 'Needs Improvement', 'Excellent', 'Poor']

const EMPTY_FORM = {
  project_name: '',
  prompt_title: '',
  prompt_version: '',
  prompt_text: '',
  response_summary: '',
  category: '',
  usefulness: '',
  reviewed: false,
  improved: false,
  screenshot_url: '',
  notes: '',
}

export default function CapsuleForm({ initialData, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(
    initialData
      ? {
          ...initialData,
          reviewed: !!initialData.reviewed,
          improved: !!initialData.improved,
        }
      : EMPTY_FORM
  )

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [field]: val }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} id="capsule-form">
      {/* Row 1 */}
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="project_name">Project Name *</label>
          <input
            id="project_name"
            className="form-control"
            type="text"
            required
            placeholder="e.g. SmartFarm Irrigation"
            value={form.project_name}
            onChange={set('project_name')}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="prompt_title">Prompt Title *</label>
          <input
            id="prompt_title"
            className="form-control"
            type="text"
            required
            placeholder="e.g. Debug cloud deployment"
            value={form.prompt_title}
            onChange={set('prompt_title')}
          />
        </div>
      </div>

      {/* Row 2 */}
      <div className="form-grid-3">
        <div className="form-group">
          <label className="form-label" htmlFor="prompt_version">Version</label>
          <input
            id="prompt_version"
            className="form-control"
            type="text"
            placeholder="v1, v2, v3…"
            value={form.prompt_version}
            onChange={set('prompt_version')}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="category">Category</label>
          <select id="category" className="form-control" value={form.category} onChange={set('category')}>
            <option value="">Select…</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="usefulness">Usefulness</label>
          <select id="usefulness" className="form-control" value={form.usefulness} onChange={set('usefulness')}>
            <option value="">Select…</option>
            {USEFULNESS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>

      {/* Prompt text */}
      <div className="form-group">
        <label className="form-label" htmlFor="prompt_text">Prompt Text *</label>
        <textarea
          id="prompt_text"
          className="form-control"
          rows={4}
          required
          placeholder="Paste the full prompt you used…"
          value={form.prompt_text}
          onChange={set('prompt_text')}
        />
      </div>

      {/* Response summary */}
      <div className="form-group">
        <label className="form-label" htmlFor="response_summary">AI Response Summary</label>
        <textarea
          id="response_summary"
          className="form-control"
          rows={2}
          placeholder="Brief summary of what the AI responded…"
          value={form.response_summary}
          onChange={set('response_summary')}
        />
      </div>

      {/* Screenshot URL */}
      <div className="form-group">
        <label className="form-label" htmlFor="screenshot_url">Screenshot URL</label>
        <input
          id="screenshot_url"
          className="form-control"
          type="url"
          placeholder="https://..."
          value={form.screenshot_url}
          onChange={set('screenshot_url')}
        />
      </div>

      {/* Notes */}
      <div className="form-group">
        <label className="form-label" htmlFor="notes">Notes / Reflection</label>
        <textarea
          id="notes"
          className="form-control"
          rows={2}
          placeholder="What you learned, what to improve…"
          value={form.notes}
          onChange={set('notes')}
        />
      </div>

      {/* Checkboxes */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <label className="checkbox-group">
          <input
            type="checkbox"
            id="reviewed"
            checked={form.reviewed}
            onChange={set('reviewed')}
          />
          <label htmlFor="reviewed">Response Reviewed</label>
        </label>
        <label className="checkbox-group">
          <input
            type="checkbox"
            id="improved"
            checked={form.improved}
            onChange={set('improved')}
          />
          <label htmlFor="improved">Output Improved</label>
        </label>
      </div>

      {/* Form footer buttons */}
      <div className="modal-footer" style={{ padding: 0, marginTop: 4 }}>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onCancel}
          id="form-cancel-btn"
          disabled={submitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          id="form-submit-btn"
          disabled={submitting}
        >
          {submitting ? 'Saving…' : initialData ? 'Update Capsule' : 'Save Capsule'}
        </button>
      </div>
    </form>
  )
}
