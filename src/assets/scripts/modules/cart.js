export function add_item() {
  const controller = 'cart';
  const action = 'add_item';
  let $buttons = $(`.${action}`);
  if ($buttons.length) {
    $buttons.each(function() {
      let $add_item_button = $(this);
      $add_item_button.on('click', event => {
        event.preventDefault();
        let data = { item_id: $add_item_button.attr('value'), quantity: 1 };
        $.ajax({
          type: 'POST',
          url: `http://${location.host}/${controller}/${action}`,
          data,
          success: function(data) {
            let { status, quantity } = data;
            let $counter = $('.items-counter');
            $counter.text(quantity);
            console.log('success', data);
          },
          error: function(data) {
            console.log('error', data);
          },
        });
      });
    });
  }
}

export function delete_item() {
  const controller = 'cart';
  const action = 'delete_item';
  if (location.pathname.indexOf(controller) !== -1) {
    $('.item').each(function() {
      let $item = $(this);
      let $price = $item.find('.price').text();
      let $button = $item.find(`.js-${action}`);
      $button.on('click', event => {
        event.preventDefault();
        let $quantity = $item.find('.quantity_selector').val();
        let data = { id: $button.attr('value') };
        console.log(data);
        $.ajax({
          type: 'POST',
          url: `http://${location.host}/${controller}/${action}`,
          data,
          success: function(data) {
            let $total_price = $('.total_price');
            let { status, quantity } = data;
            console.log('success', data);
            let $counter = $('.items-counter');
            if (quantity === 0) {
              $counter.text('');
              $('.cart-table').remove();
              $('.content_view').append(
                $('<div>', {
                  align: 'center',
                  text: 'Корзина пуста',
                }),
              );
            } else {
              $counter.text(quantity);
            }
            $item.remove();
            $total_price.val(+$total_price.val() - +$price * $quantity);
          },
          error: function(data) {
            console.log('error', data);
          },
        });
      });
    });
  }
}

export function create_order() {
  const controller = 'cart';
  const action = 'create_order';
  if (location.pathname.indexOf(controller) !== -1) {
    let $form = $(`.js-${controller}`);
    let $submitBtn = $form.find('.create_order');
    $submitBtn.on('click', event => {
      event.preventDefault();
      if ($form.find('input[name=username]').val() === '') {
        $('.content_view').append(
          $('<div>', {
            align: 'center',
            class: 'alert alert-danger',
            text: 'Для отправки заказа необходимо авторизоваться',
          }),
        );
      } else {
        let data = $form.serializeArray();
        $.ajax({
          type: 'POST',
          url: `http://${location.host}/${controller}/${action}`,
          data,
          dataType: 'json',
          success: function(data) {
            console.log('success', data);
            let { status, message } = data;
            $('.cart-table').remove();
            $('.content_view').append(
              $('<div>', {
                align: 'center',
                text: message,
              }),
            );
          },
          error: function(data) {
            console.log('error', data);
          },
        });
      }
    });
  }
}

export function total_price_calculation() {
  const controller = 'cart';
  const action = 'change_item_quantity';
  if (location.pathname.indexOf(controller) !== -1) {
    let $items = $('.item');
    let $total_price = $('.total_price');
    $items.each(function() {
      let $item = $(this);
      let $selector = $item.find('.quantity_selector');
      let $price = $item.find('.price');
      let $old_quantity = $selector.val();
      let $item_id = $item.find('.item_id').text();
      $selector.change(function() {
        let data = { item_id: $item_id, quantity: $selector.val() };
        $.ajax({
          type: 'POST',
          url: `http://${location.host}/${controller}/${action}`,
          data,
          dataType: 'json',
          success: function(data) {
            console.log('success', data);
          },
          error: function(data) {
            console.log('error', data);
          },
        });
        $total_price.val(
          +$total_price.val() +
            $price.text() * ($selector.val() - $old_quantity),
        );
        $old_quantity = $selector.val();
      });
    });
  }
}
