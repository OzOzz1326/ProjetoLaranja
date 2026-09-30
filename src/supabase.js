import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = supabaseUrl && supabasePublishableKey
	? createClient(supabaseUrl, supabasePublishableKey)
	: null

export function dadosBasicosUsuario(usuarioAuth) {
	return {
		id: usuarioAuth.id,
		auth_id: usuarioAuth.id,
		nome: usuarioAuth.user_metadata?.nome || usuarioAuth.email?.split('@')[0] || 'Usuário',
		email: usuarioAuth.email || '',
		data_nascimento: usuarioAuth.user_metadata?.data_nascimento || '',
		avatar_url: usuarioAuth.user_metadata?.avatar_url || '',
	}
}

export async function carregarPerfilUsuario(usuarioAuth) {
	const dadosBasicos = dadosBasicosUsuario(usuarioAuth)

	if (!supabase || !usuarioAuth.email) {
		return dadosBasicos
	}

	const { data, error } = await supabase
		.from('usuarios')
		.select('*')
			.ilike('email', usuarioAuth.email.trim())
		.maybeSingle()

	if (error) {
		throw error
	}

	return {
		...dadosBasicos,
		...data,
		auth_id: usuarioAuth.id,
		email: usuarioAuth.email,
		avatar_url: usuarioAuth.user_metadata?.avatar_url || '',
		perfil_id: data?.id ?? null,
	}
}