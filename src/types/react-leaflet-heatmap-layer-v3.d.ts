declare module 'react-leaflet-heatmap-layer-v3' {
  import { Component } from 'react';

  interface HeatmapLayerProps {
    points: Array<{ lat: number; lng: number; value: number }>;
    longitudeExtractor: (point: any) => number;
    latitudeExtractor: (point: any) => number;
    intensityExtractor: (point: any) => number;
    radius?: number;
    blur?: number;
    max?: number;
    fitBoundsOnLoad?: boolean;
    fitBoundsOnUpdate?: boolean;
  }

  export default class HeatmapLayer extends Component<HeatmapLayerProps> {}
} 