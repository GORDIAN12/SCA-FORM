'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/context/language-context';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartTutorial: () => void;
}

export function SettingsDialog({ open, onOpenChange, onStartTutorial }: SettingsDialogProps) {
  const { setTheme, theme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('settings')}</DialogTitle>
          <DialogDescription>
            {t('settingsDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode">{t('darkMode')}</Label>
            <Switch
              id="dark-mode"
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="language">{t('language')}</Label>
            <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'es' | 'pt')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="pt">Português</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={onStartTutorial}>
                {t('startTutorial')}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
