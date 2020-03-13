<?php
class model_authorization extends model
{
    public function authorization()
    {
        $this->set_dsn();
        $dbh = new PDO($this->dsn, $this->db_username, $this->db_password);
        $stmt = $dbh->prepare("
            SELECT username, password
            FROM users
            WHERE username = :username AND password = :password");
        $stmt->execute(array
        (
            ':username'=>$_POST['username'],
            ':password'=>$_POST['password']
        ));
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (isset($user['username']))
        {
            $_SESSION['authorization'] = true;
            $_SESSION['username'] = $user['username'];
        } else
        {
            $_SESSION['message'] = 'Введены неверные данные';
        }
        header('Location: http://mvcshop' . $_POST['location']);
        die();
    }
}