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
        WHERE item_id = :item_id
      ");
      $data = array();
      foreach ($_SESSION['cart'] as $item_id => $quantity)
      {
        $stmt->execute(array(
          ':item_id'=>$item_id
        ));
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
      SELECT user_id FROM users
      WHERE username = :username"
    );
    $stmt->execute(array(
      ':username'=> $_POST['username']
    ));
    $user_id = $stmt->fetch(PDO::FETCH_ASSOC);
    $stmt = $dbh->prepare(
      "
      INSERT INTO orders (user_id, total_price)
      VALUES (:user_id, :total_price)
      ");
    $stmt->execute(array(
      ':user_id'=> $user_id['user_id'],
      ':total_price'=> $_POST['total_price'],
    ));
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