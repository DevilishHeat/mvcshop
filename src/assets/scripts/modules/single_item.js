export function add_item() {
  const controller = 'cart';
  const action = 'add_item';
  if (location.pathname.indexOf('single_item') !== -1) {
    let $button = $(`.${action}_single`);
    let $selector = $('.quantity_selector');
    $button.on('click', event => {
      event.preventDefault();
      let quantity = $selector.val();
      let data = {
        item_id: +$button.attr('value'),
        quantity: quantity,
      };
      console.log(data);
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
  }
}
