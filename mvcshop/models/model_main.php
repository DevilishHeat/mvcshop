<?php
class model_main extends model
{
    public function get_data()
    {
        $this->set_dsn();
        $dbh = new PDO($this->dsn, $this->db_username, $this->db_password);
        $stmt = $dbh->prepare("SELECT * FROM items");
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return $data;
    }
}