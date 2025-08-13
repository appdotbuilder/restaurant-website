import { db } from '../db';
import { reservationsTable } from '../db/schema';
import { type CreateReservationInput, type Reservation } from '../schema';

export const createReservation = async (input: CreateReservationInput): Promise<Reservation> => {
  try {
    // Parse the reservation date from string
    const reservationDate = new Date(input.reservation_date);

    // Insert reservation record
    const result = await db.insert(reservationsTable)
      .values({
        customer_name: input.customer_name,
        customer_email: input.customer_email,
        customer_phone: input.customer_phone,
        party_size: input.party_size,
        reservation_date: reservationDate,
        reservation_time: input.reservation_time,
        special_requests: input.special_requests,
        status: 'pending' // Default status for new reservations
      })
      .returning()
      .execute();

    const reservation = result[0];
    return reservation;
  } catch (error) {
    console.error('Reservation creation failed:', error);
    throw error;
  }
};