<table width="100%">
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
</table>


<?php
foreach ($data as $item): ?>
<table border="2">
    <tr>
        <td colspan="2" align="center">
            <?php echo $item['name']?>
        </td>
    </tr>
    <tr>
        <td>
            <img src="<?= $item['img'] ?>" width="100">
        </td>
        <td>
            <?= $item['description'] ?>
        </td>
    </tr>
    <tr>
        <td>
            Категория: <?= $item['category'] ?>
        </td>
        <td>
            Цена: <?= $item['price'] ?>
        </td>
    </tr>
</table>
<?php endforeach; ?>
