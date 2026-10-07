package com.library.studentapp.ui

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.library.studentapp.R
import com.library.studentapp.databinding.ActivityBookDetailBinding

class BookDetailActivity : AppCompatActivity() {

    private lateinit var binding: ActivityBookDetailBinding

    companion object {
        const val EXTRA_TITLE = "extra_title"
        const val EXTRA_AUTHOR = "extra_author"
        const val EXTRA_ISBN = "extra_isbn"
        const val EXTRA_GENRE = "extra_genre"
        const val EXTRA_YEAR = "extra_year"
        const val EXTRA_TOTAL = "extra_total"
        const val EXTRA_AVAIL = "extra_avail"
        const val EXTRA_SHELF = "extra_shelf"
        const val EXTRA_DESC = "extra_desc"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityBookDetailBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnBack.setOnClickListener {
            finish()
        }

        val title = intent.getStringExtra(EXTRA_TITLE) ?: "Book Title"
        val author = intent.getStringExtra(EXTRA_AUTHOR) ?: "Author"
        val isbn = intent.getStringExtra(EXTRA_ISBN) ?: "-"
        val genre = intent.getStringExtra(EXTRA_GENRE) ?: "General"
        val year = intent.getIntExtra(EXTRA_YEAR, 0)
        val total = intent.getIntExtra(EXTRA_TOTAL, 1)
        val avail = intent.getIntExtra(EXTRA_AVAIL, 0)
        val shelf = intent.getStringExtra(EXTRA_SHELF) ?: "-"
        val desc = intent.getStringExtra(EXTRA_DESC) ?: "No description available for this title."

        binding.tvDetailTitle.text = title
        binding.tvDetailAuthor.text = if (year > 0) "By $author ($year)" else "By $author"
        binding.tvDetailGenre.text = genre
        binding.tvDetailIsbn.text = isbn
        binding.tvDetailShelf.text = shelf
        binding.tvDetailDescription.text = desc

        if (avail > 0) {
            binding.tvDetailAvailability.apply {
                text = "$avail of $total copies available"
                setTextColor(ContextCompat.getColor(this@BookDetailActivity, R.color.success))
            }
        } else {
            binding.tvDetailAvailability.apply {
                text = "Out of Stock (0 of $total copies available)"
                setTextColor(ContextCompat.getColor(this@BookDetailActivity, R.color.danger))
            }
        }
    }
}
