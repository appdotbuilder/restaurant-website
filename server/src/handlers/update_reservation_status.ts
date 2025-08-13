import { db } from '../db';
import { reservationsTable } from '../db/schema';
import { type UpdateReservationStatusInput, type Reservation } from '../schema';
import { eq } from 'drizzle-orm';

export async function updateReservationStatus(input: UpdateReservationStatusInput): Promise<Reservation | null> {
  try {
    // Update the reservation status and updated_at timestamp
    const result = await db.update(reservationsTable)
      .set({
        status: input.status,
        updated_at: new Date()
      })
      .where(eq(reservationsTable.id, input.id))
      .returning()
      .execute();

    // If no reservation was found with the given ID, return null
    if (result.length === 0) {
      return null;
    }

    // Return the updated reservation
    const reservation = result[0];
    return {
      ...reservation,
      // No numeric conversions needed for this table
    };
  } catch (error) {
    console.error('Reservation status update failed:', error);
    throw error;
  }
}