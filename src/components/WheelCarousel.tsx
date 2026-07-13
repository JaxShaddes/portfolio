import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, PanInfo } from 'framer-motion';
import { Project, projects } from '../data';
import { PolaroidCard } from './PolaroidCard';

interface WheelCarouselProps {
  onSelectProject: (project: Project) => void;
  selectedId: number | null;
  isLocked?: boolean;
}

export const WheelCarousel: React.FC<WheelCarouselProps> = ({ onSelectProject, selectedId, isLocked = false }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const rotationValue = useMotionValue(0);
  const smoothRotation = useSpring(rotationValue, { stiffness: 100, damping: 30 });

  const totalProjects = projects.length;
  // Divide the full 360 degrees by the number of projects to ensure a seamless loop
  const angleStep = 360 / totalProjects; 

  // Handle mouse wheel with snapping and cooldown
  useEffect(() => {
    let isScrolling = false;

    const handleWheel = (e: WheelEvent) => {
      if (selectedId !== null || isLocked) return;
      
      // Prevent browser from scrolling the window
      e.preventDefault();
      
      if (isScrolling) return;
      isScrolling = true;

      const direction = e.deltaY > 0 ? -1 : 1;
      const current = rotationValue.get();
      // Snap to the next/prev project angle
      const target = Math.round(current / angleStep) * angleStep + (direction * angleStep);
      
      rotationValue.set(target);

      // Cooldown matching spring stiffness transition
      setTimeout(() => {
        isScrolling = false;
      }, 500);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [rotationValue, selectedId, angleStep, isLocked]);

  // Sync active index based on CURRENT rotation
  useEffect(() => {
    const unsubscribe = rotationValue.on('change', (v) => {
      // Find which card is closest to the 0-degree (top) position
      const normalizedRotation = ((-v % 360) + 360) % 360;
      const closestIndex = Math.round(normalizedRotation / angleStep) % totalProjects;
      
      if (closestIndex !== activeIndex) {
        setActiveIndex(closestIndex);
      }
    });
    return unsubscribe;
  }, [rotationValue, activeIndex, totalProjects, angleStep]);

  const onDrag = (_: any, info: PanInfo) => {
    if (selectedId !== null) return;
    // Increase sensitivity slightly for better feel
    rotationValue.set(rotationValue.get() + info.delta.x * 0.6);
  };

  const onDragEnd = () => {
    const current = rotationValue.get();
    // Snap to the nearest project
    const target = Math.round(current / angleStep) * angleStep;
    rotationValue.set(target);
  };

  const activeProject = projects[activeIndex];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-end overflow-hidden">
      {/* Background Text and UI - Higher Z-index to be IN FRONT of cards */}
      <div className="absolute top-[115px] md:top-auto md:bottom-[250px] left-0 w-full flex flex-col items-center md:items-start md:pl-[52%] pointer-events-none px-10 z-50">
        <motion.div 
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          key={`text-${activeIndex}`}
          className="text-center md:text-left max-w-2xl relative"
        >
          {/* Mobile Counter */}
          <div className="md:hidden flex items-center gap-2 mb-2 justify-center">
            <span className="text-[10px] tracking-[0.3em] font-bold text-gray-400">
              0{activeIndex + 1} &nbsp;/&nbsp; 0{totalProjects}
            </span>
            <div className="h-[1px] w-6 bg-gray-300"></div>
          </div>

          {/* Desktop Counter & Vertical Info */}
          <div className="hidden md:flex absolute -left-24 top-0 flex-col items-center gap-4">
            <div className="relative h-32 flex items-center">
               <span className="absolute whitespace-nowrap -rotate-90 text-[10px] tracking-[0.4em] font-bold text-gray-300 uppercase">
                0{activeIndex + 1} &nbsp; / &nbsp; 0{totalProjects}
              </span>
            </div>
            <div className="w-[1px] h-32 bg-gray-200"></div>
          </div>

          <h1 className="text-2xl md:text-8xl font-black tracking-tighter text-gray-900 leading-tight md:leading-[0.85] uppercase">
            <span className="md:hidden">{activeProject.title}</span>
            <span className="hidden md:inline">
              {activeProject.title.split(' ')[0]}
              <br />
              {activeProject.title.split(' ').slice(1).join(' ')}
            </span>
          </h1>
          
          <div className="mt-2 md:mt-4 flex items-center justify-center md:justify-start gap-2">
            <div className="h-[1px] w-12 bg-gray-900"></div>
            <p className="text-[10px] md:text-xs tracking-widest font-bold uppercase text-gray-500 md:text-gray-950">
              {activeProject.subtitle}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Wheel Interaction Area */}
      <motion.div
        onPan={selectedId === null && !isLocked ? onDrag : undefined}
        onPanEnd={selectedId === null && !isLocked ? onDragEnd : undefined}
        className="relative w-full h-[700px] flex justify-center items-end select-none overflow-visible touch-none"
      >
        
        {/* Cards container */}
        <div className="absolute bottom-0 w-full h-full flex justify-center items-end pb-[200px] pointer-events-none">
          {projects.map((project, index) => {
            // We calculate the angle for each card. 
            // If we have 7 projects, they are spread at 0, 51.4, 102.8... degrees.
            // Adding the global rotationValue makes them spin.
            const cardAngle = (index * angleStep) + rotationValue.get();
            
            return (
              <PolaroidCard
                key={project.id}
                project={project}
                isActive={activeIndex === index}
                onClick={() => onSelectProject(project)}
                rotation={cardAngle}
              />
            );
          })}
        </div>

        {/* The Cog/Wheel navigation */}
        <motion.div
          drag={selectedId === null ? "x" : false}
          onDrag={onDrag}
          onDragEnd={onDragEnd}
          style={{ 
            rotate: smoothRotation,
            touchAction: 'none'
          }}
          className={`absolute -bottom-[650px] w-[1200px] h-[1200px] z-20 ${selectedId === null ? 'cursor-grab active:cursor-grabbing' : ''}`}
        >
          {/* Minimal Cog/Disc */}
          <div className="absolute inset-0 rounded-full border-[1px] border-gray-200 opacity-40">
            {/* Tick marks around the rim */}
            {[...Array(72)].map((_, i) => (
              <div 
                key={i}
                className={`absolute top-0 left-1/2 w-[1px] ${i % 6 === 0 ? 'h-4 bg-gray-400' : 'h-2 bg-gray-200'} origin-[0_600px]`}
                style={{ transform: `translateX(-50%) rotate(${i * 5}deg)` }}
              />
            ))}
          </div>

          {/* Spokes/Lines */}
          {[...Array(12)].map((_, i) => (
            <div 
              key={i}
              className="absolute top-1/2 left-1/2 w-[1px] h-[600px] bg-gradient-to-b from-transparent via-gray-200 to-transparent opacity-20 origin-top"
              style={{ transform: `translateX(-50%) rotate(${i * 30}deg)` }}
            />
          ))}
          
          {/* Center Hub */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#F8F7F5] border border-gray-100 rounded-full flex items-center justify-center shadow-2xl">
             <div className="w-32 h-32 border border-gray-100 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-[#F2F1EF] border border-gray-200 rounded-full shadow-inner"></div>
             </div>
          </div>
        </motion.div>

        {/* Drag Indicator */}
        <div className="absolute bottom-20 md:bottom-40 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-30">
          <p className="text-[9px] tracking-widest uppercase font-medium text-gray-400 italic">
            <span className="md:hidden">Swipe to navigate</span>
            <span className="hidden md:inline">Drag the Cog to navigate</span>
          </p>
          
          {/* Mobile Swipe Hand Icon */}
          <div className="md:hidden">
            <motion.div 
              animate={{ x: [-12, 12, -12] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="text-gray-400"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 11V3a2 2 0 1 0-4 0v8a3 3 0 0 0-3 3v2a7 7 0 0 0 14 0v-4a2 2 0 1 0-4 0v1h-1V8a2 2 0 1 0-4 0v3h-1z" />
              </svg>
            </motion.div>
          </div>

          {/* PC Mouse scrollwheel indicator */}
          <div className="hidden md:flex w-5 h-8 border border-gray-400 rounded-full justify-center pt-1">
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1 h-2 bg-gray-400 rounded-full"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
