<?php
class model_admin extends model
{

    public function authorization()
    {
        $this->set_dsn();
        $dbh = new PDO($this->dsn, $this->db_username, $this->db_password);
        $stmt = $dbh->prepare(
          "
            SELECT login, password 
            FROM admins
            WHERE login = :login AND password = :password
            ");
        $stmt->execute(array
        (
            ':login'=>$_POST['login'],
            ':password'=>$_POST['password']
        ));
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);
        if (isset($admin['login']))
        {
            $_SESSION['admin'] = $admin['login'];
            return array(
              'status'=>200,
              'message'=> $admin['login'] . ' успешно авторизован',
            );
        } else
        {
            return array(
              'status'=>400,
              'message'=> 'Введенны неверные данные'
            );
        }
    }
}