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
		// Estados para modais de editar/deletar
		const [editUser, setEditUser] = useState(null) // objeto do usuário selecionado
		const [editForm, setEditForm] = useState({ name: '', email: '', password: '', active: true })
		const [savingEdit, setSavingEdit] = useState(false)
		const [deleteUser, setDeleteUser] = useState(null) // objeto do usuário selecionado para deletar

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
			// Atualiza a linha com todos os campos retornados (inclui accessLevel atualizado)
			setList(prev => prev.map(u => (u.id === id ? { ...u, ...updated } : u)))
		} catch (e) {
			alert(e.data?.error || e.message)
		} finally {
			setSaving(s => ({ ...s, [id]: false }))
		}
	}

	function openEdit(u) {
		setEditUser(u)
		setEditForm({ name: u.name || '', email: u.email || '', password: '', active: !!u.active })
	}
	function closeEdit() {
		setEditUser(null)
		setSavingEdit(false)
	}
	async function saveEdit() {
		if (!editUser) return
		setSavingEdit(true)
		try {
			const payload = { name: editForm.name, email: editForm.email, active: !!editForm.active }
			if (editForm.password && editForm.password.length >= 1) {
				payload.password = editForm.password
			}
			const updated = await api(`/admin/users/${editUser.id}`, {
				method: 'PATCH',
				body: JSON.stringify(payload)
			})
			setList(prev => prev.map(u => (u.id === editUser.id ? { ...u, ...updated } : u)))
			closeEdit()
		} catch (e) {
			alert(e.data?.error || e.message)
		} finally {
			setSavingEdit(false)
		}
	}

	function openDelete(u) { setDeleteUser(u) }
	function closeDelete() { setDeleteUser(null) }
	async function confirmDelete() {
		if (!deleteUser) return
		setSaving(s => ({ ...s, [deleteUser.id]: true }))
		try {
			await api(`/admin/users/${deleteUser.id}`, { method: 'DELETE' })
			setList(prev => prev.filter(u => u.id !== deleteUser.id))
			closeDelete()
		} catch (e) {
			alert(e.data?.error || e.message)
		} finally {
			setSaving(s => ({ ...s, [deleteUser.id]: false }))
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
								<th style={{ width: 160 }}>Ações</th>
							</tr>
						</thead>
						<tbody>
							{list.map(u => (
								<tr key={u.id}>
									<td>{u.name}</td>
									<td>{u.email}</td>
														<td style={{ minWidth: 240 }}>
															{u.role === 'SUPERADMIN' ? (
																<span className="badge bg-danger">SUPERADMIN</span>
															) : (
																<select
																	className="form-select form-select-sm"
																	value={u.role}
																	onChange={e => updateRole(u.id, e.target.value)}
																	disabled={saving[u.id]}
																>
																	{assignable.map(r => (
																		<option key={r} value={r}>{r}</option>
																	))}
																</select>
															)}
														</td>
									<td>{u.active ? 'Sim' : 'Não'}</td>
									<td>
										<div className="btn-group btn-group-sm" role="group">
											<button
												type="button"
												className="btn btn-outline-primary"
												disabled={u.role === 'SUPERADMIN' || u.id === user?.id}
												onClick={() => openEdit(u)}
											>
												Editar
											</button>
											<button
												type="button"
												className="btn btn-outline-danger"
												disabled={u.role === 'SUPERADMIN' || u.id === user?.id}
												onClick={() => openDelete(u)}
											>
												Deletar
											</button>
										</div>
										{saving[u.id] && <span className="text-muted small ms-2">Processando…</span>}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{/* Modal Editar Usuário */}
			{editUser && (
				<div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,.5)' }}>
					<div className="modal-dialog">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">Editar usuário</h5>
								<button type="button" className="btn-close" onClick={closeEdit} />
							</div>
							<div className="modal-body">
								<div className="mb-3">
									<label className="form-label">Nome</label>
									<input className="form-control" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
								</div>
								<div className="mb-3">
									<label className="form-label">E-mail</label>
									<input type="email" className="form-control" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
								</div>
								<div className="mb-3">
									<label className="form-label">Nova senha (opcional)</label>
									<input type="password" className="form-control" value={editForm.password} onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))} />
									<div className="form-text">Deixe em branco para não alterar.</div>
								</div>
								<div className="form-check form-switch">
									<input className="form-check-input" type="checkbox" id="chkActive" checked={!!editForm.active} onChange={e => setEditForm(f => ({ ...f, active: e.target.checked }))} />
									<label className="form-check-label" htmlFor="chkActive">Perfil ativo</label>
								</div>
							</div>
							<div className="modal-footer">
								<button type="button" className="btn btn-secondary" onClick={closeEdit} disabled={savingEdit}>Cancelar</button>
								<button type="button" className="btn btn-primary" onClick={saveEdit} disabled={savingEdit}>{savingEdit ? 'Salvando…' : 'Salvar'}</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Modal Deletar Usuário */}
			{deleteUser && (
				<div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,.5)' }}>
					<div className="modal-dialog">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">Confirmar exclusão</h5>
								<button type="button" className="btn-close" onClick={closeDelete} />
							</div>
							<div className="modal-body">
								<p>Tem certeza que deseja excluir a conta de <strong>{deleteUser.name}</strong> ({deleteUser.email})?</p>
								<p className="text-danger mb-0">Esta ação é irreversível.</p>
							</div>
							<div className="modal-footer">
								<button type="button" className="btn btn-secondary" onClick={closeDelete}>Cancelar</button>
								<button type="button" className="btn btn-danger" onClick={confirmDelete}>Excluir</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

