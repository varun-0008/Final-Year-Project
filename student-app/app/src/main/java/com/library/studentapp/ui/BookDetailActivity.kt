package com.library.studentapp.ui

import android.content.res.ColorStateList
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.google.gson.Gson
import com.library.studentapp.R
import com.library.studentapp.data.ApiError
import com.library.studentapp.data.RetrofitClient
import com.library.studentapp.databinding.ActivityBookDetailBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

class BookDetailActivity : AppCompatActivity() {

    private lateinit var binding: ActivityBookDetailBinding

    companion object {
        const val EXTRA_BOOK_ID = "extra_book_id"
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

        val bookId = intent.getIntExtra(EXTRA_BOOK_ID, -1)
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
            binding.tvReserveHeading.text = "Reserve Book for Pickup"
            binding.tvReserveSubheading.text = "Hold this book in advance. The circulation counter will prepare your copy for counter collection."
            binding.btnReserveBook.apply {
                text = "Reserve Book for Pickup"
                backgroundTintList = ColorStateList.valueOf(ContextCompat.getColor(this@BookDetailActivity, R.color.primary))
                setOnClickListener {
                    confirmReservation(bookId, title, shelf)
                }
            }
        } else {
            binding.tvDetailAvailability.apply {
                text = "Out of Stock (0 of $total copies available)"
                setTextColor(ContextCompat.getColor(this@BookDetailActivity, R.color.danger))
            }
            binding.tvReserveHeading.text = "Smart Waiting List"
            binding.tvReserveSubheading.text = "All copies are currently borrowed. Join the automated priority queue to get first access when returned."
            binding.btnReserveBook.apply {
                text = "Join Smart Waiting List"
                backgroundTintList = ColorStateList.valueOf(ContextCompat.getColor(this@BookDetailActivity, R.color.secondary))
                setOnClickListener {
                    joinWaitingList(bookId, title)
                }
            }
        }
    }

    private fun confirmReservation(bookId: Int, title: String, shelf: String) {
        if (bookId <= 0) {
            Toast.makeText(this, "Invalid book reference", Toast.LENGTH_SHORT).show()
            return
        }

        val cal = Calendar.getInstance()
        cal.add(Calendar.DAY_OF_YEAR, 1)
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.US)
        val preferredDate = sdf.format(cal.time)
        val timeslot = "Morning (10:00 AM - 1:00 PM)"

        AlertDialog.Builder(this)
            .setTitle("Confirm Book Reservation")
            .setMessage("Would you like to reserve \"$title\"?\n\n• Target Collection Date: $preferredDate\n• Timeslot: $timeslot\n• Location: $shelf\n\nShow your Student PIN at the circulation desk to collect.")
            .setPositiveButton("Confirm Reservation") { _, _ ->
                executeReservation(bookId, preferredDate, timeslot)
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun executeReservation(bookId: Int, preferredDate: String, timeslot: String) {
        binding.pbReserve.visibility = View.VISIBLE
        binding.btnReserveBook.isEnabled = false

        lifecycleScope.launch(Dispatchers.IO) {
            try {
                val apiService = RetrofitClient.getService(this@BookDetailActivity)
                val payload = mapOf(
                    "book_id" to bookId,
                    "preferred_date" to preferredDate,
                    "timeslot" to timeslot,
                    "notes" to "Mobile Application Reservation"
                )
                val response = apiService.createReservation(payload)

                withContext(Dispatchers.Main) {
                    binding.pbReserve.visibility = View.GONE
                    if (response.isSuccessful && response.body() != null) {
                        val body = response.body()!!
                        val resMap = body["reservation"] as? Map<*, *>
                        val resCode = resMap?.get("reservation_code")?.toString() ?: "RES-ACTIVE"

                        binding.layoutReservationStatus.visibility = View.VISIBLE
                        binding.tvReservationCode.text = "Reservation Confirmed: $resCode"
                        binding.tvReservationDetails.text = "Status: Pending Counter Collection on $preferredDate ($timeslot). Present your PIN at the desk."
                        binding.btnReserveBook.isEnabled = false
                        binding.btnReserveBook.text = "Reservation Active ($resCode)"

                        Toast.makeText(this@BookDetailActivity, "Reservation confirmed! Code: $resCode", Toast.LENGTH_LONG).show()
                    } else {
                        binding.btnReserveBook.isEnabled = true
                        val errJson = response.errorBody()?.string()
                        val msg = try {
                            Gson().fromJson(errJson, ApiError::class.java)?.error
                        } catch (_: Exception) {
                            null
                        } ?: "Reservation could not be placed (${response.code()})"
                        Toast.makeText(this@BookDetailActivity, msg, Toast.LENGTH_LONG).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    binding.pbReserve.visibility = View.GONE
                    binding.btnReserveBook.isEnabled = true
                    Toast.makeText(this@BookDetailActivity, "Connection error: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun joinWaitingList(bookId: Int, title: String) {
        if (bookId <= 0) {
            Toast.makeText(this, "Invalid book reference", Toast.LENGTH_SHORT).show()
            return
        }

        binding.pbReserve.visibility = View.VISIBLE
        binding.btnReserveBook.isEnabled = false

        lifecycleScope.launch(Dispatchers.IO) {
            try {
                val apiService = RetrofitClient.getService(this@BookDetailActivity)
                val payload = mapOf(
                    "book_id" to bookId,
                    "notes" to "Queued via Mobile App"
                )
                val response = apiService.joinWaitingList(payload)

                withContext(Dispatchers.Main) {
                    binding.pbReserve.visibility = View.GONE
                    if (response.isSuccessful) {
                        binding.layoutReservationStatus.visibility = View.VISIBLE
                        binding.tvReservationCode.text = "Smart Waiting List Active"
                        binding.tvReservationDetails.text = "You are in the priority queue for \"$title\". You will be notified the instant a copy is returned."
                        binding.btnReserveBook.isEnabled = false
                        binding.btnReserveBook.text = "Queued on Waiting List"

                        Toast.makeText(this@BookDetailActivity, "Joined Smart Waiting List!", Toast.LENGTH_SHORT).show()
                    } else {
                        binding.btnReserveBook.isEnabled = true
                        val errJson = response.errorBody()?.string()
                        val msg = try {
                            Gson().fromJson(errJson, ApiError::class.java)?.error
                        } catch (_: Exception) {
                            null
                        } ?: "Could not join waiting list"
                        Toast.makeText(this@BookDetailActivity, msg, Toast.LENGTH_LONG).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    binding.pbReserve.visibility = View.GONE
                    binding.btnReserveBook.isEnabled = true
                    Toast.makeText(this@BookDetailActivity, "Error: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }
}
