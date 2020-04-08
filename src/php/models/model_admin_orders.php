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
      ),
      items_joined (order_id, item_id, name, price, quantity)
	    AS
	    (
        SELECT orders_items.order_id, orders_items.item_id, items.name, items.price, orders_items.quantity FROM orders_items
        LEFT JOIN items ON items.item_id = orders_items.item_id
      )
      SELECT * FROM orders_and_users
      RIGHT JOIN items_joined ON orders_and_users.order_id = items_joined.order_id
      ");
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