// src/Map.tsx
import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf';
import { Feature, Polygon } from 'geojson';
import Sidebar from '../Sidebar';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

mapboxgl.accessToken = 'pk.eyJ1IjoibmV0b2NvZGVyIiwiYSI6ImNseDk1c21mMDF1eWMyaXE5bHBqb2tiZGkifQ.ZJ68R414MAEbJTa2euj3JA';

const Map: React.FC = () => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const [map, setMap] = useState<mapboxgl.Map | null>(null);
    const [draw, setDraw] = useState<MapboxDraw | null>(null);
    const [area, setArea] = useState<number>(0);
    const [svg, setSvg] = useState<string>('');
    const [coordinates, setCoordinates] = useState<number[][][]>([]);

    useEffect(() => {
        if (mapContainerRef.current && !map) {
            const initializeMap = (center: [number, number]) => {
                const mapInstance = new mapboxgl.Map({
                    container: mapContainerRef.current!,
                    style: 'mapbox://styles/mapbox/satellite-v9', // Satellite style
                    center: center,
                    zoom: 9
                });

                const drawInstance = new MapboxDraw({
                    displayControlsDefault: false,
                    controls: {
                        polygon: true,
                        trash: true
                    },
                    defaultMode: 'draw_polygon'
                });

                mapInstance.addControl(drawInstance);

                mapInstance.on('load', () => {
                    console.log('Map has loaded');
                    setMap(mapInstance);
                    setDraw(drawInstance);

                    mapInstance.on('draw.create', () => updateArea(drawInstance));
                    mapInstance.on('draw.delete', () => updateArea(drawInstance));
                    mapInstance.on('draw.update', () => updateArea(drawInstance));
                });
            };

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    initializeMap([longitude, latitude]);
                },
                (error) => {
                    console.error("Error getting user location: ", error);
                    initializeMap([-74.5, 40]); // Default location if user location is unavailable
                }
            );
        }

        return () => {
            if (map) map.remove();
        };
    }, [map]);

    const updateArea = (drawInstance: MapboxDraw) => {
        if (drawInstance) {
            const data = drawInstance.getAll();
            console.log('draw.getAll() data:', data);
            let area = 0;
            let svg = '';
            let areaInHectares = 0;
            let coords: number[][][] = [];
            if (data.features.length > 0) {
                const polygon = data.features[0] as Feature<Polygon>;
                const areaInSquareMeters = turf.area(polygon);
                console.log('Calculated area in square meters:', areaInSquareMeters);
                area = areaInSquareMeters; // Area in square meters

                // Convert square meters to hectares
                areaInHectares = area / 10000;
                console.log('Calculated area in hectares:', areaInHectares);

                // Generate SVG for the polygon
                const polygonCoordinates = polygon.geometry.coordinates[0];
                console.log('Polygon coordinates:', polygonCoordinates);
                const path = polygonCoordinates.map(coord => coord.join(',')).join(' ');
                svg = `<svg width="100" height="100" viewBox="0 0 100 100">
                           <polygon points="${path}" style="fill:lime;stroke:purple;stroke-width:1" />
                       </svg>`;

                // Store coordinates
                coords = [polygonCoordinates];
            } else {
                console.log('No features found in draw data.');
            }
            setArea(areaInHectares);
            setSvg(svg);
            setCoordinates(coords);
        } else {
            console.log('Draw instance not available.');
        }
    };

    return (
        <div className="flex h-screen">
            <div className="map-container flex-grow" ref={mapContainerRef} />
            <Sidebar area={area} svg={svg} coordinates={coordinates} />
        </div>
    );
};

export default Map;
