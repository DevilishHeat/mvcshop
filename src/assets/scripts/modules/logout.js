export default () => {
  const action = 'logout';
  const controller = 'authorization';
  let $button = $(`.${action}`);
  if ($button.length) {
    $button.off(`click.${action}`).on(`click.${action}`, event => {
      event.preventDefault();

      $.ajax({
        type: 'POST',
        url: `http://${location.host}/${controller}/${action}`,
        success: function() {
          console.log('123');
          location.reload();
        },
      });
    });
  }
};
