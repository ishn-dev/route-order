import React from 'react';
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";

const AlgorithmSelector = ({ value, onValueChange }) => {
  return (
    <RadioGroup
      dir="rtl"
      value={value}
      onValueChange={onValueChange}
      className="flex gap-6"
    >
      <div className="flex items-center space-x-2 space-x-reverse">
        <RadioGroupItem 
          value="nearest" 
          id="nearest" 
          className={cn(
            "h-5 w-5",
            "border-2 border-gray-300",
            "focus:ring-2 focus:ring-blue-500"
          )}
        />
        <Label 
          htmlFor="nearest" 
          className="text-base font-medium cursor-pointer mr-2"
        >
          אלגוריתם "השכן הקרוב"
        </Label>
      </div>
      <div className="flex items-center space-x-2 space-x-reverse">
        <RadioGroupItem 
          value="genetic" 
          id="genetic" 
          className={cn(
            "h-5 w-5",
            "border-2 border-gray-300",
            "focus:ring-2 focus:ring-blue-500"
          )}
        />
        <Label 
          htmlFor="genetic" 
          className="text-base font-medium cursor-pointer mr-2"
        >
          אלגוריתם גנטי
        </Label>
      </div>
    </RadioGroup>
  );
};

export default AlgorithmSelector;