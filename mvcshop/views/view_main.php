<section class="section">
	<div class="section__wrapper container pt-5 pb-5">
		<div class="section__side mb-3">
			<h2 class="section__title text-dark text-uppercase">Каталог</h2>
		</div>
		<div class="container__main">
			<div class="container__row row">
				<?php foreach ($data as $item): ?>
					<div class="col-3 mb-3">
						<div class="card border border-primary">
							<img class="card-img-top" src="<?= $this->images . $item['name'] . '.jpg' ?>" alt="Изображение товара">
							<div class="card-body">
								<h5 class="card-title text-primary"><?= $item['name']?></h5>
								<p class="card-text text-dark"><?= $item['description'] ?></p>
							</div>
							<ul class="list-group list-group-flush">
								<li class="list-group-item text-dark border-primary">Категория: <?= $item['category'] ?></li>
								<li class="list-group-item text-dark border-primary">Цена: <?= $item['price'] ?></li>
							</ul>
						</div>
					</div>
				<?php endforeach; ?>
			</div>
		</div>
	</div>
</section>

<!-- <table width="100%">
    <tr>
        <td>
            Каталог:
        </td>
        <td align="right">
            <form action="search" method="get">
                <label for="request">Поиск:</label>
                <input type="text" id="request" name="search_request">
            </form>
        </td>
    </tr>
</table> -->