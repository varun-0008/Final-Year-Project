package com.library.studentapp.data

import android.content.Context
import android.content.SharedPreferences
import com.google.gson.Gson

class SessionManager(context: Context) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
    private val gson = Gson()

    companion object {
        private const val PREF_NAME = "library_student_session"
        private const val KEY_TOKEN = "auth_token"
        private const val KEY_USER = "user_profile"
        private const val KEY_BASE_URL = "base_url"

        // Default: 10.0.2.2 for Android Emulator, or localhost
        const val DEFAULT_BASE_URL = "http://10.0.2.2:5000/"
    }

    fun saveAuthToken(token: String) {
        prefs.edit().putString(KEY_TOKEN, token).apply()
    }

    fun getAuthToken(): String? {
        return prefs.getString(KEY_TOKEN, null)
    }

    fun saveUser(user: User) {
        val userJson = gson.toJson(user)
        prefs.edit().putString(KEY_USER, userJson).apply()
    }

    fun getUser(): User? {
        val userJson = prefs.getString(KEY_USER, null) ?: return null
        return try {
            gson.fromJson(userJson, User::class.java)
        } catch (e: Exception) {
            null
        }
    }

    fun saveBaseUrl(url: String) {
        val formatted = if (!url.endsWith("/")) "$url/" else url
        prefs.edit().putString(KEY_BASE_URL, formatted).apply()
    }

    fun getBaseUrl(): String {
        return prefs.getString(KEY_BASE_URL, DEFAULT_BASE_URL) ?: DEFAULT_BASE_URL
    }

    fun isLoggedIn(): Boolean {
        return getAuthToken() != null
    }

    fun logout() {
        prefs.edit().remove(KEY_TOKEN).remove(KEY_USER).apply()
    }
}
