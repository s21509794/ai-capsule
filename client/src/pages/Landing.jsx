import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const features = [
  {
    icon: '🧠',
    title: 'Capture Every Prompt',
    desc: 'Save the exact prompts that worked — with version, category and full text.',
  },
  {
    icon: '🔒',
    title: 'Yours Alone',
    desc: 'Each record is tied to your account. Other users can never see or touch your prompts.',
  },
  {
    icon: '⚡',
    title: 'Track What Works',
    desc: 'Rate usefulness, mark reviewed, flag improved outputs and add reflection notes.',
  },
  {
    icon: '🗂️',
    title: 'Stay Organised',
    desc: 'Group prompts by project, version and task type so you can find them again fast.',
  },
  {
    icon: '📸',
    title: 'Screenshot Evidence',
    desc: 'Attach a screenshot URL to keep visual proof of AI-generated outputs.',
  },
  {
    icon: '☁️',
    title: 'Cloud Deployed',
    desc: 'Accessible from any device. Your prompts follow you wherever you work.',
  },
]

export default function Landing() {
  return (
    <div className="landing">
      <Navbar />

      {/* ─── Hero ─────────────────────────────────────────────────── */}
      <section className="landing-hero">
        <div className="landing-eyebrow">
          ✨ Your personal AI prompt library
        </div>
        <h1>Never Lose a<br />Useful AI Prompt</h1>
        <p>
          AI Capsule is your private vault for saving, rating and improving
          the prompts you use with ChatGPT, Copilot, Gemini and Claude.
          Sign in once — access your library everywhere.
        </p>
        <div className="landing-cta-group">
          <a href="/login" className="btn btn-primary btn-lg" id="hero-cta-btn">
            🚀 Get Started — It's Free
          </a>
          <button
            className="btn btn-ghost btn-lg"
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
          >
            See Features ↓
          </button>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────────── */}
      <section className="landing-features" id="features">
        <h2 className="landing-features-title">
          Everything you need to build your prompt library
        </h2>
        <div className="features-grid">
          {features.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────── */}
      <footer className="landing-footer">
        <p>AI Capsule · CSE3CWA / CSE5006 · Semester 2, 2026</p>
        <p style={{ marginTop: 4 }}>Designed by Dr Shuo Ding · Subject Coordinator</p>
      </footer>
    </div>
  )
}
