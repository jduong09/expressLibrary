document.addEventListener('DOMContentLoaded', () => {
  const inputGenreNew = document.getElementById('genre-new');
  const selectGenres = document.getElementById('genres-select');
  const labelInputGenre = document.getElementById('label-input-genre');

  selectGenres.addEventListener('change', () => {
    if (inputGenreNew.selected) {
      labelInputGenre.classList.remove('hide');
    } else {
      labelInputGenre.classList.add('hide');
    }
  });
});