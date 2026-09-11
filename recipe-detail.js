document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const recipeId = parseInt(urlParams.get('id')) || 1;

  const dish = getDishById(recipeId);
  const recipeDetailContainer = document.getElementById('recipeDetailContent');

  function renderRecipe() {
    if (!recipeDetailContainer) return;

    if (!dish) {
      recipeDetailContainer.innerHTML = `
        <div class="text-center py-5">
          <div class="mb-3 text-white" style="font-size: 3rem;"><i class="bi bi-search"></i></div>
          <h3 class="fw-bold text-white">Рецепт не знайдено</h3>
          <p class="text-white-50">Можливо, він був видалений або вказано невірне посилання.</p>
          <a href="catalog.html" class="btn btn-light mt-3 rounded-pill px-4 fw-semibold shadow-sm">Повернутися до каталогу</a>
        </div>`;
      return;
    }

    const currentUser = getCurrentUser();
    const isSubbed = currentUser?.subscriptions?.includes(dish.author);
    const isSaved = currentUser?.savedRecipes?.includes(dish.id);
    const isLiked = dish.likedBy && currentUser ? dish.likedBy.includes(currentUser.email) : false;

    const ingredientsList = Array.isArray(dish.ingredients) 
      ? dish.ingredients 
      : (dish.ingredients ? dish.ingredients.split('\n') : []);

    const stepsList = Array.isArray(dish.steps) 
      ? dish.steps 
      : (dish.steps ? dish.steps.split('\n') : []);

    let initialServings = 1;
    if (dish.servings) {
      const match = dish.servings.match(/\d+/);
      if (match) initialServings = parseInt(match[0]);
    }

    let mediaSection = '';
    if (dish.image) {
      mediaSection += `
        <div class="mb-4 text-center overflow-hidden rounded-4 shadow recipe-media-card border border-white border-opacity-50 bg-light">
          <img src="${dish.image}" class="img-fluid rounded-4" alt="${dish.title}" style="max-height: 600px; width: auto; object-fit: contain; display: inline-block;">
        </div>`;
    }
    if (dish.video) {
      if (dish.video.startsWith('data:video') || dish.video.endsWith('.mp4')) {
        mediaSection += `
          <div class="my-4 overflow-hidden rounded-4 shadow recipe-media-card border border-white border-opacity-50">
            <video controls class="w-100" style="max-height: 450px; background: #000;">
              <source src="${dish.video}">
              Ваш браузер не підтримує програвання відео.
            </video>
          </div>`;
      } else {
        mediaSection += `
          <div class="my-4">
            <a href="${dish.video}" target="_blank" class="btn btn-light text-danger btn-lg rounded-pill px-4 shadow-sm fw-semibold">
              <i class="bi bi-youtube me-2"></i> Переглянути відеорецепт
            </a>
          </div>`;
      }
    }

    recipeDetailContainer.innerHTML = `
      <div class="mb-5 p-4 p-md-5 bg-white rounded-4 shadow-lg border border-light">
        <nav aria-label="breadcrumb" class="mb-3">
          <ol class="breadcrumb mb-0 small">
            <li class="breadcrumb-item"><a href="index.html" class="text-decoration-none text-muted">Головна</a></li>
            <li class="breadcrumb-item"><a href="catalog.html" class="text-decoration-none text-muted">Страви</a></li>
            <li class="breadcrumb-item active text-success fw-semibold" aria-current="page">${dish.title}</li>
          </ol>
        </nav>

        <h1 class="fw-bold text-dark mb-3 display-5">${dish.title}</h1>
        
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 py-3 border-top border-bottom mb-4 border-light-subtle">
          <div class="d-flex align-items-center gap-3">
            <img src="${dish.avatar || 'profile.png'}" class="rounded-circle border shadow-sm" width="48" height="48" alt="${dish.author}" style="object-fit: cover;">
            <div>
              <h6 class="mb-0 fw-bold text-dark">${dish.author || 'Анонім'}</h6>
              <small class="text-muted">Автор рецепта</small>
            </div>
            <button class="btn btn-sm ${isSubbed ? 'btn-following' : 'btn-follow'} ms-2 shadow-sm" onclick="toggleFollowAuthor('${dish.author}')">
              <span>${isSubbed ? 'Підписані' : 'Підписатися'}</span>
            </button>
          </div>

          <div class="d-flex align-items-center gap-2 flex-wrap">
            <div class="badge bg-light text-dark border px-3 py-2 rounded-pill fw-normal fs-6 shadow-sm">
              <i class="bi bi-clock text-success me-1"></i> ${dish.time || '30 хв'}
            </div>
            
            <!-- КАЛЬКУЛЯТОР ПОРЦІЙ -->
            <div class="badge bg-light text-dark border px-2 py-1 rounded-pill fw-normal fs-6 shadow-sm d-flex align-items-center gap-1">
              <i class="bi bi-people text-success ms-1"></i>
              <span class="small">Порції:</span>
              <div class="input-group input-group-sm" style="width: 85px;">
                <button class="btn btn-sm btn-outline-success border-0 px-1 py-0 fw-bold" type="button" id="decreaseServings">-</button>
                <input type="number" id="servingsCount" class="form-control text-center p-0 border-0 bg-transparent fw-bold text-dark shadow-none" value="${initialServings}" min="1" max="100">
                <button class="btn btn-sm btn-outline-success border-0 px-1 py-0 fw-bold" type="button" id="increaseServings">+</button>
              </div>
            </div>

            <div class="badge bg-light text-dark border px-3 py-2 rounded-pill fw-normal fs-6 shadow-sm">
              <i class="bi bi-fire text-success me-1"></i> ${dish.difficulty || 'Легко'}
            </div>
          </div>
        </div>

        ${mediaSection}

        <div class="d-flex gap-3 my-4">
          <button class="btn ${isLiked ? 'btn-danger' : 'btn-outline-danger'} rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-sm" onclick="toggleLikeRecipe(${dish.id})">
            <i class="bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'} fs-5"></i> 
            <span>${dish.likes || 0} Вподобайки</span>
          </button>
          <button class="btn ${isSaved ? 'btn-success' : 'btn-outline-success'} rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-sm" onclick="toggleSaveRecipe(${dish.id})">
            <i class="bi ${isSaved ? 'bi-bookmark-check-fill' : 'bi-bookmark'} fs-5"></i> 
            <span>${isSaved ? 'Збережено' : 'Зберегти рецепт'}</span>
          </button>
        </div>
      </div>

      <div class="row g-4 mb-5">
        <div class="col-lg-4">
          <div class="card border-0 shadow-lg rounded-4 h-100 bg-white recipe-section-card">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                <h4 class="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                  <i class="bi bi-basket text-success"></i> Список покупок
                </h4>
                <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 small">Чек-лист</span>
              </div>
              <p class="text-muted small mb-3">Відмічайте інгредієнти під час покупки. Кількість оновлюється автоматично!</p>
              <ul class="list-unstyled mb-0" id="shoppingList">
                <!-- Динамічно заповнюється функцією оновлення порцій -->
              </ul>
            </div>
          </div>
        </div>

        <div class="col-lg-8">
          <div class="card border-0 shadow-lg rounded-4 h-100 bg-white recipe-section-card">
            <div class="card-body p-4">
              <h4 class="fw-bold mb-4 text-dark d-flex align-items-center gap-2 border-bottom pb-3">
                <i class="bi bi-journal-text text-success"></i> Покрокове приготування
              </h4>
              <div class="d-flex flex-column gap-3">
                ${stepsList.map((s, idx) => `
                  <div class="p-3 rounded-3 bg-light border border-light-subtle d-flex gap-3 align-items-start shadow-sm">
                    <div class="badge bg-success rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm" style="width: 32px; height: 32px; min-width: 32px; font-size: 0.9rem;">
                      ${idx + 1}
                    </div>
                    <p class="mb-0 text-dark pt-1 lh-base">${s}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-lg rounded-4 p-4 p-md-5 bg-white recipe-section-card">
        <h4 class="fw-bold mb-4 text-dark d-flex align-items-center gap-2 border-bottom pb-3">
          <i class="bi bi-chat-square-text text-success"></i> Коментарі (${dish.commentsList ? dish.commentsList.length : 0})
        </h4>
        
        <div class="mb-4 d-flex gap-2">
          <input type="text" id="commentInput" class="form-control rounded-pill px-4 py-2 border bg-light shadow-sm" placeholder="${currentUser ? 'Залиште свій відгук про рецепт...' : 'Увійдіть, щоб залишити коментар'}" ${!currentUser ? 'disabled' : ''}>
          <button id="addCommentBtn" class="btn btn-success rounded-pill px-4 py-2 shadow-sm fw-semibold" ${!currentUser ? 'disabled' : ''}>Надіслати</button>
        </div>

        <div class="d-flex flex-column gap-3" id="commentsContainer">
          ${(dish.commentsList || []).length === 0 ? `
            <p class="text-muted text-center py-4 mb-0 bg-light rounded-3 border">Ще немає коментарів. Будьте першим!</p>
          ` : (dish.commentsList || []).map((c, index) => {
            const isLikedComment = c.isLiked || false;
            const likesCount = c.likes || 0;
            return `
              <div class="p-3 bg-light rounded-4 border position-relative shadow-sm">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <div class="d-flex align-items-center gap-2">
                    <img src="${c.avatar || 'profile.png'}" class="rounded-circle border" width="38" height="38" alt="${c.author}" style="object-fit: cover;">
                    <div>
                      <h6 class="mb-0 fw-bold small text-dark">${c.author}</h6>
                      <small class="text-muted" style="font-size: 0.75rem;">${c.time}</small>
                    </div>
                  </div>
                  <div class="d-flex align-items-center gap-2">
                    <button class="btn btn-sm ${isLikedComment ? 'btn-danger' : 'btn-outline-danger'} like-comment-btn rounded-pill px-3 py-1 d-flex align-items-center gap-1 shadow-sm" data-index="${index}">
                      <i class="bi ${isLikedComment ? 'bi-heart-fill' : 'bi-heart'}"></i>
                      <span class="small">${likesCount}</span>
                    </button>
                    ${currentUser && currentUser.username === c.author ? `
                      <button class="btn btn-sm btn-outline-secondary delete-comment-btn rounded-circle p-1 d-flex align-items-center justify-content-center shadow-sm" style="width: 28px; height: 28px;" data-index="${index}" title="Видалити коментар">
                        <i class="bi bi-trash text-danger small"></i>
                      </button>
                    ` : ''}
                  </div>
                </div>
                <p class="mb-0 text-dark ps-5 text-break">${c.text}</p>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // --- ЛОГІКА КАЛЬКУЛЯТОРА ПОРЦІЙ ТА ПЕРЕРАХУНКУ ІНГРЕДІЄНТІВ ---
    const baseServings = initialServings;
    const servingsInput = document.getElementById('servingsCount');
    const decreaseBtn = document.getElementById('decreaseServings');
    const increaseBtn = document.getElementById('increaseServings');
    const shoppingListContainer = document.getElementById('shoppingList');

    function updateIngredientsList(currentServings) {
      if (!shoppingListContainer) return;
      
      shoppingListContainer.innerHTML = ingredientsList.map((item, index) => {
        // Шукаємо числа в рядку інгредієнта (наприклад: "Цукор — 200 г" або "Яйця — 3 шт")
        const calculatedItem = item.replace(/(\d+([.,]\d+)?)/g, (match) => {
          const num = parseFloat(match.replace(',', '.'));
          const scaled = (num / baseServings) * currentServings;
          // Округлимо до 1 знаку після коми, якщо це не ціле число
          return Number.isInteger(scaled) ? scaled : scaled.toFixed(1);
        });

        return `
          <li class="py-2.5 border-bottom border-light d-flex align-items-center gap-3">
            <input class="form-check-input ingredient-checkbox mt-0 fs-5 shadow-sm" type="checkbox" id="ing-${index}" style="cursor: pointer; accent-color: #2e7d32;">
            <label class="form-check-label text-dark fw-medium text-break" for="ing-${index}" style="cursor: pointer; transition: all 0.2s;">
              ${calculatedItem}
            </label>
          </li>
        `;
      }).join('');

      // Перепідключаємо обробники чекбоксів для перекреслення
      document.querySelectorAll('.ingredient-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
          const label = document.querySelector(`label[for="${e.target.id}"]`);
          if (label) {
            if (e.target.checked) {
              label.style.textDecoration = 'line-through';
              label.style.color = '#6c757d';
            } else {
              label.style.textDecoration = 'none';
              label.style.color = '#212529';
            }
          }
        });
      });
    }

    // Первинне заповнення списку інгредієнтів
    updateIngredientsList(initialServings);

    // Обробники подій для кнопок та інпуту порцій
    if (decreaseBtn && increaseBtn && servingsInput) {
      decreaseBtn.addEventListener('click', () => {
        let val = parseInt(servingsInput.value) || 1;
        if (val > 1) {
          servingsInput.value = val - 1;
          updateIngredientsList(parseInt(servingsInput.value));
        }
      });

      increaseBtn.addEventListener('click', () => {
        let val = parseInt(servingsInput.value) || 1;
        if (val < 100) {
          servingsInput.value = val + 1;
          updateIngredientsList(parseInt(servingsInput.value));
        }
      });

      servingsInput.addEventListener('input', () => {
        let val = parseInt(servingsInput.value);
        if (isNaN(val) || val < 1) val = 1;
        if (val > 100) val = 100;
        updateIngredientsList(val);
      });
    }
    // -------------------------------------------------------------

    const addCommentBtn = document.getElementById('addCommentBtn');
    if (addCommentBtn) {
      addCommentBtn.addEventListener('click', () => {
        const input = document.getElementById('commentInput');
        const text = input.value.trim();
        if (!text) return;

        const newComment = {
          author: currentUser ? currentUser.username : 'Гість',
          avatar: currentUser ? currentUser.avatar : 'profile.png',
          time: 'Щойно',
          text: text,
          likes: 0,
          isLiked: false
        };

        if (!dish.commentsList) dish.commentsList = [];
        dish.commentsList.push(newComment);
        dish.comments = dish.commentsList.length;

        saveDishState();
        renderRecipe();
      });
    }

    document.querySelectorAll('.like-comment-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.getAttribute('data-index'));
        const comment = dish.commentsList[index];

        if (comment.isLiked) {
          comment.likes = Math.max(0, (comment.likes || 1) - 1);
          comment.isLiked = false;
        } else {
          comment.likes = (comment.likes || 0) + 1;
          comment.isLiked = true;
        }

        saveDishState();
        renderRecipe();
      });
    });

    document.querySelectorAll('.delete-comment-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const commentIndex = parseInt(e.currentTarget.getAttribute('data-index'));
        dish.commentsList.splice(commentIndex, 1);
        dish.comments = dish.commentsList.length;

        saveDishState();
        renderRecipe();
      });
    });
  }

  function saveDishState() {
    const dishes = getDishes();
    const idx = dishes.findIndex(d => d.id === dish.id);
    if (idx !== -1) {
      dishes[idx] = dish;
      saveDishes(dishes);
    }
  }

  renderRecipe();
});

// Додаткова глобальна функція для обробки коментарів (за потреби)
window.addCommentToRecipe = function(recipeId) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert('Будь ласка, увійдіть, щоб залишати коментарі!');
    return;
  }

  // Використовуємо твій айдішник інпуту: commentInput
  const commentInput = document.getElementById('commentInput');
  const text = commentInput ? commentInput.value.trim() : '';

  if (!text) {
    alert('Напишіть текст коментаря!');
    return;
  }

  const dishes = getDishes();
  const dish = dishes.find(d => d.id === recipeId);
  if (!dish) return;

  if (!dish.commentsList) dish.commentsList = [];

  // Додаємо новий коментар на початок списку
  dish.commentsList.unshift({
    author: currentUser.username,
    avatar: currentUser.avatar || 'profile.png',
    time: 'Щойно',
    text: text,
    likes: 0,
    isLiked: false
  });

  dish.comments = dish.commentsList.length;
  saveDishes(dishes);
  
  commentInput.value = '';
  window.location.reload();
};