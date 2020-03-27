<div id="autorization" aria-labelledby="Форма авторизации" class="modal" tabindex="-1" role="dialog">
<div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title text-info">Авторизация</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
      <form class="js-authorization">
        <div class="form-group">
          <label for="authLogin">Имя пользователя:</label>
          <input id="authLogin" class="form-control" type="text" name="username" aria-describedby="Поле для ввода логина" required>
        </div>

        <div class="form-group">
          <label for="authPassword">Пароль:</label>
          <input id="authPassword" class="form-control" type="password" name="password" aria-describedby="Поле для ввода пароля" required>
        </div>

        <button type="submit" class="btn btn-primary">Войти</button>
      </form>
      </div>
    </div>
  </div>
</div>