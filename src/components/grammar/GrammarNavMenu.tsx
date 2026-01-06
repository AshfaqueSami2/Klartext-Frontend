'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, Home, Trophy, LayoutGrid } from 'lucide-react';

export function GrammarNavMenu() {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-lg">
          <Menu className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => router.push('/grammar')}>
          <LayoutGrid className="w-4 h-4 mr-2" />
          All Topics
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/grammar/progress')}>
          <Trophy className="w-4 h-4 mr-2" />
          My Progress
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/dashboard')}>
          <Home className="w-4 h-4 mr-2" />
          Dashboard
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
