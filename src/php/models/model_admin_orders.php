<?php
class model_admin_orders extends model
{
  public function get_data()
  {
    $this->set_dsn();
    $dbh = new PDO($this->dsn, $this->db_username, $this->db_password);
    $stmt = $dbh->prepare(
      "
      WITH orders_and_users(order_id, user_id, total_price, username)
      AS 
      (
        SELECT  orders.order_id, orders.user_id, orders.total_price, users.username FROM orders
        LEFT JOIN users ON orders.user_id = users.user_id
      )
      SELECT * FROM orders_and_users
      RIGHT JOIN orders_items ON orders_and_users.order_id = orders_items.order_id");
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $data;
  }
}