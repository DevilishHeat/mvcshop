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
          <div class="container__row row">
            <?php foreach ($data['items'] as $item): ?>
              <div class="col-3 mb-3">
                <div class="card border border-primary">
                  <img class="card-img-top" src="<?= $this->images . $item['name'] . '.jpg' ?>" alt="Изображение товара">
                  <div class="card-body">
                    <div class="card-title text-primary">
                      <form action="single_item" method="get">
                        <input type="hidden" name="item_id" value="<?= $item['item_id'] ?>">
                        <button type="submit" class="btn btn-link"><?= $item['name'] ?></button>
                      </form>
                    </div>
                    <p class="card-text text-dark"><?= $item['description'] ?></p>
                  </div>
                  <ul class="list-group list-group-flush">
                    <li class="list-group-item text-dark border-primary">Категория: <?= $item['category'] ?></li>
                    <li class="list-group-item text-dark border-primary">Цена: <?= $item['price'] ?></li>
                    <li class="list-group-item text-dark border-primary">
                        <button class="btn btn-primary add_item" type="submit" value="<?= $item['item_id'] ?>">В корзину</button>
                    </li>
                  </ul>
                </div>
              </div>
            <?php endforeach; ?>
          </div>
        </div>
      </div>

    </div>
	</div>
</section>