# Skill: Integração Khan Academy

**Quando usar:** ao implementar ou modificar a aba Khan Academy de um aluno.

---

## Modelo de dados Khan

```
khan_profiles
  id, student_id (FK), khan_username, profile_url,
  streak_days, minutes_week, last_activity, created_at

khan_topics
  id, khan_profile_id (FK), name, url, progress (0–100), order

khan_subtopics
  id, khan_topic_id (FK), name, url, completed (bool)
```

---

## Estrutura da aba

```
[Perfil] — username, link para perfil, streak, minutos/semana
  └── [Tópico 1] — nome, link, barra de progresso %
       ├── [Subtópico A] — nome, link, status (concluído/pendente)
       └── [Subtópico B]
  └── [Tópico 2]
       └── ...
```

---

## URLs do Khan Academy

Base: `https://pt.khanacademy.org`

Exemplos de links diretos:
- Perfil: `https://pt.khanacademy.org/profile/{username}`
- Tópico: `https://pt.khanacademy.org/math/arithmetic`
- Exercício: `https://pt.khanacademy.org/math/arithmetic/fractions`

O professor cola a URL manualmente. Não há API do Khan no MVP.

---

## Fetch do perfil

```js
// src/lib/api.js
khan.getProfile(studentId)
// retorna: khan_profiles com khan_topics e khan_subtopics aninhados

// Query:
supabase
  .from('khan_profiles')
  .select('*, khan_topics(*, khan_subtopics(*))')
  .eq('student_id', studentId)
  .single()
```

---

## Exibição do progresso

```jsx
// Barra de progresso de um tópico
<div style={{ height: 6, borderRadius: 3, background: 'var(--surface-2)' }}>
  <div style={{
    height: '100%',
    borderRadius: 3,
    background: 'var(--matematica)',  // #F59E0B — cor padrão para Khan/math
    width: topic.progress + '%',
    transition: 'width 0.5s',
  }} />
</div>
```

---

## Empty state

Quando o aluno não tem khan_profile:
```jsx
<EmptyState
  icon="📚"
  title="Khan Academy não configurado"
  description="Adicione o perfil Khan Academy deste aluno para rastrear o progresso."
/>
```

---

## Onde aparece

| Tela | Contexto |
|---|---|
| Detalhe do aluno → aba Khan Academy | Visão completa com edição |
| Portal dos pais → aba Khan | Visão read-only com links |
| Relatório | Snapshot do progresso |
