import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SimpleDialog, SimpleDialogHeader, SimpleDialogTitle, SimpleDialogContent } from '@/components/SimpleDialog';
import type { MenuItem } from '../../../server/src/schema';

interface ChefsSpecialsSectionProps {
  specials: MenuItem[];
}

export function ChefsSpecialsSection({ specials }: ChefsSpecialsSectionProps) {
  const [selectedSpecial, setSelectedSpecial] = useState<MenuItem | null>(null);

  const formatDietaryInfo = (dietaryInfo: string | null) => {
    if (!dietaryInfo) return [];
    return dietaryInfo.split(',').map((info: string) => info.trim());
  };

  if (specials.length === 0) {
    return (
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Chef's Specials
          </h2>
          <p className="text-xl text-slate-600">
            Our chef is currently crafting new special dishes. Check back soon!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 md:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
            <span className="text-2xl">👨‍🍳</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Chef's Specials
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Indulge in our chef's signature creations, featuring premium ingredients 
            and innovative techniques that showcase culinary artistry.
          </p>
        </div>

        {/* Specials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {specials.map((special: MenuItem) => (
            <Card 
              key={special.id} 
              className="hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer border-0 shadow-lg relative overflow-hidden"
              onClick={() => setSelectedSpecial(special)}
            >
              {/* Premium Badge */}
              <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-white px-4 py-2 text-sm font-semibold rounded-bl-lg z-10">
                ⭐ Premium
              </div>

              {/* Food Image Placeholder */}
              <div 
                className="h-56 bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center relative overflow-hidden"
                style={{
                  backgroundImage: special.image_url ? `url(${special.image_url})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {!special.image_url && (
                  <div className="text-amber-600 text-center">
                    <div className="w-20 h-20 mx-auto mb-2 opacity-50">
                      🍽️
                    </div>
                    <span className="text-sm font-medium">Premium Dish Photo</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-slate-900 line-clamp-2 pr-2">
                    {special.name}
                  </h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-amber-600">
                      ${special.price.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <p className="text-slate-600 mb-4 line-clamp-3 leading-relaxed">
                  {special.description}
                </p>

                {/* Dietary Info and Status */}
                <div className="flex flex-wrap gap-2">
                  {formatDietaryInfo(special.dietary_info).map((diet: string) => (
                    <Badge key={diet} variant="secondary" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                      {diet}
                    </Badge>
                  ))}
                  {!special.is_available && (
                    <Badge variant="destructive" className="text-xs">
                      Currently Unavailable
                    </Badge>
                  )}
                </div>

                {/* Click to view details hint */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500 italic">Click to view ingredients & preparation details</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-slate-50 to-indigo-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Experience Culinary Excellence
            </h3>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Our chef's specials are available for a limited time and feature seasonal ingredients. 
              Reserve your table today to ensure you don't miss these extraordinary dishes.
            </p>
            <button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-full transition-colors duration-300"
              onClick={() => document.getElementById('reservations')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Make a Reservation
            </button>
          </div>
        </div>
      </div>

      {/* Special Detail Modal */}
      <SimpleDialog open={!!selectedSpecial} onOpenChange={(open) => !open && setSelectedSpecial(null)}>
        {selectedSpecial && (
          <>
            <SimpleDialogHeader>
              <SimpleDialogTitle>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="mr-3">👨‍🍳</span>
                    {selectedSpecial.name}
                    <Badge className="ml-3 bg-amber-500 hover:bg-amber-600 text-white">
                      Chef's Special
                    </Badge>
                  </div>
                  <button
                    onClick={() => setSelectedSpecial(null)}
                    className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>
              </SimpleDialogTitle>
            </SimpleDialogHeader>
            
            <SimpleDialogContent>
              <div className="space-y-6">
                {/* Image */}
                <div 
                  className="w-full h-72 bg-gradient-to-br from-amber-100 to-orange-200 rounded-lg flex items-center justify-center relative overflow-hidden"
                  style={{
                    backgroundImage: selectedSpecial.image_url ? `url(${selectedSpecial.image_url})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {!selectedSpecial.image_url && (
                    <div className="text-amber-600 text-center">
                      <div className="w-24 h-24 mx-auto mb-2 opacity-50">
                        🍽️
                      </div>
                      <span className="text-lg font-medium">Premium Dish Photography</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2">
                      <span className="text-2xl font-bold text-amber-600">
                        ${selectedSpecial.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-slate-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-3">Chef's Description</h4>
                  <p className="text-slate-700 text-lg leading-relaxed">
                    {selectedSpecial.description}
                  </p>
                </div>

                {/* Ingredients */}
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                    <span className="mr-2">🥬</span>
                    Premium Ingredients
                  </h4>
                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <p className="text-slate-700 leading-relaxed">{selectedSpecial.ingredients}</p>
                  </div>
                </div>

                {/* Preparation Info */}
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                    <span className="mr-2">👨‍🍳</span>
                    Chef's Technique
                  </h4>
                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <p className="text-slate-700 leading-relaxed">{selectedSpecial.preparation_info}</p>
                  </div>
                </div>

                {/* Dietary Info */}
                {selectedSpecial.dietary_info && (
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-3">Dietary Information</h4>
                    <div className="flex flex-wrap gap-2">
                      {formatDietaryInfo(selectedSpecial.dietary_info).map((diet: string) => (
                        <Badge key={diet} className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                          {diet}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Availability Status */}
                {!selectedSpecial.is_available ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <span className="mr-2 text-red-500">⚠️</span>
                      <p className="text-red-700 font-medium">
                        This chef's special is currently unavailable. Please ask your server about today's alternatives.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <span className="mr-2 text-green-500">✅</span>
                      <p className="text-green-700 font-medium">
                        Available today! Reserve your table to experience this exceptional dish.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </SimpleDialogContent>
          </>
        )}
      </SimpleDialog>
    </section>
  );
}