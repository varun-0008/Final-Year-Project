package com.library.studentapp.data

import com.google.gson.annotations.SerializedName

data class User(
    val id: Int,
    val name: String,
    val email: String,
    @SerializedName("student_id") val studentId: String?,
    val role: String,
    val department: String?,
    val phone: String?
)

data class Book(
    val id: Int,
    val isbn: String,
    val title: String,
    val author: String,
    val genre: String,
    @SerializedName("published_year") val publishedYear: Int?,
    @SerializedName("total_copies") val totalCopies: Int,
    @SerializedName("available_copies") val availableCopies: Int,
    @SerializedName("shelf_location") val shelfLocation: String,
    val description: String?,
    @SerializedName("cover_url") val coverUrl: String? = null
)

data class BorrowRecord(
    @SerializedName("borrow_id") val borrowId: Int,
    @SerializedName("book_id") val bookId: Int,
    val title: String,
    val author: String,
    val isbn: String,
    val genre: String,
    @SerializedName("shelf_location") val shelfLocation: String,
    @SerializedName("borrow_date") val borrowDate: String,
    @SerializedName("due_date") val dueDate: String,
    @SerializedName("return_date") val returnDate: String?,
    val status: String,
    @SerializedName("computed_status") val computedStatus: String?,
    @SerializedName("fine_amount") val fineAmount: Double,
    @SerializedName("days_overdue") val daysOverdue: Int,
    @SerializedName("days_remaining") val daysRemaining: Int,
    val notes: String?
)

data class LoginRequest(
    val identifier: String,
    val password: String
)

data class LoginResponse(
    val message: String,
    val token: String,
    val user: User
)

data class RegisterRequest(
    val name: String,
    val email: String,
    @SerializedName("student_id") val studentId: String,
    val password: String,
    val department: String?,
    val phone: String?
)

data class RegisterResponse(
    val message: String,
    val token: String,
    val user: User
)

data class BooksResponse(
    val books: List<Book>
)

data class BorrowedResponse(
    val borrowedBooks: List<BorrowRecord>
)

data class ApiError(
    val error: String?
)
