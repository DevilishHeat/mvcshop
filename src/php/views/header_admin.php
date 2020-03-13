<?php
if (isset($_SESSION['admin'])): ?>
<table width="100%">
    <tr>
        <td>
            <a href="../admin_catalog">Каталог</a>
        </td>
        <td>
            Заказы
        </td>
        <td>
            <a href="../admin_admins">Админы</a>
        </td>
        <td>
            <a href="../">На главную</a>
        </td>
        <td align="right">
            <?= 'Администратор ' . $_SESSION['admin'] ?><br>
            <a href="../admin/logout">Выйти</a>
        </td>
    </tr>
</table>
<?php endif; ?>