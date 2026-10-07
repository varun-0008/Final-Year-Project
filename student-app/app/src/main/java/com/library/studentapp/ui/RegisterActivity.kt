package com.library.studentapp.ui

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.google.gson.Gson
import com.library.studentapp.data.ApiError
import com.library.studentapp.data.RegisterRequest
import com.library.studentapp.data.RetrofitClient
import com.library.studentapp.data.SessionManager
import com.library.studentapp.databinding.ActivityRegisterBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class RegisterActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRegisterBinding
    private lateinit var sessionManager: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRegisterBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)

        binding.btnRegister.setOnClickListener {
            performRegistration()
        }

        binding.tvLoginPrompt.setOnClickListener {
            finish()
        }
    }

    private fun performRegistration() {
        val name = binding.etName.text.toString().trim()
        val email = binding.etEmail.text.toString().trim()
        val studentId = binding.etStudentId.text.toString().trim()
        val dept = binding.etDept.text.toString().trim()
        val phone = binding.etPhone.text.toString().trim()
        val password = binding.etPassword.text.toString()

        if (name.isEmpty() || email.isEmpty() || studentId.isEmpty() || password.isEmpty()) {
            Toast.makeText(this, "Please fill in all required fields", Toast.LENGTH_SHORT).show()
            return
        }

        binding.progressBar.visibility = View.VISIBLE
        binding.btnRegister.isEnabled = false

        lifecycleScope.launch(Dispatchers.IO) {
            try {
                val apiService = RetrofitClient.getService(this@RegisterActivity)
                val req = RegisterRequest(
                    name = name,
                    email = email,
                    studentId = studentId,
                    password = password,
                    department = if (dept.isNotEmpty()) dept else null,
                    phone = if (phone.isNotEmpty()) phone else null
                )
                val response = apiService.register(req)

                withContext(Dispatchers.Main) {
                    binding.progressBar.visibility = View.GONE
                    binding.btnRegister.isEnabled = true

                    if (response.isSuccessful && response.body() != null) {
                        val body = response.body()!!
                        sessionManager.saveAuthToken(body.token)
                        sessionManager.saveUser(body.user)

                        Toast.makeText(
                            this@RegisterActivity,
                            "Registration successful!",
                            Toast.LENGTH_SHORT
                        ).show()

                        startActivity(Intent(this@RegisterActivity, MainActivity::class.java))
                        finishAffinity()
                    } else {
                        val errorJson = response.errorBody()?.string()
                        val errorMsg = try {
                            Gson().fromJson(errorJson, ApiError::class.java)?.error
                        } catch (e: Exception) {
                            null
                        } ?: "Registration failed (${response.code()})"

                        Toast.makeText(this@RegisterActivity, errorMsg, Toast.LENGTH_LONG).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    binding.progressBar.visibility = View.GONE
                    binding.btnRegister.isEnabled = true
                    Toast.makeText(
                        this@RegisterActivity,
                        "Connection error: ${e.localizedMessage ?: "Could not reach server"}",
                        Toast.LENGTH_LONG
                    ).show()
                }
            }
        }
    }
}
