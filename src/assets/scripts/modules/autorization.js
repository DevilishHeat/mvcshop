export default () => {
  const API = 'authorization';

  let $form = $('.js-autorization');
  let $submitBtn = $form.find('button[type="submit"]');

  $submitBtn.off('click.registration').on('click.registration', event => {
    event.preventDefault();
    let data = JSON.stringify($form.serializeArray());

    $.ajax({
      method: 'POST',
      url: `http://mvcshop.com/${API}`,
      data,
      dataType: 'json',
    });
  });
};
