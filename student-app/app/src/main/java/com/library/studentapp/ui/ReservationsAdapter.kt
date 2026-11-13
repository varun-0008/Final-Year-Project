package com.library.studentapp.ui

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.library.studentapp.R
import com.library.studentapp.data.Reservation
import com.library.studentapp.databinding.ItemReservationBinding

class ReservationsAdapter : RecyclerView.Adapter<ReservationsAdapter.ReservationViewHolder>() {

    private val reservations = mutableListOf<Reservation>()

    fun submitList(newList: List<Reservation>) {
        reservations.clear()
        reservations.addAll(newList)
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ReservationViewHolder {
        val binding = ItemReservationBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return ReservationViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ReservationViewHolder, position: Int) {
        holder.bind(reservations[position])
    }

    override fun getItemCount(): Int = reservations.size

    inner class ReservationViewHolder(private val binding: ItemReservationBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(res: Reservation) {
            val context = binding.root.context

            binding.tvResCode.text = res.reservationCode
            binding.tvResTitle.text = res.bookTitle
            binding.tvResAuthor.text = res.bookAuthor?.let { "By $it" } ?: "Library Catalog"
            binding.tvResDate.text = "${res.preferredDate} (${res.timeslot})"
            binding.tvResShelf.text = "Block ${res.block ?: "A"}, Floor ${res.floor ?: 2}, ${res.rack ?: "Rack 08"}, ${res.shelf ?: "Shelf 03"}"

            when (res.status.lowercase()) {
                "ready_for_pickup", "approved" -> {
                    binding.tvResStatus.text = "READY FOR PICKUP"
                    binding.tvResStatus.setTextColor(ContextCompat.getColor(context, R.color.success))
                    binding.tvResStatus.background = ContextCompat.getDrawable(context, R.drawable.bg_badge_available)
                }
                "pending" -> {
                    binding.tvResStatus.text = "PENDING CONFIRMATION"
                    binding.tvResStatus.setTextColor(ContextCompat.getColor(context, R.color.warning))
                    binding.tvResStatus.background = ContextCompat.getDrawable(context, R.drawable.bg_badge_overdue)
                }
                "issued", "collected" -> {
                    binding.tvResStatus.text = "ISSUED / COLLECTED"
                    binding.tvResStatus.setTextColor(ContextCompat.getColor(context, R.color.primary))
                    binding.tvResStatus.background = ContextCompat.getDrawable(context, R.drawable.bg_badge_active)
                }
                else -> {
                    binding.tvResStatus.text = res.status.uppercase()
                    binding.tvResStatus.setTextColor(ContextCompat.getColor(context, R.color.gray_700))
                    binding.tvResStatus.background = ContextCompat.getDrawable(context, R.drawable.bg_badge_active)
                }
            }
        }
    }
}
