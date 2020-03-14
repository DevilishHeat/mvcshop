<?php
class View
{
    function generate($content_view, $view_template, $data = null)
    {
        include './views/'.$view_template;
    }
}