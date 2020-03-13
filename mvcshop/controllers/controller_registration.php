<?php
class controller_registration extends controller
{
    public function __construct()
    {
        parent::__construct();
        $this->model = new model_registration();
    }

    public function action_index()
    {
        $this->view->generate('view_registration.php', 'view_template.php');
    }

    public function action_create_user()
    {
        if ($_POST['password'] == $_POST['password_repeat'])
        {
            if ($this->model->username_available())
            {
                if ($this->model->email_available())
                {
                    if ($this->model->create_user())
                    {
                        header('Location: http://mvcshop/registration/complete');
                        die;
                    }
                }
            }
        }else
        {
            $_SESSION['message'] = 'Пароли не совпадают';
        }
        header('Location: http://mvcshop/registration');
        die;
    }
    public function action_complete()
    {
        $this->view->generate('view_registration_complete.php', 'view_template.php');
    }
}