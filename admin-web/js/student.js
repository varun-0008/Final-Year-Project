// Smart Campus Library — Student Web Portal Client

const StudentPortal = (() => {
  let currentUser = null;
  let cachedBooks = [];
  let activeTab = 'catalog';
  let activeGenre = '';

  function getStudentToken() {
    return localStorage.getItem('library_student_token');
  }

  function setStudentSession(token, user) {
    localStorage.setItem('library_student_token', token);
    localStorage.setItem('library_student_user', JSON.stringify(user));
    currentUser = user;
  }

  function clearStudentSession() {
    localStorage.removeItem('library_student_token');
    localStorage.removeItem('library_student_user');
    currentUser = null;
  }

  async function studentRequest(endpoint, options = {}) {
    const url = endpoint;
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const token = getStudentToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401 && !endpoint.includes('/login')) {
        clearStudentSession();
        showAuthOverlay();
      }
      throw new Error(data.error || `HTTP error ${res.status}`);
    }
    return data;
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

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatDate(dStr) {
    if (!dStr) return '-';
    return new Date(dStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function showAuthOverlay() {
    const overlay = document.getElementById('student-auth-overlay');
    if (overlay) overlay.style.display = 'flex';
  }

  function hideAuthOverlay() {
    const overlay = document.getElementById('student-auth-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  function setAuthMode(mode) {
    const loginForm = document.getElementById('student-login-form');
    const regForm = document.getElementById('student-register-form');
    const loginBtn = document.getElementById('tab-login-btn');
    const regBtn = document.getElementById('tab-register-btn');

    if (mode === 'login') {
      loginForm.style.display = 'block';
      regForm.style.display = 'none';
      loginBtn.className = 'btn btn-sm btn-primary';
      regBtn.className = 'btn btn-sm btn-secondary';
    } else {
      loginForm.style.display = 'none';
      regForm.style.display = 'block';
      loginBtn.className = 'btn btn-sm btn-secondary';
      regBtn.className = 'btn btn-sm btn-primary';
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    const identifier = document.getElementById('stu-login-identifier').value.trim();
    const password = document.getElementById('stu-login-password').value;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      setStudentSession(data.token, data.user);
      hideAuthOverlay();
      showToast(`Welcome back, ${data.user.name}!`, 'success');
      updateNavProfile();
      loadCatalog();
      loadNotifications();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    const payload = {
      name: document.getElementById('reg-name').value.trim(),
      student_id: document.getElementById('reg-roll').value.trim(),
      email: document.getElementById('reg-email').value.trim(),
      department: document.getElementById('reg-dept').value.trim(),
      semester: document.getElementById('reg-sem').value.trim(),
      password: document.getElementById('reg-pass').value,
    };

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      setStudentSession(data.token, data.user);
      hideAuthOverlay();
      showToast('Registration successful! Digital ID Card activated.', 'success');
      updateNavProfile();
      switchTab('card');
      loadNotifications();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function openForgotPassword() {
    const ident = prompt('Enter your College Registration Number or Email:');
    if (!ident) return;

    try {
      const res = await studentRequest('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ identifier: ident }),
      });
      alert(`Verification code generated: ${res.reset_token}\n\n(In production, this code is sent to your college email.)`);

      const pin = prompt('Enter the 6-digit verification code you received:');
      if (!pin) return;

      const newPass = prompt('Enter your new password (at least 6 characters):');
      if (!newPass) return;

      const resetRes = await studentRequest('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token: pin, new_password: newPass }),
      });
      alert(resetRes.message);
      showToast('Password reset! You can now log in.', 'success');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  function updateNavProfile() {
    const tag = document.getElementById('nav-student-tag');
    if (tag && currentUser) {
      tag.innerText = `${currentUser.name} (${currentUser.student_id || ''}) • ${currentUser.department || 'GIOE'}`;
    }
  }

  // Tab switching
  function switchTab(tab) {
    activeTab = tab;
    document.querySelectorAll('.student-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
    });

    document.getElementById('stu-tab-catalog').style.display = tab === 'catalog' ? 'block' : 'none';
    document.getElementById('stu-tab-card').style.display = tab === 'card' ? 'block' : 'none';
    document.getElementById('stu-tab-myaccount').style.display = tab === 'myaccount' ? 'block' : 'none';
    document.getElementById('stu-tab-announcements').style.display = tab === 'announcements' ? 'block' : 'none';

    if (tab === 'catalog') loadCatalog();
    else if (tab === 'card') loadDigitalCard();
    else if (tab === 'myaccount') loadMyAccount();
    else if (tab === 'announcements') loadAnnouncements();
  }

  // ==================== BOOK CATALOG & EXACT SHELF LOCATOR ====================
  async function loadCatalog() {
    const search = document.getElementById('stu-catalog-search')?.value || '';
    const availOnly = document.getElementById('stu-avail-filter')?.checked || false;
    const container = document.getElementById('stu-books-container');

    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (activeGenre) params.append('genre', activeGenre);
      if (availOnly) params.append('availableOnly', 'true');

      const data = await studentRequest(`/api/books?${params.toString()}`);
      cachedBooks = data.books || [];
      renderCatalog(cachedBooks);
    } catch (err) {
      container.innerHTML = `<div style="grid-column: 1 / -1; padding: 30px; text-align: center; color: var(--danger);">Failed to load books: ${escapeHtml(err.message)}</div>`;
    }
  }

  function renderCatalog(books) {
    const container = document.getElementById('stu-books-container');
    if (!books || books.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--gray-600); background: white; border-radius: 12px; border: 1px solid #e2e8f0;">
          <div style="font-size: 36px; margin-bottom: 10px;">📖</div>
          <h3>No books found matching your query</h3>
          <p style="font-size: 13px;">Try searching for another keyword or clearing category filters.</p>
        </div>`;
      return;
    }

    container.innerHTML = books.map(b => {
      const isAvailable = b.available_copies > 0;
      const copiesBadge = isAvailable
        ? `<span class="badge badge-success">${b.available_copies} of ${b.total_copies} Copies Available</span>`
        : `<span class="badge badge-danger">Out of Stock (${b.waiting_count || 0} Waiting)</span>`;

      const coverImg = b.cover_url
        ? `<img src="${escapeHtml(b.cover_url)}" alt="cover">`
        : `<div style="font-size: 44px; color: #cbd5e1;">📚</div>`;

      return `
        <div class="student-book-card">
          <div class="book-cover-area">
            ${coverImg}
          </div>
          <div style="padding: 16px; display: flex; flex-direction: column; flex: 1;">
            <div style="margin-bottom: 6px;">
              <span class="badge badge-neutral">${escapeHtml(b.genre)}</span>
            </div>
            <h3 style="font-size: 15px; margin: 0 0 4px; color: #0f172a; line-height: 1.3;">${escapeHtml(b.title)}</h3>
            <p style="margin: 0 0 10px; font-size: 12px; color: #64748b;">By ${escapeHtml(b.author)} ${b.published_year ? `(${b.published_year})` : ''}</p>
            
            <div style="margin-bottom: 8px;">${copiesBadge}</div>

            <!-- Exact Physical Shelf Locator Banner -->
            <div class="shelf-locator-banner">
              <div class="shelf-locator-title">
                <span>📍</span> Exact Physical Shelf Location
              </div>
              <div class="shelf-locator-coords">
                <span class="coord-tag">Block ${escapeHtml(b.block || 'A')}</span>
                <span class="coord-tag">Floor ${b.floor || 2}</span>
                <span class="coord-tag">${escapeHtml(b.rack || 'Rack 08')}</span>
                <span class="coord-tag">${escapeHtml(b.shelf || 'Shelf 03')}</span>
              </div>
            </div>

            <p style="font-size: 12px; color: #475569; margin: 0 0 14px; line-height: 1.4; flex: 1;">
              ${escapeHtml(b.description || 'Comprehensive reference volume available in central stacks.')}
            </p>

            <div style="margin-top: auto; display: flex; gap: 8px;">
              ${isAvailable ? `
                <button class="btn btn-primary" style="flex: 1; font-size: 12px; padding: 8px;" onclick="StudentPortal.openReserveModal(${b.id})">
                  📋 Reserve Copy
                </button>
              ` : `
                <button class="btn btn-secondary" style="flex: 1; font-size: 12px; padding: 8px;" onclick="StudentPortal.joinWaitingList(${b.id})">
                  ⏳ Join Smart Waiting List
                </button>
              `}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function handleSearch(q) {
    loadCatalog();
  }

  function setGenreFilter(genre) {
    activeGenre = genre;
    document.querySelectorAll('#stu-genre-chips .category-chip').forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-genre') === genre);
    });
    loadCatalog();
  }

  // ==================== ONLINE BOOK RESERVATION ====================
  function openReserveModal(bookId) {
    const book = cachedBooks.find(b => b.id === bookId);
    if (!book) return;

    document.getElementById('res-book-id').value = book.id;
    document.getElementById('res-modal-title').innerText = `Reserve: ${book.title}`;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('res-preferred-date').value = tomorrow.toISOString().split('T')[0];
    document.getElementById('res-preferred-date').min = new Date().toISOString().split('T')[0];

    document.getElementById('res-book-summary').innerHTML = `
      <div style="font-weight: bold; font-size: 13px; color: #1e3a8a;">${escapeHtml(book.title)}</div>
      <div style="font-size: 11px; color: #475569;">Author: ${escapeHtml(book.author)} • ISBN: ${escapeHtml(book.isbn)}</div>
      <div style="font-size: 11px; color: #166534; font-weight: 600; margin-top: 4px;">
        📍 Shelf: Block ${escapeHtml(book.block || 'A')}, Floor ${book.floor || 2}, ${escapeHtml(book.rack || 'Rack 08')}, ${escapeHtml(book.shelf || 'Shelf 03')}
      </div>
    `;

    document.getElementById('modal-stu-reserve').classList.add('active');
  }

  async function submitReservation(e) {
    e.preventDefault();
    const bookId = document.getElementById('res-book-id').value;
    const preferredDate = document.getElementById('res-preferred-date').value;
    const timeslot = document.getElementById('res-timeslot').value;
    const notes = document.getElementById('res-notes').value.trim();

    try {
      const res = await studentRequest('/api/reservations', {
        method: 'POST',
        body: JSON.stringify({
          book_id: bookId,
          preferred_date: preferredDate,
          timeslot: timeslot,
          notes: notes
        }),
      });

      closeModals();
      alert(`🎉 Reservation Placed Successfully!\n\nReservation ID: ${res.reservation.reservation_code}\nScheduled Date: ${preferredDate} (${timeslot})\n\nYou will receive a notification when the librarian confirms your hold.`);
      showToast('Reservation confirmed!', 'success');
      loadNotifications();
      switchTab('myaccount');
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function cancelReservation(id) {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      await studentRequest(`/api/reservations/${id}/cancel`, { method: 'PATCH' });
      showToast('Reservation cancelled.', 'info');
      loadMyAccount();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // ==================== SMART WAITING LIST ====================
  async function joinWaitingList(bookId) {
    try {
      const res = await studentRequest('/api/waiting-list/join', {
        method: 'POST',
        body: JSON.stringify({ book_id: bookId }),
      });
      alert(`🎉 Joined Smart Waiting List!\n\nYour Queue Position is #${res.queue_position}.\n\nThe system will hold the book and alert you immediately via in-app notification when a student returns it.`);
      showToast(res.message, 'success');
      loadCatalog();
      loadNotifications();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function leaveWaitingList(id) {
    if (!confirm('Leave the waiting list queue for this book?')) return;
    try {
      await studentRequest(`/api/waiting-list/${id}`, { method: 'DELETE' });
      showToast('Left waiting list queue.', 'info');
      loadMyAccount();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // ==================== DIGITAL LIBRARY MEMBERSHIP CARD (MODULE 8) ====================
  async function loadDigitalCard() {
    const container = document.getElementById('stu-digital-card-render');
    container.innerHTML = '<div style="text-align: center; padding: 30px; color: #64748b;">Loading Digital Membership Card...</div>';

    try {
      const data = await studentRequest('/api/auth/student-card');
      const c = data.card;

      container.innerHTML = `
        <div class="id-card-wrap">
          <div class="library-id-card">
            <div class="id-card-header">
              <div class="id-card-motto">“${escapeHtml(c.motto)}”</div>
              <div class="id-card-inst">${escapeHtml(c.institution)}</div>
              <div class="id-card-sub">${escapeHtml(c.board)}</div>
            </div>

            <div class="id-card-body">
              <div class="id-card-photo-box">
                <img src="${escapeHtml(c.photo_url)}" class="id-card-photo" alt="Student Photo">
                <div class="id-card-validity">VALID THRU: ${escapeHtml(c.validity)}</div>
              </div>

              <div class="id-card-details">
                <div class="id-card-name">${escapeHtml(c.student_name)}</div>
                <div class="id-card-reg">${escapeHtml(c.student_id)}</div>
                <div class="id-card-meta">
                  <strong>Course:</strong> ${escapeHtml(c.course)}<br>
                  <strong>Dept:</strong> ${escapeHtml(c.department)}<br>
                  <strong>Sem:</strong> ${escapeHtml(c.semester)}<br>
                  <strong>Membership ID:</strong> <code>${escapeHtml(c.membership_id)}</code><br>
                  <strong>Status:</strong> <span class="badge badge-success" style="font-size: 10px;">${escapeHtml(c.status)}</span><br>
                  <strong>Borrow Limit:</strong> ${c.active_loans} / ${c.borrow_limit} books checked out
                </div>
              </div>
            </div>

            <div class="id-card-footer">
              <img src="${c.qr_code_url}" class="id-card-qr-img" alt="Digital QR Card">
              <div class="id-card-qr-text">
                <strong>⚡ Dynamic Desk Checkout QR</strong>
                Present to librarian for scan-and-go book issue, renewal, and return at the circulation counter.
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div style="padding: 20px; color: var(--danger); text-align: center;">Error loading card: ${escapeHtml(err.message)}</div>`;
    }
  }

  // ==================== MY LIBRARY ACCOUNT DASHBOARD ====================
  async function loadMyAccount() {
    try {
      const data = await studentRequest('/api/auth/my-account');
      const s = data.summary;

      document.getElementById('acc-stat-borrowed').innerText = s.current_borrowed || 0;
      document.getElementById('acc-stat-slots').innerText = `${s.available_limit} / ${s.total_borrow_limit}`;
      document.getElementById('acc-stat-reservations').innerText = s.approved_reservations_count || 0;
      document.getElementById('acc-stat-fines').innerText = `₹${(s.pending_fines || 0).toFixed(2)}`;

      // Loans Table
      const loansTbody = document.getElementById('stu-loans-tbody');
      const loans = data.currently_borrowed || [];
      if (loans.length === 0) {
        loansTbody.innerHTML = `<tr><td colspan="6" class="empty-state">No books currently borrowed. You have ${s.available_limit} borrowing slots available!</td></tr>`;
      } else {
        loansTbody.innerHTML = loans.map(l => {
          const isOverdue = l.computed_status === 'overdue';
          const countdown = isOverdue
            ? `<span class="badge badge-danger">Overdue by ${l.days_overdue} days</span>`
            : `<span class="badge badge-info">${l.days_remaining} days left</span>`;

          return `
            <tr>
              <td>
                <strong>${escapeHtml(l.title)}</strong><br>
                <small style="color: #64748b;">${escapeHtml(l.isbn || '')}</small>
              </td>
              <td>
                <span class="shelf-coordinate-pill">
                  📍 Block ${escapeHtml(l.block || 'A')} • ${escapeHtml(l.rack || 'Rack 08')}
                </span>
              </td>
              <td>${formatDate(l.borrow_date)}</td>
              <td><strong>${formatDate(l.due_date)}</strong></td>
              <td>${countdown}</td>
              <td style="color: ${l.calculated_fine > 0 ? 'var(--danger)' : 'var(--success)'}; font-weight: bold;">
                ₹${(l.calculated_fine || 0).toFixed(2)}
              </td>
            </tr>
          `;
        }).join('');
      }

      // Reservations Table
      const resTbody = document.getElementById('stu-res-tbody');
      const reservations = data.reservations || [];
      if (reservations.length === 0) {
        resTbody.innerHTML = `<tr><td colspan="6" class="empty-state">No active reservations.</td></tr>`;
      } else {
        resTbody.innerHTML = reservations.map(r => {
          let badgeClass = r.status === 'ready_for_pickup' ? 'badge-success' : (r.status === 'approved' ? 'badge-info' : 'badge-warning');
          return `
            <tr>
              <td><code>${escapeHtml(r.reservation_code)}</code></td>
              <td><strong>${escapeHtml(r.title)}</strong></td>
              <td>${formatDate(r.preferred_date)} (${escapeHtml(r.timeslot)})</td>
              <td>📍 Block ${escapeHtml(r.block || 'A')}, Fl ${r.floor || 2}, ${escapeHtml(r.rack || 'Rack 08')}</td>
              <td><span class="badge ${badgeClass}">${r.status}</span></td>
              <td>
                <button class="btn btn-sm btn-secondary" onclick="StudentPortal.cancelReservation(${r.id})">Cancel</button>
              </td>
            </tr>
          `;
        }).join('');
      }

      // Waiting List Table
      const waitTbody = document.getElementById('stu-wait-table');
      const waitings = data.waiting_list || [];
      if (waitings.length === 0) {
        waitTbody.innerHTML = `<tr><td colspan="5" class="empty-state">Not currently in any waiting list queues.</td></tr>`;
      } else {
        waitTbody.innerHTML = waitings.map(w => `
          <tr>
            <td><strong>${escapeHtml(w.title)}</strong></td>
            <td><span class="badge badge-primary">#${w.queue_position} In Line</span></td>
            <td><span class="badge ${w.status === 'notified' ? 'badge-success' : 'badge-neutral'}">${w.status}</span></td>
            <td>${formatDate(w.created_at)}</td>
            <td>
              <button class="btn btn-sm btn-danger" onclick="StudentPortal.leaveWaitingList(${w.id})">Leave Queue</button>
            </td>
          </tr>
        `).join('');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // ==================== IN-APP NOTIFICATIONS (MODULE 7) ====================
  async function loadNotifications() {
    try {
      const data = await studentRequest('/api/notifications/my');
      const notifs = data.notifications || [];
      const unread = data.unread_count || 0;

      const badge = document.getElementById('notif-badge');
      if (badge) {
        badge.style.display = unread > 0 ? 'block' : 'none';
        badge.innerText = unread;
      }

      const listContainer = document.getElementById('notif-list-container');
      if (!listContainer) return;

      if (notifs.length === 0) {
        listContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #64748b; font-size: 12px;">No notifications yet.</div>';
        return;
      }

      listContainer.innerHTML = notifs.map(n => {
        let icon = '🔔';
        if (n.type === 'pickup_ready') icon = '📦';
        else if (n.type === 'waiting_list_alert') icon = '⏳';
        else if (n.type === 'fine_update') icon = '⚠️';
        else if (n.type === 'holiday_announcement') icon = '🏖️';

        return `
          <div class="notif-item ${n.is_read ? '' : 'unread'}">
            <span style="font-size: 18px;">${icon}</span>
            <div style="flex: 1;">
              <strong style="color: #0f172a; display: block; margin-bottom: 2px;">${escapeHtml(n.title)}</strong>
              <div style="color: #475569; line-height: 1.3;">${escapeHtml(n.message)}</div>
              <small style="color: #94a3b8; font-size: 10px; margin-top: 4px; display: block;">${formatDate(n.created_at)}</small>
            </div>
          </div>
        `;
      }).join('');
    } catch (_) {}
  }

  function toggleNotifications() {
    const dropdown = document.getElementById('notif-dropdown');
    if (dropdown) {
      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    }
  }

  async function markAllNotifsRead() {
    try {
      await studentRequest('/api/notifications/read-all', { method: 'PATCH' });
      loadNotifications();
    } catch (_) {}
  }

  // ==================== ANNOUNCEMENTS ====================
  async function loadAnnouncements() {
    const container = document.getElementById('stu-announcements-list');
    try {
      const data = await studentRequest('/api/announcements');
      const list = data.announcements || [];

      if (list.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #64748b; padding: 20px;">No current announcements.</div>';
        return;
      }

      container.innerHTML = list.map(a => {
        let badgeColor = '#0284c7';
        if (a.category === 'holiday') badgeColor = '#dc2626';
        else if (a.category === 'new_arrival') badgeColor = '#059669';

        return `
          <div style="border-left: 4px solid ${badgeColor}; background: #f8fafc; border-radius: 8px; padding: 14px 18px; border: 1px solid #e2e8f0; border-left-width: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <strong style="font-size: 14px; color: #0f172a;">${escapeHtml(a.title)}</strong>
              <span class="badge" style="background: ${badgeColor}; color: white; font-size: 10px;">${escapeHtml(a.category)}</span>
            </div>
            <p style="margin: 0 0 6px; font-size: 13px; color: #334155; line-height: 1.4;">${escapeHtml(a.content)}</p>
            <small style="color: #64748b; font-size: 11px;">Posted on ${formatDate(a.created_at)}</small>
          </div>
        `;
      }).join('');
    } catch (err) {
      container.innerHTML = `<div style="color: var(--danger);">${escapeHtml(err.message)}</div>`;
    }
  }

  function closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  }

  function logout() {
    clearStudentSession();
    showAuthOverlay();
    showToast('Signed out of student portal.', 'info');
  }

  // Initialization
  function init() {
    const rawUser = localStorage.getItem('library_student_user');
    const token = getStudentToken();
    if (token && rawUser) {
      currentUser = JSON.parse(rawUser);
      hideAuthOverlay();
      updateNavProfile();
      loadCatalog();
      loadNotifications();
    } else {
      showAuthOverlay();
    }

    // Close notifications when clicking outside
    document.addEventListener('click', (e) => {
      const dropdown = document.getElementById('notif-dropdown');
      const bellBtn = document.getElementById('notif-bell-btn');
      if (dropdown && dropdown.style.display === 'block') {
        if (!dropdown.contains(e.target) && !bellBtn.contains(e.target)) {
          dropdown.style.display = 'none';
        }
      }
    });
  }

  return {
    init,
    handleLogin,
    handleRegister,
    setAuthMode,
    openForgotPassword,
    switchTab,
    loadCatalog,
    handleSearch,
    setGenreFilter,
    openReserveModal,
    submitReservation,
    cancelReservation,
    joinWaitingList,
    leaveWaitingList,
    loadDigitalCard,
    loadMyAccount,
    toggleNotifications,
    markAllNotifsRead,
    closeModals,
    logout,
  };
})();

document.addEventListener('DOMContentLoaded', StudentPortal.init);
