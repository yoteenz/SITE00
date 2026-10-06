import { useSyncExternalStore } from 'react';
import type { JurnlTrip } from '../foundation/trips';
import type { CalendarDate } from '../foundation/dates';
import { getRepository } from '../repository/deviceRepository';

let seq = 0;

export function useTrips(): JurnlTrip[] {
  return useSyncExternalStore((cb) => getRepository().subscribe(cb), () => listTrips(), () => []);
}

export function listTrips(): JurnlTrip[] {
  return getRepository().listTrips().filter((t) => t.status !== 'ARCHIVED');
}

export function tripById(id: string): JurnlTrip | null {
  return getRepository().listTrips().find((t) => t.trip_id === id && t.status !== 'ARCHIVED') ?? null;
}

export function totalTripReserved(): number {
  return listTrips().filter((t) => t.status === 'ACTIVE').reduce((s, t) => s + Math.max(0, t.reserved_amount), 0);
}

export function createTrip(input: { title: string; destination: string; target_budget: number; start_date?: CalendarDate | null }): JurnlTrip {
  const now = new Date().toISOString();
  seq += 1;
  const trip: JurnlTrip = {
    trip_id: `trip-${seq}-${Date.now()}`,
    title: input.title.trim().toUpperCase(),
    destination: input.destination.trim().toUpperCase(),
    start_date: input.start_date ?? null,
    end_date: null,
    target_budget: Math.max(0, input.target_budget),
    reserved_amount: 0,
    paid_amount: 0,
    linked_goal_id: null,
    linked_plan_id: null,
    status: 'ACTIVE',
    notes: '',
    created_at: now,
    updated_at: now,
    completed_at: null,
    archived_at: null,
  };
  return getRepository().upsertTrip(trip);
}

export function updateTrip(trip: JurnlTrip): JurnlTrip {
  return getRepository().upsertTrip(trip);
}

export function completeTrip(id: string): JurnlTrip | null {
  const trip = tripById(id);
  if (!trip) return null;
  return getRepository().upsertTrip({ ...trip, status: 'COMPLETE', completed_at: new Date().toISOString(), reserved_amount: 0 });
}

export function archiveTrip(id: string): boolean {
  return getRepository().deleteTrip(id);
}
