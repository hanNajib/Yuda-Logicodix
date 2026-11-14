<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserDailyScreenTimeMatrix;
use App\Models\UserInterventionSetting;
use App\Models\UserSocialScreenTime;
use App\Models\UserTask;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GuestSyncService
{
    /**
     * Sinkronkan semua data yang sebelumnya dibuat dengan guest_uuid ke akun user yang baru login.
     */
    public static function syncGuestDataToUser(User $user, ?string $guestUuid): void
    {
        if (!$guestUuid || trim($guestUuid) === '') {
            return;
        }

        try {
            DB::transaction(function () use ($user, $guestUuid) {
                // 1. Migrasi Tasks
                UserTask::where('guest_uuid', $guestUuid)
                    ->whereNull('user_id')
                    ->update([
                        'user_id' => $user->id,
                        'guest_uuid' => null,
                    ]);

                // 2. Migrasi Pengaturan Intervensi (UserInterventionSetting)
                $guestSetting = UserInterventionSetting::where('guest_uuid', $guestUuid)
                    ->whereNull('user_id')
                    ->first();

                if ($guestSetting) {
                    $userSetting = UserInterventionSetting::where('user_id', $user->id)->first();
                    if ($userSetting) {
                        // Update preferensi user dengan preferensi terakhir saat guest jika ada
                        $userSetting->update([
                            'tone_style' => $guestSetting->tone_style ?? $userSetting->tone_style,
                            'scroll_interval_minutes' => $guestSetting->scroll_interval_minutes ?? $userSetting->scroll_interval_minutes,
                            'current_pause_duration' => $guestSetting->current_pause_duration ?? $userSetting->current_pause_duration,
                            'last_pause_duration' => $guestSetting->last_pause_duration ?? $userSetting->last_pause_duration,
                        ]);
                        $guestSetting->delete();
                    } else {
                        $guestSetting->update([
                            'user_id' => $user->id,
                            'guest_uuid' => null,
                        ]);
                    }
                }

                // 3. Migrasi Social Screen Time
                $guestSocials = UserSocialScreenTime::where('guest_uuid', $guestUuid)
                    ->whereNull('user_id')
                    ->get();

                foreach ($guestSocials as $guestSocial) {
                    $userSocial = UserSocialScreenTime::where('user_id', $user->id)->first();
                    if ($userSocial) {
                        $userSocial->increment('instagram', (int)$guestSocial->instagram);
                        $userSocial->increment('tiktok', (int)$guestSocial->tiktok);
                        $userSocial->increment('facebook', (int)$guestSocial->facebook);
                        $userSocial->increment('threads', (int)$guestSocial->threads);
                        $userSocial->increment('youtube', (int)$guestSocial->youtube);
                        $userSocial->increment('x', (int)$guestSocial->x);
                        $guestSocial->delete();
                    } else {
                        $guestSocial->update([
                            'user_id' => $user->id,
                            'guest_uuid' => null,
                        ]);
                    }
                }

                // 4. Migrasi Daily Screen Time Matrix
                $guestMatrices = UserDailyScreenTimeMatrix::where('guest_uuid', $guestUuid)
                    ->whereNull('user_id')
                    ->get();

                foreach ($guestMatrices as $gm) {
                    $existing = UserDailyScreenTimeMatrix::where('user_id', $user->id)
                        ->where('log_date', $gm->log_date)
                        ->first();

                    if ($existing) {
                        // Gabungkan akumulasi slot dan total
                        $updates = [
                            'total_screen_time_minutes' => $existing->total_screen_time_minutes + $gm->total_screen_time_minutes,
                            'interventions_triggered' => $existing->interventions_triggered + $gm->interventions_triggered,
                        ];

                        foreach (UserDailyScreenTimeMatrix::SLOT_COLUMNS as $slotCol) {
                            $updates[$slotCol] = ($existing->{$slotCol} ?? 0) + ($gm->{$slotCol} ?? 0);
                        }

                        if (!empty($gm->emotion) && empty($existing->emotion)) {
                            $updates['emotion'] = $gm->emotion;
                        }

                        $existing->update($updates);
                        $gm->delete();
                    } else {
                        $gm->update([
                            'user_id' => $user->id,
                            'guest_uuid' => null,
                        ]);
                    }
                }
            });

            Log::info("Guest data successfully merged to User ID: {$user->id} from Guest UUID: {$guestUuid}");
        } catch (\Throwable $e) {
            Log::error("Failed to sync guest data to user {$user->id}: " . $e->getMessage());
        }
    }
}
