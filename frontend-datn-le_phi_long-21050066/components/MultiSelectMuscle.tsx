'use client';

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MUSCLE_GROUPS } from "@/constants";

type Props = {
  value: string[];                  // các id dạng string
  onChange: (v: string[]) => void;  // đẩy ngược lên form
  placeholder?: string;
};

export function MultiSelectMuscle({ value, onChange, placeholder = "Chọn nhóm cơ..." }: Props) {
  const [open, setOpen] = React.useState(false);

  const toggle = (id: string) => {
    if (value.includes(id)) onChange(value.filter((v) => v !== id));
    else onChange([...value, id]);
  };

  const selected = MUSCLE_GROUPS.filter((m) => value.includes(String(m.id)));

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" className="w-full justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              {selected.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                selected.map((m) => <Badge key={m.id} variant="secondary">{m.name}</Badge>)
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Tìm nhóm cơ..." />
            <CommandEmpty>Không có kết quả</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {MUSCLE_GROUPS.map((m) => {
                const isSelected = value.includes(String(m.id));
                return (
                  <CommandItem
                    key={m.id}
                    value={m.name}
                    onSelect={() => toggle(String(m.id))}
                    className="cursor-pointer"
                  >
                    <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                    {m.name}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
