// Початкові дані страв
const initialDishes = [
  {
    id: 1,
    title: 'Класична італійська паста Карбонара',
    category: 'lunch',
    author: 'Катерина',
    avatar: 'profile.png',
    image: 'karbonara.jpg',
    video: '',
    desc: 'Густий, шовковистий соус створюється без жодних вершків — лише за рахунок жовтків, витриманого сиру та гарячої води від пасти.',
    time: '20 хв',
    timeMinutes: 20,
    servings: '2 порції',
    difficulty: 'Легко',
    likes: 128,
    likedBy: [],
    comments: 1,
    ingredients: [
      'Паста (спагеті або букатіні) — 200 г',
      'Панчета або бекон — 100 г',
      'Жовтки — 3 шт.',
      'Сир Пармезан — 50 г',
      'Чорний перець та сіль — за смаком'
    ],
    steps: [
      'Зваріть пасту у підсоленій воді.',
      'Обсмажте бекон до золотистої скоринки.',
      'Збийте жовтки з натертим сиром та перцем.',
      'Змішайте пасту з беконом, зніміть з вогню і влийте яєчну суміш.'
    ],
    commentsList: [
      { author: 'Олена', time: '2 години тому', avatar: 'profile.png', text: 'Готувала за цим рецептом — соус вийшов ідеально шовковистим!', likes: 0, isLiked: false }
    ]
  },
  {
    id: 2,
    title: 'Домашня піца Маргарита',
    category: 'lunch',
    author: 'Олексій',
    avatar: 'people.png',
    image: 'pizza.png',
    video: '',
    desc: 'Традиційне пухке тісто, соковитий томатний соус, свіжа моцарела та ароматичні листочки базиліку.',
    time: '35 хв',
    timeMinutes: 35,
    servings: '4 порції',
    difficulty: 'Середньо',
    likes: 42,
    likedBy: [],
    comments: 1,
    ingredients: [
      'Тісто для піци — 300 г',
      'Томатний соус — 100 г',
      'Сир Моцарела — 150 г',
      'Свіжий базилік — кілька листочків'
    ],
    steps: [
      'Розкачайте тісто у круглу форму.',
      'Змастіть томатним соусом та викладіть моцарелу.',
      'Випікайте при 220°C протягом 12–15 хвилин.'
    ],
    commentsList: [
      { author: 'Андрій', time: '3 години тому', avatar: 'profile.png', text: 'Піца вийшла чудова, дякую!', likes: 0, isLiked: false }
    ]
  }
];

// Ініціалізація баз даних у localStorage
function initDB() {
  if (!localStorage.getItem('tarilka_dishes')) {
    localStorage.setItem('tarilka_dishes', JSON.stringify(initialDishes));
  }
  if (!localStorage.getItem('tarilka_users')) {
    localStorage.setItem('tarilka_users', JSON.stringify([]));
  }
}

// Отримати всі рецепти
function getDishes() {
  initDB();
  return JSON.parse(localStorage.getItem('tarilka_dishes')) || [];
}

// Зберегти список рецептів
function saveDishes(dishes) {
  localStorage.setItem('tarilka_dishes', JSON.stringify(dishes));
}

// Отримати один рецепт за ID
function getDishById(id) {
  const dishes = getDishes();
  return dishes.find(d => d.id === Number(id));
}

// Додати новий рецепт та відправити сповіщення підписникам
function addDish(newDish) {
  const dishes = getDishes();
  const currentUser = getCurrentUser();
  const authorName = currentUser ? currentUser.username : (newDish.author || 'Гість');

  const dishToAdd = {
    id: Date.now(),
    likes: 0,
    likedBy: [],
    comments: 0,
    commentsList: [],
    avatar: currentUser?.avatar || 'profile.png',
    author: authorName,
    ...newDish
  };

  dishes.unshift(dishToAdd);
  saveDishes(dishes);

  // Надсилання сповіщень усім підписникам автора
  if (currentUser) {
    sendNotificationToSubscribers(currentUser.username, dishToAdd.title, dishToAdd.id);
  }

  return dishToAdd;
}

// === УПРАВЛІННЯ КОРИСТУВАЧАМИ ТА СЕСІЄЮ ===

function getUsers() {
  initDB();
  return JSON.parse(localStorage.getItem('tarilka_users')) || [];
}

function saveUsers(users) {
  localStorage.setItem('tarilka_users', JSON.stringify(users));
}

function getCurrentUser() {
  const session = localStorage.getItem('tarilka_current_user');
  return session ? JSON.parse(session) : null;
}

function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('tarilka_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('tarilka_current_user');
  }
}

// Додати сповіщення підписникам
function sendNotificationToSubscribers(authorUsername, recipeTitle, recipeId) {
  const users = getUsers();
  let updated = false;

  users.forEach(u => {
    if (u.subscriptions && u.subscriptions.includes(authorUsername)) {
      if (!u.notifications) u.notifications = [];
      u.notifications.unshift({
        id: Date.now() + Math.random(),
        text: `Автор ${authorUsername} опублікував новий рецепт: "${recipeTitle}"`,
        recipeId: recipeId,
        read: false,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      updated = true;
    }
  });

  if (updated) {
    saveUsers(users);
    // Оновити по поточній сесії, якщо ми підписані на самого себе (або оновити поточну сесію)
    const current = getCurrentUser();
    if (current) {
      const refreshedCurrent = users.find(u => u.email === current.email);
      if (refreshedCurrent) setCurrentUser(refreshedCurrent);
    }
  }
}