import React from 'react';
import Admonition from '@theme/Admonition';

export default function Warning({children, title}) {
  return (
    <Admonition type="warning" title={title}>
      {children}
    </Admonition>
  );
}
