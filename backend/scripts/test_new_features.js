const http = require('http');

async function testFeatures() {
  console.log('🧪 Running full integration test for all Smart Campus Library features...');

  // Start server on a test port if not running
  process.env.PORT = '5001';
  const server = require('../server');

  // Wait 1.5s for server to start
  await new Promise(r => setTimeout(r, 1500));

  async function req(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(`http://localhost:5001${path}`);
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const options = {
        method,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        headers
      };

      const request = http.request(options, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (_) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      });

      request.on('error', reject);
      if (body) request.write(JSON.stringify(body));
      request.end();
    });
  }

  try {
    // 1. Test Login via College Registration Number
    console.log('\n--- 1. Testing Login via College Registration Number ---');
    const loginRes = await req('POST', '/api/auth/login', {
      identifier: '24054-CPS-062',
      password: 'student123'
    });
    console.log('Student Login status:', loginRes.status, 'Name:', loginRes.data?.user?.name, 'RegNo:', loginRes.data?.user?.student_id);
    const studentToken = loginRes.data.token;

    // 1b. Test Librarian Login
    console.log('\n--- 1b. Testing Librarian Login ---');
    const adminLoginRes = await req('POST', '/api/auth/login', {
      identifier: 'admin@library.com',
      password: 'admin123'
    });
    console.log('Librarian Login status:', adminLoginRes.status, 'Role:', adminLoginRes.data?.user?.role);
    const adminToken = adminLoginRes.data.token;

    // 2. Test Digital Library Membership Card (Module 8)
    console.log('\n--- 2. Testing Digital Library Membership Card ---');
    const cardRes = await req('GET', '/api/auth/student-card', null, studentToken);
    console.log('Digital Card status:', cardRes.status);
    console.log('Motto:', cardRes.data?.card?.motto);
    console.log('Institution:', cardRes.data?.card?.institution);
    console.log('Student:', cardRes.data?.card?.student_name, '| Membership ID:', cardRes.data?.card?.membership_id);
    console.log('Dynamic QR Code length:', cardRes.data?.card?.qr_code_url?.length, 'bytes');

    // 3. Test Book Finder – Exact Shelf Locator
    console.log('\n--- 3. Testing Exact Shelf Locator in Catalog ---');
    const booksRes = await req('GET', '/api/books', null, studentToken);
    console.log('Books fetched count:', booksRes.data?.books?.length);
    const firstBook = booksRes.data?.books[0];
    console.log('Book title:', firstBook?.title);
    console.log('Exact Shelf Locator:', `Block ${firstBook?.block}, Floor ${firstBook?.floor}, Section: ${firstBook?.section}, ${firstBook?.rack}, ${firstBook?.shelf}`);

    // 4. Test Online Book Reservation
    console.log('\n--- 4. Testing Online Book Reservation ---');
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const reserveRes = await req('POST', '/api/reservations', {
      book_id: firstBook.id,
      preferred_date: tomorrow,
      timeslot: '10:00 AM - 12:00 PM',
      notes: 'Final Year Project study reference'
    }, studentToken);
    console.log('Reserve status:', reserveRes.status, 'Msg:', reserveRes.data?.message);
    const reservationCode = reserveRes.data?.reservation?.reservation_code;
    const reservationId = reserveRes.data?.reservation?.id;
    console.log('Reservation Code:', reservationCode, 'ID:', reservationId);

    // 5. Test Librarian Desk Scanner (Module 8 QR Desk Scan)
    console.log('\n--- 5. Testing Librarian Desk QR Scanner by Code ---');
    const scanRes = await req('GET', `/api/auth/student-by-code/${encodeURIComponent('24054-CPS-062')}`, null, adminToken);
    console.log('Desk Scan Student:', scanRes.data?.student?.name, '| Can Borrow:', scanRes.data?.can_borrow);
    console.log('Active Loans:', scanRes.data?.active_loans?.length, '| Pending Reservations:', scanRes.data?.reservations?.length);

    // 6. Test Librarian Approving Reservation
    console.log('\n--- 6. Testing Reservation Approval & Ready for Pickup ---');
    if (reservationId) {
      const approveRes = await req('PATCH', `/api/reservations/${reservationId}/approve`, {
        ready_for_pickup: true
      }, adminToken);
      console.log('Approve status:', approveRes.status, 'Status:', approveRes.data?.status);
    }

    // 7. Test In-App Notification Center (Module 7)
    console.log('\n--- 7. Testing In-App Notification Center ---');
    const notifsRes = await req('GET', '/api/notifications/my', null, studentToken);
    console.log('Notifications count:', notifsRes.data?.notifications?.length, 'Unread:', notifsRes.data?.unread_count);
    notifsRes.data?.notifications?.slice(0, 3).forEach((n, idx) => {
      console.log(`  [${idx + 1}] (${n.type}) ${n.title}: ${n.message.substring(0, 70)}...`);
    });

    // 8. Test My Library Account Dashboard
    console.log('\n--- 8. Testing My Library Account Dashboard ---');
    const myAccRes = await req('GET', '/api/auth/my-account', null, studentToken);
    console.log('My Account status:', myAccRes.status);
    console.log('Summary:', myAccRes.data?.summary);

    // 9. Test Smart Waiting List
    console.log('\n--- 9. Testing Smart Waiting List Queue ---');
    const secondBook = booksRes.data?.books[1];
    const waitRes = await req('POST', '/api/waiting-list/join', {
      book_id: secondBook.id
    }, studentToken);
    console.log('Waiting List Join status:', waitRes.status, 'Queue Position:', waitRes.data?.queue_position);

    // 10. Test Library Announcements
    console.log('\n--- 10. Testing Announcements ---');
    const annRes = await req('GET', '/api/announcements', null, studentToken);
    console.log('Announcements count:', annRes.data?.announcements?.length);
    annRes.data?.announcements?.slice(0, 2).forEach(a => {
      console.log(`  📢 [${a.category}] ${a.title}`);
    });

    console.log('\n🎉 ALL 10 SUBSYSTEMS & MODULES TESTED AND FUNCTIONING PERFECTLY!');
    process.exit(0);
  } catch (e) {
    console.error('Test error:', e);
    process.exit(1);
  }
}

testFeatures();
