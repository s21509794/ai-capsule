function categoryColor(cat) {
  const map = {
    Coding: 'badge-purple',
    Writing: 'badge-teal',
    Research: 'badge-amber',
    Debugging: 'badge-red',
    Study: 'badge-teal',
    Other: 'badge-gray',
  }
  return map[cat] || 'badge-gray'
}

function usefulnessColor(u) {
  const map = {
    Excellent: 'badge-teal',
    Good: 'badge-purple',
    'Needs Improvement': 'badge-amber',
    Poor: 'badge-red',
  }
  return map[u] || 'badge-gray'
}

function formatDate(dt) {
  if (!dt) return ''
  return new Date(dt + (dt.includes('Z') ? '' : 'Z')).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

export default function CapsuleCard({ capsule, onEdit, onDelete }) {
  const {
    id, project_name, prompt_title, prompt_version, prompt_text,
    response_summary, category, usefulness, reviewed, improved,
    screenshot_url, notes, created_at,
  } = capsule

  return (
    <article className="capsule-card" aria-label={`Capsule: ${prompt_title}`}>
      {/* Header */}
      <div className="capsule-card-header">
        <div>
          <div className="capsule-card-title">{prompt_title}</div>
          <div className="capsule-card-project">
            📁 {project_name}
            {prompt_version && <span style={{ marginLeft: 6, opacity: 0.7 }}>· {prompt_version}</span>}
          </div>
        </div>
        <div className="capsule-card-actions">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onEdit(capsule)}
            id={`edit-capsule-${id}`}
            aria-label={`Edit ${prompt_title}`}
            title="Edit"
          >
            ✏️
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(capsule)}
            id={`delete-capsule-${id}`}
            aria-label={`Delete ${prompt_title}`}
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Prompt text preview */}
      <div className="capsule-card-prompt">{prompt_text}</div>

      {/* Response summary */}
      {response_summary && (
        <p className="capsule-card-summary">
          <strong style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>AI Response: </strong>
          {response_summary}
        </p>
      )}

      {/* Tags */}
      <div className="capsule-card-tags">
        {category && <span className={`badge ${categoryColor(category)}`}>{category}</span>}
        {usefulness && <span className={`badge ${usefulnessColor(usefulness)}`}>{usefulness}</span>}
        {reviewed ? <span className="badge badge-teal">✓ Reviewed</span> : null}
        {improved ? <span className="badge badge-teal">⚡ Improved</span> : null}
        {screenshot_url && (
          <a
            href={screenshot_url}
            target="_blank"
            rel="noopener noreferrer"
            className="badge badge-gray"
            style={{ textDecoration: 'none' }}
          >
            🖼 Screenshot
          </a>
        )}
      </div>

      {/* Notes */}
      {notes && (
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', fontStyle: 'italic' }}>
          💬 {notes}
        </p>
      )}

      {/* Footer */}
      <div className="capsule-card-footer">
        <span>ID #{id}</span>
        <span>{formatDate(created_at)}</span>
      </div>
    </article>
  )
}
