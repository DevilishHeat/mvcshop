<?php
class View
{
  protected $images = "../assets/images/";
    function generate($content_view, $view_template, $data = null)
    {
        include './views/'.$view_template;
    }
}