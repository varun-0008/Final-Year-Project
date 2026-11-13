package com.library.studentapp.data

import com.google.gson.annotations.SerializedName

data class User(
    val id: Int,
    val name: String,
    val email: String,
    @SerializedName("student_id") val studentId: String?,
    val role: String,
    val department: String?,
    val course: String? = null,
    val semester: String? = null,
    @SerializedName("membership_id") val membershipId: String? = null,
    @SerializedName("membership_valid_until") val membershipValidUntil: String? = null,
    @SerializedName("borrow_limit") val borrowLimit: Int? = 3,
    @SerializedName("photo_url") val photoUrl: String? = null,
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
    val block: String? = "A",
    val floor: Int? = 2,
    val section: String? = "Computer Science",
    val rack: String? = "Rack 08",
    val shelf: String? = "Shelf 03",
    @SerializedName("waiting_count") val waitingCount: Int? = 0,
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
    val block: String? = "A",
    val floor: Int? = 2,
    val rack: String? = "Rack 08",
    val shelf: String? = "Shelf 03",
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

data class DigitalCard(
    val institution: String,
    val board: String,
    val motto: String,
    @SerializedName("student_name") val studentName: String,
    @SerializedName("student_id") val studentId: String,
    val department: String,
    val course: String,
    val semester: String,
    @SerializedName("membership_id") val membershipId: String,
    val validity: String,
    val status: String,
    @SerializedName("borrow_limit") val borrowLimit: Int,
    @SerializedName("active_loans") val activeLoans: Int,
    @SerializedName("remaining_slots") val remainingSlots: Int,
    @SerializedName("photo_url") val photoUrl: String?,
    @SerializedName("qr_data") val qrData: String,
    @SerializedName("qr_code_url") val qrCodeUrl: String
)

data class DigitalCardResponse(
    val card: DigitalCard
)

data class Reservation(
    val id: Int,
    @SerializedName("reservation_code") val reservationCode: String,
    @SerializedName("book_id") val bookId: Int,
    @SerializedName("book_title") val bookTitle: String,
    @SerializedName("book_author") val bookAuthor: String?,
    @SerializedName("preferred_date") val preferredDate: String,
    val timeslot: String,
    val status: String,
    val block: String? = "A",
    val floor: Int? = 2,
    val rack: String? = "Rack 08",
    val shelf: String? = "Shelf 03"
)

data class ReservationsResponse(
    val reservations: List<Reservation>
)

data class NotificationItem(
    val id: Int,
    val title: String,
    val message: String,
    val type: String,
    @SerializedName("is_read") val isRead: Boolean,
    @SerializedName("created_at") val createdAt: String
)

data class NotificationsResponse(
    val notifications: List<NotificationItem>,
    @SerializedName("unread_count") val unreadCount: Int
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
    val course: String? = null,
    val semester: String? = null,
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

data class CreateReservationRequest(
    @SerializedName("book_id") val bookId: Int,
    @SerializedName("preferred_date") val preferredDate: String,
    val timeslot: String,
    val notes: String? = null
)

data class CreateReservationResponse(
    val message: String,
    val reservation: Reservation
)

data class JoinWaitingListRequest(
    @SerializedName("book_id") val bookId: Int,
    val notes: String? = null
)

data class CommonApiResponse(
    val message: String? = null,
    val error: String? = null
)

data class ApiError(
    val error: String?
)
