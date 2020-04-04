<?php
class model_cart extends model
{
  public function get_data()
  {
    if (isset($_SESSION['cart']))
    {
      $this->set_dsn();
      $dbh = new PDO($this->dsn, $this->db_username, $this->db_password);
      $stmt = $dbh->prepare(
        "
      SELECT * FROM items
      WHERE item_id = :id
      ");
      $data = array();
      foreach ($_SESSION['cart'] as $id => $quantity)
      {
        $stmt->execute(array(':id'=>$id));
        $data[] = $stmt->fetch(PDO::FETCH_ASSOC);
      }
      return $data;
    }
    return 'Корзина пуста';
  }

  public function create_order()
  {
    $this->set_dsn();
    $dbh = new PDO($this->dsn, $this->db_username, $this->db_password);
    $stmt = $dbh->prepare(
      "
      INSERT INTO orders (user_id, total_price)
      VALUES (1, :total_price)
      ");
    $stmt->execute(array(':total_price'=>$_POST['total_price']));
    //После исправления авторизации будуд разные пользователи
    $order_id = $dbh->lastInsertId();
    $stmt = $dbh->prepare(
      "
      INSERT INTO orders_items (order_id, item_id, quantity) 
      VALUES (:order_id, :item_id, :quantity)
      ");
    foreach ($_SESSION['cart'] as $item_id=>$quantity)
    {
      $stmt->execute(array
      (
        ':order_id'=>$order_id,
        ':item_id'=>$item_id,
        ':quantity'=>$quantity,
      ));
    }
  }
}