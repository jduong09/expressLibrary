document.addEventListener('DOMContentLoaded', () => {
  const btnGenreNew = document.getElementById('btn-genre-new');
  const btnBookNew = document.getElementById('btn-book-new');
  const btnsEdit = document.getElementsByClassName('btn-edit');
  const btnsDelete = document.getElementsByClassName('btn-delete');
  const btnsGenre = document.getElementsByClassName('btn-genre');
  const divBackground = document.getElementById('div-background');

  btnGenreNew.addEventListener('click', (e) => {
    e.preventDefault();
    const modalCollection = document.getElementById('div-modal-collection');

    modalCollection.classList.remove('hide');
    divBackground.classList.remove('hide');
  });

  btnBookNew.addEventListener('click', (e) => {
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

  for (let k = 0; k < btnsGenre.length; k++) {
    btnsGenre[k].addEventListener('click', (e) => {
      e.preventDefault();

      const genreName = e.currentTarget.getAttribute('data-genre-name');
      console.log('making fetch request');
      window.location = (`/?genre=${genreName}`);
    });
  }
});