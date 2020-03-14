<?php
if (!isset($_SESSION['username']))
{
    $_SESSION['authorization'] = 0;
} else
{
    $_SESSION['authorization'] = 1;
}
?>
<header>
    <table width="100%">
        <tr>
            <td>
                <a href="/main">Главная</a>
            </td>
            <td>
                <a href="order">Корзина</a>
            </td>
            <td align="right">
                <?php
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
                <?php endif; ?>
            </td>
        </tr>
    </table>
</header>