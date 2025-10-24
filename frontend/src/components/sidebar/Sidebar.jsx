import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
// Estilos opcionais futuros
// import '../styles/Sidebar.scss'

export default function Sidebar() {
	const navigate = useNavigate()
	const token = localStorage.getItem('token')
	const userRaw = localStorage.getItem('user')
	const user = userRaw ? JSON.parse(userRaw) : null

	function logout() {
		localStorage.removeItem('token')
		localStorage.removeItem('user')
		navigate('/login')
	}

		return (
			<aside
				className="d-flex flex-column bg-light border-end position-sticky top-0"
				style={{ width: 240, height: '100vh' }}
			>
				<div className="px-3 py-3 border-bottom">
					<Link to="/dashboard" className="text-decoration-none fw-bold">DAC_COENEL</Link>
				</div>
			<nav className="flex-grow-1 p-2">
				<ul className="nav nav-pills flex-column gap-1">
					<li className="nav-item">
						<NavLink to="/dashboard" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
							<i className="bi bi-speedometer2 me-2" /> Dashboard
						</NavLink>
					</li>
					{token && user?.role === 'SUPERADMIN' && (
						<li className="nav-item">
							<NavLink to="/perfis" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
								<i className="bi bi-people me-2" /> Perfis
							</NavLink>
						</li>
					)}
					{token && (
						<li className="nav-item">
							<NavLink to="/perfil" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
								<i className="bi bi-person-circle me-2" /> Perfil
							</NavLink>
						</li>
					)}
				</ul>
			</nav>
					<div className="p-3 border-top mt-auto">
						{token && user ? (
							<div className="d-flex align-items-center justify-content-between gap-2">
								<div className="small text-muted text-truncate" title={`${user.name} (${user.role})`}>
									{user.name}
								</div>
								<button className="btn btn-outline-danger btn-sm" onClick={logout} title="Sair">
									<i className="bi bi-arrow-bar-right" />
								</button>
							</div>
						) : (
							<Link to="/login" className="btn btn-primary w-100">
								<i className="bi bi-box-arrow-in-right me-1" /> Entrar
							</Link>
						)}
					</div>
		</aside>
	)
}

