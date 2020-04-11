<?php
class model_admin_catalog extends model
{
    public function get_data()
    {
        $this->set_dsn();
        $dbh = new PDO($this->dsn, $this->db_username, $this->db_password);
        $stmt = $dbh->prepare(
          "
            SELECT * FROM items
            LEFT JOIN categories ON items.category_id = categories.category_id");
        $stmt->execute();
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stmt = $dbh->prepare("SELECT * FROM categories");
        $stmt->execute();
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $data = array('items'=>$items, 'categories'=>$categories);
        return $data;
    }

    public function update_item()
    {
        $this->set_dsn();
        $dbh = new PDO($this->dsn, $this->db_username, $this->db_password);
        $stmt = $dbh->prepare(
            "
            UPDATE items
            SET name = :name, description = :description, category_id = :category, price = :price
            WHERE item_id = :id
            ");
        $stmt->execute(array(
            ':name'=>$_POST['name'],
            ':description'=>$_POST['description'],
            ':category'=>$_POST['category'],
            ':price'=>$_POST['price']
        ));
    }

    public function create_item()
    {
      $this->set_dsn();
      $dbh = new PDO($this->dsn, $this->db_username, $this->db_password);
      $stmt = $dbh->prepare(
        "
        SELECT category_id FROM categories
        WHERE category = :category"
      );
      $stmt->execute(array(
        ':category'=> $_POST['category']
      ));
      $category_id = $stmt->fetch(PDO::FETCH_ASSOC);
      $stmt = $dbh->prepare(
        "
        INSERT INTO items (name, price, category_id, description, quantity)
        VALUES (:name, :price, :category_id, :description, :quantity)"
      );
      if ($stmt->execute(array(
        ':name'=>$_POST['name'],
        ':price'=>$_POST['price'],
        ':category_id'=>$category_id['category_id'],
        ':description'=>$_POST['description'],
        ':quantity'=>$_POST['quantity'],
      ))) {
        return array(
          'status'=> 200,
          'message'=> 'Товар успешно добавлен в базу данных'
        );
      } else {
        return array(
          'status'=> 400,
          'message'=> 'Проблемы с добавлением данных в базу данных'
        );
      }
    }

    public function delete_item()
    {
      $this->set_dsn();
      $dbh = new PDO($this->dsn, $this->db_username, $this->db_password);
      $stmt = $dbh->prepare(
        "
        SELECT name
        FROM items
        WHERE item_id = :id"
      );
      $stmt->execute(array(':id'=>$_POST['id']));
      $name = $stmt->fetch(PDO::FETCH_ASSOC);
      $stmt = $dbh->prepare(
        "
        DELETE FROM items
        WHERE item_id = :id"
      );
      $stmt->execute(array(':id'=>$_POST['id']));
      unlink('../src/assets/images/' . $name['name'] . '.jpg');
    }
}