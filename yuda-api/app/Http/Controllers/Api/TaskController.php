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
            'title'          => 'required|string|max:255',
            'scheduled_date' => 'required|date_format:Y-m-d',
            'scheduled_time' => 'nullable|date_format:H:i',
            'guest_uuid'     => 'sometimes|string|max:64',
        ]);

        $task = UserTask::create([
            'user_id'        => $identity['user_id'],
            'guest_uuid'     => $identity['guest_uuid'],
            'title'          => $validated['title'],
            'scheduled_date' => $validated['scheduled_date'],
            'scheduled_time' => $validated['scheduled_time'] ?? null,
            'is_completed'   => false,
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
            'title'          => 'sometimes|string|max:255',
            'scheduled_date' => 'sometimes|date_format:Y-m-d',
            'scheduled_time' => 'nullable|date_format:H:i',
        ]);

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
     * Format output task
     */
    private function formatTask(UserTask $task): array
    {
        return [
            'id'             => $task->id,
            'title'          => $task->title,
            'scheduled_date' => $task->scheduled_date->toDateString(),
            'scheduled_time' => $task->scheduled_time,
            'is_completed'   => $task->is_completed,
            'completed_at'   => $task->completed_at?->toIso8601String(),
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

