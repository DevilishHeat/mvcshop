export function create_admin() {
  const controller = 'admin_admins';
  const action = 'create_admin';
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

export function delete_admin() {
  const controller = 'admin_admins';
  const action = 'delete_admin';
  if (location.pathname.indexOf(controller) !== -1) {
    let $admins = $('.admin');
    $admins.each(function() {
      let $admin = $(this);
      let $button = $admin.find(`.${action}`);
      $button.on('click', event => {
        event.preventDefault();
        let admin_id = $button.attr('value');
        let data = { admin_id: admin_id };
        $.ajax({
          type: 'POST',
          url: `http://${location.host}/${controller}/${action}`,
          data,
          success: function(data) {
            console.log('success', data);
            let { status, message } = data;
            if (status === 200) {
              $admin.remove();
            } else {
              let $alert = $admin.find($('.alert'));
              $alert.removeAttr('hidden').text(message);
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

export function change_password() {
  const controller = 'admin_admins';
  const action = 'change_password';
  if (location.pathname.indexOf(controller) !== -1) {
    let $modal = $(`#${action}`);
    let $form = $modal.find($(`.js-${action}`));
    let $submitBtn = $form.find($('button'));
    $submitBtn.on('click', event => {
      event.preventDefault();
      let admin_id = $form.find($('.admin_id')).attr('value');
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
            $modal.modal('hide');
            let $admin = $(`#${admin_id}`);
            $admin
              .find($('.is_password_set'))
              .text(String.fromCharCode(message));
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
  const controller = 'admin_admins';
  if (location.pathname.indexOf(controller) !== -1) {
    let $buttons = $('.change_password');
    if ($buttons.length) {
      $buttons.each(function() {
        let $button = $(this);
        $button.on('click', event => {
          let admin_id = $button.attr('value');
          let $modal = $('#change_password');
          let $hidden_input = $modal.find('.admin_id');
          $hidden_input.attr('value', admin_id);
        });
      });
    }
  }
}
