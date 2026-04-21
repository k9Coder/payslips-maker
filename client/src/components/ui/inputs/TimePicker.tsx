import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TimePickerProps {
  value: string; // "HH:mm"
  onChange: (value: string) => void;
  label?: string;
}

export function TimePicker({ value, onChange, label }: TimePickerProps) {
  // Local state for the input display to handle partial typing
  const [displayValue, setDisplayValue] = useState(value);

  // Sync local display when external value changes (e.g., on Clear or Edit)
  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ''); // Numbers only
    
    if (val.length > 4) val = val.slice(0, 4);

    // Auto-colon logic
    let formatted = val;
    if (val.length >= 3) {
      formatted = val.slice(0, 2) + ':' + val.slice(2);
    }

    setDisplayValue(formatted);

    // Only update the parent state if it's a complete valid-looking time
    if (formatted.length === 5) {
      onChange(formatted);
    } else if (formatted === "") {
      onChange("");
    }
  };

  const handleBlur = () => {
    // Validation on blur: fix "9:00" to "09:00"
    if (displayValue.includes(':')) {
      const [h, m] = displayValue.split(':');
      const fixedH = h.padStart(2, '0');
      const fixedM = (m || '').padEnd(2, '0').slice(0, 2);
      const final = `${fixedH}:${fixedM}`;
      setDisplayValue(final);
      onChange(final);
    }
  };

  // Quick select options
  const quickTimes = ["08:00", "09:00", "17:00", "18:00"];

  return (
    <div className="space-y-1">
      <div className="relative group">
        <Input
          type="text"
          placeholder="00:00"
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="pl-9 font-mono focus-visible:ring-[#1B2A4A]"
          dir="ltr"
        />
        <Popover>
          <PopoverTrigger asChild>
            <button className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1B2A4A]">
              <Clock className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="start">
            <div className="grid grid-cols-2 gap-2">
              {quickTimes.map((t) => (
                <button
                  key={t}
                  className="text-xs p-2 border rounded hover:bg-slate-50 transition-colors"
                  onClick={() => {
                    setDisplayValue(t);
                    onChange(t);
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-center uppercase">נפוץ לאחרונה</p>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}