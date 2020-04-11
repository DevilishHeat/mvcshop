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

export function delete_item() {}

export function change_item() {}
