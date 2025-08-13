import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SimpleDialog, SimpleDialogHeader, SimpleDialogTitle, SimpleDialogContent } from '@/components/SimpleDialog';
import { trpc } from '@/utils/trpc';
import type { MenuCategory, MenuItem } from '../../../server/src/schema';

interface MenuSectionProps {
  categories: MenuCategory[];
}

export function MenuSection({ categories }: MenuSectionProps) {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadMenuItems = useCallback(async (categoryId: number) => {
    try {
      setIsLoading(true);
      const items = await trpc.getMenuItemsByCategory.query({ categoryId });
      setMenuItems(items);
    } catch (error) {
      console.error('Failed to load menu items:', error);
      setMenuItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (categories.length > 0 && activeCategory === null) {
      const firstCategory = categories[0];
      if (firstCategory) {
        setActiveCategory(firstCategory.id);
        loadMenuItems(firstCategory.id);
      }
    }
  }, [categories, activeCategory, loadMenuItems]);

  const handleCategoryClick = (categoryId: number) => {
    if (categoryId !== activeCategory) {
      setActiveCategory(categoryId);
      loadMenuItems(categoryId);
    }
  };

  const formatDietaryInfo = (dietaryInfo: string | null) => {
    if (!dietaryInfo) return [];
    return dietaryInfo.split(',').map((info: string) => info.trim());
  };

  return (
    <section id="menu" className="py-16 px-4 md:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Our Menu
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Discover our carefully crafted dishes made with the finest ingredients 
            and prepared with passion by our expert chefs.
          </p>
        </div>

        {/* Category Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category: MenuCategory) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              size="lg"
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg'
                  : 'border-slate-300 text-slate-700 hover:border-indigo-600 hover:text-indigo-600'
              }`}
              onClick={() => handleCategoryClick(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Menu Items Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-slate-200 rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded mb-4 w-2/3"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {menuItems.map((item: MenuItem) => (
              <Card 
                key={item.id} 
                className="hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer border-0 shadow-md"
                onClick={() => setSelectedItem(item)}
              >
                {/* Food Image Placeholder */}
                <div 
                  className="h-48 bg-gradient-to-br from-slate-200 to-slate-300 rounded-t-lg flex items-center justify-center relative overflow-hidden"
                  style={{
                    backgroundImage: item.image_url ? `url(${item.image_url})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {!item.image_url && (
                    <div className="text-slate-500 text-center">
                      <div className="w-16 h-16 mx-auto mb-2 opacity-30">
                        🍽️
                      </div>
                      <span className="text-sm">Delicious Food Photo</span>
                    </div>
                  )}
                  {item.is_chefs_special && (
                    <Badge className="absolute top-3 right-3 bg-amber-500 hover:bg-amber-600 text-white">
                      Chef's Special
                    </Badge>
                  )}
                </div>

                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-slate-900 line-clamp-2">
                      {item.name}
                    </h3>
                    <span className="text-2xl font-bold text-indigo-600 ml-2">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                  
                  <p className="text-slate-600 mb-4 line-clamp-3">
                    {item.description}
                  </p>

                  {/* Dietary Info */}
                  <div className="flex flex-wrap gap-2">
                    {formatDietaryInfo(item.dietary_info).map((diet: string) => (
                      <Badge key={diet} variant="secondary" className="text-xs">
                        {diet}
                      </Badge>
                    ))}
                    {!item.is_available && (
                      <Badge variant="destructive" className="text-xs">
                        Currently Unavailable
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Menu Item Detail Modal */}
      <SimpleDialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        {selectedItem && (
          <>
            <SimpleDialogHeader>
              <SimpleDialogTitle>
                <div className="flex items-center justify-between">
                  {selectedItem.name}
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>
                {selectedItem.is_chefs_special && (
                  <Badge className="mt-2 bg-amber-500 hover:bg-amber-600 text-white">
                    Chef's Special
                  </Badge>
                )}
              </SimpleDialogTitle>
            </SimpleDialogHeader>
            
            <SimpleDialogContent>
              <div className="space-y-6">
                {/* Image */}
                <div 
                  className="w-full h-64 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundImage: selectedItem.image_url ? `url(${selectedItem.image_url})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {!selectedItem.image_url && (
                    <div className="text-slate-500 text-center">
                      <div className="w-20 h-20 mx-auto mb-2 opacity-30">
                        🍽️
                      </div>
                      <span>Mouth-watering Food Photo</span>
                    </div>
                  )}
                </div>

                {/* Price and Description */}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-lg text-slate-700 mb-4">
                      {selectedItem.description}
                    </p>
                  </div>
                  <div className="text-3xl font-bold text-indigo-600 ml-4">
                    ${selectedItem.price.toFixed(2)}
                  </div>
                </div>

                {/* Ingredients */}
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">Ingredients</h4>
                  <p className="text-slate-700">{selectedItem.ingredients}</p>
                </div>

                {/* Preparation Info */}
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">Preparation</h4>
                  <p className="text-slate-700">{selectedItem.preparation_info}</p>
                </div>

                {/* Dietary Info */}
                {selectedItem.dietary_info && (
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-2">Dietary Information</h4>
                    <div className="flex flex-wrap gap-2">
                      {formatDietaryInfo(selectedItem.dietary_info).map((diet: string) => (
                        <Badge key={diet} variant="secondary">
                          {diet}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Availability Status */}
                {!selectedItem.is_available && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 font-medium">
                      This item is currently unavailable. Please check back later or ask your server for alternatives.
                    </p>
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