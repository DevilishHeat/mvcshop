<?php if(isset($_SESSION['cart'])): ?>
<table class="table" border="2">
  <thead class="thead-dark">
  <tr>
    <th scope="col">
      #
    </th>
    <th scope="col">
      Товар
    </th>
    <th scope="col">
      Цена
    </th>
    <th scope="col" colspan="2">
      Количество
    </th>
  </tr>
  </thead>
  <form action="cart/create_order" method="post">
    <tbody>
    <?php foreach ($data as $item): ?>
      <tr>
        <td>
          <img src="<?= $this->images . $item['name'] . '.jpg' ?>" height="50">
        </td>
        <td>
          <?= $item['name'] ?>
        </td>
        <td>
          <?= $item['price'] ?>
        </td>
        <td>
          <div class="form-group">
            <select class="form-controll" name="quantity<?= $item['item_id'] ?>">
              <?php
              for($i = 1; $i <= $item['quantity']; $i++)
              {
                if ($i == $_SESSION['cart'][$item['item_id']])
                {
                  echo "<option selected>$i</option>";
                }else
                {
                  echo "<option>$i</option>";
                }
              }
              ?>
            </select>
          </div>
        </td>
        <td>
          <a href="cart/delete_item?id=<?= $item['item_id'] ?>">X</a>
        </td>
      </tr>
    <?php
    $total_price += $item['price'] * $_SESSION['cart'][$item['item_id']];
    endforeach;
    ?>
    <tr>
      <td></td>
      <td></td>
      <td>Сумма:</td>
      <td>
        <?= $total_price ?>
      </td>
      <td>
        <input type="hidden" name="total_price" value="<?= $total_price ?>">
        <button type="submit" class="btn btn-primary">
          Заказать
        </button>
      </td>
    </tr>
    </tbody>

  </form>
</table>

<?php
else:
  echo "<div align='center'>$data</div>";
endif;
