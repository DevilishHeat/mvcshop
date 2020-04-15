<?php
$current_order_id = 0;
?>
<table class="table">
  <thead class="thead-dark">
  <tr>
    <th scope="col">Заказчик\товар</th>
    <th scope="col">#заказа\товара</th>
    <th scope="col">Сумма/цена</th>
    <th scope="col"></th>
  </tr>
  </thead>
  <tbody>
  <?php foreach ($data as $order):
    if ($current_order_id != $order['order_id']):
  ?>
  <tr class="order_<?= $order['order_id'] ?>">
    <td><strong><?= $order['username'] ?></strong></td>
    <td><strong><?= $order['order_id'] ?></strong></td>
    <td><strong><?= $order['total_price'] ?></strong></td>
    <td>
      <form class="js-delete_order">
        <input type="hidden" name="order_id" value="<?= $order['order_id'] ?>">
        <button type="button" class="btn btn-primary delete_order">X</button>
      </form>
    </td>
  </tr>
      <?php
      $current_order_id = $order['order_id'];
      endif;
      ?>
  <tr class="order_<?= $order['order_id'] ?>">
    <td><?= $order['name'] ?></td>
    <td><?= $order['quantity'] ?></td>
    <td><?= $order['price'] ?></td>
  </tr>
  <?php endforeach; ?>
  </tbody>
</table>