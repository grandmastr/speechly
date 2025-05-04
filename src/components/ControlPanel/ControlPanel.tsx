import React from 'react';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  VisuallyHidden,
} from '@/ui';
import { AudioRecorder, TTSInput, VoiceSelector } from '@/components';

interface ControlPanelProps {
  isOpen: boolean;
  onOpenChange: () => void;
  fullName?: string;
  email?: string;
}

const ControlPanel = ({
  isOpen,
  onOpenChange,
  fullName,
  email,
}: ControlPanelProps): React.ReactElement => (
  <Sheet open={isOpen} onOpenChange={onOpenChange}>
    <SheetContent className={'!max-w-[450px]'}>
      <SheetHeader>
        <SheetTitle>Speechly - Your AI TTS companion</SheetTitle>
        <VisuallyHidden>
          <SheetDescription>Control panel for speechly</SheetDescription>
        </VisuallyHidden>
      </SheetHeader>
      <div className={'px-[1rem] grid gap-[2rem]'}>
        <AudioRecorder fullName={fullName} email={email} />
        <VoiceSelector />
        <TTSInput />
      </div>
    </SheetContent>
  </Sheet>
);

export default ControlPanel;
