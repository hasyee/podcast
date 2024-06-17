import React, { useState } from 'react';
import { useCounter, useMinus } from './hooks';
import { Button, Group, Text } from '@mantine/core';

function Test() {
  const [bool, setBool] = useState(false);
  const [{ increment, reset }, counter] = useCounter();
  const minus = useMinus();

  return (
    <Group ml={'auto'}>
      <Text>{counter}</Text>
      <Text>{minus}</Text>
      <Text>{bool ? 'true' : 'false'}</Text>

      <Button size="compact-xs" onClick={increment}>
        Increment
      </Button>
      <Button size="compact-xs" onClick={reset}>
        Reset
      </Button>
      <Button size="compact-xs" onClick={() => setBool(bool => !bool)}>
        Toggle
      </Button>
    </Group>
  );
}

export default React.memo(Test);
