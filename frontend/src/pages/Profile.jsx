import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

export default function Profile() {
  const navigate = useNavigate()
  const [me, setMe] = useState(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const data = await api('/me')
        setMe(data)
        setForm({ name: data.name || '', email: data.email || '', password: '' })
      } catch (err) {
        setError(err.data?.error || err.message)
      }
    })()
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    setError('')
    setSavedMsg('')
    setSaving(true)
    try {
      const payload = { name: form.name, email: form.email }
      if (form.password) payload.password = form.password
      const resp = await api('/me', { method: 'PATCH', body: JSON.stringify(payload) })
      if (resp?.token) localStorage.setItem('token', resp.token)
      if (resp?.user) localStorage.setItem('user', JSON.stringify(resp.user))
      setMe(resp.user)
      setForm(f => ({ ...f, password: '' }))
      setSavedMsg('Dados atualizados com sucesso!')
    } catch (err) {
      setError(err.data?.error || err.message)
    } finally {
      setSaving(false)
    }
  }

  if (error) return <div className="alert alert-danger">{error}</div>
  if (!me) return <div>Carregando…</div>

  return (
    <div className="container-fluid">
      <div className="row g-3">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Meu perfil</h5>
              {savedMsg && <div className="alert alert-success py-2">{savedMsg}</div>}
              <form onSubmit={handleSave} className="row g-3">
                <div className="col-12">
                  <label className="form-label">Nome</label>
                  <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="col-12">
                  <label className="form-label">E-mail</label>
                  <input type="email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className="col-12">
                  <label className="form-label">Nova senha (opcional)</label>
                  <input type="password" className="form-control" placeholder="Digite para alterar" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                  <div className="form-text">Mínimo de 6 caracteres se desejar alterar.</div>
                </div>
                <div className="col-12 d-flex gap-2">
                  <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Salvando…' : 'Salvar alterações'}</button>
                  {me.accessLevel < 7 && (
                    <button type="button" className="btn btn-outline-danger ms-auto" onClick={() => setShowDelete(true)}>
                      Excluir conta
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body d-flex flex-column align-items-center justify-content-center text-center">
              <i className="bi bi-person-circle mb-3" style={{ fontSize: 64 }} />
              <div className="small text-muted">{me.role}</div>
              <div className="small">Nível de acesso: {me.accessLevel}</div>
              <div className="small">Status: {me.active ? 'Ativo' : 'Inativo'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmação de exclusão */}
      {showDelete && (
        <>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog">
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirmar exclusão</h5>
                  <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowDelete(false)}></button>
                </div>
                <div className="modal-body">
                  <p>Tem certeza que deseja excluir sua conta? Esta ação não poderá ser desfeita.</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowDelete(false)}>Cancelar</button>
                  <button type="button" className="btn btn-danger" onClick={async () => {
                    try {
                      await api('/me', { method: 'DELETE' })
                      localStorage.removeItem('token')
                      localStorage.removeItem('user')
                      navigate('/login')
                    } catch (e) {
                      alert(e.data?.error || e.message)
                    }
                  }}>Excluir</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  )
}
