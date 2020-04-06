export function add_item() {
  const controller = 'cart';
  const action = 'add_item';
  if ($(`.js-${action}`).length) {
    $(`.js-${action}`).each(function(index) {
      $(this)
        .off(`click.${action}`)
        .on(`click.${action}`, event => {
          event.preventDefault();
          let data = { id: $(this).attr('value') };
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
  if ($('.item').length) {
    $('.item').each(function(index) {
      let $item = $(this);
      let $button = $item.find(`.js-${action}`);
      $button.off(`click.${action}`).on(`click.${action}`, event => {
        event.preventDefault();
        let data = { id: $button.attr('value') };
        console.log(data);
        $.ajax({
          type: 'POST',
          url: `http://${location.host}/${controller}/${action}`,
          data,
          success: function(data) {
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
  let $form = $(`.js-${controller}`);
  let $submitBtn = $form.find('.create_order');
  if ($form.length) {
    $submitBtn.off(`click.${action}`).on(`click.${action}`, event => {
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

}