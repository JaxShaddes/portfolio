import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Project } from '../data';

interface PolaroidCardProps {
  project: Project;
  isActive: boolean;
  onClick: () => void;
  rotation: number;
}

export const PolaroidCard: React.FC<PolaroidCardProps> = ({ project, isActive, onClick, rotation }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <motion.div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="absolute cursor-pointer select-none pointer-events-auto touch-none"
      initial={false}
      animate={{
        rotate: isActive ? 0 : rotation,
        scale: isActive ? (isMobile ? 0.95 : 1.08) : (isMobile ? 0.75 : 0.8),
        opacity: isActive ? 1 : 0.4,
        zIndex: isActive ? 30 : 10, // Text is at Z-50, so cards are always behind
        x: isActive && !isMobile ? -220 : 0,
        y: isActive ? (isMobile ? 50 : 60) : 0
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        width: '240px',
        height: '320px',
        bottom: isMobile ? '230px' : '290px', // Lowered to prevent overlapping top edge on smaller screens
        left: '50%',
        marginLeft: '-120px',
        transformOrigin: '50% 210%', // Increased radius for smoother circular path
      }}
    >
      <div className="bg-white p-3 pb-8 shadow-2xl rounded-sm border border-gray-100 flex flex-col h-full transform transition-transform duration-300 hover:rotate-2">
        <div className="relative flex-grow overflow-hidden bg-gray-200">
          <motion.img
            layoutId={`image-${project.id}`}
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover"
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div className="mt-4 text-left">
          <p className="text-[8px] font-lexend font-light tracking-widest text-gray-800 uppercase border-t pt-2 border-gray-200">
            {project.title}
          </p>
          <p className="text-[8px] text-gray-500 italic uppercase">
            {project.subtitle}
          </p>
        </div>
        

      </div>
    </motion.div>
  );
};
