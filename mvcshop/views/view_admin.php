<div align="center">
    <form action="admin/authorization" method="post">
        <div>
            <label for="auth_admin">Логин</label> <br>
            <input type="text" name="login" id="auth_admin">
        </div>
        <div>
            <label for="auth_password">Пароль</label> <br>
            <input type="password" name="password" id="auth_password"><br>
        </div>
        <?= 'SESSION_MESSAGE:' . $_SESSION['message'] ?><br>
        <input type="submit" value="Войти">
    </form>
</div>
