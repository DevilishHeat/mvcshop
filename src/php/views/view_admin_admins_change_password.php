<div align="center">
    <form action="../admin_admins/update_password" method="post"><br>
        <label for="old_password">Старый пароль</label><br>
        <input type="password" name="old_password" id="old_password"><br>
        <label for="new_password">Новый пароль</label><br>
        <input type="password" name="new_password" id="new_password"><br>
        <label for="password_repeat">Повторите пароль</label><br>
        <input type="password" name="password_repeat" id="password_repeat"><br>
        <input type="hidden" name="id" value="<?= $_POST['id'] ?>">
        <input type="submit" value="Изменить"> <br>
        <?= $_SESSION['message'] ?>
    </form>
</div>