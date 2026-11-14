/**
 * Global Debug Configuration
 * Ubah ENABLE_DEBUG_OVERLAY_BUBBLE ke true jika ingin menampilkan floating widget timer & app tracker
 * saat monitoring Reels/Shorts berjalan (berguna untuk testing deteksi app dan durasi scrolling).
 */
export const DEBUG_CONFIG = {
    /**
     * Tampilkan floating bubble timer & nama app di layar saat overlay monitor aktif.
     * Set ke true untuk mode debug floating widget.
     * Set ke false untuk mode produksi/normal (hanya intervensi saat interval habis).
     */
    ENABLE_DEBUG_OVERLAY_BUBBLE: true,
};

