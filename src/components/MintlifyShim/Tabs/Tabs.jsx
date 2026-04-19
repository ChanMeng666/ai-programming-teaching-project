import React, {Children, isValidElement} from 'react';
import DocusaurusTabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

// Mintlify <Tabs> 下挂 <Tab title="...">，这里把它们转成 @theme/TabItem。
export default function Tabs({children}) {
  const items = Children.toArray(children).filter(isValidElement);

  return (
    <DocusaurusTabs>
      {items.map((child, idx) => {
        const title = child.props.title || child.props.label || `Tab ${idx + 1}`;
        const value = child.props.value || title.toLowerCase().replace(/\s+/g, '-');
        return (
          <TabItem key={value + idx} value={value} label={title}>
            {child.props.children}
          </TabItem>
        );
      })}
    </DocusaurusTabs>
  );
}
