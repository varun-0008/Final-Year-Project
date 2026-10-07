package com.library.studentapp.ui

import android.content.Intent
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
import com.library.studentapp.data.RetrofitClient
import com.library.studentapp.data.SessionManager
import com.library.studentapp.databinding.ActivityMainBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var sessionManager: SessionManager

    private lateinit var booksAdapter: BooksAdapter
    private lateinit var borrowedAdapter: BorrowedBooksAdapter

    private var searchJob: Job? = null
    private var selectedGenre: String? = null

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

        // Initial load
        loadCatalog()
    }

    private fun setupUI() {
        val user = sessionManager.getUser()
        val studentName = user?.name ?: "Student"
        binding.tvStudentGreeting.text = "Hello, $studentName"

        // Setup Profile info
        binding.tvProfileName.text = studentName
        binding.tvProfileStudentId.text = "ID: ${user?.studentId ?: "N/A"}"
        binding.tvProfileEmail.text = user?.email ?: "N/A"
        binding.tvProfileDept.text = user?.department ?: "Not Specified"
        binding.tvProfilePhone.text = user?.phone ?: "Not Specified"
    }

    private fun setupRecyclerViews() {
        // Books Catalog Adapter
        booksAdapter = BooksAdapter { book ->
            val intent = Intent(this, BookDetailActivity::class.java).apply {
                putExtra(BookDetailActivity.EXTRA_TITLE, book.title)
                putExtra(BookDetailActivity.EXTRA_AUTHOR, book.author)
                putExtra(BookDetailActivity.EXTRA_ISBN, book.isbn)
                putExtra(BookDetailActivity.EXTRA_GENRE, book.genre)
                putExtra(BookDetailActivity.EXTRA_YEAR, book.publishedYear ?: 0)
                putExtra(BookDetailActivity.EXTRA_TOTAL, book.totalCopies)
                putExtra(BookDetailActivity.EXTRA_AVAIL, book.availableCopies)
                putExtra(BookDetailActivity.EXTRA_SHELF, book.shelfLocation)
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
    }

    private fun setupListeners() {
        // Navigation Tabs
        binding.btnTabCatalog.setOnClickListener { switchTab(0) }
        binding.btnTabBorrowed.setOnClickListener { switchTab(1) }
        binding.btnTabProfile.setOnClickListener { switchTab(2) }

        // Swipe Refresh
        binding.swipeRefreshCatalog.setOnRefreshListener { loadCatalog() }
        binding.swipeRefreshBorrowed.setOnRefreshListener { loadBorrowedBooks() }

        // Category Chips Filter
        binding.chipGroupCategories.setOnCheckedStateChangeListener { group, checkedIds ->
            if (checkedIds.isEmpty()) {
                selectedGenre = null
            } else {
                val chip = group.findViewById<Chip>(checkedIds.first())
                val text = chip?.text?.toString()
                selectedGenre = if (text == "All") null else text
            }
            loadCatalog()
        }

        // Search Input
        binding.etSearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                searchJob?.cancel()
                searchJob = lifecycleScope.launch {
                    delay(250)
                    loadCatalog()
                }
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        // Available Only Checkbox
        binding.cbAvailableOnly.setOnCheckedChangeListener { _, _ ->
            loadCatalog()
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
            loadCatalog()
        } else if (tabIndex == 1) {
            loadBorrowedBooks()
        }
    }

    private fun loadCatalog() {
        binding.swipeRefreshCatalog.isRefreshing = true
        val query = binding.etSearch.text?.toString()?.trim()
        val availableOnly = binding.cbAvailableOnly.isChecked

        lifecycleScope.launch(Dispatchers.IO) {
            try {
                val apiService = RetrofitClient.getService(this@MainActivity)
                val response = apiService.getBooks(
                    search = if (!query.isNullOrEmpty()) query else null,
                    genre = selectedGenre,
                    availableOnly = if (availableOnly) true else null
                )

                withContext(Dispatchers.Main) {
                    binding.swipeRefreshCatalog.isRefreshing = false
                    if (response.isSuccessful && response.body() != null) {
                        val books = response.body()!!.books
                        booksAdapter.submitList(books)
                        binding.tvEmptyCatalog.visibility = if (books.isEmpty()) View.VISIBLE else View.GONE
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

    private fun loadBorrowedBooks() {
        binding.swipeRefreshBorrowed.isRefreshing = true

        lifecycleScope.launch(Dispatchers.IO) {
            try {
                val apiService = RetrofitClient.getService(this@MainActivity)
                val response = apiService.getMyBorrowedBooks()

                withContext(Dispatchers.Main) {
                    binding.swipeRefreshBorrowed.isRefreshing = false
                    if (response.isSuccessful && response.body() != null) {
                        val list = response.body()!!.borrowedBooks
                        borrowedAdapter.submitList(list)
                        binding.tvEmptyBorrowed.visibility = if (list.isEmpty()) View.VISIBLE else View.GONE
                    } else {
                        Toast.makeText(this@MainActivity, "Failed to load borrowed books", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    binding.swipeRefreshBorrowed.isRefreshing = false
                    Toast.makeText(this@MainActivity, "Error: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun performSignOut() {
        sessionManager.logout()
        Toast.makeText(this, "Logged out successfully", Toast.LENGTH_SHORT).show()
        startActivity(Intent(this, LoginActivity::class.java))
        finishAffinity()
    }
}
