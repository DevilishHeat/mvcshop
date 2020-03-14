<?php
session_start();
?>
<div align="center">
    <form action="/registration/create_user" method="post">
        <label for="username">Имя пользователя</label> <br>
        <input type="text" id="username" name="username" required> <br>
        <label for="email">Email</label> <br>
        <input type="email" id="email" name="email" required> <br>
        <label for="password">Пароль</label> <br>
        <input type="password" id="password" name="password" required> <br>
        <label for="password_repeat">Повторите пароль</label> <br>
        <input type="password" id="password_repeat" name="password_repeat" required> <br>
        <?= 'SESSION_MESSAGE: ' . $_SESSION['message']?> <br>
        <input type="submit" value="Зарегистрироваться">
    </form>
</div>