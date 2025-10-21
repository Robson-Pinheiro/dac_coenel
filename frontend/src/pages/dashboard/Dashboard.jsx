import React from 'react'
// import './Dashboard.scss'

export default function Dashboard() {
	return (
		<div className="container-fluid">
			<div className="row">
				<div className="col-12 col-lg-10 col-xl-8">
					<div className="card shadow-sm">
						<div className="card-body">
							<h5 className="card-title">Dashboard</h5>
							<p className="mb-0 text-muted">
								Bem-vindo ao painel inicial. Em breve, você verá aqui métricas, atalhos e notificações do sistema.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

