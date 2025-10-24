const API_BASE = '/api'

export async function api(path, options = {}) {
  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const text = await res.text()
  let data
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  if (!res.ok) {
    const err = new Error(data?.error || 'Erro de requisição')
    err.status = res.status
    err.data = data
    // Se perfil ficou inativo, forçar logout e redirecionar (evitar interromper o fluxo da tela de login)
    if ((res.status === 401 || res.status === 403) && (data?.error === 'Perfil inativo')) {
      const isLoginRequest = typeof path === 'string' && path.startsWith('/auth/login')
      const alreadyOnLogin = typeof window !== 'undefined' && window.location && window.location.pathname === '/login'
      try {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      } catch {}
      if (!isLoginRequest && !alreadyOnLogin && typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    throw err
  }
  return data
}
