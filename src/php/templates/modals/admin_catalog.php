<div id="change_item" class="modal" tabindex="-1" role="dialog" aria-labelledby="Форма изменения товара">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header flex-column">
        <h5 class="modal-title text-info">Изменение товара</h5>

        <div class="modal-alert alert alert-danger my-3 mx-auto" hidden role="alert"></div>

        <button type="button" class="close" data-dismiss="modal">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <div class="modal-body">
        <form class="js-change_item">
          <div class="form-group">
            <label for="modal_name">Наименование:</label>
            <input id="modal_name" class="form-control" type="text" name="name" required>
          </div>

          <div class="form-group">
            <label for="modal_description">Описание:</label>
            <textarea id="modal_description" class="form-control" name="description" required></textarea>
          </div>

          <div class="form-group">
            <label for="modal_category">Категория:</label>
            <select name="category" id="modal_category" class="form-control">
              <?php foreach ($data['categories'] as $category): ?>
                <option>
                  <?= $category['category'] ?>
                </option>
              <?php endforeach; ?>
            </select>
          </div>

          <div class="form-group">
            <label for="modal_price">Цена:</label>
            <input type="text" id="modal_price" name="price" class="form-control">
          </div>

          <input type="hidden" name="item_id" value="0">
          <button type="button" class="btn btn-primary">Изменить</button>
        </form>
      </div>
    </div>
  </div>
</div>