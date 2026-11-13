package com.library.studentapp.ui

import android.content.Intent
import android.content.res.ColorStateList
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.chip.Chip
import com.library.studentapp.R
import com.library.studentapp.data.Book
import com.library.studentapp.data.BorrowRecord
import com.library.studentapp.data.Reservation
import com.library.studentapp.data.RetrofitClient
import com.library.studentapp.data.SessionManager
import com.library.studentapp.databinding.ActivityMainBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var sessionManager: SessionManager

    private lateinit var booksAdapter: BooksAdapter
    private lateinit var borrowedAdapter: BorrowedBooksAdapter
    private lateinit var reservationsAdapter: ReservationsAdapter

    private var cachedBooks: List<Book> = emptyList()
    private var cachedLoans: List<BorrowRecord> = emptyList()
    private var cachedReservations: List<Reservation> = emptyList()

    private var selectedGenre: String? = null
    private var activeSubTab: Int = 0 // 0 = Loans, 1 = Reservations

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        sessionManager = SessionManager(this)

        if (!sessionManager.isLoggedIn()) {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
            return
        }

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupUI()
        setupRecyclerViews()
        setupListeners()

        // Fast parallel initial load
        loadCatalog()
        loadLoansAndReservations()
    }

    private fun setupUI() {
        val user = sessionManager.getUser()
        val studentName = user?.name ?: "Student"
        binding.tvStudentGreeting.text = "Hello, $studentName"

        // Setup Profile info with PIN terminology
        binding.tvProfileName.text = studentName
        binding.tvProfileStudentId.text = "PIN: ${user?.studentId ?: "N/A"}"
        binding.tvProfileEmail.text = user?.email ?: "N/A"
        binding.tvProfileDept.text = user?.department ?: "Not Specified"
        binding.tvProfilePhone.text = user?.phone ?: "Not Specified"

        // Setup Initial Digital Card State
        binding.tvCardStudentName.text = studentName
        binding.tvCardRegNo.text = "PIN: ${user?.studentId ?: ""}"
        binding.tvCardDept.text = user?.department ?: "Cyber Physical Systems and Security"
        loadDigitalCard()
    }

    private fun setupRecyclerViews() {
        // Books Catalog Adapter
        booksAdapter = BooksAdapter { book ->
            val exactCoords = "Block ${book.block ?: "A"}, Floor ${book.floor ?: 2}, Section: ${book.section ?: book.genre}, ${book.rack ?: "Rack 08"}, ${book.shelf ?: "Shelf 03"}"
            val intent = Intent(this, BookDetailActivity::class.java).apply {
                putExtra(BookDetailActivity.EXTRA_BOOK_ID, book.id)
                putExtra(BookDetailActivity.EXTRA_TITLE, book.title)
                putExtra(BookDetailActivity.EXTRA_AUTHOR, book.author)
                putExtra(BookDetailActivity.EXTRA_ISBN, book.isbn)
                putExtra(BookDetailActivity.EXTRA_GENRE, book.genre)
                putExtra(BookDetailActivity.EXTRA_YEAR, book.publishedYear ?: 0)
                putExtra(BookDetailActivity.EXTRA_TOTAL, book.totalCopies)
                putExtra(BookDetailActivity.EXTRA_AVAIL, book.availableCopies)
                putExtra(BookDetailActivity.EXTRA_SHELF, exactCoords)
                putExtra(BookDetailActivity.EXTRA_DESC, book.description)
            }
            startActivity(intent)
        }
        binding.rvBooks.layoutManager = LinearLayoutManager(this)
        binding.rvBooks.adapter = booksAdapter

        // Borrowed Books Adapter
        borrowedAdapter = BorrowedBooksAdapter()
        binding.rvBorrowedBooks.layoutManager = LinearLayoutManager(this)
        binding.rvBorrowedBooks.adapter = borrowedAdapter

        // Online Reservations Adapter
        reservationsAdapter = ReservationsAdapter()
        binding.rvReservations.layoutManager = LinearLayoutManager(this)
        binding.rvReservations.adapter = reservationsAdapter
    }

    private fun setupListeners() {
        // Main Navigation Tabs
        binding.btnTabCatalog.setOnClickListener { switchTab(0) }
        binding.btnTabBorrowed.setOnClickListener { switchTab(1) }
        binding.btnTabProfile.setOnClickListener { switchTab(2) }

        // Sub-tabs in Loans & Holds
        binding.btnSubLoans.setOnClickListener { switchBorrowedSubTab(0) }
        binding.btnSubReservations.setOnClickListener { switchBorrowedSubTab(1) }

        // Swipe Refresh
        binding.swipeRefreshCatalog.setOnRefreshListener { loadCatalog() }
        binding.swipeRefreshBorrowed.setOnRefreshListener { loadLoansAndReservations() }

        // Category Chips Filter - Instant In-Memory Filter
        binding.chipGroupCategories.setOnCheckedStateChangeListener { group, checkedIds ->
            if (checkedIds.isEmpty()) {
                selectedGenre = null
            } else {
                val chip = group.findViewById<Chip>(checkedIds.first())
                val text = chip?.text?.toString()
                selectedGenre = if (text == "All") null else text
            }
            applyFiltersInstant()
        }

        // Search Input - Instant In-Memory Filter (0ms delay)
        binding.etSearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                applyFiltersInstant()
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        // Available Only Checkbox - Instant In-Memory Filter
        binding.cbAvailableOnly.setOnCheckedChangeListener { _, _ ->
            applyFiltersInstant()
        }

        // Sign Out
        binding.btnLogout.setOnClickListener { performSignOut() }
        binding.btnSignOut.setOnClickListener { performSignOut() }
    }

    private fun switchTab(tabIndex: Int) {
        val activeColor = ContextCompat.getColor(this, R.color.primary)
        val inactiveColor = ContextCompat.getColor(this, R.color.gray_600)

        // Reset tab buttons
        binding.btnTabCatalog.setTextColor(if (tabIndex == 0) activeColor else inactiveColor)
        binding.btnTabBorrowed.setTextColor(if (tabIndex == 1) activeColor else inactiveColor)
        binding.btnTabProfile.setTextColor(if (tabIndex == 2) activeColor else inactiveColor)

        // Toggle layouts
        binding.layoutCatalog.visibility = if (tabIndex == 0) View.VISIBLE else View.GONE
        binding.layoutBorrowed.visibility = if (tabIndex == 1) View.VISIBLE else View.GONE
        binding.layoutProfile.visibility = if (tabIndex == 2) View.VISIBLE else View.GONE

        if (tabIndex == 0) {
            if (cachedBooks.isEmpty()) loadCatalog()
        } else if (tabIndex == 1) {
            loadLoansAndReservations()
        } else if (tabIndex == 2) {
            loadDigitalCard()
        }
    }

    private fun switchBorrowedSubTab(subTabIndex: Int) {
        activeSubTab = subTabIndex
        val primaryColor = ContextCompat.getColor(this, R.color.primary)
        val grayColor = ContextCompat.getColor(this, R.color.gray_700)
        val whiteColor = ContextCompat.getColor(this, R.color.white)

        if (subTabIndex == 0) {
            binding.btnSubLoans.backgroundTintList = ColorStateList.valueOf(primaryColor)
            binding.btnSubLoans.setTextColor(whiteColor)
            binding.btnSubReservations.backgroundTintList = ColorStateList.valueOf(android.graphics.Color.TRANSPARENT)
            binding.btnSubReservations.setTextColor(grayColor)

            binding.rvBorrowedBooks.visibility = View.VISIBLE
            binding.rvReservations.visibility = View.GONE
            binding.tvEmptyBorrowed.visibility = if (cachedLoans.isEmpty()) View.VISIBLE else View.GONE
            binding.tvEmptyReservations.visibility = View.GONE
        } else {
            binding.btnSubReservations.backgroundTintList = ColorStateList.valueOf(primaryColor)
            binding.btnSubReservations.setTextColor(whiteColor)
            binding.btnSubLoans.backgroundTintList = ColorStateList.valueOf(android.graphics.Color.TRANSPARENT)
            binding.btnSubLoans.setTextColor(grayColor)

            binding.rvBorrowedBooks.visibility = View.GONE
            binding.rvReservations.visibility = View.VISIBLE
            binding.tvEmptyBorrowed.visibility = View.GONE
            binding.tvEmptyReservations.visibility = if (cachedReservations.isEmpty()) View.VISIBLE else View.GONE
        }
    }

    private fun applyFiltersInstant() {
        val query = binding.etSearch.text?.toString()?.trim()?.lowercase() ?: ""
        val availableOnly = binding.cbAvailableOnly.isChecked

        val filtered = cachedBooks.filter { book ->
            val matchGenre = selectedGenre == null || book.genre.equals(selectedGenre, ignoreCase = true)
            val matchAvail = !availableOnly || book.availableCopies > 0
            val matchQuery = query.isEmpty() ||
                    book.title.lowercase().contains(query) ||
                    book.author.lowercase().contains(query) ||
                    book.genre.lowercase().contains(query) ||
                    book.isbn.lowercase().contains(query)
            matchGenre && matchAvail && matchQuery
        }

        booksAdapter.submitList(filtered)
        binding.tvEmptyCatalog.visibility = if (filtered.isEmpty()) View.VISIBLE else View.GONE
    }

    private fun loadCatalog() {
        binding.swipeRefreshCatalog.isRefreshing = true

        lifecycleScope.launch(Dispatchers.IO) {
            try {
                val apiService = RetrofitClient.getService(this@MainActivity)
                val response = apiService.getBooks()

                withContext(Dispatchers.Main) {
                    binding.swipeRefreshCatalog.isRefreshing = false
                    if (response.isSuccessful && response.body() != null) {
                        cachedBooks = response.body()!!.books
                        applyFiltersInstant()
                    } else {
                        Toast.makeText(this@MainActivity, "Failed to load catalog", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    binding.swipeRefreshCatalog.isRefreshing = false
                    Toast.makeText(this@MainActivity, "Error: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun loadLoansAndReservations() {
        binding.swipeRefreshBorrowed.isRefreshing = true

        lifecycleScope.launch(Dispatchers.IO) {
            try {
                val apiService = RetrofitClient.getService(this@MainActivity)

                // Parallel async fetching for instant loading speed
                val loansDeferred = async { apiService.getMyBorrowedBooks() }
                val reservationsDeferred = async { apiService.getMyReservations() }

                val loansRes = loansDeferred.await()
                val resRes = reservationsDeferred.await()

                withContext(Dispatchers.Main) {
                    binding.swipeRefreshBorrowed.isRefreshing = false

                    if (loansRes.isSuccessful && loansRes.body() != null) {
                        cachedLoans = loansRes.body()!!.borrowedBooks
                        borrowedAdapter.submitList(cachedLoans)
                        binding.btnSubLoans.text = "Active Loans (${cachedLoans.size})"
                    }

                    if (resRes.isSuccessful && resRes.body() != null) {
                        cachedReservations = resRes.body()!!.reservations
                        reservationsAdapter.submitList(cachedReservations)
                        binding.btnSubReservations.text = "My Reservations (${cachedReservations.size})"
                    }

                    switchBorrowedSubTab(activeSubTab)
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    binding.swipeRefreshBorrowed.isRefreshing = false
                    Toast.makeText(this@MainActivity, "Error updating loans: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun loadDigitalCard() {
        lifecycleScope.launch(Dispatchers.IO) {
            try {
                val apiService = RetrofitClient.getService(this@MainActivity)
                val response = apiService.getDigitalCard()
                if (response.isSuccessful && response.body() != null) {
                    val card = response.body()!!.card
                    withContext(Dispatchers.Main) {
                        binding.tvCardStudentName.text = card.studentName
                        binding.tvCardRegNo.text = "PIN: ${card.studentId}"
                        binding.tvCardDept.text = card.department
                        binding.tvCardValidity.text = "Valid until: ${card.validity}"
                        binding.tvCardStatusBadge.text = card.status.uppercase()

                        // Decode QR base64
                        try {
                            val pureBase64 = card.qrCodeUrl.substringAfter("base64,")
                            val decodedBytes = android.util.Base64.decode(pureBase64, android.util.Base64.DEFAULT)
                            val bitmap = android.graphics.BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
                            binding.ivCardQrCode.setImageBitmap(bitmap)
                        } catch (_: Exception) {}
                    }
                }
            } catch (_: Exception) {}
        }
    }

    private fun performSignOut() {
        sessionManager.logout()
        Toast.makeText(this, "Logged out successfully", Toast.LENGTH_SHORT).show()
        startActivity(Intent(this, LoginActivity::class.java))
        finishAffinity()
    }
}
