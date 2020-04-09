<div id="change_password" aria-labelledby="Смена пароля" class="modal" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header flex-column">
        <h5 class="modal-title text-info">Смена пароля</h5>

        <div class="modal-alert alert alert-danger my-3 mx-auto" hidden  role="alert"></div>

        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <form class="js-change_password">
          <div class="form-group">
            <label for="old_password">Старый пароль:</label>
            <input id="old_password" class="form-control" type="password" name="old_password" aria-describedby="Поле для старого пароля" required>
          </div>

          <div class="form-group">
            <label for="new_password">Новый пароль:</label>
            <input id="new_password" class="form-control" type="password" name="new_password" aria-describedby="Поле для ввода нового пароля" required>
          </div>

          <div class="form-group">
            <label for="repeat_password">Повторите пароль:</label>
            <input id="repeat_password" class="form-control" type="password" name="repeat_password" aria-describedby="Поле для повторного ввода нового пароля" required>
          </div>

          <div class="form-group">
            <input type="hidden" name="admin_id" class="admin_id form-control" value="0">
          </div>

          <button type="button" class="btn btn-primary">Изменить</button>

        </form>
      </div>
    </div>
  </div>
</div>