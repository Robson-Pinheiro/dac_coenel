import React, { useEffect, useState } from 'react'
import { api } from '../api/client'

export default function Profile() {
  const [me, setMe] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const data = await api('/me')
        setMe(data)
      } catch (err) {
        setError(err.data?.error || err.message)
      }
    })()
  }, [])

  if (error) return <div className="alert alert-danger">{error}</div>
  if (!me) return <div>Carregando…</div>

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">Meu perfil</h5>
        <dl className="row mb-0">
          <dt className="col-sm-3">Nome</dt>
          <dd className="col-sm-9">{me.name}</dd>
          <dt className="col-sm-3">E-mail</dt>
          <dd className="col-sm-9">{me.email}</dd>
          <dt className="col-sm-3">Papel</dt>
          <dd className="col-sm-9">{me.role}</dd>
          <dt className="col-sm-3">Nível de acesso</dt>
          <dd className="col-sm-9">{me.accessLevel}</dd>
          <dt className="col-sm-3">Ativo</dt>
          <dd className="col-sm-9">{me.active ? 'Sim' : 'Não'}</dd>
        </dl>
      </div>
    </div>
  )
}
