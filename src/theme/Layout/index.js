import React from 'react';
import OriginalLayout from '@theme-original/Layout';
import BackToTop from '@site/src/components/BackToTop';
import LoadingBar from '@site/src/components/LoadingBar';

export default function Layout(props) {
  return (
    <>
      <LoadingBar />
      <OriginalLayout {...props} />
      <BackToTop />
    </>
  );
} 