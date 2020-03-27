<?php $current_order_id = 0 ?>
<table class="table">
  <thead class="thead-dark">
  <th scope="col">#</th>
  <th scope="col">Заказчик</th>
  <th scope="col">Сумма</th>
  </thead>
  <tbody>
  <?php foreach ($data as $order):
    if ($current_order_id != $order['order_id']):
  ?>
  <tr>
    <td><?= $order['order_id'] ?></td>
    <td><?= $order['username'] ?></td>
    <td><?= $order['total_price'] ?></td>
  </tr>
  <?php endif; ?>
  <tr>
    <td>

    </td>
  </tr>
  <?php endforeach; ?>
  </tbody>

</table>
<?php
print_r($data);