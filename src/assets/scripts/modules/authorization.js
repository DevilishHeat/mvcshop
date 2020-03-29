export default () => {
  const API = 'authorization';

  let $modal = $(`#${API}`);
  let $form = $(`.js-${API}`);
  let $submitBtn = $form.find('button[type="submit"]');
  let $alert = $modal.find('.alert-danger');

  $submitBtn.off(`click.${API}`).on(`click.${API}`, event => {
    event.preventDefault();
    let data = $form.serializeArray();

    $.ajax({
      type: 'POST',
      url: `http://mvcshop.com/${API}`,
      data,
      dataType: 'json',
      success: function(data) {
        let { status, message } = data;

        /* 
        if (status === 200) {
          ...
        }
        
        */

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
