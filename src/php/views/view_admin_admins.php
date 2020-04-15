<table class="table">
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
  <tbody class="admins">
<?php
foreach ($data as $admin):
?>
    <tr class="admin" id="<?= $admin['admin_id'] ?>">
        <td>
            <?= $admin['login'] ?>
        </td>
        <td class="is_password_set">
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
          <button type="button" class="btn btn-primary change_password" data-toggle="modal" data-target="#change_password" value="<?= $admin['admin_id'] ?>">Изменить пароль</button>
        </td>
        <td>
          <button type="button" value="<?= $admin['admin_id'] ?>" class="btn btn-primary delete_admin">X</button>
          <div class="alert alert-danger" hidden></div>
        </td>
    </tr>
<?php endforeach; ?>
  </tbody>
</table>
<form class="js-create_admin">
    <br>
    <table class="table">
        <thead class="thead-dark text-center">
        <tr>
          <th scope="col" colspan="4">Создать новую учётную запись</th>
        </tr>
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
            <div class="alert alert-danger" hidden></div>
          </td>
        </tr>
        <tr>
            <td>
                <input type="text" name="login" id="login" class="form-control">
            </td>
            <td>
                <input type="password" name="password" id="password" class="form-control">
            </td>
            <td>
                <input type="password" name="password_repeat" id="password_repeat" class="form-control">
            </td>
            <td>
                <button type="button" class="btn btn-primary create_admin">Создать</button>
            </td>
        </tr>
    </table>
</form>

<?php
include('./templates/modals/admin_admins.php');
?>