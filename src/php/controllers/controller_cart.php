<?php
class controller_cart extends controller
{
  public function __construct()
  {
    parent::__construct();
    $this->model = new model_cart();
  }

  public function action_index()
  {
    $data = $this->model->get_data();
    if (isset($_SESSION['cart']))
    {
      foreach ($data as $item)
      {
        if ($item['quantity'] < $_SESSION['cart'][$item['item_id']])
        {
          $_SESSION['cart'][$item['item_id']] = $item['quantity'];
        }
      }
    }
    $this->view->generate('view_cart.php', "view_template.php", $data);
  }

  public function action_add_item()
  {
    //unset($_SESSION['cart']);
      $id = $_POST['id'];
      //в массиве cart под индексом, равным id товара в бд, указывается количество этого товара в заказе
    if (!isset($_SESSION['cart']))
    {
      $_SESSION['cart'] = array();
    }
    if (in_array($id, $_SESSION['cart']))
    {
      $_SESSION['cart'][$id] += 1;
    } else
    {
      $_SESSION['cart'][$id] = 1;
    }
    header('Location: http://mvcshop.com' . $_POST['location']);
    die();
  }

  public function action_delete_item()
  {
    unset($_SESSION['cart'][$_GET['id']]);
    if (count($_SESSION['cart']) == 0)
    {
      unset($_SESSION['cart']);
    }
    header('Location: http://mvcshop.com/cart');
    die();
  }

  public function action_create_order()
  {
    $this->model->create_order();
    unset($_SESSION['cart']);
    header('Location: http://mvcshop.com');
    die();
  }
}