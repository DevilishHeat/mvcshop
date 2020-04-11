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
    if ($stmt->execute(array(':category'=>$_POST['category']))) {
      return array(
        'status'=> 200,
        'message'=> 'Категория успешно создана'
      );
    } else {
      return array(
        'status'=> 400,
        'message'=> 'Проблемы со  cтороны сервера или категория с таким названием уже существует'
      );
    }
  }

  public function delete_category()
  {
    $this->set_dsn();
    $dbh = new PDO($this->dsn, $this->db_username, $this->db_password);
    $stmt = $dbh->prepare(
      "
      DELETE FROM categories
      WHERE category_id = :category_id
      ");
    $stmt->execute(array(':category_id'=>$_POST['category_id']));
  }

  public function update_category()
  {
    $this->set_dsn();
    $dbh = new PDO($this->dsn, $this->db_username, $this->db_password);
    $stmt = $dbh->prepare(
      'UPDATE categories
      SET category = :category
      WHERE category_id = :category_id'
    );
    if ($stmt->execute(array(
      ':category'=> $_POST['changed_category'],
      ':category_id'=> $_POST['category_id'],
    ))) {
      return array(
        'status'=> 200,
        'message'=> 'Название категории успешно изменено',
      );
    } else {
      return array(
        'status'=> 400,
        'message'=> 'Ошибка со стороны базы данных'
      );
    }
  }
}