import React from 'react';
import OriginalLayout from '@theme-original/Layout';
import BackToTop from '@site/src/components/BackToTop';
import LoadingBar from '@site/src/components/LoadingBar';
import Navbar from '@site/src/components/Navbar';

export default function Layout(props) {
  return (
    <>
      <LoadingBar />
      <Navbar />
      <OriginalLayout {...props} />
      <BackToTop />
    </>
  );
} 