<?php
class controller_404 extends controller
{
    public function action_index()
    {
        $this->view->generate('view_404.php', 'view_template.php');
    }
}