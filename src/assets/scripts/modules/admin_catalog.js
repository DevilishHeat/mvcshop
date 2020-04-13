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
    let $items = $('.item');
    $items.each(function() {
      let $item = $(this);
      let $changeBtn = $item.find($('.change_item'));
      $changeBtn.on('click', event => {
        let $data = $item.find($('.data_container'));
        let $modal = $('#change_item');
        let $form = $modal.find($('.js-change_item'));
        let $name = $form.find('input[name="name"]');
        $name.attr('value', $data.data('name'));
        let $description = $form.find('textarea[name="description"]');
        $description.val($data.data('description'));
        let $category = $form.find('select[name="category"]');
        $category.val($data.data('category'));
        let $price = $form.find('input[name="price"]');
        $price.attr('value', $data.data('price'));
        let $item_id = $form.find('input[name="item_id"]');
        $item_id.attr('value', $data.data('item_id'));
      });
    });
  }
}
