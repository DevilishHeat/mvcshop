<?php if(isset($_SESSION['cart'])): ?>
  <form class="js-cart">
    <table class="table cart-table" border="2">
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

    <tbody>
    <?php foreach ($data as $item): ?>
      <tr class="item">
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
          <div>
            <select class="quantity_selector" name="quantity<?= $item['item_id'] ?>">
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
          <button type="button" class="btn btn-primary js-delete_item" value="<?= $item['item_id'] ?>">X</button>
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
        <input type="hidden" class="form-control" name="username" value="<?= isset($_SESSION['username']) ? $_SESSION['username'] : '' ?>">
        <input type="hidden" class="form-control" name="total_price" value="<?= $total_price ?>">
        <button type="button" class="btn btn-primary create_order">Заказать</button>
      </td>
    </tr>
    </tbody>
  </table>
  </form>

<?php
//Вывод сообщения, что корзина пуста
else:
  echo "<div align='center'>$data</div>";
endif;
