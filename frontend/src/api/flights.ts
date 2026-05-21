import api from './client';

export async function listFlights(params: Record<string, unknown>) {
  const res = await api.get('/flights', { params });
  return res.data;
}

export async function updateCheckin(id: string, data: Record<string, unknown>) {
  const res = await api.put(`/flights/${id}/checkin`, data);
  return res.data.data;
}
