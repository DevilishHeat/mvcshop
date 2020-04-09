export function create_category() {}

export function delete_category() {
  const controller = 'admin_categories';
  const action = 'delete_category';
  let $categoies = $('.category');
  if ($categoies.length) {
    $categoies.each(function() {
      let $category = $(this);
      let $button = $category.find(`.${action}`);
      $button.on('click', event => {
        event.preventDefault();
        let category_id = $button.attr('value');
        let data = { category_id: +category_id };
        $.ajax({
          type: 'POST',
          url: `http://${location.host}/${controller}/${action}`,
          data,
          success: function(data) {
            console.log('success', data);
            let { status } = data;
            if (status === 200) {
              $category.remove();
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

export function change_category() {}
