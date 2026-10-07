package com.library.studentapp.data

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
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

    // Students can only VIEW their own borrowed books.
    // Adding/issuing borrowed records is strictly available only to the admin/librarian.
    @GET("api/borrow/my-books")
    suspend fun getMyBorrowedBooks(): Response<BorrowedResponse>
}
