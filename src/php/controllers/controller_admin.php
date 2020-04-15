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
            header("Location: http://$_SERVER[SERVER_NAME]/admin_orders");
            die();
        }else
        {
            $this->view->generate('view_admin.php', 'view_template_admin.php');
        }
    }
    public function action_authorization()
    {
        $json = $this->model->authorization();
        header('Content-Type: application/json');
        echo json_encode($json);
    }

    public function action_logout()
    {
        unset($_SESSION['admin']);
        $json = array(
          'status'=> 200,
        );
        echo json_encode($json);
    }

}