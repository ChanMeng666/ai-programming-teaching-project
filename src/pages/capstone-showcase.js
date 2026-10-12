import React from 'react';
import Layout from '@theme/Layout';
import { translate } from '@docusaurus/Translate';
import BrowserOnly from '@docusaurus/BrowserOnly';
import CapstoneShowcase from '@site/src/components/CapstoneShowcase';
import styles from '@site/src/components/CapstoneShowcase/styles.module.css';

export default function CapstoneShowcasePage() {
  return (
    <Layout
      title={translate({
        id: 'capstoneShowcase.pageTitle',
        message: 'TECHNEST 2026 Capstone Showcase',
      })}
      description={translate({
        id: 'capstoneShowcase.pageDescription',
        message:
          'Live showcase of TECHNEST 2026 capstone projects. Vote for your favorites — top 3 highlighted, refreshed every minute.',
      })}
    >
      <BrowserOnly fallback={<div className={styles.pageWrapper} />}>
        {() => <CapstoneShowcase />}
      </BrowserOnly>
    </Layout>
  );
}
