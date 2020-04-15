<?php
class model_registration extends model
{
    public function username_available()
    {
        $this->set_dsn();
        $dbh = new PDO($this->dsn, $this->db_username, $this->db_password);
        $stmt = $dbh->prepare(
          "
          SELECT username FROM users WHERE username = :username
          "
        );
        $stmt->execute(array(
          ':username'=> $_POST['username']
        ));
        if ($stmt->fetch(PDO::FETCH_ASSOC))
        {
            $_SESSION['message'] = 'Имя пользователя уже занято';
            return false;
        }
        return true;
    }

    public function email_available()
    {
        $this->set_dsn();
        $dbh = new PDO($this->dsn, $this->db_username, $this->db_password);
        $stmt = $dbh->prepare(
          "
          SELECT email FROM users WHERE email = :email
          "
        );
        $stmt->execute(array(
          ':email'=> $_POST['email']
        ));
        if ($stmt->fetch(PDO::FETCH_ASSOC))
        {
            $_SESSION['message'] = 'Почтовый адрес уже занят';
            return false;
        }
        return true;
    }

    public function create_user()
    {
        $this->set_dsn();
        $dbh = new PDO($this->dsn, $this->db_username, $this->db_password);
        $stmt = $dbh->prepare(
          "
            INSERT INTO users (username, email, password)
            VALUES (:username, :email, :password)
            ");
        if ($stmt->execute(array(
          ':username'=> $_POST['username'],
          ':email'=> $_POST['email'],
          ':password'=> $_POST['password'])))
        {
          return array(
            'status'=> 200,
            'message'=> 'Регистрация прошла успешно'
          );
        }
        return array(
          'status'=> 400,
          'message'=> 'Проблемы с подключением к базе данных',
        );
    }
}