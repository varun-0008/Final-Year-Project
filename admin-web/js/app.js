// Librarian Admin Dashboard Logic (Pure Vanilla JavaScript)

const App = (() => {
  let cachedBooks = [];
  let cachedStudents = [];
  let cachedBorrows = [];
  let cachedOLResults = [];
  let activeTab = 'overview';
  let activeGenre = '';

  // Check auth immediately
  function initAuth() {
    if (!API.isLoggedIn()) {
      window.location.href = 'login.html';
      return false;
    }
    const user = API.getUser();
    if (user?.role !== 'librarian') {
      API.logout();
      return false;
    }

    const nameEl = document.getElementById('admin-name');
    const avatarEl = document.getElementById('admin-avatar');
    if (nameEl) nameEl.innerText = user.name || 'Chief Librarian';
    if (avatarEl) avatarEl.innerText = (user.name || 'L')[0].toUpperCase();

    return true;
  }

  // Tab switching
  function switchTab(tabName) {
    activeTab = tabName;
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    const targetSection = document.getElementById(`tab-${tabName}`);
    if (targetSection) targetSection.style.display = 'block';

    const targetNav = document.querySelector(`.nav-item[data-tab="${tabName}"]`);
    if (targetNav) targetNav.classList.add('active');

    const titleEl = document.getElementById('page-title-text');
    const subtitleEl = document.getElementById('page-subtitle-text');

    if (tabName === 'overview') {
      titleEl.innerText = 'Dashboard Overview';
      subtitleEl.innerText = 'Library metrics, real-time inventory, and active loans';
      loadOverview();
    } else if (tabName === 'catalog') {
      titleEl.innerText = 'Book Catalog Management';
      subtitleEl.innerText = 'Manage books, stock quantities, and shelf locations';
      loadBooks();
    } else if (tabName === 'borrowings') {
      titleEl.innerText = 'Issue & Return Management';
      subtitleEl.innerText = 'Issue books to students, track due dates, and process returns';
      loadBorrowings();
    } else if (tabName === 'students') {
      titleEl.innerText = 'Registered Students';
      subtitleEl.innerText = 'View enrolled students, download template, and import via Excel';
      loadStudents();
    }
  }

  // Load Dashboard Overview
  async function loadOverview() {
    try {
      const statsData = await API.getStats();
      const s = statsData.stats || {};
      document.getElementById('stat-titles').innerText = s.total_titles || 0;
      document.getElementById('stat-total-copies').innerText = s.total_copies || 0;
      document.getElementById('stat-avail-copies').innerText = s.available_copies || 0;
      document.getElementById('stat-active-loans').innerText = s.active_borrows || 0;
      document.getElementById('stat-overdue').innerText = s.overdue_count || 0;
      document.getElementById('stat-students').innerText = s.total_students || 0;

      // Load recent borrow transactions
      const borrowData = await API.getAllBorrows();
      cachedBorrows = borrowData.records || [];
      renderOverviewLoans(cachedBorrows.slice(0, 6));
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  }

  function renderOverviewLoans(records) {
    const tbody = document.getElementById('overview-loans-tbody');
    if (!records || records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No borrow transactions found.</td></tr>`;
      return;
    }

    tbody.innerHTML = records.map(r => {
      const isOverdue = r.computed_status === 'overdue';
      const isReturned = r.status === 'returned';
      const badgeClass = isReturned ? 'badge-success' : (isOverdue ? 'badge-danger' : 'badge-info');

      return `
        <tr>
          <td>
            <strong>${escapeHtml(r.student_name)}</strong><br>
            <small class="badge badge-neutral">${escapeHtml(r.student_id || '')}</small>
          </td>
          <td>
            <strong>${escapeHtml(r.book_title)}</strong><br>
            <small style="color: var(--gray-600);">${escapeHtml(r.book_isbn)}</small>
          </td>
          <td>${formatDate(r.borrow_date)}</td>
          <td>
            <span class="${isOverdue ? 'badge badge-danger' : ''}">
              ${formatDate(r.due_date)}
            </span>
          </td>
          <td><span class="badge ${badgeClass}">${r.computed_status}</span></td>
          <td>
            ${isReturned ? '<span style="color: var(--gray-600); font-size: 13px;">Completed</span>' : `
              <button class="btn btn-sm btn-success" onclick="App.confirmReturn(${r.id}, '${escapeHtml(r.book_title)}', ${r.days_overdue})">
                Return
              </button>
            `}
          </td>
        </tr>
      `;
    }).join('');
  }

  // Load Book Catalog
  async function loadBooks() {
    const search = document.getElementById('catalog-search')?.value || '';
    const availOnly = document.getElementById('catalog-avail-only')?.checked || false;

    try {
      const data = await API.getBooks(search, activeGenre, availOnly);
      cachedBooks = data.books || [];
      renderBooksTable(cachedBooks);
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  }

  function renderBooksTable(books) {
    const tbody = document.getElementById('catalog-tbody');
    if (!books || books.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-state">
            <div class="empty-state-icon">📚</div>
            <p>No books in library catalog.</p>
            <p style="font-size: 13px; margin-top: 6px;">
              <button class="btn btn-secondary btn-sm" onclick="App.openOpenLibraryModal()">🌐 Import Books from Open Library</button>
              or <button class="btn btn-primary btn-sm" onclick="App.openAddBookModal()">+ Add Manually</button>
            </p>
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = books.map(b => {
      const isAvailable = b.available_copies > 0;
      const stockBadge = isAvailable
        ? `<span class="badge badge-success">${b.available_copies} / ${b.total_copies} In Stock</span>`
        : `<span class="badge badge-danger">Out of Stock (0 / ${b.total_copies})</span>`;

      const coverImg = b.cover_url
        ? `<img src="${escapeHtml(b.cover_url)}" alt="cover" style="width: 36px; height: 50px; object-fit: cover; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">`
        : `<div style="width: 36px; height: 50px; background: var(--gray-200); border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 16px;">📖</div>`;

      return `
        <tr>
          <td style="width: 50px; text-align: center;">${coverImg}</td>
          <td>
            <strong>${escapeHtml(b.title)}</strong><br>
            <small style="color: var(--gray-600);">${escapeHtml(b.author)} ${b.published_year ? `(${b.published_year})` : ''}</small>
          </td>
          <td><code>${escapeHtml(b.isbn)}</code></td>
          <td><span class="badge badge-neutral">${escapeHtml(b.genre)}</span></td>
          <td>${stockBadge}</td>
          <td><strong>${escapeHtml(b.shelf_location)}</strong></td>
          <td>
            <div style="display: flex; gap: 6px;">
              ${isAvailable ? `
                <button class="btn btn-sm btn-primary" onclick="App.openIssueForBook('${escapeHtml(b.isbn)}')">
                  Issue
                </button>
              ` : ''}
              <button class="btn btn-sm btn-secondary" onclick="App.openEditBookModal(${b.id})">
                Edit
              </button>
              <button class="btn btn-sm btn-danger" onclick="App.deleteBook(${b.id}, '${escapeHtml(b.title)}')">
                Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Load Borrowings & Loans
  async function loadBorrowings() {
    const search = document.getElementById('borrow-search')?.value || '';
    const status = document.getElementById('borrow-status-filter')?.value || 'all';

    try {
      const data = await API.getAllBorrows(status, search);
      cachedBorrows = data.records || [];
      renderBorrowingsTable(cachedBorrows);
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  }

  function renderBorrowingsTable(records) {
    const tbody = document.getElementById('borrow-tbody');
    if (!records || records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="empty-state">No borrowing records found.</td></tr>`;
      return;
    }

    tbody.innerHTML = records.map(r => {
      const isOverdue = r.computed_status === 'overdue';
      const isReturned = r.status === 'returned';
      const badgeClass = isReturned ? 'badge-success' : (isOverdue ? 'badge-danger' : 'badge-info');

      let fineText = '-';
      if (r.fine_amount > 0) {
        fineText = `<strong style="color: var(--danger);">$${parseFloat(r.fine_amount).toFixed(2)}</strong>`;
      } else if (isOverdue) {
        fineText = `<span style="color: var(--danger); font-size: 12px; font-weight: 600;">Overdue (${r.days_overdue}d)</span>`;
      }

      return `
        <tr>
          <td>
            <strong>${escapeHtml(r.student_name)}</strong><br>
            <small class="badge badge-neutral">${escapeHtml(r.student_id || '')}</small>
            <div style="font-size: 11px; color: var(--gray-600);">${escapeHtml(r.student_email || '')}</div>
          </td>
          <td>
            <strong>${escapeHtml(r.book_title)}</strong><br>
            <small style="color: var(--gray-600);">${escapeHtml(r.book_author || '')} (ISBN: ${escapeHtml(r.book_isbn)})</small><br>
            <small style="color: var(--secondary);">📍 ${escapeHtml(r.shelf_location || '')}</small>
          </td>
          <td>${formatDate(r.borrow_date)}</td>
          <td>
            <strong class="${isOverdue ? 'badge badge-danger' : ''}">
              ${formatDate(r.due_date)}
            </strong>
          </td>
          <td><span class="badge ${badgeClass}">${r.computed_status}</span></td>
          <td>${fineText}</td>
          <td>
            ${isReturned ? '<span style="color: var(--gray-600); font-size: 13px;">Returned</span>' : `
              <button class="btn btn-sm btn-success" onclick="App.confirmReturn(${r.id}, '${escapeHtml(r.book_title)}', ${r.days_overdue})">
                Mark Return
              </button>
            `}
          </td>
        </tr>
      `;
    }).join('');
  }

  // Load Registered Students
  async function loadStudents() {
    try {
      const data = await API.getStudents();
      cachedStudents = data.students || [];
      renderStudentsTable(cachedStudents);
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  }

  function renderStudentsTable(students) {
    const tbody = document.getElementById('students-tbody');
    const search = document.getElementById('students-search')?.value.toLowerCase() || '';

    const filtered = students.filter(s => 
      !search || 
      s.name.toLowerCase().includes(search) || 
      (s.student_id && s.student_id.toLowerCase().includes(search)) ||
      (s.email && s.email.toLowerCase().includes(search))
    );

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-state">
            <div class="empty-state-icon">🎓</div>
            <p>No registered students found.</p>
            <p style="font-size: 13px; margin-top: 6px;">
              <button class="btn btn-primary btn-sm" onclick="App.openUploadStudentsModal()">📤 Import Students via Excel</button>
            </p>
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(s => {
      const activeCount = parseInt(s.active_borrowed_count, 10) || 0;
      const overdueCount = parseInt(s.overdue_count, 10) || 0;

      return `
        <tr>
          <td><strong>${escapeHtml(s.name)}</strong></td>
          <td><code>${escapeHtml(s.student_id || '-')}</code></td>
          <td>${escapeHtml(s.email)}</td>
          <td>${escapeHtml(s.department || '-')}</td>
          <td>${escapeHtml(s.phone || '-')}</td>
          <td>
            <span class="badge ${activeCount > 0 ? 'badge-info' : 'badge-neutral'}">
              ${activeCount} books
            </span>
          </td>
          <td>
            <span class="badge ${overdueCount > 0 ? 'badge-danger' : 'badge-neutral'}">
              ${overdueCount} overdue
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }

  // ==================== OPEN LIBRARY MODAL & SEARCH ====================
  function openOpenLibraryModal() {
    document.getElementById('modal-open-library').classList.add('active');
    document.getElementById('ol-query').focus();
  }

  function quickSearchOL(query) {
    document.getElementById('ol-query').value = query;
    performOLSearch(query);
  }

  async function performOLSearch(query) {
    const container = document.getElementById('ol-results-container');
    const searchBtn = document.getElementById('ol-search-btn');

    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">⏳</div>
        <p>Connecting to Open Library by Internet Archive...</p>
      </div>`;

    if (searchBtn) searchBtn.disabled = true;

    try {
      const data = await API.searchOpenLibrary(query, 12);
      cachedOLResults = data.results || [];

      if (cachedOLResults.length === 0) {
        container.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-state-icon">🔍</div>
            <p>No books found on Open Library for "${escapeHtml(query)}".</p>
          </div>`;
        return;
      }

      container.innerHTML = cachedOLResults.map((book, idx) => {
        const coverHtml = book.cover_url 
          ? `<img src="${escapeHtml(book.cover_url)}" alt="cover" class="ol-cover-thumb">`
          : `<div class="ol-cover-thumb">📖</div>`;

        return `
          <div class="ol-book-card" id="ol-card-${idx}">
            ${coverHtml}
            <div class="ol-book-info">
              <div>
                <div class="ol-book-title" title="${escapeHtml(book.title)}">${escapeHtml(book.title)}</div>
                <div class="ol-book-author">By ${escapeHtml(book.author)}</div>
                <div class="ol-book-meta">
                  <span>${book.published_year ? `Year: ${book.published_year}` : ''}</span>
                  <span style="margin-left: 8px;">ISBN: <code>${escapeHtml(book.isbn)}</code></span>
                </div>
                <div style="margin-top: 4px;">
                  <span class="badge badge-neutral" style="font-size: 11px;">${escapeHtml(book.genre)}</span>
                </div>
              </div>
              <div class="ol-actions">
                <div style="display: flex; gap: 6px; align-items: center;">
                  <label style="font-size: 11px; color: var(--gray-600);">Copies:</label>
                  <input type="number" id="ol-copies-${idx}" class="input" value="3" min="1" max="50" style="width: 55px; padding: 4px 6px; font-size: 12px;">
                </div>
                <button type="button" class="btn btn-sm btn-primary" id="btn-ol-import-${idx}" onclick="App.importOLBook(${idx})">
                  📥 Import
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    } catch (err) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; color: var(--danger);">
          <p>⚠️ Error: ${escapeHtml(err.message)}</p>
        </div>`;
    } finally {
      if (searchBtn) searchBtn.disabled = false;
    }
  }

  async function importOLBook(index) {
    const book = cachedOLResults[index];
    if (!book) return;

    const btn = document.getElementById(`btn-ol-import-${index}`);
    const copiesInput = document.getElementById(`ol-copies-${index}`);
    const copies = parseInt(copiesInput?.value, 10) || 3;

    if (btn) {
      btn.disabled = true;
      btn.innerText = 'Importing...';
    }

    try {
      const payload = {
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        genre: book.genre,
        published_year: book.published_year,
        total_copies: copies,
        shelf_location: 'Main Stacks',
        cover_url: book.cover_url,
        description: `Imported from Open Library by Internet Archive. Editions: ${book.edition_count || 1}.`,
      };

      const res = await API.importOpenLibraryBook(payload);
      API.showToast(res.message, 'success');

      if (btn) {
        btn.innerText = '✅ Imported';
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-success');
      }

      // Refresh catalog and overview in background
      if (activeTab === 'catalog') loadBooks();
      if (activeTab === 'overview') loadOverview();
    } catch (err) {
      API.showToast(err.message, 'error');
      if (btn) {
        btn.disabled = false;
        btn.innerText = '📥 Import';
      }
    }
  }

  // ==================== AUTO-FILL ISBN FROM OPEN LIBRARY ====================
  async function autoFillISBN() {
    const isbnInput = document.getElementById('add-isbn');
    const isbn = isbnInput?.value.trim();
    if (!isbn) {
      API.showToast('Please enter an ISBN first', 'info');
      isbnInput?.focus();
      return;
    }

    const btn = document.getElementById('btn-autofill-isbn');
    if (btn) {
      btn.disabled = true;
      btn.innerText = 'Searching...';
    }

    try {
      const res = await API.lookupOpenLibraryISBN(isbn);
      const b = res.book;
      if (!b) throw new Error('No details found for this ISBN');

      if (b.title) document.getElementById('add-title').value = b.title;
      if (b.published_year) document.getElementById('add-year').value = b.published_year;
      if (b.cover_url) document.getElementById('add-cover-url').value = b.cover_url;
      if (b.description) document.getElementById('add-desc').value = b.description;

      API.showToast(`Found: "${b.title}" from Open Library!`, 'success');
    } catch (err) {
      API.showToast(err.message, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerText = '⚡ Auto-Fill';
      }
    }
  }

  // ==================== EXCEL STUDENT UPLOAD ====================
  function openUploadStudentsModal() {
    document.getElementById('form-upload-students').reset();
    document.getElementById('selected-file-name').innerText = '';
    document.getElementById('upload-results').style.display = 'none';
    document.getElementById('modal-upload-students').classList.add('active');
  }

  async function handleStudentFileUpload(e) {
    e.preventDefault();
    const fileInput = document.getElementById('students-file-input');
    const file = fileInput?.files?.[0];
    if (!file) {
      API.showToast('Please select an Excel (.xlsx/.xls) or CSV file.', 'info');
      return;
    }

    const submitBtn = document.getElementById('btn-submit-upload');
    submitBtn.disabled = true;
    submitBtn.innerText = 'Importing...';

    try {
      const res = await API.uploadStudentsExcel(file);
      API.showToast(res.message, 'success');

      // Display results summary box
      const resultsBox = document.getElementById('upload-results');
      resultsBox.style.display = 'block';
      document.getElementById('badge-upload-created').innerText = `${res.createdCount} Created`;
      document.getElementById('badge-upload-skipped').innerText = `${res.skippedCount} Skipped`;

      let summaryHtml = `<strong>Summary:</strong> Processed file with ${res.createdCount} new student(s) added.`;
      if (res.skipped && res.skipped.length > 0) {
        summaryHtml += `<br><br><strong>Skipped rows:</strong><ul style="margin-left: 18px; margin-top: 4px;">`;
        res.skipped.slice(0, 5).forEach(s => {
          summaryHtml += `<li>Row ${s.row}: ${escapeHtml(s.reason)}</li>`;
        });
        if (res.skipped.length > 5) summaryHtml += `<li>...and ${res.skipped.length - 5} more</li>`;
        summaryHtml += `</ul>`;
      }
      document.getElementById('upload-summary-text').innerHTML = summaryHtml;

      loadStudents();
      loadOverview();
    } catch (err) {
      API.showToast(err.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerText = 'Start Import';
    }
  }

  // ==================== MODALS MANAGEMENT ====================
  function openAddBookModal() {
    document.getElementById('form-add-book').reset();
    document.getElementById('modal-add-book').classList.add('active');
  }

  async function openEditBookModal(bookId) {
    const book = cachedBooks.find(b => b.id === bookId) || await API.getBook(bookId).then(r => r.book);
    if (!book) return;

    document.getElementById('edit-id').value = book.id;
    document.getElementById('edit-title').value = book.title;
    document.getElementById('edit-author').value = book.author;
    document.getElementById('edit-isbn').value = book.isbn;
    document.getElementById('edit-genre').value = book.genre;
    document.getElementById('edit-year').value = book.published_year || '';
    document.getElementById('edit-copies').value = book.total_copies;
    document.getElementById('edit-shelf').value = book.shelf_location;
    document.getElementById('edit-cover-url').value = book.cover_url || '';
    document.getElementById('edit-desc').value = book.description || '';

    document.getElementById('modal-edit-book').classList.add('active');
  }

  function openIssueModal() {
    document.getElementById('form-issue-book').reset();
    const due = new Date();
    due.setDate(due.getDate() + 14);
    document.getElementById('issue-due-date').value = due.toISOString().split('T')[0];
    document.getElementById('modal-issue-book').classList.add('active');
  }

  function openIssueForBook(isbn) {
    openIssueModal();
    document.getElementById('issue-book').value = isbn;
  }

  function closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(el => el.classList.remove('active'));
  }

  // Delete Book
  async function deleteBook(id, title) {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await API.deleteBook(id);
      API.showToast('Book deleted successfully', 'success');
      loadBooks();
      if (activeTab === 'overview') loadOverview();
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  }

  // Confirm and Return Book
  async function confirmReturn(borrowId, title, overdueDays) {
    let confirmMsg = `Confirm return for "${title}"?`;
    if (overdueDays > 0) {
      confirmMsg += `\n\n⚠️ Notice: This book is ${overdueDays} day(s) overdue and a fine will be calculated.`;
    }

    if (!confirm(confirmMsg)) return;

    try {
      const res = await API.returnBook(borrowId);
      let successMsg = res.message;
      if (res.fineCalculated > 0) {
        successMsg += ` Overdue fine recorded: $${res.fineCalculated.toFixed(2)}`;
      }
      API.showToast(successMsg, 'success');

      if (activeTab === 'overview') loadOverview();
      if (activeTab === 'borrowings') loadBorrowings();
      if (activeTab === 'catalog') loadBooks();
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  }

  // CSV Export helpers
  function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function exportCatalogCSV() {
    if (!cachedBooks.length) {
      API.showToast('No books to export', 'info');
      return;
    }
    const header = ['ID', 'Title', 'Author', 'ISBN', 'Genre', 'Year', 'Total Copies', 'Available Copies', 'Shelf Location'];
    const rows = cachedBooks.map(b => [
      b.id,
      `"${(b.title || '').replace(/"/g, '""')}"`,
      `"${(b.author || '').replace(/"/g, '""')}"`,
      b.isbn,
      `"${(b.genre || '').replace(/"/g, '""')}"`,
      b.published_year || '',
      b.total_copies,
      b.available_copies,
      `"${(b.shelf_location || '').replace(/"/g, '""')}"`,
    ]);
    const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadCSV(csv, `library_catalog_${new Date().toISOString().split('T')[0]}.csv`);
    API.showToast('Catalog exported to CSV!', 'success');
  }

  function exportLoansCSV() {
    if (!cachedBorrows.length) {
      API.showToast('No loans to export', 'info');
      return;
    }
    const header = ['ID', 'Student Name', 'Student ID', 'Book Title', 'ISBN', 'Borrow Date', 'Due Date', 'Status', 'Fine'];
    const rows = cachedBorrows.map(r => [
      r.id,
      `"${(r.student_name || '').replace(/"/g, '""')}"`,
      r.student_id || '',
      `"${(r.book_title || '').replace(/"/g, '""')}"`,
      r.book_isbn,
      r.borrow_date,
      r.due_date,
      r.computed_status,
      r.fine_amount || 0,
    ]);
    const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadCSV(csv, `library_loans_${new Date().toISOString().split('T')[0]}.csv`);
    API.showToast('Loans exported to CSV!', 'success');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatDate(dStr) {
    if (!dStr) return '-';
    const d = new Date(dStr);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  // Setup Event Listeners
  function setupListeners() {
    // Navigation Tabs
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        if (tab) switchTab(tab);
      });
    });

    // Category Chips
    document.querySelectorAll('.category-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeGenre = chip.getAttribute('data-genre') || '';
        loadBooks();
      });
    });

    // Logout
    document.getElementById('logout-btn')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to log out?')) {
        API.logout();
      }
    });

    // Top bar buttons
    document.getElementById('btn-add-book')?.addEventListener('click', openAddBookModal);
    document.getElementById('btn-quick-issue')?.addEventListener('click', openIssueModal);
    document.getElementById('btn-top-open-library')?.addEventListener('click', openOpenLibraryModal);

    // Auto-fill ISBN button
    document.getElementById('btn-autofill-isbn')?.addEventListener('click', autoFillISBN);

    // Catalog search/filter
    document.getElementById('catalog-search')?.addEventListener('input', debounce(loadBooks, 250));
    document.getElementById('catalog-avail-only')?.addEventListener('change', loadBooks);

    // Borrowings search/filter
    document.getElementById('borrow-search')?.addEventListener('input', debounce(loadBorrowings, 250));
    document.getElementById('borrow-status-filter')?.addEventListener('change', loadBorrowings);

    // Students search
    document.getElementById('students-search')?.addEventListener('input', () => renderStudentsTable(cachedStudents));

    // Open Library search form
    document.getElementById('form-ol-search')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = document.getElementById('ol-query').value.trim();
      if (q) performOLSearch(q);
    });

    // Excel Student Upload File Input & Dropzone
    const dropzone = document.getElementById('file-dropzone');
    const fileInput = document.getElementById('students-file-input');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());

      fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
          document.getElementById('selected-file-name').innerText = `Selected: ${fileInput.files[0].name} (${(fileInput.files[0].size / 1024).toFixed(1)} KB)`;
        }
      });

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });

      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
          fileInput.files = e.dataTransfer.files;
          document.getElementById('selected-file-name').innerText = `Selected: ${e.dataTransfer.files[0].name}`;
        }
      });
    }

    // Submit Student Upload form
    document.getElementById('form-upload-students')?.addEventListener('submit', handleStudentFileUpload);

    // Form: Add Book
    document.getElementById('form-add-book')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        title: document.getElementById('add-title').value.trim(),
        author: document.getElementById('add-author').value.trim(),
        isbn: document.getElementById('add-isbn').value.trim(),
        genre: document.getElementById('add-genre').value.trim(),
        published_year: document.getElementById('add-year').value || null,
        total_copies: parseInt(document.getElementById('add-copies').value, 10),
        shelf_location: document.getElementById('add-shelf').value.trim(),
        cover_url: document.getElementById('add-cover-url').value.trim() || null,
        description: document.getElementById('add-desc').value.trim(),
      };

      try {
        await API.createBook(payload);
        API.showToast('Book added successfully!', 'success');
        closeModals();
        if (activeTab === 'catalog') loadBooks();
        if (activeTab === 'overview') loadOverview();
      } catch (err) {
        API.showToast(err.message, 'error');
      }
    });

    // Form: Edit Book
    document.getElementById('form-edit-book')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('edit-id').value;
      const payload = {
        title: document.getElementById('edit-title').value.trim(),
        author: document.getElementById('edit-author').value.trim(),
        isbn: document.getElementById('edit-isbn').value.trim(),
        genre: document.getElementById('edit-genre').value.trim(),
        published_year: document.getElementById('edit-year').value || null,
        total_copies: parseInt(document.getElementById('edit-copies').value, 10),
        shelf_location: document.getElementById('edit-shelf').value.trim(),
        cover_url: document.getElementById('edit-cover-url').value.trim() || null,
        description: document.getElementById('edit-desc').value.trim(),
      };

      try {
        await API.updateBook(id, payload);
        API.showToast('Book updated successfully!', 'success');
        closeModals();
        if (activeTab === 'catalog') loadBooks();
        if (activeTab === 'overview') loadOverview();
      } catch (err) {
        API.showToast(err.message, 'error');
      }
    });

    // Form: Issue Book (ADMIN ONLY)
    document.getElementById('form-issue-book')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        student_identifier: document.getElementById('issue-student').value.trim(),
        book_identifier: document.getElementById('issue-book').value.trim(),
        due_date: document.getElementById('issue-due-date').value,
        notes: document.getElementById('issue-notes').value.trim(),
      };

      try {
        const res = await API.issueBook(payload);
        API.showToast(res.message, 'success');
        closeModals();
        if (activeTab === 'borrowings') loadBorrowings();
        if (activeTab === 'overview') loadOverview();
        if (activeTab === 'catalog') loadBooks();
      } catch (err) {
        API.showToast(err.message, 'error');
      }
    });

    // Close modal on escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModals();
    });
  }

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Initialization
  function init() {
    if (!initAuth()) return;
    setupListeners();
    loadOverview();
  }

  return {
    init,
    switchTab,
    openAddBookModal,
    openEditBookModal,
    openIssueModal,
    openIssueForBook,
    openOpenLibraryModal,
    openUploadStudentsModal,
    quickSearchOL,
    importOLBook,
    closeModals,
    deleteBook,
    confirmReturn,
    exportCatalogCSV,
    exportLoansCSV,
  };
})();

document.addEventListener('DOMContentLoaded', App.init);
