package com.library.studentapp.data

import android.content.Context
import okhttp3.ConnectionPool
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {
    private var retrofit: Retrofit? = null
    private var lastBaseUrl: String? = null
    private val connectionPool = ConnectionPool(10, 5, TimeUnit.MINUTES)

    fun getService(context: Context): ApiService {
        val sessionManager = SessionManager(context)
        val baseUrl = sessionManager.getBaseUrl()

        if (retrofit == null || lastBaseUrl != baseUrl) {
            lastBaseUrl = baseUrl

            val loggingInterceptor = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BASIC
            }

            val authInterceptor = Interceptor { chain ->
                val requestBuilder = chain.request().newBuilder()
                sessionManager.getAuthToken()?.let { token ->
                    requestBuilder.addHeader("Authorization", "Bearer $token")
                }
                chain.proceed(requestBuilder.build())
            }

            val okHttpClient = OkHttpClient.Builder()
                .connectionPool(connectionPool)
                .connectTimeout(10, TimeUnit.SECONDS)
                .readTimeout(10, TimeUnit.SECONDS)
                .writeTimeout(10, TimeUnit.SECONDS)
                .retryOnConnectionFailure(true)
                .addInterceptor(authInterceptor)
                .addInterceptor(loggingInterceptor)
                .build()

            retrofit = Retrofit.Builder()
                .baseUrl(baseUrl)
                .client(okHttpClient)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
        }

        return retrofit!!.create(ApiService::class.java)
    }
}
