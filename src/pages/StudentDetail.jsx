import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, ExternalLink, Plus, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import ClassModal from '../components/students/ClassModal'
import ReportModal from '../components/students/ReportModal'
import './StudentDetail.css'

const TABS = ['Hoje', 'Histórico', 'Progresso', 'Khan Academy', 'Relatório']

const DISC_COLOR = {
  piano: 'var(--piano)', robotica: 'var(--robotica)',
  matematica: 'var(--math)', ingles: 'var(--ingles)',
  bateria: 'var(--bateria)', reforco: 'var(--reforco)',
}

export default function StudentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState('Hoje')
  const [student, setStudent] = useState(null)
  const [classes, setClasses] = useState([])
  const [progress, setProgress] = useState([])
  const [khan, setKhan] = useState(null)
  const [khanTopics, setKhanTopics] = useState([])
  const [showClassModal, setShowClassModal] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [id])

  async function load() {
    const [{ data: stu }, { data: cls }, { data: prg }, { data: kp }, { data: kt }] = await Promise.all([
      supabase.from('students').select('*').eq('id', id).single(),
      supabase.from('classes').select('*').eq('student_id', id).order('date', { ascending: false }),
      supabase.from('progress').select('*').eq('student_id', id),
      supabase.from('khan_profiles').select('*').eq('student_id', id).single(),
      supabase.from('student_khan_topics').select('*, khan_topics(title, url, khan_subtopics(*))').eq('student_id', id),
    ])
    setStudent(stu)
    setClasses(cls ?? [])
    setProgress(prg ?? [])
    setKhan(kp)
    setKhanTopics(kt ?? [])
    setLoading(false)
  }

  if (loading) return <div className="loading">Carregando...</div>
  if (!student) return <div className="loading">Aluno não encontrado.</div>

  const lastClass = classes[0]

  return (
    <div className="student-detail fade-in">
      {/* Header */}
      <div className="detail-header">
        <button className="btn btn-ghost" onClick={() => navigate('/alunos')}>
          <ArrowLeft size={15} /> Alunos
        </button>
        <div className="detail-title">
          <div className="student-avatar-lg">{student.name?.[0]?.toUpperCase()}</div>
          <div>
            <h1>{student.name}</h1>
            <p className="detail-meta">
              {student.age && `${student.age} anos · `}
              {student.school && student.school}
            </p>
          </div>
        </div>
        <button className="btn btn-ghost" onClick={() => setShowReport(true)}>
          <FileText size={15} /> Relatório
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {/* ── Tab: Hoje ── */}
      {tab === 'Hoje' && (
        <div className="tab-content">
          {lastClass ? (
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="class-header">
                <span className="badge" style={{ background: '#1a1a1a', color: DISC_COLOR[lastClass.discipline] }}>
                  {lastClass.discipline}
                </span>
                <span className="class-date">
                  {format(new Date(lastClass.date), "d 'de' MMMM", { locale: ptBR })}
                </span>
              </div>
              <p className="class-text">{lastClass.what_was_done || 'Sem descrição registrada.'}</p>
              {lastClass.pending && (
                <div className="pending-block">
                  <strong>Pendências:</strong> {lastClass.pending}
                </div>
              )}
              {lastClass.next_step && (
                <div className="next-block">
                  <strong>Próximo passo:</strong> {lastClass.next_step}
                </div>
              )}
            </div>
          ) : (
            <div className="card empty-card">Nenhuma aula registrada ainda.</div>
          )}

          <button className="btn btn-primary" onClick={() => setShowClassModal(true)}>
            <Plus size={15} /> Registrar aula de hoje
          </button>
        </div>
      )}

      {/* ── Tab: Histórico ── */}
      {tab === 'Histórico' && (
        <div className="tab-content">
          {classes.length === 0 ? (
            <p className="empty">Sem aulas registradas.</p>
          ) : (
            <div className="history-list">
              {classes.map(c => (
                <div key={c.id} className="history-item">
                  <div className="history-dot" style={{ background: DISC_COLOR[c.discipline] }} />
                  <div className="history-body">
                    <div className="history-meta">
                      <span className="badge" style={{ background:'#1a1a1a', color: DISC_COLOR[c.discipline] }}>
                        {c.discipline}
                      </span>
                      <span className="class-date">
                        {format(new Date(c.date), "d 'de' MMMM yyyy", { locale: ptBR })}
                      </span>
                    </div>
                    <p className="class-text">{c.what_was_done}</p>
                    {c.pending && <p className="pending-block"><strong>Pendência:</strong> {c.pending}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Progresso ── */}
      {tab === 'Progresso' && (
        <div className="tab-content">
          {progress.length === 0 ? (
            <p className="empty">Sem dados de progresso.</p>
          ) : (
            <div className="progress-list">
              {progress.map(p => (
                <div key={p.id} className="progress-row">
                  <div className="progress-label">
                    <span style={{ color: DISC_COLOR[p.discipline] }}>{p.discipline}</span>
                    <span className="progress-pct">{p.percentage}%</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: p.percentage + '%',
                        background: DISC_COLOR[p.discipline]
                      }}
                    />
                  </div>
                  {p.notes && <p className="progress-notes">{p.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Khan Academy ── */}
      {tab === 'Khan Academy' && (
        <div className="tab-content">
          {khan ? (
            <div className="card khan-profile">
              <div className="khan-header">
                <div>
                  <div className="khan-username">{khan.khan_username}</div>
                  <div className="khan-meta">
                    🔥 {khan.streak_days ?? 0} dias · ⏱ {khan.weekly_minutes ?? 0} min esta semana
                  </div>
                </div>
                <a
                  href={`https://www.khanacademy.org/profile/${khan.khan_username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-ghost"
                >
                  <ExternalLink size={14} /> Ver perfil
                </a>
              </div>
            </div>
          ) : (
            <div className="card empty-card" style={{ marginBottom: 16 }}>
              Perfil Khan Academy não vinculado.
            </div>
          )}

          <div className="khan-topics">
            {khanTopics.map(kt => (
              <div key={kt.id} className="card khan-topic">
                <div className="topic-header">
                  <span className="topic-title">{kt.khan_topics?.title}</span>
                  <a href={kt.khan_topics?.url} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ padding:'4px 10px', fontSize:12 }}>
                    <ExternalLink size={12} /> Abrir
                  </a>
                </div>
                <div className="topic-progress-track">
                  <div className="topic-progress-fill" style={{ width: (kt.progress_pct ?? 0) + '%' }} />
                </div>
                <div className="topic-pct">{kt.progress_pct ?? 0}%</div>

                {kt.khan_topics?.khan_subtopics?.map(sub => (
                  <a key={sub.id} href={sub.url} target="_blank" rel="noreferrer" className="subtopic-link">
                    {sub.title} <ExternalLink size={11} />
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {showClassModal && (
        <ClassModal studentId={id} onClose={() => { setShowClassModal(false); load() }} />
      )}
      {showReport && (
        <ReportModal student={student} classes={classes} progress={progress} khan={khan} khanTopics={khanTopics} onClose={() => setShowReport(false)} />
      )}
    </div>
  )
}
