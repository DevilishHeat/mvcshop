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
    $id = $_POST['id'];
      //в массиве cart под индексом, равным id товара в бд, указывается количество этого товара в заказе
    if (!isset($_SESSION['cart']))
    {
      $_SESSION['cart'] = array();
    }
    if (array_key_exists("$id", $_SESSION['cart']))
    {
      $_SESSION['cart']["$id"] += 1;
    } else
    {
      $_SESSION['cart']["$id"] = 1;
    }
    $json = array(
      'status'=> 200,
      'quantity' => count($_SESSION['cart'])
    );
    header('Content-Type: application/json');
    echo json_encode($json);
  }

  public function action_delete_item()
  {
    $json = array(
      'status'=> 200,
      'quantity'=> count($_SESSION['cart']) - 1,
    );
    unset($_SESSION['cart'][$_POST['id']]);
    if (count($_SESSION['cart']) == 0)
    {
      unset($_SESSION['cart']);
    }
    header('Content-Type: application/json');
    echo json_encode($json);
  }

  public function action_create_order()
  {
    $this->model->create_order();
    unset($_SESSION['cart']);
    $json = array(
      'status'=> 200,
      'message'=> 'Ваш заказ успешно отправлен на обработку.'
    );
    header('Content-Type: application/json');
    echo json_encode($json);
  }
}