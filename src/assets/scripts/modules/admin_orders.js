export function delete_order() {
  const controller = 'admin_orders';
  const action = 'delete_order';
  let $form = $(`.js-${action}`);
  if ($form.length) {
    $form.each(function() {
      let $form = $(this);
      let $button = $form.find(`.${action}`);
      $button.on('click', event => {
        event.preventDefault();
        let data = $form.serializeArray();
        $.ajax({
          type: 'POST',
          url: `http://${location.host}/${controller}/${action}`,
          data,
          dataType: 'json',
          success: function(data) {
            console.log('success', data);
            let { status, order_id } = data;
            let $order = $(`.order_${order_id}`);
            $order.each(function() {
              $(this).remove();
            });
          },
          error: function(data) {
            console.log('error', data);
          },
        });
      });
    });
  }
}
