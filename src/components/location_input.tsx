'use client';

import React, { Fragment, KeyboardEvent } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Autocomplete } from '@react-google-maps/api';
import { GripVertical, Plus, Trash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface LocationInputProps {
  locations: Location[];
  setLocations: (locations: Location[]) => void;
  onFocusInput: (index: number) => void;
  onAddressInput: (index: number, address: string) => void;
  onAddressSubmit: (index: number, address: string) => void;
}

const SortableItem: React.FC<{
  id: number;
  value: string;
  placeholder: string;
  onPlaceSelected: (place: google.maps.places.PlaceResult) => void;
  onInputChange: (value: string) => void;
  onInputSubmit: (value: string) => void;
  onFocus: () => void;
  onRemove: () => void;
}> = ({ id, value, placeholder, onPlaceSelected, onInputChange, onInputSubmit, onFocus, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  
  // Store reference to the current autocomplete instance
  const autocompleteRef = React.useRef<google.maps.places.Autocomplete | null>(null);

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place && place.geometry && place.geometry.location) {
        // This will properly update with the selected place
        onPlaceSelected(place);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onInputSubmit(value);
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="group flex items-center gap-2 w-full mb-2">
      <div {...listeners} {...attributes} className="px-0.5 cursor-grab">
        <GripVertical className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <Autocomplete
          onLoad={(autocomplete) => {
            // Store the autocomplete instance in ref
            autocompleteRef.current = autocomplete;
            if (autocomplete) {
              // Use the proper event listener pattern
              google.maps.event.addListener(autocomplete, 'place_changed', handlePlaceChanged);
            }
          }}
          onUnmount={() => {
            // Clean up listeners when component unmounts
            if (autocompleteRef.current) {
              google.maps.event.clearListeners(autocompleteRef.current, 'place_changed');
              autocompleteRef.current = null;
            }
          }}
          options={{
            componentRestrictions: { country: 'id' },
          }}
        >
          <Input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              // Add a slight delay to avoid race conditions with place_changed event
              setTimeout(() => {
                // Only call onInputSubmit if we have a value and no place was selected
                if (value.trim()) {
                  onInputSubmit(value);
                }
              }, 200);
            }}
            onFocus={onFocus}
          />
        </Autocomplete>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8" 
        onClick={onRemove}
      >
        <Trash className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  );
};

const LocationInput: React.FC<LocationInputProps> = ({ 
  locations, 
  setLocations, 
  onFocusInput, 
  onAddressInput, 
  onAddressSubmit
}) => {
  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = Number(active.id);
      const newIndex = Number(over.id);
      const reordered = [...locations];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);
      setLocations(reordered);
    }
  };

  const handleSelectPlace = (index: number, place: google.maps.places.PlaceResult) => {
    if (place.geometry?.location) {
      const newLocation = {
        lat: place.geometry.location.lat() ?? 0,
        lng: place.geometry.location.lng() ?? 0,
        address: place.formatted_address ?? '',
      };
      
      // Create a new array to ensure React detects the change
      const newLocations = [...locations];
      newLocations[index] = newLocation;
      setLocations(newLocations);
    }
  };

  const handleAddLocation = () => {
    setLocations([...locations, { lat: 0, lng: 0, address: '' }]);
  };

  const handleRemoveLocation = (index: number) => {
    // Always keep at least 2 locations
    if (locations.length <= 2) return;
    
    setLocations(locations.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <DndContext onDragEnd={handleDragEnd}>
        <SortableContext items={locations.map((_, i) => i)} strategy={verticalListSortingStrategy}>
          {locations.map((loc, index) => (
            <Fragment key={index}>
              <SortableItem
                id={index}
                value={loc.address}
                placeholder={`Pilih destinasi ${index + 1}`}
                onPlaceSelected={(place) => handleSelectPlace(index, place)}
                onInputChange={(value) => onAddressInput(index, value)}
                onInputSubmit={(value) => onAddressSubmit(index, value)}
                onFocus={() => onFocusInput(index)}
                onRemove={() => handleRemoveLocation(index)}
              />
            </Fragment>
          ))}
        </SortableContext>
      </DndContext>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full flex items-center gap-1" 
        onClick={handleAddLocation}
      >
        <Plus className="h-4 w-4" />
        <span>Tambah destinasi</span>
      </Button>
    </div>
  );
};

export default LocationInput;
