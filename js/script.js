// script.js - Sistema de Biblioteca Cervantes

// Datos simulados de la biblioteca
const libraryData = {
  currentUser: null,
  users: [
    { id: 1, email: "usuario@ejemplo.com", password: "123456", name: "Juan Pérez" }
  ],
  books: [
    { id: 1, title: "Cien años de soledad", author: "Gabriel García Márquez", year: 1967, genre: "Realismo mágico", available: true },
    { id: 2, title: "Don Quijote de la Mancha", author: "Miguel de Cervantes", year: 1605, genre: "Novela clásica", available: false, dueDate: "2025-08-15" },
    { id: 3, title: "La sombra del viento", author: "Carlos Ruiz Zafón", year: 2001, genre: "Misterio", available: true }
  ],
  borrowings: [
    { id: 1, userId: 1, bookId: 2, borrowDate: "2025-08-01", dueDate: "2025-08-15", returned: false }
  ]
};

// Funciones de navegación
function goTo(page) {
  window.location.href = page;
}

// Función de login mejorada
function login() {
  const email = document.querySelector('input[type="text"]').value;
  const password = document.querySelector('input[type="password"]').value;
  
  const user = libraryData.users.find(u => u.email === email && u.password === password);
  
  if (user) {
    libraryData.currentUser = user;
    localStorage.setItem('libraryCurrentUser', JSON.stringify(user));
    showNotification(`Bienvenido, ${user.name}`, 'success');
    setTimeout(() => goTo("dashboard.html"), 1500);
  } else {
    showNotification('Credenciales incorrectas', 'error');
  }
}

// Función de registro mejorada
function register() {
  const name = document.querySelector('input[placeholder="Nombre completo"]').value;
  const email = document.querySelector('input[placeholder="Correo electrónico"]').value;
  const password = document.querySelector('input[placeholder="Contraseña"]').value;
  
  if (!name || !email || !password) {
    showNotification('Por favor complete todos los campos', 'error');
    return;
  }
  
  if (libraryData.users.some(u => u.email === email)) {
    showNotification('Este correo ya está registrado', 'error');
    return;
  }
  
  const newUser = {
    id: libraryData.users.length + 1,
    name,
    email,
    password
  };
  
  libraryData.users.push(newUser);
  showNotification('Registro exitoso. Ahora puede iniciar sesión', 'success');
  setTimeout(() => goTo("index.html"), 1500);
}

// Función para cerrar sesión
function logout() {
  localStorage.removeItem('libraryCurrentUser');
  libraryData.currentUser = null;
  goTo("index.html");
}

// Función para cargar libros en el dashboard
function loadRecommendedBooks() {
  const booksContainer = document.querySelector('.library-books');
  if (!booksContainer) return;
  
  const availableBooks = libraryData.books.filter(book => book.available);
  const recommendedBooks = availableBooks.slice(0, 3);
  
  booksContainer.innerHTML = recommendedBooks.map(book => `
    <div class="library-book">
      <div class="library-book-cover" style="background-color: ${getRandomBookColor()}">
        <i class="fas fa-book"></i>
      </div>
      <h4>${book.title}</h4>
      <p>${book.author}</p>
    </div>
  `).join('');
}

// Función para cargar préstamos activos
function loadActiveBorrowings() {
  if (!libraryData.currentUser) return;
  
  const userBorrowings = libraryData.borrowings.filter(
    b => b.userId === libraryData.currentUser.id && !b.returned
  );
  
  // Actualizar la interfaz según los préstamos
}

// Función para renovar préstamo
function renewBorrowing(borrowingId) {
  const borrowing = libraryData.borrowings.find(b => b.id === borrowingId);
  if (!borrowing) return;
  
  const newDueDate = new Date(borrowing.dueDate);
  newDueDate.setDate(newDueDate.getDate() + 14); // Extender 2 semanas
  
  borrowing.dueDate = newDueDate.toISOString().split('T')[0];
  showNotification('Préstamo renovado con éxito', 'success');
  loadActiveBorrowings();
}

// Función para reservar libro
function reserveBook(bookId) {
  if (!libraryData.currentUser) {
    showNotification('Debe iniciar sesión para reservar', 'error');
    return;
  }
  
  const book = libraryData.books.find(b => b.id === bookId);
  if (!book) return;
  
  if (!book.available) {
    showNotification('Este libro no está disponible', 'error');
    return;
  }
  
  const newBorrowing = {
    id: libraryData.borrowings.length + 1,
    userId: libraryData.currentUser.id,
    bookId: book.id,
    borrowDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    returned: false
  };
  
  book.available = false;
  libraryData.borrowings.push(newBorrowing);
  showNotification('Libro reservado con éxito', 'success');
  
  // Actualizar la interfaz
  if (window.location.pathname.includes('books.html')) {
    loadBooks();
  }
}

// Mostrar notificación estilizada
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `library-notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }, 100);
}

// Función auxiliar para colores de libros
function getRandomBookColor() {
  const colors = ['#8B4513', '#5d3a1a', '#A0522D', '#654321', '#6e3b12'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Verificar autenticación al cargar páginas protegidas
function checkAuth() {
  const protectedPages = ['dashboard.html', 'books.html', 'borrowings.html'];
  const currentPage = window.location.pathname.split('/').pop();
  
  if (!protectedPages.includes(currentPage)) return;
  
  const storedUser = localStorage.getItem('libraryCurrentUser');
  if (storedUser) {
    libraryData.currentUser = JSON.parse(storedUser);
  } else {
    goTo('index.html');
  }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  
  // Cargar datos según la página
  if (window.location.pathname.includes('dashboard.html')) {
    loadRecommendedBooks();
  } else if (window.location.pathname.includes('books.html')) {
    loadBooks();
  } else if (window.location.pathname.includes('borrowings.html')) {
    loadActiveBorrowings();
  }
  
  // Asignar eventos dinámicos
  document.querySelectorAll('.library-btn[onclick="login()"]').forEach(btn => {
    btn.addEventListener('click', login);
  });
  
  document.querySelectorAll('.library-btn[onclick="register()"]').forEach(btn => {
    btn.addEventListener('click', register);
  });
  
  document.querySelectorAll('.library-logout').forEach(btn => {
    btn.addEventListener('click', logout);
  });
});

// Funciones específicas para profile.html
function loadProfileData() {
  if (!libraryData.currentUser) return;
  
  // Cargar datos del usuario
  document.getElementById('profile-name').textContent = libraryData.currentUser.name;
  document.getElementById('profile-email').textContent = libraryData.currentUser.email;
  document.getElementById('name').value = libraryData.currentUser.name;
  document.getElementById('email').value = libraryData.currentUser.email;
  
  // Cargar estadísticas (simuladas)
  document.getElementById('books-read').textContent = '12';
  document.getElementById('reading-days').textContent = '84';
  document.getElementById('favorite-pages').textContent = '327';
  document.getElementById('user-ranking').textContent = '#8';
  
  // Configurar formulario
  document.getElementById('profile-form').addEventListener('submit', saveProfileChanges);
  document.getElementById('cancel-changes').addEventListener('click', resetProfileForm);
}

function saveProfileChanges(e) {
  e.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const currentPassword = document.getElementById('current-password').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  
  // Validaciones básicas
  if (!name || !email) {
    showNotification('Nombre y correo son obligatorios', 'error');
    return;
  }
  
  if (newPassword && newPassword !== confirmPassword) {
    showNotification('Las contraseñas no coinciden', 'error');
    return;
  }
  
  if (newPassword && !currentPassword) {
    showNotification('Debe ingresar su contraseña actual', 'error');
    return;
  }
  
  // Actualizar datos del usuario
  libraryData.currentUser.name = name;
  libraryData.currentUser.email = email;
  
  if (newPassword && currentPassword === libraryData.currentUser.password) {
    libraryData.currentUser.password = newPassword;
  } else if (newPassword) {
    showNotification('Contraseña actual incorrecta', 'error');
    return;
  }
  
  // Actualizar localStorage
  localStorage.setItem('libraryCurrentUser', JSON.stringify(libraryData.currentUser));
  
  // Actualizar la visualización
  document.getElementById('profile-name').textContent = name;
  document.getElementById('profile-email').textContent = email;
  
  // Limpiar campos de contraseña
  document.getElementById('current-password').value = '';
  document.getElementById('new-password').value = '';
  document.getElementById('confirm-password').value = '';
  
  showNotification('Perfil actualizado con éxito', 'success');
}

function resetProfileForm() {
  document.getElementById('name').value = libraryData.currentUser.name;
  document.getElementById('email').value = libraryData.currentUser.email;
  document.getElementById('current-password').value = '';
  document.getElementById('new-password').value = '';
  document.getElementById('confirm-password').value = '';
}

// En la inicialización, añadir esta comprobación
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  
  if (window.location.pathname.includes('profile.html')) {
    loadProfileData();
  }
  
  // ... resto del código de inicialización
});