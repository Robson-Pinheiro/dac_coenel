import React, { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { api } from '../api/client'

const FALLBACK_ASSIGNABLE = [
	'GESTOR_DE_ENERGIA',
	'TECNICO_DE_MANUTENCAO',
	'USUARIO',
	'FINANCEIRO',
	'SENSORES-MEDIDORES',
	'SISTEMA_NOTIFICACAO',
]

export default function Perfis() {
	const userRaw = localStorage.getItem('user')
	const user = userRaw ? JSON.parse(userRaw) : null
	const isSuperAdmin = user?.role === 'SUPERADMIN'

		const [list, setList] = useState([])
	const [loading, setLoading] = useState(true)
	const [err, setErr] = useState('')
	const [saving, setSaving] = useState({}) // { [id]: boolean }
		const [assignable, setAssignable] = useState(FALLBACK_ASSIGNABLE)

	useEffect(() => {
		if (!isSuperAdmin) return
		;(async () => {
			setLoading(true)
			setErr('')
					try {
						// Carregar papéis possíveis pelo backend (que controla políticas)
						try {
							const r = await api('/admin/roles')
							if (Array.isArray(r?.assignableRoles) && r.assignableRoles.length) {
								setAssignable(r.assignableRoles)
							}
						} catch (_) { /* fallback já definido */ }
						const data = await api('/admin/users')
						setList(data)
			} catch (e) {
				setErr(e.data?.error || e.message)
			} finally {
				setLoading(false)
			}
		})()
	}, [isSuperAdmin])

	async function updateRole(id, role) {
		setSaving(s => ({ ...s, [id]: true }))
		try {
			const updated = await api(`/admin/users/${id}/role`, {
				method: 'PATCH',
				body: JSON.stringify({ role })
			})
			setList(prev => prev.map(u => (u.id === id ? { ...u, role: updated.role } : u)))
		} catch (e) {
			alert(e.data?.error || e.message)
		} finally {
			setSaving(s => ({ ...s, [id]: false }))
		}
	}

	if (!localStorage.getItem('token')) return <Navigate to="/login" replace />
	if (!isSuperAdmin) return <div className="alert alert-danger">Acesso permitido somente ao SUPERADMIN.</div>

	return (
		<div className="container-fluid">
			<div className="d-flex align-items-center justify-content-between mb-3">
				<h5 className="mb-0">Gestão de Perfis</h5>
			</div>
			{err && <div className="alert alert-danger">{err}</div>}
			{loading ? (
				<div>Carregando…</div>
			) : (
				<div className="table-responsive">
					<table className="table align-middle">
						<thead>
							<tr>
								<th>Nome</th>
								<th>E-mail</th>
								<th>Papel</th>
								<th>Ativo</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{list.map(u => (
								<tr key={u.id}>
									<td>{u.name}</td>
									<td>{u.email}</td>
														<td style={{ minWidth: 240 }}>
															<select
																className="form-select form-select-sm"
																value={u.role}
																onChange={e => updateRole(u.id, e.target.value)}
																disabled={saving[u.id] || u.role === 'SUPERADMIN'}
															>
																{assignable.map(r => (
																	<option key={r} value={r}>{r}</option>
																))}
															</select>
														</td>
									<td>{u.active ? 'Sim' : 'Não'}</td>
									<td style={{ width: 1 }}>
										{saving[u.id] && <span className="text-muted small">Salvando…</span>}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	)
}

