import { db } from '../db';
import { reservationsTable } from '../db/schema';
import { type GetReservationsByDateInput, type Reservation } from '../schema';
import { gte, lt, asc, and } from 'drizzle-orm';

export async function getReservationsByDate(input: GetReservationsByDateInput): Promise<Reservation[]> {
  try {
    // Parse the input date and create start/end of day boundaries
    const inputDate = new Date(input.date);
    const startOfDay = new Date(inputDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(startOfDay);
    nextDay.setDate(nextDay.getDate() + 1);

    // Query reservations for the specified date, ordered by reservation time
    const results = await db.select()
      .from(reservationsTable)
      .where(
        and(
          gte(reservationsTable.reservation_date, startOfDay),
          lt(reservationsTable.reservation_date, nextDay)
        )
      )
      .orderBy(asc(reservationsTable.reservation_time))
      .execute();

    return results;
  } catch (error) {
    console.error('Get reservations by date failed:', error);
    throw error;
  }
}