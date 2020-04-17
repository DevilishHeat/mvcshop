<header class="header">

	<div class="header__wrapper">
    <div class="header__header-top header-top">
			<div class="header-top__wrapper container">
				<div class="header-top__row row">
					<div class="col-3">
						<a href="/main" class="header-top__logo logo">
							<div class="logo__image">
								<img class="logo__img" src="<?= $this->images ?>logo/logo-winter.png" alt="Логотип">
							</div>
						</a>
					</div>
					<div class="col-9 d-flex">
						<div class="header-top__user-actions user-actions">
							<div class="user-actions__list">
                <?php
                if (isset($_SESSION['username'])):
                ?>
                <div class="user-actions__item">
                  Вы вошли как: <?= $_SESSION['username'] ?>
                </div>
                <div class="user-actions__item">
                  <button type="button" class="btn btn-primary logout" >Выйти</button>
                </div>
                  <div class="user-actions__item">
                    <a class="btn btn-danger" href="cart">	Корзина <span class="badge badge-light items-counter"><?= isset($_SESSION['cart']) ? count($_SESSION['cart']) : "" ?></span></a>
                  </div>
                <?php else: ?>
								<div class="user-actions__item">
									<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#authorization">Войти</button>
								</div>
								<div class="user-actions__item">
									<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#registration">Регистрация</button>
								</div>
								<div class="user-actions__item">
										<a class="btn btn-danger" href="cart">	Корзина <span class="badge badge-light items-counter"><?= isset($_SESSION['cart']) ? count($_SESSION['cart']) : "" ?></span></a>
								</div>
                <?php endif; ?>
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
						<a class="nav-item nav-link active" href="/main">Главная <span class="sr-only">(current)</span></a>
						<a class="nav-item nav-link" href="/contacts">Контакты</a>
						<a class="nav-item nav-link" href="/about">О компании</a>
					</div>
				</nav>
			</div>
		</div>
	</div>

</header>

<?php
  include('./templates/modals/authorization.php');
  include('./templates/modals/registration.php');
?>