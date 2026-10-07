package com.library.studentapp.ui

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.library.studentapp.R
import com.library.studentapp.data.BorrowRecord
import com.library.studentapp.databinding.ItemBorrowedBookBinding

class BorrowedBooksAdapter : RecyclerView.Adapter<BorrowedBooksAdapter.BorrowViewHolder>() {

    private val borrowedList = mutableListOf<BorrowRecord>()

    fun submitList(newList: List<BorrowRecord>) {
        borrowedList.clear()
        borrowedList.addAll(newList)
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): BorrowViewHolder {
        val binding = ItemBorrowedBookBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return BorrowViewHolder(binding)
    }

    override fun onBindViewHolder(holder: BorrowViewHolder, position: Int) {
        holder.bind(borrowedList[position])
    }

    override fun getItemCount(): Int = borrowedList.size

    inner class BorrowViewHolder(private val binding: ItemBorrowedBookBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(record: BorrowRecord) {
            val context = binding.root.context

            binding.tvBorrowedTitle.text = record.title
            binding.tvBorrowedAuthor.text = "By ${record.author}"
            binding.tvBorrowDate.text = "Borrowed: ${record.borrowDate}"
            binding.tvDueDate.text = "Due Date: ${record.dueDate}"
            binding.tvShelfInfo.text = "Return to: ${record.shelfLocation}"

            val isOverdue = record.computedStatus == "overdue" || record.daysOverdue > 0
            val isReturned = record.status == "returned"

            if (isReturned) {
                binding.tvStatusBadge.apply {
                    text = "RETURNED"
                    setTextColor(ContextCompat.getColor(context, R.color.success))
                    background = ContextCompat.getDrawable(context, R.drawable.bg_badge_available)
                }
                binding.tvDueCountdown.apply {
                    text = "Completed"
                    setTextColor(ContextCompat.getColor(context, R.color.gray_600))
                    background = ContextCompat.getDrawable(context, R.drawable.bg_badge_active)
                }
            } else if (isOverdue) {
                binding.tvStatusBadge.apply {
                    text = "OVERDUE"
                    setTextColor(ContextCompat.getColor(context, R.color.danger))
                    background = ContextCompat.getDrawable(context, R.drawable.bg_badge_overdue)
                }
                binding.tvDueCountdown.apply {
                    text = "${record.daysOverdue} days overdue!"
                    setTextColor(ContextCompat.getColor(context, R.color.danger))
                    background = ContextCompat.getDrawable(context, R.drawable.bg_badge_overdue)
                }
            } else {
                binding.tvStatusBadge.apply {
                    text = "ACTIVE LOAN"
                    setTextColor(ContextCompat.getColor(context, R.color.primary))
                    background = ContextCompat.getDrawable(context, R.drawable.bg_badge_active)
                }
                binding.tvDueCountdown.apply {
                    text = "Due in ${record.daysRemaining} days"
                    setTextColor(ContextCompat.getColor(context, R.color.success))
                    background = ContextCompat.getDrawable(context, R.drawable.bg_badge_available)
                }
            }

            if (record.fineAmount > 0) {
                binding.tvFineAmount.visibility = View.VISIBLE
                binding.tvFineAmount.text = "Fine: $${"%.2f".format(record.fineAmount)}"
            } else {
                binding.tvFineAmount.visibility = View.GONE
            }
        }
    }
}
