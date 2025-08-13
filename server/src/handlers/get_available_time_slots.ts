import { db } from '../db';
import { reservationsTable } from '../db/schema';
import { type GetReservationsByDateInput } from '../schema';
import { eq, and, ne } from 'drizzle-orm';

export type TimeSlot = {
  time: string;
  available: boolean;
  capacity: number;
};

// Restaurant configuration
const RESTAURANT_CAPACITY = 80; // Total seating capacity
const TIME_SLOTS = [
  '17:00', '17:30', '18:00', '18:30', '19:00', 
  '19:30', '20:00', '20:30', '21:00', '21:30'
]; // Available reservation times

export async function getAvailableTimeSlots(input: GetReservationsByDateInput): Promise<TimeSlot[]> {
  try {
    const reservationDate = new Date(input.date);
    
    // Get all confirmed reservations for the specified date
    const reservations = await db.select()
      .from(reservationsTable)
      .where(
        and(
          eq(reservationsTable.reservation_date, reservationDate),
          ne(reservationsTable.status, 'cancelled')
        )
      )
      .execute();

    // Calculate occupied capacity per time slot
    const occupiedCapacity: { [timeSlot: string]: number } = {};
    
    reservations.forEach(reservation => {
      const timeSlot = reservation.reservation_time;
      if (!occupiedCapacity[timeSlot]) {
        occupiedCapacity[timeSlot] = 0;
      }
      occupiedCapacity[timeSlot] += reservation.party_size;
    });

    // Generate time slots with availability
    const timeSlots: TimeSlot[] = TIME_SLOTS.map(time => {
      const occupied = occupiedCapacity[time] || 0;
      const remainingCapacity = RESTAURANT_CAPACITY - occupied;
      
      return {
        time,
        available: remainingCapacity > 0,
        capacity: remainingCapacity
      };
    });

    return timeSlots;
  } catch (error) {
    console.error('Failed to get available time slots:', error);
    throw error;
  }
}