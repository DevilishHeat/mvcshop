<?php
class model_admin_orders extends model
{
  public function get_data()
  {
    $this->set_dsn();
    $dbh = new PDO($this->dsn, $this->db_username, $this->db_password);
    $stmt = $dbh->prepare(
      "
      SELECT orders.order_id, orders.user_id, orders.total_price, users.username, orders_items.order_id, orders_items.item_id, items.name, items.price, orders_items.quantity
      FROM orders
      LEFT JOIN users ON orders.user_id = users.user_id
      LEFT JOIN orders_items ON orders.order_id = orders_items.order_id
      LEFT JOIN items ON orders_items.item_id = items.item_id"
    );
    $stmt->execute();
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $data;
  }

  public function delete_order()
  {
    $this->set_dsn();
    $dbh = new PDO($this->dsn, $this->db_username, $this->db_password);
    $stmt = $dbh->prepare(
      "
      DELETE FROM orders
      WHERE order_id = :order_id
      ");
    $stmt->execute(array(':order_id'=>$_POST['order_id']));
  }
}