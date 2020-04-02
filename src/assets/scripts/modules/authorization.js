export default () => {
  const controller = 'authorization';
  let $modal = $('#authorization');
  let $form = $(`.js-${controller}`);
  let $submitBtn = $form.find('button[type="submit"]');
  let $alert = $modal.find('.alert-danger');

  $submitBtn.off(`click.${controller}`).on(`click.${controller}`, event => {
    event.preventDefault();
    let data = $form.serializeArray();

    $.ajax({
      type: 'POST',
      url: `http://${location.host}/${controller}`,
      data,
      dataType: 'json',
      success: function(data) {
        console.log('success', data);
        let { status, message } = data;

        if (status === 200) {
          location.reload();
          return;
        }

        if (status === 400) {
          $alert.text(message).removeAttr('hidden');
          return;
        }
      },
      error: function(data) {
        console.log('error', data);
      },
    });
  });
};
