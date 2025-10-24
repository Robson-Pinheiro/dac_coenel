import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: 'superadmin@admin.com', password: 'superadmin123' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      let data
      if (mode === 'register') {
        data = await api('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name: form.name, email: form.email, password: form.password })
        })
      } else {
        data = await api('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: form.email, password: form.password })
        })
      }
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/profile')
    } catch (err) {
      setError(err.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title mb-3">{mode === 'login' ? 'Entrar' : 'Criar conta'}</h5>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              {mode === 'register' && (
                <div className="mb-3">
                  <label className="form-label">Nome</label>
                  <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
              )}
              <div className="mb-3">
                <label className="form-label">E-mail</label>
                <input type="email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Senha</label>
                <input type="password" className="form-control" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              </div>
              <div className="d-grid gap-2">
                <button disabled={loading} className="btn btn-primary" type="submit">
                  {loading ? 'Aguarde…' : (mode === 'login' ? 'Entrar' : 'Criar conta')}
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
                  {mode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
