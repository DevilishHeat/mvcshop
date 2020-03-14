<table width="50%" border="1">
    <tr>
        <td>
            Логин
        </td>
        <td>
            Пароль
        </td>
        <td colspan="2">
            Функции
        </td>
    </tr>
<?php
foreach ($data as $admin):
?>
    <tr>
        <td>
            <?= $admin['login'] ?>
        </td>
        <td>
            <?php
            if ($admin['password'] != '')
            {
                echo '&#10003;';
            } else
            {
                echo 'X';
            }
            ?>
        </td>
        <td>
            <form action="admin_admins/change_password" method="post">
                <input type="hidden" name="id" value="<?= $admin['ID'] ?>">
                <input type="submit" value="Изменить пароль">
            </form>
        </td>
        <td>
            <form action="admin_admins/delete_admin" method="post">
                <input type="hidden" name="login" value="<?= $admin['login'] ?>">
                <input type="hidden" name="id" value="<?= $admin['ID'] ?>">
                <input type="submit" value="Удалить">
                <?= '<br>' . $_SESSION['message'] ?>
            </form>
        </td>
    </tr>
<?php endforeach; ?>
</table>
<form action="admin_admins/create_admin" method="post">
    <br>
    <table width="50%" border="1">
        <thead>Создать новую учётную запись</thead>
        <tr>
            <td>
                <label for="login">Логин</label>
            </td>
            <td>
                <label for="password">Пароль</label>
            </td>
            <td colspan="2">
                <label for="password_repeat">Повторите пароль</label>
            </td>
        </tr>
        <tr>
            <td>
                <input type="text" name="login" id="login">
            </td>
            <td>
                <input type="password" name="password" id="password">
            </td>
            <td>
                <input type="password" name="password_repeat" id="password_repeat">
            </td>
            <td>
                <input type="submit" value="Создать">
            </td>
        </tr>
    </table>
</form>
<?= $_SESSION['message'] ?>

