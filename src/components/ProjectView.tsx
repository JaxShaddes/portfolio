import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { projects, Project } from '../data';
import { ArrowLeft, Share2, Heart, ExternalLink } from 'lucide-react';

interface ProjectViewProps {
  project: Project;
  onBack: () => void;
  onNextProject: () => void;
}

export const ProjectView: React.FC<ProjectViewProps> = ({ project, onBack, onNextProject }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCaseStudy, setShowCaseStudy] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCaseStudy(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: project.title,
      text: `Bruno Clemente — ${project.title}: ${project.subtitle}`,
      url: window.location.href
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Project link copied to clipboard!');
      } catch (err) {
        console.error('Could not copy text: ', err);
      }
    }
  };

  const currentIndex = projects.findIndex(p => p.id === project.id);
  const nextIndex = currentIndex !== -1 ? (currentIndex + 1) % projects.length : 0;
  const nextProject = projects[nextIndex];

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const yLeft = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const yRight = useTransform(scrollYProgress, [0, 1], [0, 60]);

  const detailImagesList = project.detailImages && project.detailImages.length > 0 
    ? project.detailImages 
    : [project.image, project.image];

  const leftColumnImages = detailImagesList.filter((_, i) => i % 2 === 0);
  const rightColumnImages = detailImagesList.filter((_, i) => i % 2 !== 0);

  const paragraphs = project.description.split(/\r?\n\s*\r?\n/);
  const showMoreButton = paragraphs.length > 2;
  const displayedText = showMoreButton && !isExpanded
    ? paragraphs.slice(0, 2).join('\n\n')
    : project.description;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-white overflow-y-auto"
    >
      {/* Header */}
      <nav className="fixed top-0 left-0 w-full p-8 flex justify-between items-center z-50 mix-blend-difference text-white">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 hover:opacity-70 transition-opacity"
        >
          <ArrowLeft size={20} />
          <span className="text-[10px] tracking-widest font-bold uppercase">Back</span>
        </button>
        <div className="flex gap-6">
          <Share2 
            size={20} 
            className="cursor-pointer hover:scale-110 transition-transform" 
            onClick={handleShare}
          />
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative w-full h-[70vh] overflow-hidden bg-gray-100">
        <motion.img
          layoutId={`image-${project.id}`}
          src={project.image}
          className="w-full h-full object-cover"
          style={{ objectFit: 'cover' }}
        />
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row gap-20">
          <div className="md:w-1/3">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-[10px] tracking-widest font-bold text-gray-400 uppercase mb-2">Designer</p>
              <p className="text-lg font-medium text-gray-900 mb-8">{project.author}</p>
              
              <p className="text-[10px] tracking-widest font-bold text-gray-400 uppercase mb-2">Role</p>
              <div className="text-lg font-medium text-gray-900 mb-8">
                {Array.isArray(project.role) ? (
                  <ul className="space-y-1">
                    {project.role.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                ) : (
                  project.role
                )}
              </div>
              
              <p className="text-[10px] tracking-widest font-bold text-gray-400 uppercase mb-2">Services</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {project.services && project.services.length > 0 ? (
                  project.services.map((service, index) => (
                    <li key={index}>{service}</li>
                  ))
                ) : (
                  <>
                    <li>Art Direction</li>
                    <li>Visual Identity</li>
                    <li>Digital Strategy</li>
                  </>
                )}
              </ul>
            </motion.div>
          </div>
          
          <div className="md:w-2/3">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-5xl font-bold tracking-tighter text-gray-900 mb-6 uppercase">
                {project.title}
              </h2>
              <div className="w-20 h-1 bg-gray-900 mb-10"></div>
              <p className="text-xl text-gray-700 leading-relaxed mb-6 whitespace-pre-wrap">
                {displayedText}
              </p>
              {showMoreButton && (
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mb-10 text-[10px] tracking-widest font-black uppercase underline decoration-2 underline-offset-4 hover:opacity-60 transition-opacity"
                >
                  {isExpanded ? 'Show Less' : 'Show More'}
                </button>
              )}
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowCaseStudy(true)}
                  className="px-8 py-4 bg-gray-900 text-white text-[10px] tracking-[0.2em] font-bold uppercase flex items-center gap-3 hover:bg-black transition-colors"
                >
                  View Case Study <ExternalLink size={14} />
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* More detailed shots */}
        <div ref={containerRef} className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start">
          {/* Left Column */}
          <motion.div style={{ y: yLeft }} className="flex flex-col gap-8 md:gap-16">
            {leftColumnImages.map((imagePath, index) => (
              <div 
                key={`left-${index}`} 
                className="w-full bg-gray-100 overflow-hidden"
              >
                <img 
                  src={imagePath} 
                  alt={`Detail Left ${index + 1}`} 
                  className="w-full h-auto transition-all duration-700 hover:scale-[1.02]" 
                />
              </div>
            ))}
          </motion.div>

          {/* Right Column */}
          <motion.div style={{ y: yRight }} className="flex flex-col gap-8 md:gap-16 pt-20 md:pt-40">
            {rightColumnImages.map((imagePath, index) => (
              <div 
                key={`right-${index}`} 
                className="w-full bg-gray-100 overflow-hidden"
              >
                <img 
                  src={imagePath} 
                  alt={`Detail Right ${index + 1}`} 
                  className="w-full h-auto transition-all duration-700 scale-110 hover:scale-100" 
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <footer 
        className="border-t border-gray-100 py-20 text-center cursor-pointer group"
        onClick={onNextProject}
      >
        <p className="text-[10px] tracking-widest font-bold text-gray-400 uppercase transition-colors group-hover:text-black">Next Project</p>
        <h3 className="text-4xl font-bold text-gray-900 mt-4 uppercase transition-opacity group-hover:opacity-50">
          {nextProject.title}
        </h3>
      </footer>

      {/* Case Study Modal Popup */}
      <AnimatePresence>
        {showCaseStudy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex justify-center items-center p-4 md:p-10"
          >
            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-[#0A0A0C] border border-gray-850 w-full h-full max-w-6xl rounded-sm overflow-hidden flex flex-col relative shadow-2xl"
            >
              {/* Top bar */}
              <div className="bg-[#121216] border-b border-brand-border px-6 py-4 flex justify-between items-center text-white">
                <span className="text-[10px] font-bold tracking-widest uppercase font-mono text-gray-400">
                  Case Study — {project.title}
                </span>
                <button 
                  onClick={() => setShowCaseStudy(false)}
                  className="text-gray-400 hover:text-white font-mono text-xs tracking-widest uppercase flex items-center gap-1 hover:opacity-75 transition-opacity"
                >
                  Close [ESC]
                </button>
              </div>

              {/* Content Iframe */}
              <div className="flex-grow w-full h-full bg-[#0E0E10]">
                <iframe 
                  src={`/Behance/${project.slug}/index.html`}
                  className="w-full h-full border-none"
                  title={`${project.title} Behance Case Study`}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
