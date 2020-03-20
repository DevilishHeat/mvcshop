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
            header('Location: http://mvcshop.com/admin_orders');
            die();
        }else
        {
            $this->view->generate('view_admin.php', 'view_template_admin.php');
        }
    }
    public function action_authorization()
    {
        $this->model->authorization();
        header('Location: http://mvcshop.com/admin');
        die();
    }

    public function action_logout()
    {
        unset($_SESSION['admin']);
        header('Location: http://mvcshop.com/admin');
        die();
    }

}