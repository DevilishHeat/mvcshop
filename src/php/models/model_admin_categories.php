<?php
class model_admin_categories extends model
{
  public function get_data()
  {
    $this->set_dsn();
    $dbh = new PDO($this->dsn, $this->db_username, $this->db_password);
    $stmt = $dbh->prepare("SELECT * FROM categories");
    $stmt->execute();
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $data;
  }

  public function create_category()
  {
    $this->set_dsn();
    $dbh = new PDO($this->dsn, $this->db_username, $this->db_password);
    $stmt = $dbh->prepare(
      "
      INSERT INTO categories (category)
      VALUES (:category)
      ");
    $stmt->execute(array(':category'=>$_POST['category']));
  }

  public function delete_category()
  {
    $this->set_dsn();
    $dbh = new PDO($this->dsn, $this->db_username, $this->db_password);
    $stmt = $dbh->prepare(
      "
      DELETE FROM categories
      WHERE category_id = :id
      ");
    $stmt->execute(array(':id'=>$_POST['id']));
  }

  public function update_category()
  {
    $this->set_dsn();
    $dbh = new PDO($this->dsn, $this->db_username, $this->db_password);
    $stmt = $dbh->prepare();
  }
}