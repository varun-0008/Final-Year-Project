package com.library.studentapp.ui

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.google.gson.Gson
import com.library.studentapp.data.ApiError
import com.library.studentapp.data.LoginRequest
import com.library.studentapp.data.RetrofitClient
import com.library.studentapp.data.SessionManager
import com.library.studentapp.databinding.ActivityLoginBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding
    private lateinit var sessionManager: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        sessionManager = SessionManager(this)

        // If already logged in, navigate directly to MainActivity
        if (sessionManager.isLoggedIn()) {
            startActivity(Intent(this, MainActivity::class.java))
            finish()
            return
        }

        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.etServerUrl.setText(sessionManager.getBaseUrl())

        binding.btnLogin.setOnClickListener {
            performLogin()
        }

        binding.tvRegisterPrompt.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }
    }

    private fun performLogin() {
        val serverUrl = binding.etServerUrl.text.toString().trim()
        val identifier = binding.etIdentifier.text.toString().trim()
        val password = binding.etPassword.text.toString()

        if (serverUrl.isNotEmpty()) {
            sessionManager.saveBaseUrl(serverUrl)
        }

        if (identifier.isEmpty() || password.isEmpty()) {
            Toast.makeText(this, "Please enter your ID/Email and password", Toast.LENGTH_SHORT).show()
            return
        }

        binding.progressBar.visibility = View.VISIBLE
        binding.btnLogin.isEnabled = false

        lifecycleScope.launch(Dispatchers.IO) {
            try {
                val apiService = RetrofitClient.getService(this@LoginActivity)
                val response = apiService.login(LoginRequest(identifier, password))

                withContext(Dispatchers.Main) {
                    binding.progressBar.visibility = View.GONE
                    binding.btnLogin.isEnabled = true

                    if (response.isSuccessful && response.body() != null) {
                        val loginBody = response.body()!!
                        sessionManager.saveAuthToken(loginBody.token)
                        sessionManager.saveUser(loginBody.user)

                        Toast.makeText(
                            this@LoginActivity,
                            "Welcome, ${loginBody.user.name}!",
                            Toast.LENGTH_SHORT
                        ).show()

                        startActivity(Intent(this@LoginActivity, MainActivity::class.java))
                        finish()
                    } else {
                        val errorJson = response.errorBody()?.string()
                        val errorMsg = try {
                            Gson().fromJson(errorJson, ApiError::class.java)?.error
                        } catch (e: Exception) {
                            null
                        } ?: "Login failed (${response.code()})"

                        Toast.makeText(this@LoginActivity, errorMsg, Toast.LENGTH_LONG).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    binding.progressBar.visibility = View.GONE
                    binding.btnLogin.isEnabled = true
                    Toast.makeText(
                        this@LoginActivity,
                        "Connection error: ${e.localizedMessage ?: "Could not reach server"}",
                        Toast.LENGTH_LONG
                    ).show()
                }
            }
        }
    }
}
