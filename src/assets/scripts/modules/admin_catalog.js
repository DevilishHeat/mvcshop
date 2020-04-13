export function create_item() {
  const controller = 'admin_catalog';
  const action = 'create_item';
  if (location.pathname.indexOf(controller) !== -1) {
    let $form = $(`.js-${action}`);
    let $submitBtn = $form.find(`.${action}`);
    $submitBtn.on('click', event => {
      event.preventDefault();
      let form = $(`.js-${action}`)[0];
      let data = new FormData(form);
      console.log(data);
      $.ajax({
        type: 'POST',
        url: `http://${location.host}/${controller}/${action}`,
        data: data,
        contentType: false,
        processData: false,
        dataType: 'json',
        enctype: 'multipart/form-data',
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
  if (location.pathname.indexOf(controller) !== -1) {
    let $items = $('.item');
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

export function change_item() {
  const controller = 'admin_catalog';
  const action = 'change_item';
  if (location.pathname.indexOf(controller) !== -1) {
    let $modal = $(`#${action}`);
    let $form = $modal.find($(`.js-${action}`));
    let $submitBtn = $form.find($('button'));
    $submitBtn.on('click', event => {
      event.preventDefault();
      let item_id = $form.find($('.item_id')).attr('value');
      let data = $form.serializeArray();
      $.ajax({
        type: 'POST',
        url: `http://${location.host}/${controller}/${action}`,
        data,
        dataType: 'json',
        success: function(data) {
          console.log('success', data);
          let { status, message } = data;
          if (status === 400) {
            let $alert = $modal.find($('.alert'));
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

export function modal_content() {
  const controller = 'admin_catalog';
  if (location.pathname.indexOf(controller) !== -1) {
    let $buttons = $('.change_item');
    if ($buttons.length) {
      $buttons.each(function() {
        let $button = $(this);
        $button.on('click', event => {
          let item_id = $button.attr('value');
          let $modal = $('#change_item');
        });
      });
    }
  }
}
