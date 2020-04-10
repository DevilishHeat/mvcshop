export function create_category() {
  const controller = 'admin_categories';
  const action = 'create_category';
  let $form = $(`.js-${action}`);
  if ($form.length) {
    let $submitBtn = $form.find(`.${action}`);
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

export function delete_category() {
  const controller = 'admin_categories';
  const action = 'delete_category';
  let $categoies = $('.category');
  if ($categoies.length) {
    $categoies.each(function() {
      let $category = $(this);
      let $button = $category.find(`.${action}`);
      $button.on('click', event => {
        event.preventDefault();
        let category_id = $button.attr('value');
        let data = { category_id: +category_id };
        $.ajax({
          type: 'POST',
          url: `http://${location.host}/${controller}/${action}`,
          data,
          success: function(data) {
            console.log('success', data);
            let { status } = data;
            if (status === 200) {
              $category.remove();
            }
          },
          error: function(data) {
            console.log('error', data);
          },
        });
      });
    });
  }
}

export function change_category() {}
