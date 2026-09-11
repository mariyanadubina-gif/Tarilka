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
          <div class="bg-white p-5 rounded-4 shadow-sm d-inline-block border">
            <i class="bi bi-search fs-1 mb-2 d-block text-secondary"></i>
            <p class="fs-5 mb-0 text-dark fw-semibold">За вашим запитом нічого не знайдено.</p>
            <p class="small text-muted mt-1">Спробуйте змінити фільтри або пошуковий запит</p>
          </div>
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

      let mediaHtml = '';
      if (dish.image) {
        mediaHtml = `<img src="${dish.image}" class="recipe-img" alt="${dish.title}">`;
      } else if (dish.video) {
        mediaHtml = `
          <div class="recipe-img d-flex flex-column align-items-center justify-content-center bg-dark text-white py-4">
            <i class="bi bi-play-circle fs-1 mb-1"></i>
            <span class="small">Відеорецепт</span>
          </div>`;
      } else {
        mediaHtml = `<img src="Food.png" class="recipe-img" alt="${dish.title}">`;
      }

      // Кількість коментарів
      const commentsCount = dish.commentsList ? dish.commentsList.length : (dish.comments || 0);

      const cardHtml = `
        <div class="col-md-6 col-lg-4 mb-4" data-id="${dish.id}">
          <div class="recipe-card p-3">
            
            <!-- Верхня частина з контентом -->
            <div class="recipe-content-area">
              <!-- Шапка картки (Автор та підписка) -->
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="d-flex align-items-center gap-2">
                  <img src="${dish.avatar || 'profile.png'}" class="rounded-circle object-fit-cover shadow-sm border" width="38" height="38" alt="${dish.author}">
                  <span class="fw-semibold text-dark text-truncate" style="max-width: 110px;">${dish.author}</span>
                </div>
                ${currentUser && currentUser.email !== dish.author ? `
                  <button class="btn btn-sm ${isSubbed ? 'btn-following' : 'btn-follow'}" onclick="toggleFollowAuthor('${dish.author}')">
                    <span>${isSubbed ? 'Підписані' : 'Підписатися'}</span>
                  </button>` : ''}
              </div>

              <!-- Зображення з кліком на деталі -->
              <div class="recipe-img-wrapper mb-3 shadow-sm" onclick="window.location.href='recipe-detail.html?id=${dish.id}'">
                ${mediaHtml}
              </div>

              <!-- Назва страви -->
              <h5 class="recipe-title fw-bold text-dark mb-2 cursor-pointer" onclick="window.location.href='recipe-detail.html?id=${dish.id}'">${dish.title}</h5>

              <!-- Опис -->
              <p class="recipe-desc text-muted small mb-3">${dish.desc || ''}</p>

              <!-- Охайні та красиві плашки (тепер завжди на одному рівні) -->
              <div class="recipe-meta-badges">
                ${dish.time ? `
                  <div class="recipe-meta-badge" title="Час готування">
                    <i class="bi bi-clock"></i>
                    <span>${dish.time}</span>
                  </div>` : ''}
                ${dish.servings ? `
                  <div class="recipe-meta-badge" title="Порції">
                    <i class="bi bi-people"></i>
                    <span>${dish.servings}</span>
                  </div>` : ''}
                <div class="recipe-meta-badge" title="Складність">
                  <i class="bi bi-fire"></i>
                  <span>${dish.difficulty || 'Легко'}</span>
                </div>
              </div>
            </div>

            <!-- Нижня панель з лайками та збереженням -->
            <div>
              <hr class="my-2 text-muted opacity-25">

              <div class="d-flex justify-content-between align-items-center pt-2">
                <button class="btn-recipe-action ${isLiked ? 'btn-like-active' : 'btn-like-default'}" onclick="toggleLikeRecipe(${dish.id})">
                  <i class="bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'}"></i>
                  <span>${dish.likes || 0}</span>
                </button>

                <a href="recipe-detail.html?id=${dish.id}#commentsSection" class="btn-recipe-action btn-like-default text-decoration-none" title="Переглянути коментарі">
                  <i class="bi bi-chat-dots"></i>
                  <span>${commentsCount}</span>
                </a>

                <button class="btn-recipe-action ${isSaved ? 'btn-save-active' : 'btn-save-default'}" onclick="toggleSaveRecipe(${dish.id})">
                  <i class="bi ${isSaved ? 'bi-bookmark-check-fill' : 'bi-bookmark'}"></i>
                  <span>${isSaved ? 'Збережено' : 'Зберегти'}</span>
                </button>
              </div>
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

