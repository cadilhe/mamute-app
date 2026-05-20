import { useEffect, useState } from 'react';
import { schedule as scheduleApi } from '../../lib/api';
import { DisciplineBadge } from '../shared/Badge';
import { Loading } from '../shared/Loading';

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export function SchedulePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    scheduleApi.list().then(({ data: d }) => { setData(d || []); setLoading(false); });
  }, []);

  if (loading) return <Loading />;

  const byDay = {};
  DAYS.forEach((_, i) => { byDay[i+1] = data.filter(s => s.day_of_week === i+1); });

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:700, letterSpacing:'-0.5px' }}>Agenda</h1>
        <p style={{ color:'var(--text-3)', fontSize:13, marginTop:2 }}>Grade semanal de aulas</p>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12 }}>
        {DAYS.map((day, i) => (
          <div key={day} style={{ background:'var(--surface)', borderRadius:12, border:'1px solid var(--border)', overflow:'hidden' }}>
            <div style={{ padding:'12px 16px', background:'var(--surface-2)', borderBottom:'1px solid var(--border)' }}>
              <div style={{ fontWeight:600, fontSize:14 }}>{day}</div>
              <div style={{ fontSize:11, color:'var(--text-3)' }}>{byDay[i+1]?.length || 0} aulas</div>
            </div>
            <div style={{ padding:'10px 12px', display:'flex', flexDirection:'column', gap:6, minHeight:80 }}>
              {byDay[i+1]?.length === 0 ? (
                <div style={{ color:'var(--text-3)', fontSize:12, textAlign:'center', padding:12 }}>—</div>
              ) : byDay[i+1]?.map(s => (
                <div key={s.id} style={{ padding:'8px 10px', borderRadius:8, background:'var(--bg)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontWeight:500, fontSize:13 }}>{s.students?.name}</div>
                    <div style={{ fontSize:11, color:'var(--text-3)' }}>{s.start_time?.slice(0,5)} – {s.end_time?.slice(0,5)}</div>
                  </div>
                  <DisciplineBadge discipline={s.modules?.discipline} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
