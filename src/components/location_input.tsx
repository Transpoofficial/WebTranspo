"use client";

import { Fragment, useState } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { EllipsisVertical, Flag, GripVertical, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Interface for location state
interface Location {
  id: string;
  placeholder: string;
  value: string;
}

// Interface for Input component props
interface InputProps {
  type: string;
  placeholder: string;
  className?: string;
  id?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// Interface for SortableItem props
interface SortableItemProps {
  id: string;
  location: Location;
  handleInputChange: (id: string, value: string) => void;
}

// Input component (replace with your actual Input component)
const InputTemplate: React.FC<InputProps> = ({
  type,
  placeholder,
  className,
  id,
  value,
  onChange,
}) => (
  <Input
    type={type}
    placeholder={placeholder}
    className={className}
    id={id}
    value={value}
    onChange={onChange}
  />
);

// Sortable Item component
const SortableItem: React.FC<SortableItemProps> = ({
  id,
  location,
  handleInputChange,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center w-full`}
    >
      {/* Drag handle */}
      <div
        {...listeners}
        {...attributes}
        className={`invisible group-hover:visible ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        <GripVertical size={20} />
      </div>

      {/* Input field */}
      <InputTemplate
        type="text"
        placeholder={location.placeholder}
         className="w-full"
        value={location.value}
        onChange={(e) => handleInputChange(location.id, e.target.value)}
      />
    </div>
  );
};

const LocationInput: React.FC = () => {
  // Initial state for input fields
  const [locations, setLocations] = useState<Location[]>([
    { id: "location-1", placeholder: "Titik jemput", value: "" },
    { id: "location-2", placeholder: "Lokasi tujuan 1", value: "" },
    { id: "location-3", placeholder: "Lokasi tujuan terakhir", value: "" },
  ]);

  // Handle drag end to reorder items
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLocations((prev) => {
        const oldIndex = prev.findIndex((loc) => loc.id === active.id);
        const newIndex = prev.findIndex((loc) => loc.id === over.id);
        const newLocations = [...prev];
        const [movedItem] = newLocations.splice(oldIndex, 1);
        newLocations.splice(newIndex, 0, movedItem);
        return newLocations;
      });
    }
  };

  // Handle input value changes
  const handleInputChange = (id: string, value: string) => {
    setLocations((prev) =>
      prev.map((loc) => (loc.id === id ? { ...loc, value } : loc))
    );
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext
        items={locations.map((loc) => loc.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col items-center">
          {locations.map((location, key) => (
            <Fragment key={key}>
              <div className="flex items-center w-full">
                {key === 0 ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="min-w-5 min-h-5 w-5 h-5">
                          <MapPin color="#DC362E" size={20} />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Titik penjemputan</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : key === locations.length - 1 ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="min-w-5 min-h-5 w-5 h-5">
                          <Flag color="#DC362E" size={20} />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Titik penjemputan</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="min-w-5 min-h-5 w-5 h-5 text-xs text-center font-medium border border-black rounded-full">
                          {key}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Tujuan {key}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                <SortableItem
                  key={location.id}
                  id={location.id}
                  location={location}
                  handleInputChange={handleInputChange}
                />
              </div>

              {key !== locations.length - 1 && (
                <div className="min-w-5 w-5 mr-auto">
                  <EllipsisVertical strokeWidth={1} size={20} />
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default LocationInput;
