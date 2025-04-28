import React from 'react';
import { Volume2Icon } from 'lucide-react';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Textarea,
} from '@/ui';

const TTSInput = (): React.ReactElement => (
  <Card>
    <CardHeader>
      <CardTitle>
        Direct TTS Input
      </CardTitle>
    </CardHeader>
    <CardContent className={'grid gap-[1rem]'}>
      <Textarea />
      <Button size={'lg'} className={'text-[0.75rem]'}>
        <Volume2Icon size={16} />
        Read All
      </Button>
    </CardContent>
  </Card>
);

export default TTSInput;
