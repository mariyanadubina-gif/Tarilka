document.addEventListener('DOMContentLoaded', () => {
  const profileContainer = document.getElementById('profileContainer');
  let currentUser = getCurrentUser();

  if (!currentUser) {
    alert('Будь ласка, увійдіть у систему, щоб переглянути профіль.');
    window.location.href = 'index.html';
    return;
  }

  function renderProfile() {
    const allDishes = getDishes();
    const allUsers = getUsers();
    
    const myRecipes = allDishes.filter(d => d.author === currentUser.username);
    const savedRecipes = allDishes.filter(d => currentUser.savedRecipes && currentUser.savedRecipes.includes(d.id));
    const subscriptions = currentUser.subscriptions || [];
    
    const subscribers = allUsers.filter(u => u.subscriptions && u.subscriptions.includes(currentUser.username));

    profileContainer.innerHTML = `
      <div class="row g-4">
        <!-- Блок інформації про користувача (ліва колонка) -->
        <div class="col-lg-4">
          <div class="p-4 bg-white rounded-4 shadow-sm text-center">
            <img src="${currentUser.avatar || 'profile.png'}" class="rounded-circle mb-3 border border-3 border-success object-fit-cover" width="100" height="100" alt="Avatar">
            <h3 class="fw-bold text-dark mb-1">${currentUser.username}</h3>
            <p class="text-muted small mb-2">${currentUser.email}</p>
            ${currentUser.bio ? `<p class="text-secondary small fst-italic mb-3 px-2">"${currentUser.bio}"</p>` : '<p class="text-muted small fst-italic mb-3">Ще немає опису про себе.</p>'}
            
            <div class="row text-center border-top border-bottom py-3 my-3 g-0">
              <div class="col-3 border-end">
                <h5 class="fw-bold mb-0">${myRecipes.length}</h5>
                <small class="text-muted" style="font-size: 0.75rem;">Рецептів</small>
              </div>
              <div class="col-3 border-end">
                <h5 class="fw-bold mb-0">${savedRecipes.length}</h5>
                <small class="text-muted" style="font-size: 0.75rem;">Збережено</small>
              </div>
              <div class="col-3 border-end">
                <h5 class="fw-bold mb-0">${subscribers.length}</h5>
                <small class="text-muted" style="font-size: 0.75rem;">Підписники</small>
              </div>
              <div class="col-3">
                <h5 class="fw-bold mb-0">${subscriptions.length}</h5>
                <small class="text-muted" style="font-size: 0.75rem;">Підписок</small>
              </div>
            </div>

            <button class="btn btn-outline-success w-100 mb-2 rounded-pill" id="openEditProfileBtn">Редагувати профіль</button>
            <button class="btn btn-add-recipe w-100 rounded-pill" id="openProfileRecipeModal">Додати новий рецепт</button>
          </div>
        </div>

        <!-- Права колонка з вкладками -->
        <div class="col-lg-8">
          <div class="bg-white rounded-4 shadow-sm p-4">
            <ul class="nav nav-pills mb-4 gap-2" id="profileTabs" role="tablist">
              <li class="nav-item" role="presentation">
                <button class="nav-link active rounded-pill px-4" id="my-recipes-tab" data-bs-toggle="pill" data-bs-target="#myRecipesPane" type="button">Мої рецепти</button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link rounded-pill px-4" id="saved-tab" data-bs-toggle="pill" data-bs-target="#savedPane" type="button">Збережені страви</button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link rounded-pill px-4" id="subs-tab" data-bs-toggle="pill" data-bs-target="#subsPane" type="button">Підписки</button>
              </li>
            </ul>

            <div class="tab-content" id="profileTabContent">
              <!-- Мої рецепти -->
              <div class="tab-pane fade show active" id="myRecipesPane">
                <h5 class="fw-bold mb-3">Мої опубліковані рецепти</h5>
                ${myRecipes.length === 0 ? `
                  <div class="profile-empty-state">
                    <i class="bi bi-journal-x fs-2 text-muted mb-2 d-block"></i>
                    <p class="mb-0">Ви ще не опублікували жодного рецепта.</p>
                  </div>
                ` : `
                  <div class="row g-3">
                    ${myRecipes.map(dish => renderRecipeCardMini(dish, 'owner')).join('')}
                  </div>
                `}
              </div>

              <!-- Збережені страви -->
              <div class="tab-pane fade" id="savedPane">
                <h5 class="fw-bold mb-3">Збережені рецепти</h5>
                ${savedRecipes.length === 0 ? `
                  <div class="profile-empty-state">
                    <i class="bi bi-bookmark-heart fs-2 text-muted mb-2 d-block"></i>
                    <p class="mb-0">У вас немає збережених рецептів.</p>
                  </div>
                ` : `
                  <div class="row g-3">
                    ${savedRecipes.map(dish => renderRecipeCardMini(dish, 'saved')).join('')}
                  </div>
                `}
              </div>

              <!-- Підписки -->
              <div class="tab-pane fade" id="subsPane">
                <h5 class="fw-bold mb-3">Автори, на яких ви підписані</h5>
                ${subscriptions.length === 0 ? `
                  <div class="profile-empty-state">
                    <i class="bi bi-people fs-2 text-muted mb-2 d-block"></i>
                    <p class="mb-0">Ви поки ні на кого не підписалися.</p>
                  </div>
                ` : `
                  <div class="d-flex flex-column gap-2">
                    ${subscriptions.map(author => `
                      <div class="subscription-item d-flex justify-content-between align-items-center p-3 bg-white rounded-4 shadow-sm">
                        <div class="d-flex align-items-center gap-3">
                          <img src="profile.png" class="rounded-circle border border-2 border-success object-fit-cover" width="40" height="40" alt="${author}">
                          <span class="fw-bold text-dark">${author}</span>
                        </div>
                        <button class="btn btn-sm btn-outline-danger rounded-pill px-3" onclick="toggleFollowAuthor('${author}')">Відписатися</button>
                      </div>
                    `).join('')}
                  </div>
                `}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    initProfileEvents();
  }

  function renderRecipeCardMini(dish, type) {
    return `
      <div class="col-md-6">
        <div class="card profile-recipe-card h-100 shadow-sm rounded-4 overflow-hidden bg-white">
          <div class="position-relative">
            <img src="${dish.image || 'Food.png'}" class="card-img-top object-fit-cover" height="150" alt="${dish.title}">
            <span class="position-absolute top-0 end-0 m-2 badge bg-dark bg-opacity-75 rounded-pill px-2 py-1 small">
              ${dish.difficulty || 'Легко'}
            </span>
          </div>
          <div class="card-body p-3 d-flex flex-column justify-content-between">
            <div>
              <h6 class="fw-bold text-dark mb-2 text-truncate">${dish.title}</h6>
              <p class="text-muted small mb-3">
                ${dish.time ? `⏱ ${dish.time} ` : ''}
                ${dish.servings ? `| 🍽 ${dish.servings}` : ''}
              </p>
            </div>
            <div class="d-flex justify-content-between align-items-center pt-2 border-top">
              <a href="recipe-detail.html?id=${dish.id}" class="btn btn-sm btn-outline-success rounded-pill px-3">Переглянути</a>
              
              ${type === 'owner' ? `
                <div class="d-flex gap-1">
                  <button class="btn btn-sm btn-light text-primary border rounded-circle p-1 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;" onclick="openEditRecipeModal(${dish.id})" title="Редагувати"><i class="bi bi-pencil fs-6"></i></button>
                  <button class="btn btn-sm btn-light text-danger border rounded-circle p-1 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;" onclick="deleteMyRecipe(${dish.id})" title="Видалити"><i class="bi bi-trash fs-6"></i></button>
                </div>
              ` : ''}

              ${type === 'saved' ? `
                <button class="btn btn-sm btn-light text-danger border rounded-circle p-1 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;" onclick="removeFromSaved(${dish.id})" title="Видалити зі збереженого"><i class="bi bi-bookmark-x fs-6"></i></button>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function initProfileEvents() {
    const openModalBtn = document.getElementById('openProfileRecipeModal');
    const recipeModal = document.getElementById('recipeModal');
    const closeRecipeModalBtn = document.getElementById('closeRecipeModal');
    const recipeForm = document.getElementById('recipeForm');

    // Логіка кнопок плюс/мінус для кількості порцій у профілі
    const modalServingsInput = document.getElementById('modalServingsCount');
    const modalDecBtn = document.getElementById('modalDecreaseServings');
    const modalIncBtn = document.getElementById('modalIncreaseServings');

    if (modalDecBtn && modalIncBtn && modalServingsInput) {
      if (!modalServingsInput.value) modalServingsInput.value = "1";
      modalDecBtn.onclick = () => {
        let val = parseInt(modalServingsInput.value) || 1;
        if (val > 1) modalServingsInput.value = val - 1;
      };
      modalIncBtn.onclick = () => {
        let val = parseInt(modalServingsInput.value) || 1;
        if (val < 100) modalServingsInput.value = val + 1;
      };
    }

    // Редагування порцій
    const editServingsInput = document.getElementById('editRecipeServings');
    const editDecBtn = document.getElementById('editModalDecreaseServings');
    const editIncBtn = document.getElementById('editModalIncreaseServings');

    if (editDecBtn && editIncBtn && editServingsInput) {
      if (!editServingsInput.value) editServingsInput.value = "1";
      editDecBtn.onclick = () => {
        let val = parseInt(editServingsInput.value) || 1;
        if (val > 1) editServingsInput.value = val - 1;
      };
      editIncBtn.onclick = () => {
        let val = parseInt(editServingsInput.value) || 1;
        if (val < 100) editServingsInput.value = val + 1;
      };
    }

    if (openModalBtn && recipeModal) {
      openModalBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (modalServingsInput && !modalServingsInput.value) modalServingsInput.value = "1";
        recipeModal.classList.add('active');
      });
    }

    if (closeRecipeModalBtn && recipeModal) {
      closeRecipeModalBtn.addEventListener('click', () => {
        recipeModal.classList.remove('active');
      });
    }

    window.addEventListener('click', (e) => {
      if (e.target === recipeModal) recipeModal.classList.remove('active');
    });

    if (recipeForm) {
      recipeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('recipeTitle').value.trim();
        const category = document.getElementById('recipeCategory').value;
        const descInput = document.getElementById('recipeDesc');
        const customDesc = descInput ? descInput.value.trim() : '';
        const ingredientsText = document.getElementById('recipeIngredients').value;
        const stepsText = document.getElementById('recipeSteps').value;
        const time = document.getElementById('recipeTime').value.trim();
        const difficulty = document.getElementById('recipeDifficulty').value;
        
        const servingsNum = modalServingsInput ? (modalServingsInput.value || '1') : '1';
        const servings = `${servingsNum} порцій`;
        
        const photoFile = document.getElementById('recipePhoto').files[0];
        const videoFile = document.getElementById('recipeVideo').files[0];
        const videoUrl = document.getElementById('recipeVideoUrl').value.trim();

        if (!photoFile) {
          alert('Будь ласка, виберіть фото страви!');
          return;
        }

        if (videoFile && videoFile.size > 5 * 1024 * 1024) {
          alert('Завеликий файл, більше 5мб');
          return;
        }

        let dishes = getDishes();

        const createNewDish = (photoData, videoData) => {
          const newDish = {
            id: Date.now(),
            title: title,
            category: category,
            ingredients: ingredientsText.split('\n').filter(i => i.trim() !== ''),
            steps: stepsText.split('\n').filter(s => s.trim() !== ''),
            desc: customDesc,
            image: photoData,
            video: videoData || videoUrl || '',
            time: time,
            servings: servings,
            difficulty: difficulty || 'Легко',
            author: currentUser.username,
            avatar: currentUser.avatar,
            commentsList: []
          };

          dishes.push(newDish);
          saveDishes(dishes);
          recipeModal.classList.remove('active');
          recipeForm.reset();
          if (modalServingsInput) modalServingsInput.value = '1';
          alert('Рецепт успішно створено!');
          renderProfile();
        };

        const readPhoto = new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target.result);
          reader.readAsDataURL(photoFile);
        });

        const readVideo = new Promise((resolve) => {
          if (videoFile) {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target.result);
            reader.readAsDataURL(videoFile);
          } else {
            resolve('');
          }
        });

        Promise.all([readPhoto, readVideo]).then(([photoData, videoData]) => {
          createNewDish(photoData, videoData);
        });
      });
    }

    const editProfileModal = document.getElementById('editProfileModal');
    const openEditBtn = document.getElementById('openEditProfileBtn');
    const closeEditBtn = document.getElementById('closeEditModal');
    const editProfileForm = document.getElementById('editProfileForm');
    const editUsernameInput = document.getElementById('editUsername');
    const editBioInput = document.getElementById('editBio');
    const editAvatarFileInput = document.getElementById('editAvatarFile');

    if (openEditBtn && editProfileModal) {
      openEditBtn.addEventListener('click', () => {
        editUsernameInput.value = currentUser.username;
        editBioInput.value = currentUser.bio || '';
        editProfileModal.classList.add('active');
      });
    }

    if (closeEditBtn && editProfileModal) {
      closeEditBtn.addEventListener('click', () => {
        editProfileModal.classList.remove('active');
      });
    }

    window.addEventListener('click', (e) => {
      if (e.target === editProfileModal) editProfileModal.classList.remove('active');
    });

    if (editProfileForm) {
      editProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newUsername = editUsernameInput.value.trim();
        const newBio = editBioInput.value.trim();
        const avatarFile = editAvatarFileInput.files[0];

        if (!newUsername) {
          alert('Нікнейм не може бути порожнім!');
          return;
        }

        const users = getUsers();
        if (users.some(u => u.username === newUsername && u.email !== currentUser.email)) {
          alert('Користувач із таким нікнеймом вже існує!');
          return;
        }

        const saveChanges = (avatarData) => {
          const oldUsername = currentUser.username;
          currentUser.username = newUsername;
          currentUser.bio = newBio;
          if (avatarData) currentUser.avatar = avatarData;

          const uIdx = users.findIndex(u => u.email === currentUser.email);
          if (uIdx !== -1) {
            users[uIdx] = currentUser;
            saveUsers(users);
          }
          setCurrentUser(currentUser);

          let dishes = getDishes();
          dishes.forEach(d => {
            if (d.author === oldUsername) {
              d.author = newUsername;
              if (avatarData) d.avatar = avatarData;
            }
            if (d.commentsList) {
              d.commentsList.forEach(c => {
                if (c.author === oldUsername) {
                  c.author = newUsername;
                  if (avatarData) c.avatar = avatarData;
                }
              });
            }
          });
          saveDishes(dishes);

          if (oldUsername !== newUsername) {
            users.forEach(u => {
              if (u.subscriptions) {
                const sIdx = u.subscriptions.indexOf(oldUsername);
                if (sIdx !== -1) u.subscriptions[sIdx] = newUsername;
              }
            });
            saveUsers(users);
          }

          editProfileModal.classList.remove('active');
          alert('Профіль успішно оновлено!');
          window.location.reload();
        };

        if (avatarFile) {
          const reader = new FileReader();
          reader.onload = (ev) => saveChanges(ev.target.result);
          reader.readAsDataURL(avatarFile);
        } else {
          saveChanges(null);
        }
      });
    }

    const editRecipeModal = document.getElementById('editRecipeModal');
    const closeEditRecipeModalBtn = document.getElementById('closeEditRecipeModal');
    const editRecipeForm = document.getElementById('editRecipeForm');

    if (closeEditRecipeModalBtn && editRecipeModal) {
      closeEditRecipeModalBtn.addEventListener('click', () => {
        editRecipeModal.classList.remove('active');
      });
    }

    window.addEventListener('click', (e) => {
      if (e.target === editRecipeModal) editRecipeModal.classList.remove('active');
    });

    if (editRecipeForm) {
      editRecipeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = Number(document.getElementById('editRecipeId').value);
        const title = document.getElementById('editRecipeTitle').value.trim();
        const category = document.getElementById('editRecipeCategory').value;
        const ingredientsText = document.getElementById('editRecipeIngredients').value;
        const stepsText = document.getElementById('editRecipeSteps').value;
        const time = document.getElementById('editRecipeTime').value.trim();
        const difficulty = document.getElementById('editRecipeDifficulty').value;
        
        const servingsNum = editServingsInput ? (editServingsInput.value || '1') : '1';
        const servings = `${servingsNum} порцій`;
        
        const photoFile = document.getElementById('editRecipePhoto').files[0];
        const videoFile = document.getElementById('editRecipeVideo').files[0];
        const videoUrl = document.getElementById('editRecipeVideoUrl').value.trim();

        if (videoFile && videoFile.size > 5 * 1024 * 1024) {
          alert('Завеликий файл, більше 5мб');
          return;
        }

        const descInput = document.getElementById('editRecipeDesc');
        const customDesc = descInput ? descInput.value.trim() : '';

        let dishes = getDishes();
        const dishIndex = dishes.findIndex(d => d.id === id);

        if (dishIndex === -1) {
          alert('Рецепт не знайдено!');
          return;
        }

        const updateDishData = (newPhoto, newVideo) => {
          dishes[dishIndex].title = title;
          dishes[dishIndex].category = category;
          dishes[dishIndex].ingredients = ingredientsText.split('\n').filter(i => i.trim() !== '');
          dishes[dishIndex].steps = stepsText.split('\n').filter(s => s.trim() !== '');
          dishes[dishIndex].desc = customDesc;
          dishes[dishIndex].time = time;
          dishes[dishIndex].servings = servings;
          dishes[dishIndex].difficulty = difficulty;
          
          if (newPhoto) {
            dishes[dishIndex].image = newPhoto;
          }

          if (newVideo) {
            dishes[dishIndex].video = newVideo;
          } else if (videoUrl) {
            dishes[dishIndex].video = videoUrl;
          }

          saveDishes(dishes);
          editRecipeModal.classList.remove('active');
          editRecipeForm.reset();
          alert('Рецепт успішно оновлено!');
          renderProfile();
        };

        const readPhoto = new Promise((resolve) => {
          if (photoFile) {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target.result);
            reader.readAsDataURL(photoFile);
          } else {
            resolve(null);
          }
        });

        const readVideo = new Promise((resolve) => {
          if (videoFile) {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target.result);
            reader.readAsDataURL(videoFile);
          } else {
            resolve(null);
          }
        });

        Promise.all([readPhoto, readVideo]).then(([newPhoto, newVideo]) => {
          updateDishData(newPhoto, newVideo);
        });
      });
    }
  }

  window.openEditRecipeModal = function(id) {
    const dishes = getDishes();
    const dish = dishes.find(d => d.id === id);
    if (!dish) return;

    document.getElementById('editRecipeId').value = dish.id;
    document.getElementById('editRecipeTitle').value = dish.title || '';
    document.getElementById('editRecipeCategory').value = dish.category || 'lunch';
    document.getElementById('editRecipeDesc').value = dish.desc || '';
    document.getElementById('editRecipeIngredients').value = Array.isArray(dish.ingredients) ? dish.ingredients.join('\n') : '';
    document.getElementById('editRecipeSteps').value = Array.isArray(dish.steps) ? dish.steps.join('\n') : '';
    document.getElementById('editRecipeTime').value = dish.time || '';
    
    const servingsField = document.getElementById('editRecipeServings');
    if (servingsField) {
      const match = dish.servings ? String(dish.servings).match(/\d+/) : null;
      servingsField.value = match ? match[0] : '1';
    }

    document.getElementById('editRecipeDifficulty').value = dish.difficulty || 'Легко';

    const videoUrlInput = document.getElementById('editRecipeVideoUrl');
    if (videoUrlInput) {
      if (dish.video && !dish.video.startsWith('data:')) {
        videoUrlInput.value = dish.video;
      } else {
        videoUrlInput.value = '';
      }
    }

    const editRecipeModal = document.getElementById('editRecipeModal');
    if (editRecipeModal) {
      editRecipeModal.classList.add('active');
    }
  };

  window.deleteMyRecipe = function(id) {
    if (!confirm('Ви дійсно хочете видалити цей рецепт?')) return;

    let dishes = getDishes();
    dishes = dishes.filter(d => d.id !== id);
    saveDishes(dishes);

    let users = getUsers();
    users.forEach(u => {
      if (u.savedRecipes) {
        u.savedRecipes = u.savedRecipes.filter(savedId => savedId !== id);
      }
    });
    saveUsers(users);

    alert('Рецепт успішно видалено!');
    renderProfile();
  };

  window.removeFromSaved = function(id) {
    if (!currentUser.savedRecipes) return;

    currentUser.savedRecipes = currentUser.savedRecipes.filter(savedId => savedId !== id);

    let users = getUsers();
    const uIdx = users.findIndex(u => u.email === currentUser.email);
    if (uIdx !== -1) {
      users[uIdx] = currentUser;
      saveUsers(users);
    }

    setCurrentUser(currentUser);
    renderProfile();
  };

  renderProfile();
});