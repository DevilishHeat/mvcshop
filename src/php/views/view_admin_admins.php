<table class="table" border="1">
  <thead class="thead-dark">
  <tr>
    <th scope="col">
      Логин
    </th>
    <th scope="col">
      Пароль
    </th>
    <th scope="col" colspan="2">
      Функции
    </th>
  </tr>
  </thead>
  <tbody>
<?php
foreach ($data as $admin):
?>
    <tr class="admin">
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
          <button type="button" class="btn btn-primary change_password" value="<?= $admin['admin_id'] ?>">Изменить пароль</button>
        </td>
        <td>
          <button type="button" value="<?= $admin['admin_id'] ?>" class="btn btn-primary delete_admin">X</button>
          <div class="alert alert-danger" hidden></div>
        </td>
    </tr>
<?php endforeach; ?>
  </tbody>
</table>
<form action="admin_admins/create_admin" method="post">
    <br>
    <table class="table" width="50%" border="1">
        <thead class="thead-dark" align="center">
        <th scope="col" colspan="4">Создать новую учётную запись</th>
        </thead>
        <tr>
            <td>
                <label for="login">Логин</label>
            </td>
            <td>
                <label for="password">Пароль</label>
            </td>
            <td>
                <label for="password_repeat">Повторите пароль</label>
            </td>
          <td>
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

