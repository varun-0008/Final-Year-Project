// API helper module for Librarian Admin Site (Vanilla JavaScript)

const API = (() => {
  const BASE_URL = window.location.origin;

  function getToken() {
    return localStorage.getItem('library_admin_token');
  }

  function getUser() {
    const raw = localStorage.getItem('library_admin_user');
    return raw ? JSON.parse(raw) : null;
  }

  function setSession(token, user) {
    localStorage.setItem('library_admin_token', token);
    localStorage.setItem('library_admin_user', JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem('library_admin_token');
    localStorage.removeItem('library_admin_user');
  }

  function isLoggedIn() {
    return !!getToken();
  }

  function logout() {
    clearSession();
    window.location.href = 'login.html';
  }

  async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
      ...(options.headers || {}),
    };

    // Only set Content-Type to JSON if not sending FormData
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          if (response.status === 401 && !endpoint.includes('/login')) {
            clearSession();
            window.location.href = 'login.html';
          }
        }
        throw new Error(data.error || `HTTP error ${response.status}`);
      }

      return data;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  }

  function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  return {
    getToken,
    getUser,
    isLoggedIn,
    logout,
    showToast,
    BASE_URL,

    // Auth
    login: async (identifier, password) => {
      const res = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });
      setSession(res.token, res.user);
      return res;
    },

    getStudents: () => request('/api/auth/students'),

    uploadStudentsExcel: (file) => {
      const formData = new FormData();
      formData.append('file', file);
      return request('/api/auth/students/upload', {
        method: 'POST',
        body: formData,
      });
    },

    getTemplateUrl: () => `${BASE_URL}/api/auth/students/template`,

    // Books
    getBooks: (search = '', genre = '', availableOnly = false) => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (genre) params.append('genre', genre);
      if (availableOnly) params.append('availableOnly', 'true');
      return request(`/api/books?${params.toString()}`);
    },

    getBook: (id) => request(`/api/books/${id}`),

    createBook: (bookData) => request('/api/books', {
      method: 'POST',
      body: JSON.stringify(bookData),
    }),

    updateBook: (id, bookData) => request(`/api/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookData),
    }),

    deleteBook: (id) => request(`/api/books/${id}`, {
      method: 'DELETE',
    }),

    // Open Library Integration (Internet Archive)
    searchOpenLibrary: (query, limit = 12) => {
      const params = new URLSearchParams({ q: query, limit });
      return request(`/api/books/openlibrary/search?${params.toString()}`);
    },

    lookupOpenLibraryISBN: (isbn) => {
      return request(`/api/books/openlibrary/lookup/${encodeURIComponent(isbn)}`);
    },

    importOpenLibraryBook: (bookData) => request('/api/books/openlibrary/import', {
      method: 'POST',
      body: JSON.stringify(bookData),
    }),

    // Borrow records (Admin only!)
    issueBook: (payload) => request('/api/borrow/issue', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

    returnBook: (borrowId) => request('/api/borrow/return', {
      method: 'POST',
      body: JSON.stringify({ borrow_id: borrowId }),
    }),

    getAllBorrows: (status = '', search = '') => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (search) params.append('search', search);
      return request(`/api/borrow/all?${params.toString()}`);
    },

    getStats: () => request('/api/borrow/stats'),
  };
})();
