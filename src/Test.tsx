import React from 'react';
import { useCounter } from './hooks';

function Test() {
  const [{ increment }, counter] = useCounter();
  return (
    <div>
      <p>{counter}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}

export default React.memo(Test);
