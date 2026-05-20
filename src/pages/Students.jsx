import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Search, Plus, AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import StudentModal from '../components/students/StudentModal'
import './Students.css'

export default function Students() {
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase
      .from('student_overview')
      .select('*')
      .order('name')
    setStudents(data ?? [])
    setLoading(false)
  }

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase())
  )

  function statusInfo(s) {
    if ((s.days_since_last_class ?? 99) > 14)
      return { icon: AlertTriangle, color: 'var(--red)', label: 'Sem aula há ' + (s.days_since_last_class ?? '?') + ' dias', cls: 'alert-red' }
    if ((s.pending_count ?? 0) >= 2)
      return { icon: Clock, color: 'var(--yellow)', label: s.pending_count + ' pendências', cls: 'alert-yellow' }
    return { icon: CheckCircle, color: 'var(--green)', label: 'Em dia', cls: 'alert-green' }
  }

  return (
    <div className="students-page fade-in">
      <div className="page-header">
        <h1>Alunos</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Novo aluno
        </button>
      </div>

      <div className="search-bar">
        <Search size={16} />
        <input
          type="text"
          placeholder="Buscar aluno..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ background: 'transparent', border: 'none', flex: 1, fontSize: '14px' }}
        />
      </div>

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : (
        <div className="students-list">
          {filtered.map(s => {
            const status = statusInfo(s)
            const Icon = status.icon
            return (
              <div
                key={s.id}
                className="student-row"
                onClick={() => navigate('/alunos/' + s.id)}
              >
                <div className="student-avatar">
                  {s.name?.[0]?.toUpperCase()}
                </div>
                <div className="student-info">
                  <div className="student-name">{s.name}</div>
                  <div className="student-meta">
                    {s.age && <span>{s.age} anos</span>}
                    {s.disciplines?.length > 0 && (
                      <span>{s.disciplines.join(' · ')}</span>
                    )}
                  </div>
                </div>
                <div className={`badge ${status.cls}`}>
                  <Icon size={11} style={{ marginRight: 4 }} />
                  {status.label}
                </div>
                <div className="student-arrow">›</div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <p className="empty">Nenhum aluno encontrado.</p>
          )}
        </div>
      )}

      {showModal && (
        <StudentModal onClose={() => { setShowModal(false); load() }} />
      )}
    </div>
  )
}
