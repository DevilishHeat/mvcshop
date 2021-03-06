<div id="registration" class="modal" aria-labelledby="Форма регистрации" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title text-info">Регистрация 🏡</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">

        <div class="modal-alert alert alert-danger my-3 mx-auto" hidden  role="alert"></div>
        <div class="modal-alert alert alert-success my-3 mx-auto" hidden  role="alert"></div>

      <form class="js-registration">
        <div class="form-group">
          <label for="RegLogin">Имя пользователя:</label>
          <input type="text" class="form-control" id="RegLogin" name="username" aria-describedby="Поле для ввода логина" required>
        </div>

        <div class="form-group">
          <label for="RegEmail">Электронная почта:</label>
          <input type="email" class="form-control" id="RegEmail" name="email" aria-describedby="Поле для ввода адреса электронной почтчы" required>
        </div>

        <div class="form-group">
          <label for="RegPassword">Пароль:</label>
          <input type="password" class="form-control" id="RegPassword" name="password" aria-describedby="Поле для ввода пароля" required>
        </div>

        <div class="form-group">
          <label for="repeatRegPassword">Повторите пароль:</label>
          <input type="password" class="form-control" id="repeatRegPassword" name="password_repeat" aria-describedby="Поле для повторного ввода пароля" data-compare-target="RegPassword" required>
        </div>

        <button type="submit" class="btn btn-primary">Зарегистироваться</button>
      </form>
      </div>
    </div>
  </div>
</div>