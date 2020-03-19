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
  <?php foreach ($data as $item): ?>
  <tr>
    <td><img src="<?= $this->images . $item['name'] . '.jpg' ?>" height="100"></td>
    <td class="align-middle"><?= $item['name'] ?></td>
    <td class="align-middle"><?= $item['description'] ?></td>
    <td class="align-middle"><?= $item['category'] ?></td>
    <td class="align-middle" align="center"><?= $item['price'] ?></td>
    <td class="align-middle" align="center"><?= $item['quantity'] ?></td>
    <td class="align-middle" align="center">
      <form action="admin_catalog/update_item" method="post">
        <input type="hidden" value="<?= $item['id'] ?>">
        <input type="submit" value="Изменить">
      </form>
    </td>
    <td class="align-middle" align="center">
      <form action="admin_catalog/delete_item" method="post">
        <input type="hidden" value="<?= $item['id'] ?>" name="id">
        <input type="submit" value="Удалить">
      </form>
    </td>
  </tr>
  <?php endforeach; ?>
  </tbody>
</table>
<form action="admin_catalog/create_item" method="post" enctype="multipart/form-data">
  <table class="table" border="2">
    <thead class="thead-dark">
    <tr align="center">
      <th scope="col" colspan="7">Добавление нового товара в каталог</th>
    </tr>
    </thead>
    <tr>
      <th scope="col">Наименование</th>
      <th scope="col">Описание</th>
      <th scope="col">Категория</th>
      <th scope="col">Цена</th>
      <th scope="col">Количество</th>
      <th scope="col">Изображение</th>
      <th scope="col" rowspan="2" class="align-middle"><input type="submit" value="Создать"></th>
    </tr>
    <tr>
      <td>
        <input type="text" name="name">
      </td>
      <td>
        <textarea rows="3" cols="50" name="description"></textarea>
      </td>
      <td>
        <input type="text" name="category">
      </td>
      <td>
        <input type="text" name="price">
      </td>
      <td>
        <input type="text" name="quantity">
      </td>
      <td>
        <input type="file" name="img" accept="images/*">
      </td>
    </tr>
  </table>
</form>

