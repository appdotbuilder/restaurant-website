import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { reservationsTable } from '../db/schema';
import { type UpdateReservationStatusInput } from '../schema';
import { updateReservationStatus } from '../handlers/update_reservation_status';
import { eq } from 'drizzle-orm';

describe('updateReservationStatus', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update reservation status successfully', async () => {
    // Create a test reservation first
    const reservation = await db.insert(reservationsTable)
      .values({
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        customer_phone: '1234567890',
        party_size: 4,
        reservation_date: new Date('2024-12-25T19:30:00Z'),
        reservation_time: '19:30',
        special_requests: 'Window seat please',
        status: 'pending'
      })
      .returning()
      .execute();

    const createdReservation = reservation[0];

    // Test updating status to confirmed
    const updateInput: UpdateReservationStatusInput = {
      id: createdReservation.id,
      status: 'confirmed'
    };

    const result = await updateReservationStatus(updateInput);

    // Verify the result
    expect(result).toBeDefined();
    expect(result?.id).toEqual(createdReservation.id);
    expect(result?.status).toEqual('confirmed');
    expect(result?.customer_name).toEqual('John Doe');
    expect(result?.customer_email).toEqual('john@example.com');
    expect(result?.party_size).toEqual(4);
    expect(result?.updated_at).toBeInstanceOf(Date);
    expect(result?.updated_at).not.toEqual(createdReservation.updated_at);
  });

  it('should update reservation to cancelled status', async () => {
    // Create a confirmed reservation
    const reservation = await db.insert(reservationsTable)
      .values({
        customer_name: 'Jane Smith',
        customer_email: 'jane@example.com',
        customer_phone: '0987654321',
        party_size: 2,
        reservation_date: new Date('2024-12-26T20:00:00Z'),
        reservation_time: '20:00',
        special_requests: null,
        status: 'confirmed'
      })
      .returning()
      .execute();

    const createdReservation = reservation[0];

    // Update to cancelled
    const updateInput: UpdateReservationStatusInput = {
      id: createdReservation.id,
      status: 'cancelled'
    };

    const result = await updateReservationStatus(updateInput);

    expect(result).toBeDefined();
    expect(result?.status).toEqual('cancelled');
    expect(result?.id).toEqual(createdReservation.id);
  });

  it('should update reservation to completed status', async () => {
    // Create a confirmed reservation
    const reservation = await db.insert(reservationsTable)
      .values({
        customer_name: 'Bob Wilson',
        customer_email: 'bob@example.com',
        customer_phone: '5555555555',
        party_size: 6,
        reservation_date: new Date('2024-12-24T18:00:00Z'),
        reservation_time: '18:00',
        special_requests: 'Birthday celebration',
        status: 'confirmed'
      })
      .returning()
      .execute();

    const createdReservation = reservation[0];

    // Update to completed
    const updateInput: UpdateReservationStatusInput = {
      id: createdReservation.id,
      status: 'completed'
    };

    const result = await updateReservationStatus(updateInput);

    expect(result).toBeDefined();
    expect(result?.status).toEqual('completed');
    expect(result?.customer_name).toEqual('Bob Wilson');
    expect(result?.party_size).toEqual(6);
  });

  it('should persist status change to database', async () => {
    // Create a test reservation
    const reservation = await db.insert(reservationsTable)
      .values({
        customer_name: 'Alice Brown',
        customer_email: 'alice@example.com',
        customer_phone: '1111111111',
        party_size: 3,
        reservation_date: new Date('2024-12-27T19:00:00Z'),
        reservation_time: '19:00',
        special_requests: null,
        status: 'pending'
      })
      .returning()
      .execute();

    const createdReservation = reservation[0];

    // Update status
    const updateInput: UpdateReservationStatusInput = {
      id: createdReservation.id,
      status: 'confirmed'
    };

    await updateReservationStatus(updateInput);

    // Query database directly to verify persistence
    const updatedReservations = await db.select()
      .from(reservationsTable)
      .where(eq(reservationsTable.id, createdReservation.id))
      .execute();

    expect(updatedReservations).toHaveLength(1);
    expect(updatedReservations[0].status).toEqual('confirmed');
    expect(updatedReservations[0].updated_at).not.toEqual(createdReservation.updated_at);
    expect(updatedReservations[0].updated_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent reservation ID', async () => {
    const updateInput: UpdateReservationStatusInput = {
      id: 99999, // Non-existent ID
      status: 'confirmed'
    };

    const result = await updateReservationStatus(updateInput);

    expect(result).toBeNull();
  });

  it('should handle all valid status transitions', async () => {
    // Create a test reservation
    const reservation = await db.insert(reservationsTable)
      .values({
        customer_name: 'Test User',
        customer_email: 'test@example.com',
        customer_phone: '2222222222',
        party_size: 2,
        reservation_date: new Date('2024-12-28T17:30:00Z'),
        reservation_time: '17:30',
        special_requests: null,
        status: 'pending'
      })
      .returning()
      .execute();

    const createdReservation = reservation[0];
    const statuses = ['confirmed', 'cancelled', 'completed'] as const;

    // Test each status transition
    for (const status of statuses) {
      const updateInput: UpdateReservationStatusInput = {
        id: createdReservation.id,
        status: status
      };

      const result = await updateReservationStatus(updateInput);

      expect(result).toBeDefined();
      expect(result?.status).toEqual(status);
      expect(result?.id).toEqual(createdReservation.id);
    }
  });

  it('should update timestamp correctly on status change', async () => {
    // Create a test reservation
    const reservation = await db.insert(reservationsTable)
      .values({
        customer_name: 'Time Test',
        customer_email: 'time@example.com',
        customer_phone: '3333333333',
        party_size: 1,
        reservation_date: new Date('2024-12-29T12:00:00Z'),
        reservation_time: '12:00',
        special_requests: null,
        status: 'pending'
      })
      .returning()
      .execute();

    const createdReservation = reservation[0];
    const originalUpdatedAt = createdReservation.updated_at;

    // Wait a small amount to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateReservationStatusInput = {
      id: createdReservation.id,
      status: 'confirmed'
    };

    const result = await updateReservationStatus(updateInput);

    expect(result).toBeDefined();
    expect(result?.updated_at).toBeInstanceOf(Date);
    expect(result?.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    expect(result?.created_at).toEqual(createdReservation.created_at); // Should not change
  });
});