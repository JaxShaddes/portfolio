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
      className="absolute cursor-pointer select-none pointer-events-auto"
      initial={false}
      animate={{
        rotate: isActive ? 0 : rotation,
        scale: isActive ? 1.15 : 0.8,
        opacity: isActive ? 1 : 0.4,
        zIndex: isActive ? 30 : 10, // Text is at Z-50, so cards are always behind
        x: isActive && !isMobile ? -220 : 0,
        y: isActive ? (isMobile ? 170 : 100) : 0
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        width: '240px',
        height: '320px',
        bottom: '350px', // Raised slightly more to clear the wheel hub
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
          <p className="text-[10px] font-bold tracking-widest text-gray-800 uppercase border-t pt-2 border-gray-200">
            {project.author}
          </p>
          <p className="text-[8px] text-gray-500 italic uppercase">
            {Array.isArray(project.role) ? project.role.join(' / ') : project.role}
          </p>
        </div>
        
        {isActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -bottom-10 left-0 right-0 text-center"
          >
            <span className="text-[8px] tracking-[0.3em] font-bold text-gray-400 uppercase">View Project</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
