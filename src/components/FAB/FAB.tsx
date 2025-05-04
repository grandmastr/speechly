import React from 'react';
import { clsx } from 'clsx';
import { AudioLinesIcon } from 'lucide-react';

import { Button } from '@/ui';

interface FABProps {
  isOpen: boolean;
  onClick: () => void;
}

const FAB = ({ isOpen, onClick }: FABProps): React.ReactElement => {
  return (
    <Button onClick={onClick}
            className={clsx(
              'shadow-lg fixed bottom-4 right-4 size-16 transition-transform ease-in-out duration-200 rounded-full focus-ring-2 cursor-pointer',
              isOpen ? 'scale-0' : 'scale-100')}>
      <AudioLinesIcon size={24} />
    </Button>
  );
};

export default FAB;
