<?php
class controller_admin extends controller
{
    public function __construct()
    {
        parent::__construct();
        $this->model = new model_admin();
    }

    public function action_index()
    {
        if (isset($_SESSION['admin']))
        {
            header('Location: http://mvcshop/admin/orders');
            die();
        }else
        {
            $this->view->generate('view_admin.php', 'view_template_admin.php');
        }
    }
    public function action_authorization()
    {
        $this->model->authorization();
    }

    public function action_logout()
    {
        unset($_SESSION['admin']);
        header('Location: http://mvcshop/admin');
        die();
    }

    public function action_orders()
    {
        $this->view->generate('view_admin_orders.php', 'view_template_admin.php');
    }
}