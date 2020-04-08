export default () => {
  const controller = 'registration';

  let $modal = $(`#${controller}`);
  let $form = $(`.js-${controller}`);
  let $submitBtn = $form.find('button[type="submit"]');
  let $success = $modal.find('.alert-success');
  let $danger = $modal.find('.alert-danger');

  $submitBtn.on('click', event => {
    event.preventDefault();
    let data = $form.serializeArray();

    $.ajax({
      type: 'POST',
      url: `http://mvcshop.com/${controller}`,
      data,
      dataType: 'json',
      success: function(data) {
        console.log('success', data);
        let { status, message } = data;
        $success.attr('hidden', true);
        $danger.attr('hidden', true);

        if (status === 200) {
          $success.text(message).removeAttr('hidden');
        }

        if (status === 400) {
          $danger.text(message).removeAttr('hidden');
        }
      },
      error: function(data) {
        console.log('error', data);
      },
    });
  });
};
