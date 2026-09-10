document.addEventListener('DOMContentLoaded', () => {
  const catalogGrid = document.getElementById('catalogGrid');
  const categoryBtns = document.querySelectorAll('.btn-category');
  const searchInput = document.getElementById('searchInput');
  const difficultyFilter = document.getElementById('difficultyFilter');
  const timeFilter = document.getElementById('timeFilter');
  const resetFiltersBtn = document.getElementById('resetFiltersBtn');

  let currentCategory = 'all';

  function applyFilters() {
    const dishes = getDishes();
    const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedDifficulty = difficultyFilter ? difficultyFilter.value : 'all';
    const selectedMaxTime = timeFilter ? timeFilter.value : 'all';

    const filteredDishes = dishes.filter(dish => {
      const matchesCategory = currentCategory === 'all' || dish.category === currentCategory;
      const matchesSearch = dish.title.toLowerCase().includes(searchQuery) || 
                            dish.author.toLowerCase().includes(searchQuery);
      const matchesDifficulty = selectedDifficulty === 'all' || dish.difficulty === selectedDifficulty;
      const matchesTime = selectedMaxTime === 'all' || (dish.timeMinutes && dish.timeMinutes <= parseInt(selectedMaxTime));

      return matchesCategory && matchesSearch && matchesDifficulty && matchesTime;
    });

    renderCatalog(filteredDishes);
  }

  function renderCatalog(dishes) {
    if (!catalogGrid) return;
    catalogGrid.innerHTML = '';

    if (dishes.length === 0) {
      catalogGrid.innerHTML = `
        <div class="col-12 text-center text-muted py-5">
          <i class="bi bi-search fs-1 mb-2 d-block"></i>
          <p class="fs-5 mb-0">За вашим запитом нічого не знайдено.</p>
        </div>`;
      return;
    }

    const currentUser = getCurrentUser();
    const savedList = currentUser?.savedRecipes || [];
    const subList = currentUser?.subscriptions || [];

    dishes.forEach(dish => {
      const isSaved = savedList.includes(dish.id);
      const isSubbed = subList.includes(dish.author);
      const isLiked = dish.likedBy && currentUser ? dish.likedBy.includes(currentUser.email) : false;

      // Підготовка медіа (Фото або Відео)
      let mediaHtml = '';
      if (dish.image) {
        mediaHtml = `<img src="${dish.image}" class="img-fluid rounded-3 my-2 w-100 recipe-img" alt="${dish.title}">`;
      } else if (dish.video) {
        mediaHtml = `
          <div class="my-2 rounded-3 overflow-hidden bg-dark text-center py-4 text-white">
            <i class="bi bi-play-circle fs-1"></i>
            <p class="small mb-0">Відеорецепт</p>
          </div>`;
      } else {
        mediaHtml = `<img src="Food.png" class="img-fluid rounded-3 my-2 w-100 recipe-img" alt="${dish.title}">`;
      }

      const cardHtml = `
        <div class="col-md-4" data-id="${dish.id}">
          <div class="recipe-card h-100">
            <div class="recipe-card-details">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <div class="d-flex align-items-center gap-2">
                  <img src="${dish.avatar || 'profile.png'}" class="rounded-circle" width="36" height="36" alt="${dish.author}">
                  <span class="fw-semibold text-dark">${dish.author}</span>
                </div>
                <button class="btn btn-sm ${isSubbed ? 'btn-secondary' : 'btn-follow'} px-3 rounded-pill" onclick="toggleFollowAuthor('${dish.author}')">
                  ${isSubbed ? 'Підписані' : 'Підписатися'}
                </button>
              </div>

              <h5 class="recipe-title fw-bold text-dark mt-2">${dish.title}</h5>
              ${mediaHtml}

              <p class="recipe-desc text-muted small">${dish.desc || ''}</p>

              <div class="d-flex gap-3 text-muted small mb-2">
                <span>⏱ ${dish.time || '30 хв'}</span>
                <span>🍽 ${dish.servings || '2 порції'}</span>
                <span>🔥 ${dish.difficulty || 'Легко'}</span>
              </div>

              <hr class="my-2 text-muted">

              <div class="d-flex justify-content-between text-muted small pt-1 mb-2">
                <span class="cursor-pointer" onclick="toggleLikeRecipe(${dish.id})">
                  <i class="bi ${isLiked ? 'bi-heart-fill text-danger' : 'bi-heart'}"></i> ${dish.likes || 0}
                </span>
                <span class="cursor-pointer"><i class="bi bi-chat"></i> ${dish.comments || 0}</span>
                <span class="${isSaved ? 'text-success' : 'text-danger'} cursor-pointer" onclick="toggleSaveRecipe(${dish.id})">
                  <i class="bi ${isSaved ? 'bi-bookmark-check-fill' : 'bi-bookmark-fill'}"></i> ${isSaved ? 'Збережено' : 'Зберегти'}
                </span>
              </div>
            </div>

            <div class="d-flex justify-content-between align-items-center text-muted small pt-1 mb-2">
              <a href="recipe-detail.html?id=${dish.id}" class="card-button border-0 w-100 text-center text-decoration-none d-block py-2">Детальніше</a>
            </div>
          </div>
        </div>
      `;
      catalogGrid.insertAdjacentHTML('beforeend', cardHtml);
    });
  }

  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-category');
      applyFilters();
    });
  });

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (difficultyFilter) difficultyFilter.addEventListener('change', applyFilters);
  if (timeFilter) timeFilter.addEventListener('change', applyFilters);

  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (difficultyFilter) difficultyFilter.value = 'all';
      if (timeFilter) timeFilter.value = 'all';
      currentCategory = 'all';

      categoryBtns.forEach(b => b.classList.remove('active'));
      if (categoryBtns[0]) categoryBtns[0].classList.add('active');

      applyFilters();
    });
  }

  applyFilters();
});

