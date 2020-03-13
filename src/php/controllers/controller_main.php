<?php
class Controller_Main extends controller
{
    public function __construct()
    {
        parent::__construct();
        $this->model = new model_main();
    }

    public function action_index()
    {
        $data = $this->model->get_data();
        $this->view->generate('view_main.php', 'view_template.php', $data);
    }
}