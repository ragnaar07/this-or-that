// ============================================================
// API Service — All server communication (V4)
// ============================================================

import type { RoomState, PlayerRole } from '../types/game';
import { API_BASE_URL } from '../config/api';

const BASE_URL = API_BASE_URL;

interface ApiResponse<T = unknown> {
  success?: boolean;
  error?: string;
  room?: RoomState;
  playerId?: string;
  role?: PlayerRole;
  data?: T;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error ?? 'Something went wrong. Try again.' };
    }
    return data;
  } catch {
    return { error: 'Cannot connect to server. Check your connection.' };
  }
}

export const api = {
  async createRoom(
    playerName: string,
    gender: 'male' | 'female' | 'other' = 'other',
    deepPsychology = true,
    totalRounds = 20,
    gameMode = 'INDIA',
    aiTone = 'fun'
  ) {
    return request('/api/rooms', {
      method: 'POST',
      body: JSON.stringify({ playerName, gender, deepPsychology, totalRounds, gameMode, aiTone }),
    });
  },

  async joinRoom(code: string, playerName: string, gender: 'male' | 'female' | 'other' = 'other') {
    return request(`/api/rooms/${code}/join`, {
      method: 'POST',
      body: JSON.stringify({ playerName, gender }),
    });
  },

  async pollRoom(code: string, playerId: string) {
    return request(`/api/rooms/${code}?playerId=${encodeURIComponent(playerId)}`);
  },

  async submitAnswer(
    code: string,
    playerId: string,
    role: PlayerRole,
    roundNumber: number,
    choice: string,
    prediction?: string
  ) {
    return request(`/api/rooms/${code}/answer`, {
      method: 'POST',
      body: JSON.stringify({ playerId, role, roundNumber, choice, prediction }),
    });
  },

  async nextRound(code: string, playerId: string) {
    return request(`/api/rooms/${code}/next-round`, {
      method: 'POST',
      body: JSON.stringify({ playerId }),
    });
  },

  async restartRoom(code: string, playerId: string) {
    return request(`/api/rooms/${code}/restart`, {
      method: 'POST',
      body: JSON.stringify({ playerId }),
    });
  },

  async leaveRoom(code: string, playerId: string) {
    return request(`/api/rooms/${code}/leave`, {
      method: 'DELETE',
      body: JSON.stringify({ playerId }),
    });
  },

  async getStats() {
    return request<{ visitorCount: number; totalMatchesSynced: number; activeRooms: number }>('/api/stats');
  },

  async incrementVisitorCount() {
    return request<{ success: boolean; visitorCount: number }>('/api/visitors/increment', {
      method: 'POST',
    });
  },
};

