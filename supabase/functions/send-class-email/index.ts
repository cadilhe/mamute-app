const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestData {
  parentEmail: string;
  studentName: string;
  disciplineName: string;
  disciplineKey: string;
  content: string;
  pending?: string;
  nextStep?: string;
  formattedDate: string;
}

const DISCIPLINES_COLORS: Record<string, { color: string; bg: string }> = {
  piano: { color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' },
  robotica: { color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
  matematica: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
  ingles: { color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)' },
  bateria: { color: '#EC4899', bg: 'rgba(236, 72, 153, 0.1)' },
  reforco: { color: '#F97316', bg: 'rgba(249, 115, 22, 0.1)' },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }

    const {
      parentEmail,
      studentName,
      disciplineName,
      disciplineKey,
      content,
      pending,
      nextStep,
      formattedDate
    }: RequestData = await req.json()

    if (!parentEmail) {
      throw new Error('E-mail do responsável é obrigatório')
    }

    const discColor = DISCIPLINES_COLORS[disciplineKey] || { color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)' };

    // Format optional sections
    const pendingHtml = pending
      ? `
        <div class="alert-box">
          <div class="section-title">Pendências / Tarefas</div>
          <p class="section-content">${pending.replace(/\n/g, '<br>')}</p>
        </div>
      `
      : '';

    const nextStepHtml = nextStep
      ? `
        <div class="next-box">
          <div class="section-title">Próximo Passo</div>
          <p class="section-content">${nextStep.replace(/\n/g, '<br>')}</p>
        </div>
      `
      : '';

    // HTML Email Template
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resumo da Aula</title>
  <style>
    body {
      background-color: #0f0f10;
      color: #e8e8ed;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
      box-sizing: border-box;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 0.05em;
      color: #ffffff;
      text-transform: uppercase;
      margin: 0;
    }
    .logo span {
      color: ${discColor.color};
    }
    .card {
      background-color: #17171a;
      border: 1px solid #2a2a30;
      border-radius: 16px;
      padding: 30px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      margin-bottom: 24px;
    }
    .greeting {
      font-size: 14px;
      color: #8888a0;
      margin-bottom: 8px;
    }
    .title {
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      margin-top: 0;
      margin-bottom: 24px;
      line-height: 1.3;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      font-size: 11px;
      font-weight: 700;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background-color: ${discColor.bg};
      color: ${discColor.color};
      margin-bottom: 24px;
    }
    .section-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #8888a0;
      margin-top: 0;
      margin-bottom: 8px;
    }
    .section-content {
      font-size: 15px;
      line-height: 1.6;
      color: #e8e8ed;
      margin: 0 0 24px 0;
    }
    .section-content:last-child {
      margin-bottom: 0;
    }
    .alert-box {
      border-left: 4px solid #F59E0B;
      background-color: rgba(245, 158, 11, 0.08);
      border-radius: 4px 8px 8px 4px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .alert-box .section-title {
      color: #F59E0B;
    }
    .alert-box .section-content {
      color: #e8e8ed;
      margin-bottom: 0;
    }
    .next-box {
      border-left: 4px solid #10B981;
      background-color: rgba(16, 185, 129, 0.08);
      border-radius: 4px 8px 8px 4px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .next-box .section-title {
      color: #10B981;
    }
    .next-box .section-content {
      color: #e8e8ed;
      margin-bottom: 0;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #58586f;
      line-height: 1.5;
    }
    .footer a {
      color: #8888a0;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1 class="logo">MAMUTE<span>.</span></h1>
    </div>
    <div class="card">
      <div class="greeting">Olá,</div>
      <div class="title">Aqui está o resumo da aula de <strong>${studentName}</strong></div>
      
      <div class="badge">${disciplineName}</div>
      
      <div class="section-title">Data da Aula</div>
      <p class="section-content">${formattedDate}</p>
      
      <div class="section-title">O que foi feito</div>
      <p class="section-content">${content.replace(/\n/g, '<br>')}</p>
      
      ${pendingHtml}
      
      ${nextStepHtml}
    </div>
    <div class="footer">
      Este é um e-mail automático enviado pelo sistema de gestão de ensino MAMUTE.<br>
      Para ver o histórico completo e progresso do seu filho, acesse o <a href="https://mamute-app.vercel.app">Portal dos Pais</a>.
    </div>
  </div>
</body>
</html>
    `;

    const senderEmail = Deno.env.get('SENDER_EMAIL') || 'Mamute <onboarding@resend.dev>';

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: senderEmail,
        to: [parentEmail],
        subject: `Resumo da Aula de ${disciplineName} - ${studentName}`,
        html: htmlContent,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || 'Falha ao enviar e-mail via Resend');
    }

    return new Response(JSON.stringify({ success: true, messageId: result.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
