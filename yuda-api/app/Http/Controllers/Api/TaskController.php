<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserTask;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class TaskController extends Controller
{
    /**
     * Resolve identitas: user_id (Sanctum) atau guest_uuid
     */
    private function resolveIdentity(Request $request): array
    {
        $user = $request->user('sanctum');

        if ($user) {
            return ['user_id' => $user->id, 'guest_uuid' => null];
        }

        $guestUuid = $request->input('guest_uuid') ?? $request->header('X-Guest-UUID');

        return ['user_id' => null, 'guest_uuid' => $guestUuid];
    }

    /**
     * Base query builder berdasarkan identitas pengguna
     */
    private function baseQuery(array $identity)
    {
        return UserTask::where('user_id', $identity['user_id'])
            ->where('guest_uuid', $identity['guest_uuid']);
    }

    /**
     * GET /api/tasks
     * List semua task. Bisa filter ?date=2026-11-12
     */
    public function index(Request $request): JsonResponse
    {
        $identity = $this->resolveIdentity($request);

        if (! $identity['user_id'] && ! $identity['guest_uuid']) {
            return $this->unauthorizedResponse();
        }

        $query = $this->baseQuery($identity)->orderBy('scheduled_date')->orderBy('scheduled_time');

        // Filter opsional berdasarkan tanggal
        if ($request->has('date')) {
            $query->whereDate('scheduled_date', $request->input('date'));
        }

        $tasks = $query->get();

        // Summary untuk hari ini
        $today = Carbon::today()->toDateString();
        $todayTasks = $tasks->filter(fn($t) => $t->scheduled_date->toDateString() === $today);

        return response()->json([
            'success' => true,
            'data'    => [
                'summary' => [
                    'total_today'     => $todayTasks->count(),
                    'completed_today' => $todayTasks->where('is_completed', true)->count(),
                ],
                'tasks' => $tasks->map(fn($task) => $this->formatTask($task)),
            ],
        ]);
    }

    /**
     * POST /api/tasks
     * Tambah task baru
     */
    public function store(Request $request): JsonResponse
    {
        $identity = $this->resolveIdentity($request);

        if (! $identity['user_id'] && ! $identity['guest_uuid']) {
            return $this->unauthorizedResponse();
        }

        $validated = $request->validate([
            'title'                    => 'required|string|max:255',
            'scheduled_date'           => 'required|date_format:Y-m-d',
            'scheduled_time'           => 'nullable|date_format:H:i',
            'guest_uuid'               => 'sometimes|string|max:64',
            'google_calendar_event_id' => 'nullable|string|max:255',
        ]);

        // Validasi agar task tidak dapat dibuat di masa lalu
        $timezone = 'Asia/Jakarta';
        $now = Carbon::now($timezone);
        $todayStr = $now->toDateString();
        $scheduledDate = $validated['scheduled_date'];

        if ($scheduledDate < $todayStr) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat menambahkan aktivitas pada tanggal di masa lalu.',
                'errors'  => [
                    'scheduled_date' => ['Tanggal aktivitas tidak boleh di masa lalu.']
                ]
            ], 422);
        }

        if ($scheduledDate === $todayStr && !empty($validated['scheduled_time'])) {
            $scheduledDateTime = Carbon::createFromFormat('Y-m-d H:i', "{$scheduledDate} {$validated['scheduled_time']}", $timezone);
            if ($scheduledDateTime->lt($now)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak dapat menambahkan aktivitas pada jam yang sudah terlewat.',
                    'errors'  => [
                        'scheduled_time' => ['Jam aktivitas sudah terlewat di hari ini.']
                    ]
                ], 422);
            }
        }

        $task = UserTask::create([
            'user_id'                  => $identity['user_id'],
            'guest_uuid'               => $identity['guest_uuid'],
            'title'                    => $validated['title'],
            'scheduled_date'           => $validated['scheduled_date'],
            'scheduled_time'           => $validated['scheduled_time'] ?? null,
            'is_completed'             => false,
            'google_calendar_event_id' => $validated['google_calendar_event_id'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Task berhasil ditambahkan.',
            'data'    => $this->formatTask($task),
        ], 201);
    }

    /**
     * PUT /api/tasks/{id}
     * Edit task (judul, tanggal, jam)
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $identity = $this->resolveIdentity($request);

        if (! $identity['user_id'] && ! $identity['guest_uuid']) {
            return $this->unauthorizedResponse();
        }

        $task = $this->baseQuery($identity)->find($id);

        if (! $task) {
            return response()->json([
                'success' => false,
                'message' => 'Task tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'title'                    => 'sometimes|string|max:255',
            'scheduled_date'           => 'sometimes|date_format:Y-m-d',
            'scheduled_time'           => 'nullable|date_format:H:i',
            'google_calendar_event_id' => 'nullable|string|max:255',
        ]);

        $timezone = 'Asia/Jakarta';
        $now = Carbon::now($timezone);
        $todayStr = $now->toDateString();

        $originalDateStr = $task->scheduled_date->toDateString();
        if ($originalDateStr < $todayStr) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat mengubah aktivitas yang berada di masa lalu.',
            ], 422);
        }

        $newDateStr = $validated['scheduled_date'] ?? $originalDateStr;
        if ($newDateStr < $todayStr) {
            return response()->json([
                'success' => false,
                'message' => 'Tanggal aktivitas baru tidak boleh di masa lalu.',
                'errors'  => [
                    'scheduled_date' => ['Tanggal aktivitas tidak boleh di masa lalu.']
                ]
            ], 422);
        }

        $newTimeStr = array_key_exists('scheduled_time', $validated) ? $validated['scheduled_time'] : ($task->scheduled_time ? substr($task->scheduled_time, 0, 5) : null);
        if ($newDateStr === $todayStr && !empty($newTimeStr)) {
            $scheduledDateTime = Carbon::createFromFormat('Y-m-d H:i', "{$newDateStr} {$newTimeStr}", $timezone);
            if ($scheduledDateTime->lt($now)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Jam aktivitas baru sudah terlewat di hari ini.',
                    'errors'  => [
                        'scheduled_time' => ['Jam aktivitas sudah terlewat di hari ini.']
                    ]
                ], 422);
            }
        }

        $task->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Task berhasil diperbarui.',
            'data'    => $this->formatTask($task->fresh()),
        ]);
    }

    /**
     * PATCH /api/tasks/{id}/complete
     * Toggle status selesai / belum selesai
     */
    public function toggleComplete(Request $request, int $id): JsonResponse
    {
        $identity = $this->resolveIdentity($request);

        if (! $identity['user_id'] && ! $identity['guest_uuid']) {
            return $this->unauthorizedResponse();
        }

        $task = $this->baseQuery($identity)->find($id);

        if (! $task) {
            return response()->json([
                'success' => false,
                'message' => 'Task tidak ditemukan.',
            ], 404);
        }

        $nowCompleted = ! $task->is_completed;

        $task->update([
            'is_completed' => $nowCompleted,
            'completed_at' => $nowCompleted ? now() : null,
        ]);

        return response()->json([
            'success' => true,
            'message' => $nowCompleted ? 'Task ditandai selesai.' : 'Task dibatalkan.',
            'data'    => $this->formatTask($task->fresh()),
        ]);
    }

    /**
     * DELETE /api/tasks/{id}
     * Hapus task
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $identity = $this->resolveIdentity($request);

        if (! $identity['user_id'] && ! $identity['guest_uuid']) {
            return $this->unauthorizedResponse();
        }

        $task = $this->baseQuery($identity)->find($id);

        if (! $task) {
            return response()->json([
                'success' => false,
                'message' => 'Task tidak ditemukan.',
            ], 404);
        }

        $task->delete();

        return response()->json([
            'success' => true,
            'message' => 'Task berhasil dihapus.',
        ]);
    }

    /**
     * POST /api/tasks/sync-google
     * Sinkronisasi event dari Google Calendar ke daftar Task
     */
    public function syncGoogle(Request $request): JsonResponse
    {
        $identity = $this->resolveIdentity($request);

        if (! $identity['user_id'] && ! $identity['guest_uuid']) {
            return $this->unauthorizedResponse();
        }

        $validated = $request->validate([
            'events'                            => 'required|array',
            'events.*.title'                    => 'required|string|max:255',
            'events.*.scheduled_date'           => 'required|date_format:Y-m-d',
            'events.*.scheduled_time'           => 'nullable|date_format:H:i',
            'events.*.google_calendar_event_id' => 'required|string|max:255',
        ]);

        $syncedTasks = [];

        foreach ($validated['events'] as $evt) {
            $task = UserTask::updateOrCreate(
                [
                    'user_id'                  => $identity['user_id'],
                    'guest_uuid'               => $identity['guest_uuid'],
                    'google_calendar_event_id' => $evt['google_calendar_event_id'],
                ],
                [
                    'title'          => $evt['title'],
                    'scheduled_date' => $evt['scheduled_date'],
                    'scheduled_time' => $evt['scheduled_time'] ?? null,
                ]
            );

            $syncedTasks[] = $this->formatTask($task);
        }

        return response()->json([
            'success' => true,
            'message' => count($syncedTasks) . ' task berhasil disinkronkan dari Google Calendar.',
            'data'    => [
                'tasks' => $syncedTasks,
            ],
        ]);
    }

    /**
     * Format output task
     */
    private function formatTask(UserTask $task): array
    {
        return [
            'id'                       => $task->id,
            'title'                    => $task->title,
            'scheduled_date'           => $task->scheduled_date->toDateString(),
            'scheduled_time'           => $task->scheduled_time,
            'is_completed'             => $task->is_completed,
            'completed_at'             => $task->completed_at?->toIso8601String(),
            'google_calendar_event_id' => $task->google_calendar_event_id,
        ];
    }

    /**
     * Response 401 standar
     */
    private function unauthorizedResponse(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Identitas pengguna tidak ditemukan. Sertakan token Sanctum atau guest_uuid.',
        ], 401);
    }
}

