import { translate } from '@docusaurus/Translate';
import styles from './styles.module.css';

export const TRACKS = ['Campus Life', 'Personal Growth', 'Creative Tools'];

export function useTrackLabels() {
  return {
    'Campus Life': translate({
      id: 'capstoneShowcase.track.campusLife',
      message: 'Campus Life',
    }),
    'Personal Growth': translate({
      id: 'capstoneShowcase.track.personalGrowth',
      message: 'Personal Growth',
    }),
    'Creative Tools': translate({
      id: 'capstoneShowcase.track.creativeTools',
      message: 'Creative Tools',
    }),
  };
}

export function trackClassName(track) {
  if (track === 'Campus Life') return styles.trackCampus;
  if (track === 'Personal Growth') return styles.trackGrowth;
  if (track === 'Creative Tools') return styles.trackCreative;
  return styles.trackOther;
}
