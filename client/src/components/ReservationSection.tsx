import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SimpleDialog, SimpleDialogHeader, SimpleDialogTitle, SimpleDialogContent } from '@/components/SimpleDialog';
import { Card, CardContent } from '@/components/ui/card';
import { trpc } from '@/utils/trpc';
import type { CreateReservationInput } from '../../../server/src/schema';
import type { TimeSlot } from '../../../server/src/handlers/get_available_time_slots';

export function ReservationSection() {
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState('');

  const [formData, setFormData] = useState<CreateReservationInput>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    party_size: 2,
    reservation_date: '',
    reservation_time: '',
    special_requests: null
  });

  const loadAvailableSlots = useCallback(async (date: string) => {
    if (!date) return;
    
    try {
      const slots = await trpc.getAvailableTimeSlots.query({ date });
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Failed to load available slots:', error);
      setAvailableSlots([]);
    }
  }, []);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setFormData((prev: CreateReservationInput) => ({
      ...prev,
      reservation_date: date,
      reservation_time: '' // Reset time when date changes
    }));
    loadAvailableSlots(date);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await trpc.createReservation.mutate(formData);
      setIsSuccess(true);
      // Reset form
      setFormData({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        party_size: 2,
        reservation_date: '',
        reservation_time: '',
        special_requests: null
      });
      setSelectedDate('');
      setAvailableSlots([]);
    } catch (error) {
      console.error('Failed to create reservation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = (open: boolean) => {
    setIsReservationModalOpen(open);
    if (!open) {
      setIsSuccess(false);
      setIsLoading(false);
    }
  };

  // Generate date options (next 30 days)
  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      const displayDate = date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
      dates.push({ value: dateString, label: displayDate });
    }
    
    return dates;
  };

  const partySizeOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

  return (
    <section id="reservations" className="py-16 px-4 md:px-6 lg:px-8 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-6">
            <span className="text-2xl">🍽️</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Reserve Your Table
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Secure your dining experience with us. Book your table and let us create 
            an unforgettable culinary journey for you and your guests.
          </p>
        </div>

        {/* Reservation Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">📅</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Easy Booking</h3>
              <p className="text-slate-300">
                Quick and simple reservation process with instant confirmation
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">🕒</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Flexible Times</h3>
              <p className="text-slate-300">
                Choose from available time slots that work best for your schedule
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">🎉</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Special Occasions</h3>
              <p className="text-slate-300">
                Let us know about celebrations and we'll make them extra special
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Reservation CTA */}
        <div className="text-center">
          <Button 
            size="lg" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-4 text-xl font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
            onClick={() => setIsReservationModalOpen(true)}
          >
            Make a Reservation
          </Button>

          {/* Simple Dialog for Reservations */}
          <SimpleDialog open={isReservationModalOpen} onOpenChange={handleModalClose}>
            <SimpleDialogHeader>
              <SimpleDialogTitle>
                <div className="flex items-center justify-between">
                  {isSuccess ? 'Reservation Confirmed!' : 'Make a Reservation'}
                  <button
                    onClick={() => handleModalClose(false)}
                    className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>
              </SimpleDialogTitle>
            </SimpleDialogHeader>

            <SimpleDialogContent>
              {isSuccess ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">✅</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                    Thank you for your reservation!
                  </h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    We've received your reservation request and will send a confirmation 
                    email shortly. We look forward to providing you with an exceptional 
                    dining experience.
                  </p>
                  <div className="bg-slate-50 rounded-lg p-6">
                    <p className="text-sm text-slate-600">
                      <strong>What's Next:</strong><br />
                      • Check your email for confirmation details<br />
                      • We'll contact you if there are any questions<br />
                      • Arrive 10-15 minutes early for your reservation
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customer_name" className="text-sm font-medium text-slate-700">
                        Full Name *
                      </Label>
                      <Input
                        id="customer_name"
                        value={formData.customer_name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData((prev: CreateReservationInput) => ({ ...prev, customer_name: e.target.value }))
                        }
                        placeholder="Enter your full name"
                        className="mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="customer_email" className="text-sm font-medium text-slate-700">
                        Email Address *
                      </Label>
                      <Input
                        id="customer_email"
                        type="email"
                        value={formData.customer_email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData((prev: CreateReservationInput) => ({ ...prev, customer_email: e.target.value }))
                        }
                        placeholder="Enter your email"
                        className="mt-1"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="customer_phone" className="text-sm font-medium text-slate-700">
                      Phone Number *
                    </Label>
                    <Input
                      id="customer_phone"
                      type="tel"
                      value={formData.customer_phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: CreateReservationInput) => ({ ...prev, customer_phone: e.target.value }))
                      }
                      placeholder="Enter your phone number"
                      className="mt-1"
                      required
                    />
                  </div>

                  {/* Reservation Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reservation_date" className="text-sm font-medium text-slate-700">
                        Date *
                      </Label>
                      <Select 
                        value={selectedDate} 
                        onValueChange={handleDateChange}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select a date" />
                        </SelectTrigger>
                        <SelectContent>
                          {generateDateOptions().map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="party_size" className="text-sm font-medium text-slate-700">
                        Party Size *
                      </Label>
                      <Select 
                        value={formData.party_size.toString()} 
                        onValueChange={(value) => 
                          setFormData((prev: CreateReservationInput) => ({ ...prev, party_size: parseInt(value) }))
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select party size" />
                        </SelectTrigger>
                        <SelectContent>
                          {partySizeOptions.map((size) => (
                            <SelectItem key={size} value={size.toString()}>
                              {size} {size === 1 ? 'guest' : 'guests'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Time Selection */}
                  {availableSlots.length > 0 && (
                    <div>
                      <Label htmlFor="reservation_time" className="text-sm font-medium text-slate-700">
                        Available Times *
                      </Label>
                      <div className="mt-2 grid grid-cols-3 md:grid-cols-4 gap-2">
                        {availableSlots
                          .filter((slot: TimeSlot) => slot.available)
                          .map((slot: TimeSlot) => (
                          <Button
                            key={slot.time}
                            type="button"
                            variant={formData.reservation_time === slot.time ? "default" : "outline"}
                            size="sm"
                            className={`h-auto py-2 ${
                              formData.reservation_time === slot.time
                                ? 'bg-indigo-600 text-white'
                                : 'border-slate-300 hover:border-indigo-600 hover:text-indigo-600'
                            }`}
                            onClick={() => 
                              setFormData((prev: CreateReservationInput) => ({ ...prev, reservation_time: slot.time }))
                            }
                          >
                            {slot.time}
                            {slot.capacity > 0 && (
                              <span className="ml-1 text-xs opacity-75">
                                ({slot.capacity} left)
                              </span>
                            )}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Special Requests */}
                  <div>
                    <Label htmlFor="special_requests" className="text-sm font-medium text-slate-700">
                      Special Requests (Optional)
                    </Label>
                    <Textarea
                      id="special_requests"
                      value={formData.special_requests || ''}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setFormData((prev: CreateReservationInput) => ({ 
                          ...prev, 
                          special_requests: e.target.value || null 
                        }))
                      }
                      placeholder="Any dietary restrictions, allergies, or special occasions we should know about?"
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      disabled={isLoading || !formData.reservation_time}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-lg font-semibold disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Confirming Reservation...
                        </div>
                      ) : (
                        'Confirm Reservation'
                      )}
                    </Button>
                  </div>

                  <div className="text-xs text-slate-500 text-center">
                    By making a reservation, you agree to our cancellation policy. 
                    We require 24-hour notice for cancellations.
                  </div>
                </form>
              )}
            </SimpleDialogContent>
          </SimpleDialog>

          {/* Contact Information */}
          <div className="mt-12 pt-12 border-t border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <h4 className="font-semibold text-lg mb-2">📞 Phone</h4>
                <p className="text-slate-300">(555) 123-4567</p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">📧 Email</h4>
                <p className="text-slate-300">reservations@restaurant.com</p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">🕒 Hours</h4>
                <p className="text-slate-300">
                  Mon-Thu: 5:00 PM - 10:00 PM<br />
                  Fri-Sat: 5:00 PM - 11:00 PM<br />
                  Sun: 5:00 PM - 9:00 PM
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}