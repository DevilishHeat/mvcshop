export function create_admin() {
  const controller = 'admin_admins';
  const action = 'create_admin';
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

export function delete_admin() {
  const controller = 'admin_admins';
  const action = 'delete_admin';
  let $admins = $('.admin');
  if ($admins.length) {
    $admins.each(function() {
      let $admin = $(this);
      let $button = $admin.find(`.${action}`);
      $button.on('click', event => {
        event.preventDefault();
        let admin_id = $button.attr('value');
        let data = { admin_id: +admin_id };
        console.log(data);
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

export function change_password() {}
