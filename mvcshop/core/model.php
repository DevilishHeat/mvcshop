<?php
class model
{
    protected $db_host = 'localhost';
    protected $db_username = 'root';
    protected $db_password = '';
    protected $db_name = 'shop';
    protected $dsn;

    public function set_dsn()
    {
        $this->dsn = 'mysql:host=' . $this->db_host . ';dbname=' . $this->db_name;
    }

    public function get_data()
    {

    }
}