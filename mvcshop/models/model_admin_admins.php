<?php
class model_admin_admins extends model
{
    public function get_data()
    {
        $this->set_dsn();
        $dbh = new PDO($this->dsn, $this->db_username, $this->db_password);
        $stmt = $dbh->prepare("SELECT * FROM admins");
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $data;
    }

    public function create_admin()
    {
        $this->set_dsn();
        $dbh = new PDO($this->dsn, $this->db_username, $this->db_password);
        $stmt = $dbh->prepare("
            INSERT INTO admins (login, password)
            VALUES (:login, :password)
            ");
        if($stmt->execute(array(
            ':login'=>$_POST['login'],
            ':password'=>$_POST['password'])))
        {
            return true;
        }
        $_SESSION['message'] = 'проблемы с подключением к базе данных';
        return false;
    }

    public function delete_admin()
    {
        $this->set_dsn();
        $dbh = new PDO($this->dsn, $this->db_username, $this->db_password);
        $stmt = $dbh->prepare("
            DELETE FROM admins
            WHERE admins.admin_id = :id
            ");
        $stmt->execute(array(':id'=>$_POST['id']));
    }

    public function update_password()
    {
      $this->set_dsn();
      $dbh = new PDO($this->dsn, $this->db_username, $this->db_password);
      $stmt = $dbh->prepare("
         UPDATE admins
         SET password = :password
         WHERE admin_id = :id
         ");
      $stmt->execute(array(
          ':id'=>$_POST['id'],
          ':password'=>$_POST['new_password']
          ));
    }

    public function get_password()
    {
      $this->set_dsn();
      $dbh = new PDO($this->dsn, $this->db_username, $this->db_password);
      $stmt = $dbh->prepare("
         SELECT password
         FROM admins
         WHERE admin_id = :id");
      $stmt->execute(array(':id'=>$_POST['id']));
      $password = $stmt->fetch(PDO::FETCH_ASSOC);
      return $password['password'];
    }
}