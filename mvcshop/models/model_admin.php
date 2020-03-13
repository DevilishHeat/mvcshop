<?php
class model_admin extends model
{

    public function authorization()
    {
        $this->set_dsn();
        $dbh = new PDO($this->dsn, $this->db_username, $this->db_password);
        $stmt = $dbh->prepare("
            SELECT login, password 
            FROM admins
            WHERE login = :login AND password = :password");
        $stmt->execute(array
        (
            ':login'=>$_POST['login'],
            ':password'=>$_POST['password']
        ));
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);
        if (isset($admin['login']))
        {
            $_SESSION['admin'] = $admin['login'];
        } else
        {
            $_SESSION['message'] = 'Введены неверные данные';
        }
        header('Location: http://mvcshop/admin');
        die();
    }
}