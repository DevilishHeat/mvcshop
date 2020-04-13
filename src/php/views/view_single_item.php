<section class="section">
  <div class="section__wrapper">
    <div class="section__side mb-3">
      <h2 class="section__title text-dark text-uppercase">Каталог</h2>
    </div>
    <div class="container__main">
      <div class="row">
        <div class="col-3">
          <?php include 'views/view_sidebar.php'?>
        </div>
        <div class="col-9">
          <div class="col-5 item">
            <img class="card-img-top" src="<?= $this->images . $data['item']['name'] . '.jpg' ?>" alt="Изображение товара">
            <div class="card-body">
              <div class="card-title text-primary">
                <h5><?= $data['item']['name'] ?></h5>
              </div>
              <p class="card-text text-dark"><?= $data['item']['description'] ?></p>
            </div>
            <ul class="list-group list-group-flush">
              <li class="list-group-item text-dark border-primary">Категория: <?= $data['item']['category'] ?></li>
              <li class="list-group-item text-dark border-primary">Цена: <?= $data['item']['price'] ?></li>
              <li class="list-group-item text-dark border-primary">
                <label for="selector">Количество:</label>
                <select class="quantity_selector form-control" id="selector" name="quantity<?= $item['item_id'] ?>">
                  <?php
                  for($i = 1; $i <= $data['item']['quantity']; $i++)
                  {
                    echo "<option>$i</option>";
                  }
                  ?>
                </select>
              </li>
              <li class="list-group-item text-dark border-primary">
                <button class="btn btn-primary add_item_single" type="submit" value="<?= $data['item']['item_id'] ?>">В корзину</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>