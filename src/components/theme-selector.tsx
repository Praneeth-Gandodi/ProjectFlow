'use client';

import { useContext } from 'react';
import { ProfileContext, ColorTheme } from '@/context/profile-context';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const themes: { value: ColorTheme; label: string; colors: string[]; description: string }[] = [
    {
        value: 'light',
        label: 'Light',
        colors: ['#ffffff', '#f8f9fa', '#1a1d29'],
        description: 'Clean and bright'
    },
    {
        value: 'dark',
        label: 'Dark',
        colors: ['#18191d', '#242529', '#ffffff'],
        description: 'Easy on the eyes'
    },
    {
        value: 'earthy',
        label: 'Earthy',
        colors: ['#414A37', '#99744A', '#DBC2A6'],
        description: 'Natural and warm'
    },
    {
        value: 'purple',
        label: 'Purple',
        colors: ['#50207A', '#D6B9FC', '#838CE5'],
        description: 'Vibrant and modern'
    },
    {
        value: 'vintage',
        label: 'Vintage',
        colors: ['#69385C', '#715B64', '#C1AE9F'],
        description: 'Soft and nostalgic'
    },
    {
        value: 'frost',
        label: 'Frost',
        colors: ['#6F58C9', '#7E78D2', '#BDEDE0'],
        description: 'Cool and crisp'
    },
    {
        value: 'ocean',
        label: 'Ocean',
        colors: ['#1a4d5c', '#2d7a8f', '#5bc0de'],
        description: 'Deep and calming'
    }
];

export function ThemeSelector({ open, onOpenChange }: ThemeSelectorProps) {
    const { colorTheme, setColorTheme } = useContext(ProfileContext);

    const handleThemeSelect = (theme: ColorTheme) => {
        setColorTheme(theme);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="font-headline">Choose Your Theme</DialogTitle>
                    <DialogDescription>
                        Select a color theme that suits your style
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-3 py-4 max-h-[500px] overflow-y-auto">
                    {themes.map((theme) => (
                        <button
                            key={theme.value}
                            onClick={() => handleThemeSelect(theme.value)}
                            className={cn(
                                "relative flex flex-col items-start p-4 rounded-lg border-2 transition-all hover:shadow-md",
                                colorTheme === theme.value
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                            )}
                        >
                            {colorTheme === theme.value && (
                                <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                    <Check className="h-3 w-3 text-primary-foreground" />
                                </div>
                            )}
                            <div className="flex gap-2 mb-3">
                                {theme.colors.map((color, index) => (
                                    <div
                                        key={index}
                                        className="h-8 w-8 rounded-md border border-border/50 shadow-sm"
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                            <div className="text-left">
                                <div className="font-semibold font-headline">{theme.label}</div>
                                <div className="text-xs text-muted-foreground">{theme.description}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
