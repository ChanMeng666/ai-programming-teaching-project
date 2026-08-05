// Verification page for the campus-event-radar capstone credential -> /certificate/campus-event-radar
// One file per credential: @docusaurus/plugin-content-pages maps src/pages/**
// to routes automatically, and six explicit files are simpler than a route
// plugin for a cohort this size. All the content lives in awards.json.
import React from 'react';
import Certificate from '@site/src/components/Certificate';

export default function Page() {
  return <Certificate slug="campus-event-radar" />;
}
