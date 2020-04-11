<table class="table" border="2">
  <thead class="thead-dark">
  <tr>
    <th scope="col">#</th>
    <th scope="col">Наименование</th>
    <th scope="col">Описание</th>
    <th scope="col">Категория</th>
    <th scope="col">Цена</th>
    <th scope="col">Количество</th>
    <th scope="col" colspan="2">Функции</th>
  </tr>
  </thead>
  <tbody>
  <?php foreach ($data['items'] as $item): ?>
  <tr class="item">
    <td><img src="<?= $this->images . $item['name'] . '.jpg' ?>" height="100"></td>
    <td class="align-middle"><?= $item['name'] ?></td>
    <td class="align-middle"><?= $item['description'] ?></td>
    <td class="align-middle"><?= $item['category'] ?></td>
    <td class="align-middle" align="center"><?= $item['price'] ?></td>
    <td class="align-middle" align="center"><?= $item['quantity'] ?></td>
    <td class="align-middle" align="center">
      <form action="admin_catalog/update_item" method="post">
        <input type="hidden" value="<?= $item['item_id'] ?>">
        <input type="submit" value="Изменить">
      </form>
    </td>
    <td class="align-middle" align="center">
      <form action="admin_catalog/delete_item" method="post">
        <input type="hidden" value="<?= $item['item_id'] ?>" name="id">
        <input type="submit" value="Удалить">
      </form>
    </td>
  </tr>
  <?php endforeach; ?>
  </tbody>
</table>
<form class="js-create_item">
  <table class="table table-bordered">
    <thead class="thead-dark">
    <tr class="text-center">
      <th scope="col" colspan="7">Добавление нового товара в каталог</th>
    </tr>
    </thead>
    <tr>
      <th scope="col">
        <label for="name">Наименование</label>
      </th>
      <th scope="col">
        <label for="description">Описание</label>
      </th>
      <th scope="col">
        <label for="category">Категория</label>
      </th>
      <th scope="col">
        <label for="price">Цена</label>
      </th>
      <th scope="col">
        <label for="quantity">Количество</label>
      </th>
      <th scope="col">
        <label for="image">Изображение</label>
      </th>
      <th scope="col" rowspan="2" class="align-middle">
        <button type="button" class="btn btn-primary create_item">Создать</button>
      </th>
    </tr>
    <tr>
      <td>
        <input type="text" name="name" id="name" class="form-control">
      </td>
      <td>
        <textarea rows="3" cols="50" name="description" id="description" class="form-control"></textarea>
      </td>
      <td>
        <select name="category" id="category" class="form-control">
          <?php foreach ($data['categories'] as $category): ?>
          <option>
            <?= $category['category'] ?>
          </option>
          <?php endforeach; ?>
        </select>
      </td>
      <td>
        <input type="text" name="price" id="price" class="form-control">
      </td>
      <td>
        <input type="text" name="quantity" id="quantity" class="form-control">
      </td>
      <td>
        <input type="file" name="img" accept="images/*" id="image" class="form-control">
      </td>
    </tr>
  </table>
</form>
