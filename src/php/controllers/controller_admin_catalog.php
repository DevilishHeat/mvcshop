<?php
class controller_admin_catalog extends controller
{
    public function __construct()
    {
        parent::__construct();
        $this->model = new model_admin_catalog();
    }

    public function action_index()
    {
        $data = $this->model->get_data();
        $this->view->generate('view_admin_catalog.php', 'view_template_admin.php', $data);
    }

    public function action_update_item()
    {
        $this->model->update_item();
        header('Location: http://mvcshop.com/admin/catalog');
        die();
    }
}