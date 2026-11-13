package com.library.studentapp.ui

import android.app.DatePickerDialog
import android.content.res.ColorStateList
import android.os.Bundle
import android.view.View
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.google.gson.Gson
import com.library.studentapp.R
import com.library.studentapp.data.ApiError
import com.library.studentapp.data.CreateReservationRequest
import com.library.studentapp.data.JoinWaitingListRequest
import com.library.studentapp.data.RetrofitClient
import com.library.studentapp.databinding.ActivityBookDetailBinding
import com.library.studentapp.databinding.DialogReserveBookBinding
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

        val dialogBinding = DialogReserveBookBinding.inflate(layoutInflater)
        dialogBinding.tvDialogBookTitle.text = title
        dialogBinding.tvDialogShelfCoords.text = "📍 $shelf"

        val cal = Calendar.getInstance()
        cal.add(Calendar.DAY_OF_YEAR, 1)
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.US)
        var selectedDate = sdf.format(cal.time)
        dialogBinding.etPickupDate.setText(selectedDate)

        dialogBinding.etPickupDate.setOnClickListener {
            val datePicker = DatePickerDialog(
                this,
                { _, year, month, dayOfMonth ->
                    cal.set(year, month, dayOfMonth)
                    selectedDate = sdf.format(cal.time)
                    dialogBinding.etPickupDate.setText(selectedDate)
                },
                cal.get(Calendar.YEAR),
                cal.get(Calendar.MONTH),
                cal.get(Calendar.DAY_OF_MONTH)
            )
            datePicker.datePicker.minDate = System.currentTimeMillis()
            datePicker.show()
        }

        val timeslots = arrayOf(
            "Morning Slot (10:00 AM - 12:00 PM)",
            "Midday Slot (12:00 PM - 02:00 PM)",
            "Afternoon Slot (02:00 PM - 04:00 PM)",
            "Evening Slot (04:00 PM - 05:30 PM)"
        )
        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, timeslots)
        dialogBinding.spnTimeslot.adapter = adapter
        dialogBinding.spnTimeslot.setSelection(0)

        val dialog = AlertDialog.Builder(this)
            .setView(dialogBinding.root)
            .create()

        dialogBinding.btnDialogCancel.setOnClickListener {
            dialog.dismiss()
        }

        dialogBinding.btnDialogConfirm.setOnClickListener {
            val chosenDate = dialogBinding.etPickupDate.text?.toString()?.trim() ?: selectedDate
            val chosenSlot = dialogBinding.spnTimeslot.selectedItem?.toString() ?: timeslots[0]
            val notes = dialogBinding.etNotes.text?.toString()?.trim()

            if (chosenDate.isEmpty()) {
                Toast.makeText(this, "Please select a collection date", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            dialog.dismiss()
            executeReservation(bookId, chosenDate, chosenSlot, notes)
        }

        dialog.show()
    }

    private fun executeReservation(bookId: Int, preferredDate: String, timeslot: String, notes: String?) {
        binding.pbReserve.visibility = View.VISIBLE
        binding.btnReserveBook.isEnabled = false

        lifecycleScope.launch(Dispatchers.IO) {
            try {
                val apiService = RetrofitClient.getService(this@BookDetailActivity)
                val request = CreateReservationRequest(
                    bookId = bookId,
                    preferredDate = preferredDate,
                    timeslot = timeslot,
                    notes = if (!notes.isNullOrEmpty()) notes else "Mobile App Reservation"
                )
                val response = apiService.createReservation(request)

                withContext(Dispatchers.Main) {
                    binding.pbReserve.visibility = View.GONE
                    if (response.isSuccessful && response.body() != null) {
                        val body = response.body()!!
                        val res = body.reservation
                        val resCode = res.reservationCode

                        binding.layoutReservationStatus.visibility = View.VISIBLE
                        binding.tvReservationCode.text = "Reservation Confirmed: $resCode"
                        binding.tvReservationDetails.text = "Status: Ready for Collection on ${res.preferredDate} (${res.timeslot}). Present your PIN at the desk."
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
                val request = JoinWaitingListRequest(
                    bookId = bookId,
                    notes = "Queued via Mobile App"
                )
                val response = apiService.joinWaitingList(request)

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
