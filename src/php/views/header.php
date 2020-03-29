<!-- <?php
if (!isset($_SESSION['username']))
{
    $_SESSION['authorization'] = 0;
} else
{
    $_SESSION['authorization'] = 1;
}
?> -->
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
								<div class="user-actions__item">
									<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#authorization">Войти</button>
								</div>
								<div class="user-actions__item">
									<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#registration">Регистрация</button>
								</div>
								<div class="user-actions__item">
                  <a href="cart">Корзина</a>
										<!--<button class="btn btn-danger">	Корзина <span class="badge badge-light">10</span></button>-->
								</div>
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
	<!-- <?php
                if ($_SESSION['authorization']):
                    echo 'Вход выполнен<br>' . $_SESSION['username'] ?>
                    <form action="../authorization/logout" method="post">
                        <input type="hidden" name="location" value="<?= $_SERVER['REQUEST_URI'] ?>">
                        <input type="submit" value="Выход">
                    </form>
                <?php else: ?>
                    <form action="../authorization" method="post">
                        <div>
                            <label for="auth_user">Имя пользователя</label> <br>
                            <input type="text" name="username" id="auth_user">
                        </div>
                        <div>
                            <label for="auth_password">Пароль</label> <br>
                            <input type="password" name="password" id="auth_password"><br>
                        </div>
                        <input type="hidden" name="location" value="<?= $_SERVER['REQUEST_URI'] ?>">
                        <?= 'SESSION_MESSAGE:' . $_SESSION['message'] ?><br>
                        <input type="submit" value="Войти">
                    </form>
                    <a href="registration">Регистрация</a>
                <?php endif; ?> -->
</header>

<?php
	includeTemplate('/templates/modals/authorization.php');
	includeTemplate('/templates/modals/registration.php');
?>