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
  async createRoom(playerName: string, totalRounds = 20, gameMode = 'RANDOM', aiTone = 'fun') {
    return request('/api/rooms', {
      method: 'POST',
      body: JSON.stringify({ playerName, totalRounds, gameMode, aiTone }),
    });
  },

  async joinRoom(code: string, playerName: string) {
    return request(`/api/rooms/${code}/join`, {
      method: 'POST',
      body: JSON.stringify({ playerName }),
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

  async leaveRoom(code: string, playerId: string) {
    return request(`/api/rooms/${code}/leave`, {
      method: 'DELETE',
      body: JSON.stringify({ playerId }),
    });
  },
};
