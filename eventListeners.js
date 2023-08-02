document.addEventListener('DOMContentLoaded', () => {
  const btnNew = document.getElementById('btn-new');
  const btnsEdit = document.getElementsByClassName('btn-edit');
  const btnsDelete = document.getElementsByClassName('btn-delete');

  // const btnSubmit = document.getElementById('btn-submit');

  btnNew.addEventListener('click', (e) => {
    e.preventDefault();

    window.location = '/book/new';
  });

  for (let i = 0; i < btnsEdit.length; i++) {
    btnsEdit[i].addEventListener('click', (e) => {
      e.preventDefault();

      const parentEle = e.currentTarget.parentElement.parentElement;
      const dataId = parentEle.getAttribute('data-id');

      window.location = `/books/${dataId}/update`;
    });
  }

  for (let j = 0; j < btnsDelete.length; j++) {
    btnsDelete[j].addEventListener('click', (e) => {
      e.preventDefault();

      const parentEle = e.currentTarget.parentElement.parentElement;
      const dataId = parentEle.getAttribute('data-id');

      fetch(`/books/${dataId}`, {
        method: 'DELETE'
      }).then(res => res.json())
        .then(data => {
          if (data.message === 'success') {
            window.location = '/';
          } else {
            console.error(data.message);
          }
        });
    });
  }
});