import React from 'react';
import Admonition from '@theme/Admonition';

export default function Info({children, title}) {
  return (
    <Admonition type="info" title={title}>
      {children}
    </Admonition>
  );
}
