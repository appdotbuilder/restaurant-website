import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { reservationsTable } from '../db/schema';
import { type GetReservationsByDateInput } from '../schema';
import { getReservationsByDate } from '../handlers/get_reservations_by_date';

describe('getReservationsByDate', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return reservations for a specific date', async () => {
    // Create test reservations for different dates
    const targetDate = new Date('2024-12-25');
    const otherDate = new Date('2024-12-26');

    // Insert reservations for target date
    await db.insert(reservationsTable).values([
      {
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        customer_phone: '1234567890',
        party_size: 4,
        reservation_date: targetDate,
        reservation_time: '18:00',
        special_requests: 'Window table please',
        status: 'confirmed'
      },
      {
        customer_name: 'Jane Smith',
        customer_email: 'jane@example.com',
        customer_phone: '0987654321',
        party_size: 2,
        reservation_date: targetDate,
        reservation_time: '19:30',
        special_requests: null,
        status: 'pending'
      }
    ]).execute();

    // Insert reservation for different date (should not be included)
    await db.insert(reservationsTable).values({
      customer_name: 'Bob Johnson',
      customer_email: 'bob@example.com',
      customer_phone: '5555555555',
      party_size: 6,
      reservation_date: otherDate,
      reservation_time: '20:00',
      special_requests: null,
      status: 'confirmed'
    }).execute();

    const input: GetReservationsByDateInput = {
      date: '2024-12-25'
    };

    const result = await getReservationsByDate(input);

    // Should return only reservations for the target date
    expect(result).toHaveLength(2);
    expect(result[0].customer_name).toEqual('John Doe');
    expect(result[0].customer_email).toEqual('john@example.com');
    expect(result[0].party_size).toEqual(4);
    expect(result[0].reservation_time).toEqual('18:00');
    expect(result[0].special_requests).toEqual('Window table please');
    expect(result[0].status).toEqual('confirmed');
    expect(result[0].reservation_date).toBeInstanceOf(Date);

    expect(result[1].customer_name).toEqual('Jane Smith');
    expect(result[1].customer_email).toEqual('jane@example.com');
    expect(result[1].party_size).toEqual(2);
    expect(result[1].reservation_time).toEqual('19:30');
    expect(result[1].special_requests).toBeNull();
    expect(result[1].status).toEqual('pending');
  });

  it('should return reservations ordered by reservation time', async () => {
    const targetDate = new Date('2024-12-25');

    // Insert reservations in random time order
    await db.insert(reservationsTable).values([
      {
        customer_name: 'Late Dinner',
        customer_email: 'late@example.com',
        customer_phone: '1111111111',
        party_size: 2,
        reservation_date: targetDate,
        reservation_time: '21:00',
        special_requests: null,
        status: 'confirmed'
      },
      {
        customer_name: 'Early Dinner',
        customer_email: 'early@example.com',
        customer_phone: '2222222222',
        party_size: 4,
        reservation_date: targetDate,
        reservation_time: '17:30',
        special_requests: null,
        status: 'confirmed'
      },
      {
        customer_name: 'Mid Dinner',
        customer_email: 'mid@example.com',
        customer_phone: '3333333333',
        party_size: 3,
        reservation_date: targetDate,
        reservation_time: '19:00',
        special_requests: null,
        status: 'confirmed'
      }
    ]).execute();

    const input: GetReservationsByDateInput = {
      date: '2024-12-25'
    };

    const result = await getReservationsByDate(input);

    expect(result).toHaveLength(3);
    // Should be ordered by reservation_time ascending
    expect(result[0].reservation_time).toEqual('17:30');
    expect(result[0].customer_name).toEqual('Early Dinner');
    expect(result[1].reservation_time).toEqual('19:00');
    expect(result[1].customer_name).toEqual('Mid Dinner');
    expect(result[2].reservation_time).toEqual('21:00');
    expect(result[2].customer_name).toEqual('Late Dinner');
  });

  it('should return empty array when no reservations exist for date', async () => {
    // Create reservation for different date
    await db.insert(reservationsTable).values({
      customer_name: 'John Doe',
      customer_email: 'john@example.com',
      customer_phone: '1234567890',
      party_size: 4,
      reservation_date: new Date('2024-12-26'),
      reservation_time: '18:00',
      special_requests: null,
      status: 'confirmed'
    }).execute();

    const input: GetReservationsByDateInput = {
      date: '2024-12-25'
    };

    const result = await getReservationsByDate(input);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('should include reservations with all statuses', async () => {
    const targetDate = new Date('2024-12-25');

    // Insert reservations with different statuses
    await db.insert(reservationsTable).values([
      {
        customer_name: 'Pending Reservation',
        customer_email: 'pending@example.com',
        customer_phone: '1111111111',
        party_size: 2,
        reservation_date: targetDate,
        reservation_time: '18:00',
        special_requests: null,
        status: 'pending'
      },
      {
        customer_name: 'Confirmed Reservation',
        customer_email: 'confirmed@example.com',
        customer_phone: '2222222222',
        party_size: 4,
        reservation_date: targetDate,
        reservation_time: '19:00',
        special_requests: null,
        status: 'confirmed'
      },
      {
        customer_name: 'Cancelled Reservation',
        customer_email: 'cancelled@example.com',
        customer_phone: '3333333333',
        party_size: 3,
        reservation_date: targetDate,
        reservation_time: '20:00',
        special_requests: null,
        status: 'cancelled'
      },
      {
        customer_name: 'Completed Reservation',
        customer_email: 'completed@example.com',
        customer_phone: '4444444444',
        party_size: 5,
        reservation_date: targetDate,
        reservation_time: '21:00',
        special_requests: null,
        status: 'completed'
      }
    ]).execute();

    const input: GetReservationsByDateInput = {
      date: '2024-12-25'
    };

    const result = await getReservationsByDate(input);

    expect(result).toHaveLength(4);
    const statuses = result.map(r => r.status);
    expect(statuses).toContain('pending');
    expect(statuses).toContain('confirmed');
    expect(statuses).toContain('cancelled');
    expect(statuses).toContain('completed');
  });

  it('should handle date string formats correctly', async () => {
    const targetDate = new Date('2024-01-15');

    await db.insert(reservationsTable).values({
      customer_name: 'Test User',
      customer_email: 'test@example.com',
      customer_phone: '1234567890',
      party_size: 2,
      reservation_date: targetDate,
      reservation_time: '18:00',
      special_requests: null,
      status: 'confirmed'
    }).execute();

    // Test different date string formats
    const formats = [
      '2024-01-15',
      '2024-1-15',
      '01/15/2024'
    ];

    for (const dateFormat of formats) {
      const input: GetReservationsByDateInput = {
        date: dateFormat
      };

      const result = await getReservationsByDate(input);
      expect(result).toHaveLength(1);
      expect(result[0].customer_name).toEqual('Test User');
    }
  });

  it('should handle reservations with different times on same date', async () => {
    const targetDate = new Date('2024-12-25');

    await db.insert(reservationsTable).values([
      {
        customer_name: 'Midnight Reservation',
        customer_email: 'midnight@example.com',
        customer_phone: '1111111111',
        party_size: 2,
        reservation_date: new Date(targetDate.setHours(0, 0, 0, 0)),
        reservation_time: '00:00',
        special_requests: null,
        status: 'confirmed'
      },
      {
        customer_name: 'Late Night Reservation',
        customer_email: 'late@example.com',
        customer_phone: '2222222222',
        party_size: 4,
        reservation_date: new Date(targetDate.setHours(23, 59, 59, 999)),
        reservation_time: '23:59',
        special_requests: null,
        status: 'confirmed'
      }
    ]).execute();

    const input: GetReservationsByDateInput = {
      date: '2024-12-25'
    };

    const result = await getReservationsByDate(input);

    expect(result).toHaveLength(2);
    expect(result[0].reservation_time).toEqual('00:00');
    expect(result[1].reservation_time).toEqual('23:59');
  });
});