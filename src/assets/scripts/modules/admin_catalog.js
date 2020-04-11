export function create_item() {
  const controller = 'admin_catalog';
  const action = 'create_item';
  let $form = $(`.js-${action}`);
  if ($form.length) {
    let $submitBtn = $form.find(`.${action}`);
    $submitBtn.on('click', event => {
      event.preventDefault();
      let data = $form.serializeArray();
      console.log(data);
      $.ajax({
        type: 'POST',
        url: `http://${location.host}/${controller}/${action}`,
        data,
        dataType: 'json',
        success: function(data) {
          console.log('success', data);
          let { status, message } = data;
          let $alert = $form.find($('.alert'));
          if (status === 400) {
            $alert.removeAttr('hidden').text(message);
          }
          if (status === 200) {
            location.reload();
          }
        },
        error: function(data) {
          console.log('error', data);
        },
      });
    });
  }
}

export function delete_item() {
  const controller = 'admin_catalog';
  const action = 'delete_item';
  let $items = $('.item');
  if ($items.length) {
    $items.each(function() {
      let $item = $(this);
      let $button = $item.find(`.${action}`);
      if ($button.length) {
        $button.on('click', event => {
          event.preventDefault();
          let item_id = $button.attr('value');
          let data = { item_id: item_id };
          $.ajax({
            type: 'POST',
            url: `http://${location.host}/${controller}/${action}`,
            data,
            success: function(data) {
              console.log('success', data);
              let { status } = data;
              if (status === 200) {
                $item.remove();
              }
            },
            error: function(data) {
              console.log('error', data);
            },
          });
        });
      }
    });
  }
}

export function change_item() {}
