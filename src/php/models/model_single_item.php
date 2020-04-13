<?php
class model_single_item extends model
{
  public function get_data()
  {
    $this->set_dsn();
    $dbh = new PDO($this->dsn, $this->db_username, $this->db_password);
    $stmt = $dbh->prepare("
            SELECT * FROM items
            LEFT JOIN categories ON items.category_id = categories.category_id
            WHERE items.item_id = :item_id");
    $stmt->execute(array(
      ':item_id'=> $_GET['item_id']
    ));
    $item = $stmt->fetch(PDO::FETCH_ASSOC);
    $stmt = $dbh->prepare(
      "
          SELECT * FROM categories"
    );
    $stmt->execute();
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $data = array(
      'item'=> $item,
      'categories'=> $categories,
    );
    return $data;
  }
}

