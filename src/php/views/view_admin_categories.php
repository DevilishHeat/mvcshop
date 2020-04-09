<table class="table" border="2">
  <thead class="thead-dark">
  <tr>
    <th scope="col">Категория</th>
    <th scope="col" colspan="2">Функции</th>
  </tr>
  </thead>
  <tbody>
  <?php foreach ($data as $category): ?>
    <tr class="category">
      <td class="align-middle"><?= $category['category'] ?></td>
      <td class="align-middle text-center">
        <form action="admin_categories/update_category" method="post">
          <input type="hidden" value="<?= $category['category_id'] ?>">
          <input type="submit" value="Изменить">
        </form>
      </td>
      <td class="align-middle text-center">
        <button class="btn btn-primary delete_category" type="button" value="<?= $category['category_id'] ?>">X</button>
      </td>
    </tr>
  <?php endforeach; ?>
  </tbody>
</table>

<form action="admin_categories/create_category" method="post">
  <table class="table" border="2">
    <thead class="thead-dark">
    <tr align="center">
      <th scope="col" colspan="7">Добавление новой категории</th>
    </tr>
    </thead>
    <tr>
      <th scope="col">Название</th>
      <th scope="col" rowspan="2" class="align-middle"><input type="submit" value="Создать"></th>
    </tr>
    <tr>
      <td>
        <input type="text" name="category">
      </td>
    </tr>
  </table>
</form>