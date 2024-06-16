import React, { useState } from 'react';
import { useCounter, useMinus } from './hooks';

function Test() {
  const [bool, setBool] = useState(false);
  const [{ increment, reset }, counter] = useCounter();
  const minus = useMinus();

  return (
    <div>
      <p>{counter}</p>
      <p>{minus}</p>
      <p>{bool ? 'true' : 'false'}</p>

      <button onClick={increment}>Increment</button>
      <button onClick={reset}>Reset</button>
      <button onClick={() => setBool(bool => !bool)}>Toggle</button>
    </div>
  );
}

export default React.memo(Test);
