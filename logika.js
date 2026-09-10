document.addEventListener('DOMContentLoaded', () => {
  // Елементи модальних вікон
  const authModal = document.getElementById('authModal');
  const closeAuthModalBtn = document.getElementById('closeModal');
  const modalTitle = document.getElementById('modalTitle');
  const submitBtn = document.getElementById('submitBtn');
  const forgotPasswordSpan = document.getElementById('forgotPasswordSpan');
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const authForm = document.getElementById('authForm');
  
  const usernameGroup = document.getElementById('usernameGroup');
  const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
  const usernameInput = document.getElementById('username');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');

  const recipeModal = document.getElementById('recipeModal');
  const closeRecipeModalBtn = document.getElementById('closeRecipeModal');
  const recipeForm = document.getElementById('recipeForm');

  const addRecipeBtns = document.querySelectorAll('.btn-add-recipe');
  const navAuthContainer = document.getElementById('navAuthContainer');
  const communityNavBtn = document.getElementById('communityNavBtn');

  let isRegisterMode = false;

  // Оновлення блоку авторизації в хедері
  function updateNavAuthUI() {
    const user = getCurrentUser();
    if (!navAuthContainer) return;

    if (user) {
      const unreadCount = (user.notifications || []).filter(n => !n.read).length;
      
      navAuthContainer.innerHTML = `
        <div class="dropdown d-inline-block me-2">
          <button class="btn btn-outline-secondary position-relative rounded-circle p-2" type="button" id="notifDropdown" data-bs-toggle="dropdown">
            <i class="bi bi-bell"></i>
            ${unreadCount > 0 ? `<span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">${unreadCount}</span>` : ''}
          </button>
          <ul class="dropdown-menu dropdown-menu-end p-2 shadow" style="width: 280px; max-height: 300px; overflow-y: auto;">
            <li><h6 class="dropdown-header">Сповіщення</h6></li>
            ${(user.notifications && user.notifications.length > 0) 
              ? user.notifications.map(n => `
                <li class="mb-1 p-2 bg-light rounded small">
                  <a class="text-decoration-none text-dark d-block" href="recipe-detail.html?id=${n.recipeId}">
                    ${n.text} <br><small class="text-muted">${n.date}</small>
                  </a>
                </li>
              `).join('')
              : '<li class="text-muted small p-2">Сповіщень немає</li>'}
          </ul>
        </div>
        <span class="fw-bold me-2"><i class="bi bi-person-circle"></i> ${user.username}</span>
        <button class="btn btn-sm btn-outline-danger rounded-pill" id="logoutBtn">Вийти</button>
      `;

      document.getElementById('logoutBtn')?.addEventListener('click', () => {
        setCurrentUser(null);
        alert('Ви вийшли з акаунту');
        window.location.reload();
      });
    } else {
      navAuthContainer.innerHTML = `
        <button class="btn btn-auth-login" type="button">Вхід</button>
        <button class="btn btn-auth-register" type="button">Реєстрація</button>
      `;

      navAuthContainer.querySelector('.btn-auth-login')?.addEventListener('click', openLoginModal);
      navAuthContainer.querySelector('.btn-auth-register')?.addEventListener('click', openRegisterModal);
    }
  }

  const openLoginModal = () => {
    if (!authModal) return;
    isRegisterMode = false;
    modalTitle.textContent = 'Вхід';
    submitBtn.value = 'Увійти';
    if (forgotPasswordSpan) forgotPasswordSpan.style.display = 'block';
    
    usernameGroup.style.display = 'none';
    confirmPasswordGroup.style.display = 'none';
    usernameInput.removeAttribute('required');
    confirmPasswordInput.removeAttribute('required');

    authModal.classList.add('active');
  };

  const openRegisterModal = () => {
    if (!authModal) return;
    isRegisterMode = true;
    modalTitle.textContent = 'Реєстрація';
    submitBtn.value = 'Зареєструватися';
    if (forgotPasswordSpan) forgotPasswordSpan.style.display = 'none';
    
    usernameGroup.style.display = 'block';
    confirmPasswordGroup.style.display = 'block';
    usernameInput.setAttribute('required', '');
    confirmPasswordInput.setAttribute('required', '');

    authModal.classList.add('active');
  };

  const closeAuthModal = () => {
    if (authModal) authModal.classList.remove('active');
  };

  const openRecipeModal = () => {
    if (recipeModal) recipeModal.classList.add('active');
  };

  const closeRecipeModal = () => {
    if (recipeModal) recipeModal.classList.remove('active');
  };

  // Події кнопок створення рецепта
  addRecipeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const user = getCurrentUser();
      if (user) {
        openRecipeModal();
      } else {
        alert('Щоб опублікувати рецепт, будь ласка, увійдіть або зареєструйтесь!');
        openRegisterModal();
      }
    });
  });

  // Кнопка "Спільнота"
  if (communityNavBtn) {
    communityNavBtn.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Розділ "Спільнота" у розробці. Незабаром тут з’явиться загальний чат авторів!');
    });
  }

  // Кнопка "Забули пароль?"
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      const mail = prompt('Введіть ваш Email для відновлення пароля:');
      if (mail) {
        alert('Інструкцію з відновлення пароля надіслано на вказану пошту (імуляція).');
      }
    });
  }

  // Форма Авторизації
  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const users = getUsers();

      if (isRegisterMode) {
        const username = usernameInput.value.trim();
        const confirmPassword = confirmPasswordInput.value;

        if (password !== confirmPassword) {
          alert('Паролі не збігаються!');
          return;
        }

        if (users.some(u => u.email === email)) {
          alert('Користувач із таким Email вже існує!');
          return;
        }

        const newUser = {
          username: username,
          email: email,
          password: password,
          avatar: 'profile.png',
          savedRecipes: [],
          subscriptions: [],
          notifications: []
        };

        users.push(newUser);
        saveUsers(users);
        setCurrentUser(newUser);

        alert(`Вітаємо, ${username}! Ваш акаунт успішно створено.`);
      } else {
        const foundUser = users.find(u => u.email === email && u.password === password);
        if (!foundUser) {
          alert('Невірний Email або пароль!');
          return;
        }

        setCurrentUser(foundUser);
        alert(`З поверненням, ${foundUser.username}!`);
      }

      closeAuthModal();
      updateNavAuthUI();
      window.location.reload();
    });
  }

  // Форма додавання рецепта
  if (recipeForm) {
    recipeForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const user = getCurrentUser();
      if (!user) {
        alert('Ви повинні бути авторизовані!');
        return;
      }

      const title = document.getElementById('recipeTitle').value;
      const category = document.getElementById('recipeCategory')?.value || 'lunch';
      const ingredients = document.getElementById('recipeIngredients').value;
      const steps = document.getElementById('recipeSteps').value;
      const photoInput = document.getElementById('recipePhoto');
      const videoInput = document.getElementById('recipeVideo');
      const videoUrlInput = document.getElementById('recipeVideoUrl');

      const photoFile = photoInput.files[0];
      const videoFile = videoInput ? videoInput.files[0] : null;
      const videoUrl = videoUrlInput ? videoUrlInput.value.trim() : '';

      const handleSave = (photoData, videoData) => {
        const newDish = {
          title: title,
          category: category,
          desc: steps.slice(0, 100) + '...',
          ingredients: ingredients.split('\n').filter(i => i.trim() !== ''),
          steps: steps.split('\n').filter(s => s.trim() !== ''),
          image: photoData || '',
          video: videoData || videoUrl || '',
          time: '30 хв',
          timeMinutes: 30,
          servings: '2 порції',
          difficulty: 'Легко',
          author: user.username,
          avatar: user.avatar || 'profile.png'
        };

        addDish(newDish);
        recipeForm.reset();
        closeRecipeModal();
        alert('Рецепт успішно створено!');
        window.location.href = 'catalog.html';
      };

      const readPhoto = new Promise((resolve) => {
        if (photoFile) {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target.result);
          reader.readAsDataURL(photoFile);
        } else {
          resolve('');
        }
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
        handleSave(photoData, videoData);
      });
    });
  }

  if (closeAuthModalBtn) closeAuthModalBtn.addEventListener('click', closeAuthModal);
  if (closeRecipeModalBtn) closeRecipeModalBtn.addEventListener('click', closeRecipeModal);

  window.addEventListener('click', (e) => {
    if (e.target === authModal) closeAuthModal();
    if (e.target === recipeModal) closeRecipeModal();
  });

  updateNavAuthUI();
});

// Глобальні функції підписки, збереження, лайків
window.toggleFollowAuthor = function(authorName) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert('Будь ласка, увійдіть, щоб підписуватися на авторів!');
    return;
  }

  if (currentUser.username === authorName) {
    alert('Ви не можете підписатися на самого себе!');
    return;
  }

  if (!currentUser.subscriptions) currentUser.subscriptions = [];

  const index = currentUser.subscriptions.indexOf(authorName);
  if (index > -1) {
    currentUser.subscriptions.splice(index, 1);
    alert(`Ви відписалися від автора ${authorName}`);
  } else {
    currentUser.subscriptions.push(authorName);
    alert(`Ви підписалися на автора ${authorName}! Тепер ви отримуватимете сповіщення про його нові рецепти.`);
  }

  const users = getUsers();
  const uIdx = users.findIndex(u => u.email === currentUser.email);
  if (uIdx !== -1) {
    users[uIdx] = currentUser;
    saveUsers(users);
  }
  setCurrentUser(currentUser);
  window.location.reload();
};

window.toggleSaveRecipe = function(recipeId) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert('Будь ласка, увійдіть у профіль, щоб зберігати рецепти!');
    return;
  }

  if (!currentUser.savedRecipes) currentUser.savedRecipes = [];

  const index = currentUser.savedRecipes.indexOf(recipeId);
  if (index > -1) {
    currentUser.savedRecipes.splice(index, 1);
    alert('Рецепт видалено зі збережених');
  } else {
    currentUser.savedRecipes.push(recipeId);
    alert('Рецепт збережено у ваш профіль!');
  }

  const users = getUsers();
  const uIdx = users.findIndex(u => u.email === currentUser.email);
  if (uIdx !== -1) {
    users[uIdx] = currentUser;
    saveUsers(users);
  }
  setCurrentUser(currentUser);
  window.location.reload();
};

window.toggleLikeRecipe = function(recipeId) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert('Будь ласка, увійдіть, щоб ставити вподобайки!');
    return;
  }

  const dishes = getDishes();
  const dish = dishes.find(d => d.id === recipeId);
  if (!dish) return;

  if (!dish.likedBy) dish.likedBy = [];

  const userIndex = dish.likedBy.indexOf(currentUser.email);
  if (userIndex > -1) {
    dish.likedBy.splice(userIndex, 1);
    dish.likes = Math.max(0, dish.likes - 1);
  } else {
    dish.likedBy.push(currentUser.email);
    dish.likes = (dish.likes || 0) + 1;
  }

  saveDishes(dishes);
  window.location.reload();
};