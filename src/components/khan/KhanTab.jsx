'use client';

import { useEffect, useState, useCallback } from 'react';
import { khan as khanApi } from '@/lib/api';
import { Loading, ErrorState } from '../shared/Loading';
import { Button } from '../shared/Button';
import { KHAN_BASE_URL } from '@/lib/constants';
import { KhanSetupModal } from './KhanSetupModal';
import { AddTopicModal } from './AddTopicModal';

export function KhanTab({ studentId }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSetup, setShowSetup] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await khanApi.getProfile(studentId);
    if (err) {
      setError(err.message);
      setProfile(null);
    } else {
      setProfile(data);
    }
    setLoading(false);
  }, [studentId]);

  useEffect(() => { fetch(); }, [fetch]);

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={fetch} />;

  if (!profile) {
    return (
      <div className="flex flex-col items-center gap-4 p-12 text-center select-none">
        <div className="text-4xl mb-1">📚</div>
        <div className="font-semibold text-text-2">Khan Academy não configurado</div>
        <p className="text-xs text-text-3">Adicione o perfil Khan Academy deste aluno para rastrear o progresso.</p>
        <Button onClick={() => setShowSetup(true)}>Configurar Khan</Button>
        <KhanSetupModal
          open={showSetup}
          onClose={() => setShowSetup(false)}
          studentId={studentId}
          profile={null}
          onSuccess={() => { setShowSetup(false); fetch(); }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Profile */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <div className="flex justify-between items-start mb-4 flex-col sm:flex-row gap-3">
          <div>
            <div className="font-semibold text-base text-text">{profile.khan_username || 'Usuário Khan'}</div>
            <a
              href={profile.profile_url || KHAN_BASE_URL}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-piano hover:underline inline-block mt-0.5"
            >
              Ver perfil no Khan Academy →
            </a>
          </div>
          <div className="flex items-center gap-4 sm:self-center select-none">
            {[
              { label: 'Streak', value: profile.streak_days + 'd' },
              { label: 'Min/semana', value: profile.minutes_week },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="font-bold text-xl text-text">{s.value || 0}</div>
                <div className="text-[10px] text-text-3 font-semibold uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setShowSetup(true)}>✏️</Button>
          </div>
        </div>

        {/* Topics */}
        <div className="flex flex-col gap-3 mt-4 border-t border-border pt-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-text-2 select-none">Tópicos</span>
            <Button variant="ghost" size="sm" onClick={() => setShowAddTopic(true)}>+ Tópico</Button>
          </div>
          {(profile.khan_topics || []).length === 0 ? (
            <p className="text-text-3 text-xs">Nenhum tópico cadastrado.</p>
          ) : (
            (profile.khan_topics || []).map(topic => (
              <div key={topic.id} className="bg-bg rounded-xl p-4 border border-border/40">
                <div className="flex justify-between items-center mb-2.5">
                  <div>
                    <div className="font-medium text-sm text-text">{topic.name}</div>
                    <a
                      href={topic.url || KHAN_BASE_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-piano hover:underline mt-0.5 inline-block"
                    >
                      Abrir no Khan →
                    </a>
                  </div>
                  <span className="text-xs font-semibold text-text">{topic.progress || 0}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden w-full mb-3">
                  <div
                    className="h-full rounded-full bg-warning transition-all duration-500"
                    style={{ width: `${topic.progress || 0}%` }}
                  />
                </div>
                {(topic.khan_subtopics || []).map(sub => (
                  <div
                    key={sub.id}
                    className="flex justify-between items-center py-1 mt-1 border-t border-border/20 text-xs text-text-2"
                  >
                    <span className="truncate max-w-[70%]">{sub.name}</span>
                    <a
                      href={sub.url || KHAN_BASE_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="text-piano hover:underline shrink-0"
                    >
                      Abrir →
                    </a>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      <KhanSetupModal
        open={showSetup}
        onClose={() => setShowSetup(false)}
        studentId={studentId}
        profile={profile}
        onSuccess={() => { setShowSetup(false); fetch(); }}
      />
      <AddTopicModal
        open={showAddTopic}
        onClose={() => setShowAddTopic(false)}
        khanProfileId={profile.id}
        onSuccess={() => { setShowAddTopic(false); fetch(); }}
      />
    </div>
  );
}
