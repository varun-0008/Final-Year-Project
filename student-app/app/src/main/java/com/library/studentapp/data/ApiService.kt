package com.library.studentapp.data

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface ApiService {

    @POST("api/auth/login")
    suspend fun login(
        @Body request: LoginRequest
    ): Response<LoginResponse>

    @POST("api/auth/register")
    suspend fun register(
        @Body request: RegisterRequest
    ): Response<RegisterResponse>

    @GET("api/auth/student-card")
    suspend fun getDigitalCard(): Response<DigitalCardResponse>

    @GET("api/books")
    suspend fun getBooks(
        @Query("search") search: String? = null,
        @Query("genre") genre: String? = null,
        @Query("availableOnly") availableOnly: Boolean? = null
    ): Response<BooksResponse>

    @GET("api/books/{id}")
    suspend fun getBookById(
        @Path("id") id: Int
    ): Response<Map<String, Book>>

    @GET("api/borrow/my-books")
    suspend fun getMyBorrowedBooks(): Response<BorrowedResponse>

    @GET("api/reservations/my")
    suspend fun getMyReservations(): Response<ReservationsResponse>

    @POST("api/reservations")
    suspend fun createReservation(
        @Body request: CreateReservationRequest
    ): Response<CreateReservationResponse>

    @POST("api/waiting-list/join")
    suspend fun joinWaitingList(
        @Body request: JoinWaitingListRequest
    ): Response<CommonApiResponse>

    @GET("api/notifications/my")
    suspend fun getMyNotifications(): Response<NotificationsResponse>

    @PATCH("api/notifications/read-all")
    suspend fun markAllNotificationsRead(): Response<Map<String, String>>
}
