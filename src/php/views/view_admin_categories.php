<table class="table">
  <thead class="thead-dark">
  <tr>
    <th scope="col">Категория</th>
    <th scope="col" class="text-center">Изменить</th>
    <th scope="col" class="text-center">Удалить</th>
  </tr>
  </thead>
  <tbody>
  <?php foreach ($data as $category): ?>
    <tr class="category">
      <td class="align-middle"><?= $category['category'] ?></td>
      <td class="align-middle text-center">
        <div class="d-flex justify-content-center">
          <form class="js-change_category" hidden>
            <div class="form-row">
              <div class="col-auto">
                <input type="text" class="form-control" name="changed_category" value="<?= $category['category'] ?>">
              </div>
              <div class="col">
                <button type="button" class="btn btn-primary cancel">X</button>
              </div>
              <div class="col">
                <button type="button" class="btn btn-primary save">&#10003;</button>
              </div>
            </div>
            <input type="hidden" name="category_id" class="form-control" value="<?= $category['category_id'] ?>">
          </form>
          <div class="alert alert-danger" hidden></div>
        </div>
        <button type="button" class="btn btn-primary change_category">Изменить</button>
      </td>
      <td class="align-middle text-center">
        <button class="btn btn-primary delete_category" type="button" value="<?= $category['category_id'] ?>">X</button>
      </td>
    </tr>
  <?php endforeach; ?>
  </tbody>
</table>

<form class="js-create_category">
  <table class="table table-bordered">
    <thead class="thead-dark">
    <tr align="center">
      <th scope="col" colspan="7">Добавление новой категории</th>
    </tr>
    </thead>
    <tr>
      <th scope="col">Название</th>
      <th scope="col" rowspan="2" class="align-bottom">
        <div class="alert alert-danger" hidden></div>
        <button type="button" class="btn btn-primary create_category">Создать</button>
      </th>
    </tr>
    <tr>
      <td class="form-group">
        <input type="text" name="category" class="form-control" required>
      </td>
    </tr>
  </table>
</form>