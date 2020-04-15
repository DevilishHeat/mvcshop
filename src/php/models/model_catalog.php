<?php
class model_catalog extends model
{
  public function get_data()
  {
    $this->set_dsn();
    $dbh = new PDO($this->dsn, $this->db_username, $this->db_password);
    $stmt = $dbh->prepare(
      "
        SELECT * FROM items
        LEFT JOIN categories ON items.category_id = categories.category_id
        WHERE category = :category
        ");
    $stmt->execute(array(
      ':category'=>$_GET['category']
    ));
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $stmt = $dbh->prepare(
      "
          SELECT * FROM categories"
    );
    $stmt->execute();
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $data = array(
      'items'=>$items,
      'categories'=>$categories,
    );
    return $data;
  }
}