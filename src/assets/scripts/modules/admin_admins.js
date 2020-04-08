export function create_admin() {}

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
