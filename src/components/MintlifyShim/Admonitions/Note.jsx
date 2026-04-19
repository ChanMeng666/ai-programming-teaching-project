import React from 'react';
import Admonition from '@theme/Admonition';

export default function Note({children, title}) {
  return (
    <Admonition type="note" title={title}>
      {children}
    </Admonition>
  );
}
