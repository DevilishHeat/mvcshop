<?php
class controller_admin_admins extends controller
{
    public function __construct()
    {
        parent::__construct();
        $this->model = new model_admin_admins();
    }

    public function action_index()
    {
        $data = $this->model->get_data();
        $this->view->generate('view_admin_admins.php', 'view_template_admin.php', $data);
    }

    public function action_create_admin()
    {
        if ($_POST['password'] == $_POST['password_repeat'] and $_POST['login'] != '')
        {
            $this->model->create_admin();
            header('Location: http://mvcshop/admin_admins');
            die();
        } else
        {
            $_SESSION['message'] = 'Введенны недопустимые данные';
            header('Location: http://mvcshop/admin_admins');
            die();
        }
    }

    public function action_delete_admin()
    {
        $this->model->delete_admin();
        header('Location: http://mvcshop/admin_admins');
        die();
    }
}