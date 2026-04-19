import React from 'react';
import Admonition from '@theme/Admonition';

export default function Tip({children, title}) {
  return (
    <Admonition type="tip" title={title}>
      {children}
    </Admonition>
  );
}
