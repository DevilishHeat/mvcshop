export default () => {
  const controller = 'cart';
  const action = 'add_item';
  $(`.js-${action}`).each(function(index) {
    $(this)
      .off(`click.${action}`)
      .on(`click.${action}`, event => {
        event.preventDefault();
        let data = { id: $(this).attr('value') };
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
  });
};
