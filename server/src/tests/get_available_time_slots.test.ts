import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { reservationsTable } from '../db/schema';
import { type GetReservationsByDateInput } from '../schema';
import { getAvailableTimeSlots } from '../handlers/get_available_time_slots';

describe('getAvailableTimeSlots', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  const testDate = '2024-02-15';
  const testInput: GetReservationsByDateInput = {
    date: testDate
  };

  it('should return all time slots as available when no reservations exist', async () => {
    const result = await getAvailableTimeSlots(testInput);

    expect(result).toHaveLength(10);
    
    const expectedTimes = [
      '17:00', '17:30', '18:00', '18:30', '19:00',
      '19:30', '20:00', '20:30', '21:00', '21:30'
    ];

    expectedTimes.forEach((time, index) => {
      expect(result[index].time).toEqual(time);
      expect(result[index].available).toBe(true);
      expect(result[index].capacity).toEqual(80); // Full capacity
    });
  });

  it('should calculate remaining capacity correctly with existing reservations', async () => {
    // Create test reservations
    await db.insert(reservationsTable).values([
      {
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        customer_phone: '1234567890',
        party_size: 4,
        reservation_date: new Date(testDate),
        reservation_time: '19:00',
        status: 'confirmed'
      },
      {
        customer_name: 'Jane Smith',
        customer_email: 'jane@example.com',
        customer_phone: '0987654321',
        party_size: 6,
        reservation_date: new Date(testDate),
        reservation_time: '19:00',
        status: 'confirmed'
      }
    ]);

    const result = await getAvailableTimeSlots(testInput);

    // Find the 19:00 slot
    const slot1900 = result.find(slot => slot.time === '19:00');
    expect(slot1900).toBeDefined();
    expect(slot1900!.available).toBe(true);
    expect(slot1900!.capacity).toEqual(70); // 80 - 4 - 6 = 70

    // Other slots should remain at full capacity
    const slot1730 = result.find(slot => slot.time === '17:30');
    expect(slot1730!.capacity).toEqual(80);
  });

  it('should mark time slot as unavailable when capacity is fully booked', async () => {
    // Create reservation that fills the restaurant
    await db.insert(reservationsTable).values({
      customer_name: 'Big Party',
      customer_email: 'party@example.com',
      customer_phone: '1111111111',
      party_size: 80, // Full capacity
      reservation_date: new Date(testDate),
      reservation_time: '20:00',
      status: 'confirmed'
    });

    const result = await getAvailableTimeSlots(testInput);

    const slot2000 = result.find(slot => slot.time === '20:00');
    expect(slot2000).toBeDefined();
    expect(slot2000!.available).toBe(false);
    expect(slot2000!.capacity).toEqual(0);

    // Other slots should remain available
    const slot1930 = result.find(slot => slot.time === '19:30');
    expect(slot1930!.available).toBe(true);
    expect(slot1930!.capacity).toEqual(80);
  });

  it('should exclude cancelled reservations from capacity calculation', async () => {
    await db.insert(reservationsTable).values([
      {
        customer_name: 'Confirmed Guest',
        customer_email: 'confirmed@example.com',
        customer_phone: '1234567890',
        party_size: 10,
        reservation_date: new Date(testDate),
        reservation_time: '18:30',
        status: 'confirmed'
      },
      {
        customer_name: 'Cancelled Guest',
        customer_email: 'cancelled@example.com',
        customer_phone: '0987654321',
        party_size: 20,
        reservation_date: new Date(testDate),
        reservation_time: '18:30',
        status: 'cancelled'
      }
    ]);

    const result = await getAvailableTimeSlots(testInput);

    const slot1830 = result.find(slot => slot.time === '18:30');
    expect(slot1830).toBeDefined();
    expect(slot1830!.available).toBe(true);
    // Should only subtract confirmed reservation (10), not cancelled (20)
    expect(slot1830!.capacity).toEqual(70); // 80 - 10 = 70
  });

  it('should handle multiple reservations across different time slots', async () => {
    await db.insert(reservationsTable).values([
      {
        customer_name: 'Early Dinner',
        customer_email: 'early@example.com',
        customer_phone: '1111111111',
        party_size: 5,
        reservation_date: new Date(testDate),
        reservation_time: '17:00',
        status: 'confirmed'
      },
      {
        customer_name: 'Prime Time 1',
        customer_email: 'prime1@example.com',
        customer_phone: '2222222222',
        party_size: 15,
        reservation_date: new Date(testDate),
        reservation_time: '19:30',
        status: 'pending'
      },
      {
        customer_name: 'Prime Time 2',
        customer_email: 'prime2@example.com',
        customer_phone: '3333333333',
        party_size: 25,
        reservation_date: new Date(testDate),
        reservation_time: '19:30',
        status: 'confirmed'
      },
      {
        customer_name: 'Late Dinner',
        customer_email: 'late@example.com',
        customer_phone: '4444444444',
        party_size: 8,
        reservation_date: new Date(testDate),
        reservation_time: '21:30',
        status: 'completed'
      }
    ]);

    const result = await getAvailableTimeSlots(testInput);

    // Check 17:00 slot
    const slot1700 = result.find(slot => slot.time === '17:00');
    expect(slot1700!.capacity).toEqual(75); // 80 - 5 = 75

    // Check 19:30 slot (should include both pending and confirmed)
    const slot1930 = result.find(slot => slot.time === '19:30');
    expect(slot1930!.capacity).toEqual(40); // 80 - 15 - 25 = 40

    // Check 21:30 slot
    const slot2130 = result.find(slot => slot.time === '21:30');
    expect(slot2130!.capacity).toEqual(72); // 80 - 8 = 72

    // Check unbooked slot
    const slot1800 = result.find(slot => slot.time === '18:00');
    expect(slot1800!.capacity).toEqual(80);
  });

  it('should handle reservations for different dates correctly', async () => {
    // Create reservations for different dates
    await db.insert(reservationsTable).values([
      {
        customer_name: 'Today Guest',
        customer_email: 'today@example.com',
        customer_phone: '1111111111',
        party_size: 10,
        reservation_date: new Date(testDate),
        reservation_time: '19:00',
        status: 'confirmed'
      },
      {
        customer_name: 'Tomorrow Guest',
        customer_email: 'tomorrow@example.com',
        customer_phone: '2222222222',
        party_size: 15,
        reservation_date: new Date('2024-02-16'), // Different date
        reservation_time: '19:00',
        status: 'confirmed'
      }
    ]);

    const result = await getAvailableTimeSlots(testInput);

    // Should only count today's reservation
    const slot1900 = result.find(slot => slot.time === '19:00');
    expect(slot1900!.capacity).toEqual(70); // 80 - 10 = 70 (not affected by tomorrow's reservation)
  });
});