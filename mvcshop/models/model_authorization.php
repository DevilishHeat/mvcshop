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
            WHERE username = :username");
        $stmt->execute(array(':username'=>$_POST['username']));
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (isset($user['username']))
        {
          if ($user['password'] == $_POST['password'])
          {
            return array(
                'status'=> 200,
                'username'=>$user['username']
            );
          } else
          {
            return array(
                'status'=> 400,
                'message'=>'Неверный пароль'
            );
          }
        } else
        {
          return array(
              'status'=> 400,
              'message'=>'Пользователя с таким именем не существует'
          );
        }
    }
}