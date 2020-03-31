<ul class="nav flex-column">
  <?php
  foreach ($data['categories'] as $category):
  ?>
  <li>
    <form action="catalog" method="get">
      <input type="hidden" name="category" value="<?= $category['category'] ?>">
      <button type="submit" class="btn btn-link col-9 text-left"><?= $category['category'] ?></button>
    </form>
  </li>
  <?php endforeach; ?>
</ul>