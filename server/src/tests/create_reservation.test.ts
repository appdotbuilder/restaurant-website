import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { reservationsTable } from '../db/schema';
import { type CreateReservationInput } from '../schema';
import { createReservation } from '../handlers/create_reservation';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateReservationInput = {
  customer_name: 'John Doe',
  customer_email: 'john.doe@example.com',
  customer_phone: '555-123-4567',
  party_size: 4,
  reservation_date: '2024-12-25',
  reservation_time: '19:30',
  special_requests: 'Window seat preferred'
};

// Test input without special requests
const testInputMinimal: CreateReservationInput = {
  customer_name: 'Jane Smith',
  customer_email: 'jane.smith@example.com',
  customer_phone: '555-987-6543',
  party_size: 2,
  reservation_date: '2024-12-30',
  reservation_time: '18:00',
  special_requests: null
};

describe('createReservation', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a reservation with all fields', async () => {
    const result = await createReservation(testInput);

    // Basic field validation
    expect(result.customer_name).toEqual('John Doe');
    expect(result.customer_email).toEqual('john.doe@example.com');
    expect(result.customer_phone).toEqual('555-123-4567');
    expect(result.party_size).toEqual(4);
    expect(result.reservation_date).toBeInstanceOf(Date);
    expect(result.reservation_date.toISOString().split('T')[0]).toEqual('2024-12-25');
    expect(result.reservation_time).toEqual('19:30');
    expect(result.special_requests).toEqual('Window seat preferred');
    expect(result.status).toEqual('pending');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a reservation without special requests', async () => {
    const result = await createReservation(testInputMinimal);

    expect(result.customer_name).toEqual('Jane Smith');
    expect(result.customer_email).toEqual('jane.smith@example.com');
    expect(result.party_size).toEqual(2);
    expect(result.special_requests).toBeNull();
    expect(result.status).toEqual('pending');
    expect(result.id).toBeDefined();
  });

  it('should save reservation to database', async () => {
    const result = await createReservation(testInput);

    // Query using proper drizzle syntax
    const reservations = await db.select()
      .from(reservationsTable)
      .where(eq(reservationsTable.id, result.id))
      .execute();

    expect(reservations).toHaveLength(1);
    const savedReservation = reservations[0];
    expect(savedReservation.customer_name).toEqual('John Doe');
    expect(savedReservation.customer_email).toEqual('john.doe@example.com');
    expect(savedReservation.customer_phone).toEqual('555-123-4567');
    expect(savedReservation.party_size).toEqual(4);
    expect(savedReservation.reservation_date).toBeInstanceOf(Date);
    expect(savedReservation.reservation_time).toEqual('19:30');
    expect(savedReservation.special_requests).toEqual('Window seat preferred');
    expect(savedReservation.status).toEqual('pending');
    expect(savedReservation.created_at).toBeInstanceOf(Date);
    expect(savedReservation.updated_at).toBeInstanceOf(Date);
  });

  it('should handle different party sizes correctly', async () => {
    const singlePersonInput: CreateReservationInput = {
      ...testInput,
      customer_name: 'Solo Diner',
      party_size: 1
    };

    const largePartyInput: CreateReservationInput = {
      ...testInput,
      customer_name: 'Large Party',
      party_size: 12
    };

    const singleResult = await createReservation(singlePersonInput);
    expect(singleResult.party_size).toEqual(1);

    const largeResult = await createReservation(largePartyInput);
    expect(largeResult.party_size).toEqual(12);

    // Verify both reservations are saved
    const allReservations = await db.select().from(reservationsTable).execute();
    expect(allReservations).toHaveLength(2);
  });

  it('should handle different time formats correctly', async () => {
    const morningInput: CreateReservationInput = {
      ...testInput,
      customer_name: 'Morning Customer',
      reservation_time: '08:30'
    };

    const eveningInput: CreateReservationInput = {
      ...testInput,
      customer_name: 'Evening Customer', 
      reservation_time: '23:00'
    };

    const morningResult = await createReservation(morningInput);
    expect(morningResult.reservation_time).toEqual('08:30');

    const eveningResult = await createReservation(eveningInput);
    expect(eveningResult.reservation_time).toEqual('23:00');
  });

  it('should create multiple reservations successfully', async () => {
    const reservation1 = await createReservation(testInput);
    const reservation2 = await createReservation(testInputMinimal);

    expect(reservation1.id).not.toEqual(reservation2.id);
    expect(reservation1.customer_name).toEqual('John Doe');
    expect(reservation2.customer_name).toEqual('Jane Smith');

    // Verify both are in database
    const allReservations = await db.select().from(reservationsTable).execute();
    expect(allReservations).toHaveLength(2);
  });

  it('should set default status to pending', async () => {
    const result = await createReservation(testInput);
    expect(result.status).toEqual('pending');

    // Verify in database
    const savedReservation = await db.select()
      .from(reservationsTable)
      .where(eq(reservationsTable.id, result.id))
      .execute();

    expect(savedReservation[0].status).toEqual('pending');
  });
});