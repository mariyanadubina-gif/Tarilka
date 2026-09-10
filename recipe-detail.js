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
          <h3>Рецепт не знайдено</h3>
          <a href="catalog.html" class="btn btn-success mt-3">Повернутися до каталогу</a>
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

    // Формування блоку медіа (Фото та/або Відео)
    let mediaSection = '';
    if (dish.image) {
      mediaSection += `<img src="${dish.image}" class="img-fluid rounded-4 my-3 max-h-400 w-100 object-fit-cover" alt="${dish.title}">`;
    }
    if (dish.video) {
      if (dish.video.startsWith('data:video') || dish.video.endsWith('.mp4')) {
        mediaSection += `
          <div class="my-3">
            <video controls class="w-100 rounded-4" style="max-height: 450px;">
              <source src="${dish.video}">
              Ваш браузер не підтримує програвання відео.
            </video>
          </div>`;
      } else {
        mediaSection += `
          <div class="my-3">
            <a href="${dish.video}" target="_blank" class="btn btn-outline-danger btn-lg rounded-pill">
              <i class="bi bi-youtube"></i> Переглянути відеорецепт
            </a>
          </div>`;
      }
    }

    recipeDetailContainer.innerHTML = `
      <div class="text-center mb-4">
        <small class="text-muted">Головна > Страви > ${dish.title}</small>
        <h2 class="fw-bold text-dark mt-2">${dish.title}</h2>
        
        <div class="d-flex justify-content-center align-items-center gap-3 my-3 flex-wrap">
          <div class="d-flex align-items-center gap-2">
            <img src="${dish.avatar || 'profile.png'}" class="rounded-circle" width="36" height="36" alt="${dish.author}">
            <span class="fw-semibold">${dish.author || 'Анонім'}</span>
          </div>
          <button class="btn btn-sm ${isSubbed ? 'btn-secondary' : 'btn-success'} rounded-pill px-3" onclick="toggleFollowAuthor('${dish.author}')">
            ${isSubbed ? 'Підписані' : 'Підписатися'}
          </button>
          <span>⏱ ${dish.time || '30 хв'}</span>
          <span>🍽 ${dish.servings || '2 порції'}</span>
          <span>🔥 ${dish.difficulty || 'Легко'}</span>
        </div>

        ${mediaSection}

        <div class="d-flex justify-content-center gap-4 my-3 fs-5">
          <button class="btn btn-outline-danger rounded-pill px-4" onclick="toggleLikeRecipe(${dish.id})">
            <i class="bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'}"></i> ${dish.likes || 0} Вподобайки
          </button>
          <button class="btn ${isSaved ? 'btn-success' : 'btn-outline-success'} rounded-pill px-4" onclick="toggleSaveRecipe(${dish.id})">
            <i class="bi ${isSaved ? 'bi-bookmark-check-fill' : 'bi-bookmark'}"></i> ${isSaved ? 'Збережено' : 'Зберегти рецепт'}
          </button>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-md-5">
          <div class="p-3 bg-light rounded-3 h-100">
            <h5 class="fw-bold mb-3">Інгредієнти</h5>
            <ul class="list-unstyled mb-0">
              ${ingredientsList.map(i => `<li class="py-1 border-bottom border-light-subtle">• ${i}</li>`).join('')}
            </ul>
          </div>
        </div>

        <div class="col-md-7">
          <div class="p-3 bg-light rounded-3 h-100">
            <h5 class="fw-bold mb-3">Покрокове приготування</h5>
            <ol class="ps-3 mb-0">
              ${stepsList.map(s => `<li class="mb-2">${s}</li>`).join('')}
            </ol>
          </div>
        </div>
      </div>

      <div class="mt-5">
        <h5 class="fw-bold mb-3">Коментарі (${dish.commentsList ? dish.commentsList.length : 0})</h5>
        <div class="mb-3 d-flex gap-2">
          <input type="text" id="commentInput" class="form-control" placeholder="${currentUser ? 'Залиште свій відгук...' : 'Увійдіть, щоб залишити коментар'}" ${!currentUser ? 'disabled' : ''}>
          <button id="addCommentBtn" class="btn btn-success px-4" ${!currentUser ? 'disabled' : ''}>Надіслати</button>
        </div>
        <div class="d-flex flex-column gap-3" id="commentsContainer">
          ${(dish.commentsList || []).map((c, index) => {
            const isLiked = c.isLiked || false;
            const likesCount = c.likes || 0;
            return `
              <div class="p-3 bg-light rounded-3 position-relative">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <div class="d-flex align-items-center gap-2">
                    <img src="${c.avatar || 'profile.png'}" class="rounded-circle" width="30" height="30" alt="${c.author}">
                    <strong>${c.author}</strong>
                  </div>
                  <div class="d-flex align-items-center gap-3">
                    <button class="btn btn-sm ${isLiked ? 'btn-danger' : 'btn-outline-danger'} like-comment-btn py-0 px-2 d-flex align-items-center gap-1" data-index="${index}">
                      <i class="bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'}"></i>
                      <span>${likesCount}</span>
                    </button>
                    <small class="text-muted">${c.time}</small>
                    ${currentUser && currentUser.username === c.author ? `
                      <button class="btn btn-sm btn-outline-secondary delete-comment-btn py-0 px-2" data-index="${index}" title="Видалити коментар">
                        <i class="bi bi-trash text-danger"></i>
                      </button>
                    ` : ''}
                  </div>
                </div>
                <p class="mb-0 text-dark">${c.text}</p>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // Додавання нових коментарів
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

    // Лайки до коментарів
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

    // Видалення коментарів
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