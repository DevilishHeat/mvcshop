export function create_category() {
  const controller = 'admin_categories';
  const action = 'create_category';
  if (location.pathname.indexOf(controller) !== -1) {
    let $form = $(`.js-${action}`);
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
  if (location.pathname.indexOf(controller) !== -1) {
    let $categories = $('.category');
    $categories.each(function() {
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

export function change_category() {
  const controller = 'admin_categories';
  const action = 'change_category';
  if (location.pathname.indexOf(controller) !== -1) {
    let $categories = $('.category');
    $categories.each(function() {
      let $category = $(this);
      let $form = $category.find(`.js-${action}`);
      let $changeBtn = $category.find(`.${action}`);
      let $cancelBtn = $form.find('.cancel');
      let $saveBtn = $form.find('.save');
      let $alert = $category.find('.alert');
      $changeBtn.on('click', event => {
        event.preventDefault();
        $changeBtn.attr('hidden', true);
        $form.attr('hidden', false);
      });
      $cancelBtn.on('click', event => {
        event.preventDefault();
        $changeBtn.attr('hidden', false);
        $form.attr('hidden', true);
        $alert.attr('hidden', true);
      });
      $saveBtn.on('click', event => {
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
            if (status === 200) {
              location.reload();
            }
            if (status === 400) {
              $alert.attr('hidden', false).text(message);
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
