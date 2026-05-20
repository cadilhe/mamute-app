import { useEffect, useState } from 'react';
import { khan as khanApi } from '../../lib/api';
import { Button } from '../shared/Button';
import { Loading, EmptyState } from '../shared/Loading';
import { KHAN_BASE_URL } from '../../lib/constants';

export function KhanTab({ studentId }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    khanApi.getProfile(studentId).then(({ data }) => {
      setProfile(data);
      setLoading(false);
    });
  }, [studentId]);

  if (loading) return <Loading />;

  if (!profile) return (
    <EmptyState icon="📚" title="Khan Academy não configurado"
      description="Adicione o perfil Khan Academy deste aluno para rastrear o progresso." />
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* Profile */}
      <div style={{ background:'var(--surface)', borderRadius:12, border:'1px solid var(--border)', padding:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
          <div>
            <div style={{ fontWeight:600, fontSize:15 }}>{profile.khan_username || 'Usuário Khan'}</div>
            <a href={profile.profile_url || KHAN_BASE_URL} target="_blank" rel="noreferrer"
              style={{ fontSize:12, color:'#3B82F6' }}>Ver perfil no Khan Academy →</a>
          </div>
          <div style={{ display:'flex', gap:12 }}>
            {[
              { label:'Streak', value:profile.streak_days+'d' },
              { label:'Min/semana', value:profile.minutes_week },
            ].map(s => (
              <div key={s.label} style={{ textAlign:'center' }}>
                <div style={{ fontWeight:700, fontSize:20 }}>{s.value || 0}</div>
                <div style={{ fontSize:11, color:'var(--text-3)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Topics */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {(profile.khan_topics || []).map(topic => (
            <div key={topic.id} style={{ background:'var(--bg)', borderRadius:10, padding:'12px 16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, alignItems:'center' }}>
                <div>
                  <div style={{ fontWeight:500 }}>{topic.name}</div>
                  <a href={topic.url || KHAN_BASE_URL} target="_blank" rel="noreferrer"
                    style={{ fontSize:11, color:'#3B82F6' }}>Abrir no Khan →</a>
                </div>
                <span style={{ fontSize:12, fontWeight:600 }}>{topic.progress || 0}%</span>
              </div>
              <div style={{ height:6, borderRadius:3, background:'var(--border)' }}>
                <div style={{ height:'100%', borderRadius:3, background:'#F59E0B', width:(topic.progress||0)+'%', transition:'width 0.5s' }} />
              </div>
              {(topic.khan_subtopics || []).map(sub => (
                <div key={sub.id} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0', marginTop:4, fontSize:12, color:'var(--text-2)' }}>
                  <span>{sub.name}</span>
                  <a href={sub.url || KHAN_BASE_URL} target="_blank" rel="noreferrer"
                    style={{ color:'#3B82F6' }}>Abrir →</a>
                </div>
              ))}
            </div>
          ))}
          {(profile.khan_topics || []).length === 0 && (
            <p style={{ color:'var(--text-3)', fontSize:13 }}>Nenhum tópico cadastrado.</p>
          )}
        </div>
      </div>
    </div>
  );
}
