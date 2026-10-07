package com.library.studentapp.ui

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.library.studentapp.R
import com.library.studentapp.data.Book
import com.library.studentapp.databinding.ItemBookBinding

class BooksAdapter(
    private val onBookClicked: (Book) -> Unit
) : RecyclerView.Adapter<BooksAdapter.BookViewHolder>() {

    private val books = mutableListOf<Book>()

    fun submitList(newBooks: List<Book>) {
        books.clear()
        books.addAll(newBooks)
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): BookViewHolder {
        val binding = ItemBookBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return BookViewHolder(binding)
    }

    override fun onBindViewHolder(holder: BookViewHolder, position: Int) {
        holder.bind(books[position])
    }

    override fun getItemCount(): Int = books.size

    inner class BookViewHolder(private val binding: ItemBookBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(book: Book) {
            val context = binding.root.context

            binding.tvBookTitle.text = book.title
            val authorText = if (book.publishedYear != null) {
                "By ${book.author} (${book.publishedYear})"
            } else {
                "By ${book.author}"
            }
            binding.tvBookAuthor.text = authorText
            binding.tvBookGenre.text = book.genre
            binding.tvShelfLocation.text = "📍 ${book.shelfLocation}"
            binding.tvIsbn.text = "ISBN: ${book.isbn}"

            if (book.availableCopies > 0) {
                binding.tvAvailabilityBadge.apply {
                    text = "${book.availableCopies} / ${book.totalCopies} available"
                    setTextColor(ContextCompat.getColor(context, R.color.success))
                    background = ContextCompat.getDrawable(context, R.drawable.bg_badge_available)
                }
            } else {
                binding.tvAvailabilityBadge.apply {
                    text = "Out of Stock (0 / ${book.totalCopies})"
                    setTextColor(ContextCompat.getColor(context, R.color.danger))
                    background = ContextCompat.getDrawable(context, R.drawable.bg_badge_out_of_stock)
                }
            }

            binding.root.setOnClickListener {
                onBookClicked(book)
            }
        }
    }
}
