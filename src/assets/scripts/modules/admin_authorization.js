export function authorization() {
  const controller = 'admin';
  const action = 'authorization';
  let $form = $('.js-admin_authorization');
  let $submitBtn = $form.find(`.${action}`);
  let $alert = $form.find('.alert');
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
        if (status === 200) {
          location.reload();
        }
        if (status === 400) {
          $alert.removeAttr('hidden').text(message);
        }
      },
      error: function(data) {
        console.log('error', data);
      },
    });
  });
}

export function logout() {
  const controller = 'admin';
  const action = 'logout';
  let $button = $(`.${action}`);
  $button.on('click', event => {
    event.preventDefault();
    $.ajax({
      type: 'POST',
      url: `http://${location.host}/${controller}/${action}`,
      success: function(data) {
        console.log('success', data);
        location.reload();
      },
      error: function(data) {
        console.log('error', data);
      },
    });
  });
}
