<?php
class model_admin_catalog extends model
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
        $stmt->execute(array
        (
            ':name'=>$_POST['name'],
            ':description'=>$_POST['description'],
            ':category'=>$_POST['category'],
            ':price'=>$_POST['price']
        ));
        header('Location: http://mvcshop/admin/catalog');
        die();
    }
}