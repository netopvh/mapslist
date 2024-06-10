// src/Sidebar.tsx
import React from 'react';

interface SidebarProps {
    area: number;
    svg: string;
    coordinates: number[][][];
}

const Sidebar: React.FC<SidebarProps> = ({ area, svg, coordinates }) => {
    return (
        <div className="w-1/3 bg-white p-4 shadow-md">
            <h2 className="text-xl font-bold mb-2">Informações da Área Selecionada</h2>
            {area > 0 ? (
                <>
                    <p>A área calculada: {area} hectare</p>
                    <div dangerouslySetInnerHTML={{ __html: svg.replace(/fill="[^"]+"/g, 'fill="black"') }} />
                    <h2 className="text-lg font-semibold mt-4 mb-2">Coordenadas do Polígono</h2>
                    <ul>
                        {coordinates.map((polygon, index) => (
                            <li key={index}>
                                <strong>Polígono {index + 1}:</strong>
                                <ul>
                                    {polygon.map((point, idx) => (
                                        <li key={idx}>Lat: {point[1]}, Lng: {point[0]}</li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </>) : (
                <p>Nenhuma área foi selecionada</p>
            )}
        </div>
    );
};

export default Sidebar;

