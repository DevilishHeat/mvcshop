<?php
foreach ($data as $item): ?>
    <form action="#" method="get" id="update_<?= $item['id']?>">
        <div>
            <div colspan="2" align="center">
                <input type="text" name="name" form="update_<?= $item['id']?>" value="<?php echo $item['name']?>">
            </div>
            <div>
                В наличии
            </div>
        </div>
        <div>
            <div>
                <img src="../<?= $item['img'] ?>" width="100">
            </div>
            <div>
                <textarea name="description" form="update_<?= $item['id']?>"><?php echo $item['description']?></textarea>
            </div>
            <div align="center">
                <?= $item['quantity'] ?>
            </div>
        </div>
        <div>
            <div>
                Категория: <input type="text" name="category"  <?= $item['id']?>" value="<?= $item['category'] ?>">
            </div>
            <div>
                Цена: <input type="text" name="price" value="<?= $item['price'] ?>">
            </div>
            <div>
                <input type="hidden" value="<?= $item['id'] ?>" form="update">
                <input type="submit" value="Изменить" form="update">
            </div>
        </div>
        <div>
        </div>
    </form>
<?php endforeach; ?>
