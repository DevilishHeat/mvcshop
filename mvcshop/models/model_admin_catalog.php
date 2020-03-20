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
            LEFT JOIN categories ON items.category_id = categories.id");
        $stmt->execute();
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stmt = $dbh->prepare("SELECT * FROM categories");
        $stmt->execute();
        $categorys = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $data = array('items'=>$items, 'categorys'=>$categorys);
        return $data;
    }

    public function update_item()
    {
        $this->set_dsn();
        $dbh = new PDO($this->dsn, $this->db_username, $this->db_password);
        $stmt = $dbh->prepare(
            "
            UPDATE items
            SET name = :name, description = :description, category = :category, price = :price
            WHERE id = :id
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
        INSERT INTO items (name, price, category, description, quantity)
        VALUES (:name, :price, :category, :description, :quantity)"
      );
      $stmt->execute(array(
        ':name'=>$_POST['name'],
        ':price'=>$_POST['price'],
        ':category'=>$_POST['category'],
        ':description'=>$_POST['description'],
        ':quantity'=>$_POST['quantity']
      ));
    }

    public function delete_item()
    {
      $this->set_dsn();
      $dbh = new PDO($this->dsn, $this->db_username, $this->db_password);
      $stmt = $dbh->prepare(
        "
        SELECT name
        FROM items
        WHERE id = :id"
      );
      $stmt->execute(array(':id'=>$_POST['id']));
      $name = $stmt->fetch(PDO::FETCH_ASSOC);
      $stmt = $dbh->prepare(
        "
        DELETE FROM items
        WHERE id = :id"
      );
      $stmt->execute(array(':id'=>$_POST['id']));
      unlink('../src/assets/images/' . $name['name'] . '.jpg');
    }
}