<?php
if (isset($_SESSION['admin'])): ?>

	<header class="header">
		<div class="header__wrapper">
			<div class="header__header-top header-top">
				<div class="header-top__wrapper container">
					<div class="header-top__row row">
						<div class="col">
							<div class="user">
								<div class="user__side">
									<div class="user__label text-center text-uppercase text-dark font-weight-bold"> <span>Администратор: </span> <?= $_SESSION['admin'] ?></div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			
			<div class="header__header-bottom header-bottom bg-light">
				<div class="header-bottom__wrapper container">
					<nav class="navbar navbar-expand-lg navbar-light">
						<div class="navbar-nav">
							<a class="nav-item nav-link" href="/">Главная</a>
							<a class="nav-item nav-link active" href="admin_catalog">Каталог</a>
							<a class="nav-item nav-link" href="admin_admins">Администраторы</a>
							<a class="nav-item nav-link" href="admin_categories">Категории</a>
						</div>
					</nav>
				</div>
			</div>
		</div>
	</header>

<?php endif; ?>