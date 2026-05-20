import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import './Dashboard.css'

const DISCIPLINE_COLORS = {
  piano: 'var(--piano)',
  robotica: 'var(--robotica)',
  matematica: 'var(--math)',
  ingles: 'var(--ingles)',
  bateria: 'var(--bateria)',
  reforco: 'var(--reforco)',
}

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, alert: 0, pending: 0, ok: 0 })
  const [todayClasses, setTodayClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })
  const weekday = format(new Date(), 'EEEE', { locale: ptBR }).toLowerCase()

  useEffect(() => {
    async function load() {
      // Stats via student_overview view
      const { data: overview } = await supabase
        .from('student_overview')
        .select('days_since_last_class, pending_count')

      if (overview) {
        const alert = overview.filter(s => (s.days_since_last_class ?? 99) > 14).length
        const pending = overview.filter(s => (s.pending_count ?? 0) >= 2 && (s.days_since_last_class ?? 99) <= 14).length
        const ok = overview.length - alert - pending
        setStats({ total: overview.length, alert, pending, ok })
      }

      // Today's schedule
      const { data: schedules } = await supabase
        .from('schedules')
        .select('*, students(name)')
        .eq('weekday', weekday)
        .order('start_time')

      setTodayClasses(schedules ?? [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="loading">Carregando...</div>

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="date-label">{today}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#1a2040' }}>
            <Users size={20} color="var(--piano)" />
          </div>
          <div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Alunos ativos</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#2a1212' }}>
            <AlertTriangle size={20} color="var(--red)" />
          </div>
          <div>
            <div className="stat-value" style={{ color: 'var(--red)' }}>{stats.alert}</div>
            <div className="stat-label">Precisam atenção</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#2a2010' }}>
            <Clock size={20} color="var(--yellow)" />
          </div>
          <div>
            <div className="stat-value" style={{ color: 'var(--yellow)' }}>{stats.pending}</div>
            <div className="stat-label">Com pendências</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#0f2a1a' }}>
            <CheckCircle size={20} color="var(--green)" />
          </div>
          <div>
            <div className="stat-value" style={{ color: 'var(--green)' }}>{stats.ok}</div>
            <div className="stat-label">Em dia</div>
          </div>
        </div>
      </div>

      {/* Today's classes */}
      <div className="card">
        <h2 className="section-title">Aulas de hoje</h2>
        {todayClasses.length === 0 ? (
          <p className="empty">Nenhuma aula agendada para hoje.</p>
        ) : (
          <div className="today-list">
            {todayClasses.map(cls => (
              <div key={cls.id} className="today-item">
                <div
                  className="today-bar"
                  style={{ background: DISCIPLINE_COLORS[cls.discipline] ?? 'var(--text2)' }}
                />
                <div className="today-time">{cls.start_time?.slice(0,5)}</div>
                <div className="today-student">{cls.students?.name}</div>
                <div className="today-discipline badge"
                  style={{ background: '#1a1a1a', color: DISCIPLINE_COLORS[cls.discipline] ?? 'var(--text2)' }}>
                  {cls.discipline}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
