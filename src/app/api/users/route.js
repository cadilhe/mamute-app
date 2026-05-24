import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Função utilitária para inicializar o cliente do Supabase
function getAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Variáveis de ambiente do Supabase não configuradas no servidor.');
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function getUserClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
}

// Middleware de validação de super-administrador
async function validateSuperAdmin(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Token de autenticação não fornecido.', status: 401 };
  }

  const token = authHeader.split(' ')[1];
  const userClient = getUserClient();

  // Validar token no Supabase Auth
  const { data: { user }, error: authErr } = await userClient.auth.getUser(token);
  if (authErr || !user) {
    return { error: 'Sessão inválida ou expirada.', status: 401 };
  }

  // Verificar na tabela profiles se o usuário é super administrador
  const adminClient = getAdminClient();
  const { data: profile, error: profileErr } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileErr || !profile || profile.role !== 'teacher' || profile.unit_id !== null) {
    return { error: 'Acesso negado. Apenas super administradores podem gerenciar usuários.', status: 403 };
  }

  return { user, adminClient };
}

// GET: Listar todos os usuários (profiles)
export async function GET(request) {
  try {
    const { error, adminClient } = await validateSuperAdmin(request);
    if (error) {
      return NextResponse.json({ error }, { status: error.status || 400 });
    }

    const { data: profiles, error: getErr } = await adminClient
      .from('profiles')
      .select('*, units(name)')
      .order('full_name');

    if (getErr) throw getErr;

    return NextResponse.json({ data: profiles || [] });
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao listar usuários: ' + err.message }, { status: 500 });
  }
}

// POST: Criar novo usuário
export async function POST(request) {
  try {
    const { error: validationError, adminClient } = await validateSuperAdmin(request);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: validationError.status || 400 });
    }

    const body = await request.json();
    const { email, password, full_name, role, unit_id } = body;

    if (!email || !password || !full_name || !role) {
      return NextResponse.json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' }, { status: 400 });
    }

    // 1. Criar usuário na autenticação do Supabase (Auth)
    const { data: authData, error: createAuthErr } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name }
    });

    if (createAuthErr || !authData?.user) {
      throw createAuthErr || new Error('Não foi possível registrar a conta na autenticação.');
    }

    const newUserId = authData.user.id;

    // 2. Criar ou atualizar perfil correspondente na tabela profiles
    const { data: newProfile, error: createProfileErr } = await adminClient
      .from('profiles')
      .upsert({
        id: newUserId,
        full_name,
        role,
        unit_id: role === 'teacher' ? (unit_id || null) : null,
        email
      })
      .select()
      .single();

    if (createProfileErr) {
      // Se falhar o profile, limpamos a conta de auth criada para evitar órfãos
      await adminClient.auth.admin.deleteUser(newUserId);
      throw createProfileErr;
    }

    return NextResponse.json({ data: newProfile });
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao criar usuário: ' + err.message }, { status: 500 });
  }
}

// PUT: Atualizar informações do usuário
export async function PUT(request) {
  try {
    const { error: validationError, adminClient } = await validateSuperAdmin(request);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: validationError.status || 400 });
    }

    const body = await request.json();
    const { id, email, password, full_name, role, unit_id } = body;

    if (!id || !email || !full_name || !role) {
      return NextResponse.json({ error: 'Parâmetros insuficientes para atualização.' }, { status: 400 });
    }

    // 1. Atualizar e-mail e/ou senha na autenticação
    const authUpdatePayload = { email };
    if (password && password.trim() !== '') {
      authUpdatePayload.password = password;
    }

    const { error: updateAuthErr } = await adminClient.auth.admin.updateUserById(id, authUpdatePayload);
    if (updateAuthErr) {
      throw updateAuthErr;
    }

    // 2. Atualizar perfil correspondente na tabela profiles
    const { data: updatedProfile, error: updateProfileErr } = await adminClient
      .from('profiles')
      .update({
        full_name,
        role,
        unit_id: role === 'teacher' ? (unit_id || null) : null,
        email
      })
      .eq('id', id)
      .select()
      .single();

    if (updateProfileErr) throw updateProfileErr;

    return NextResponse.json({ data: updatedProfile });
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao atualizar usuário: ' + err.message }, { status: 500 });
  }
}

// DELETE: Remover usuário
export async function DELETE(request) {
  try {
    const { error: validationError, adminClient } = await validateSuperAdmin(request);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: validationError.status || 400 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário não fornecido.' }, { status: 400 });
    }

    // 1. Deletar do perfil (tabela profiles)
    const { error: deleteProfileErr } = await adminClient
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (deleteProfileErr) throw deleteProfileErr;

    // 2. Deletar da autenticação
    const { error: deleteAuthErr } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteAuthErr) throw deleteAuthErr;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao remover usuário: ' + err.message }, { status: 500 });
  }
}
