import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { WheelCarousel } from './components/WheelCarousel';
import { ProjectView } from './components/ProjectView';
import { projects, Project } from './data';
import { Menu } from 'lucide-react';

function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showWorksDropdown, setShowWorksDropdown] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowWorksDropdown(false);
        setShowAboutModal(false);
        setShowContactModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const copyEmail = () => {
    navigator.clipboard.writeText('contact@jbclemente.pt');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNextProject = () => {
    if (!selectedProject) return;
    const currentIndex = projects.findIndex(p => p.id === selectedProject.id);
    const nextIndex = currentIndex !== -1 ? (currentIndex + 1) % projects.length : 0;
    setSelectedProject(projects[nextIndex]);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F5] text-gray-900 font-sans selection:bg-black selection:text-white relative overflow-hidden">
      {/* Noise Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full p-10 flex justify-between items-start z-40">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 md:w-11 md:h-11 mb-2 md:mb-3">
            <img src="/logo.png" alt="Galleria Studio Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-xs md:text-sm font-bold tracking-wider font-space uppercase text-black">Bruno Clemente</span>
          <span className="text-[7px] md:text-[8px] tracking-[0.27em] text-gray-500 font-light font-lexend uppercase mt-1">Graphic Design</span>
        </div>
        
        <div className="flex items-center gap-8">
          <button 
            onClick={() => setShowWorksDropdown(!showWorksDropdown)}
            className="text-[10px] tracking-widest font-bold uppercase hover:opacity-50 transition-opacity"
          >
            Works
          </button>
          <button 
            onClick={() => setShowAboutModal(true)}
            className="text-[10px] tracking-widest font-bold uppercase hover:opacity-50 transition-opacity"
          >
            About
          </button>
          <button 
            onClick={() => setShowContactModal(true)}
            className="text-[10px] tracking-widest font-bold uppercase hover:opacity-50 transition-opacity cursor-pointer"
          >
            Contact
          </button>
        </div>
      </nav>

      {/* Works Index Dropdown Menu */}
      <AnimatePresence>
        {showWorksDropdown && (
          <>
            {/* Soft Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWorksDropdown(false)}
              className="fixed inset-0 z-[60] bg-black/5 backdrop-blur-xs"
            />
            {/* Works List Drawer */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-28 right-10 z-[70] bg-[#F8F7F5] border border-gray-200 rounded-sm shadow-xl p-6 w-80 noise-bg"
            >
              <div className="flex flex-col gap-4">
                <span className="text-[9px] tracking-widest text-gray-400 font-bold uppercase font-mono border-b border-gray-200 pb-2 flex justify-between items-center">
                  <span>Project Index</span>
                  <span className="text-[8px] text-gray-300">({projects.length} Items)</span>
                </span>
                <ul className="flex flex-col gap-1">
                  {projects.map((project, idx) => (
                    <li key={project.id}>
                      <button
                        onClick={() => {
                          setSelectedProject(project);
                          setShowWorksDropdown(false);
                        }}
                        className="w-full text-left font-space text-[11px] font-semibold text-gray-800 hover:text-black transition-colors flex justify-between items-center group py-1.5"
                      >
                        <span className="font-semibold tracking-wide group-hover:translate-x-1.5 transition-transform duration-300">
                          {project.title}
                        </span>
                        <span className="text-[9px] font-mono text-gray-400">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* About Modal */}
      <AnimatePresence>
        {showAboutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-md flex justify-center items-center p-4"
          >
            {/* Backdrop click to close */}
            <div className="absolute inset-0 animate-fade-in" onClick={() => setShowAboutModal(false)} />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative bg-[#F8F7F5] border border-gray-200 rounded-sm shadow-2xl p-8 md:p-12 max-w-xl w-full max-h-[90vh] overflow-y-auto noise-bg z-10 text-gray-900"
            >
              {/* Header Branding */}
              <div className="flex flex-col items-center text-center mb-8 border-b border-gray-200 pb-6">
                <div className="w-12 h-12 mb-3">
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-lg font-bold tracking-wider font-space uppercase">Bruno Clemente</h3>
                <span className="text-[7px] tracking-[0.27em] text-gray-500 font-light font-lexend uppercase mt-1">Graphic Design</span>
              </div>

              {/* Biography & Analysis */}
              <div className="space-y-6 text-left">
                <div>
                  <h4 className="text-[9px] tracking-widest font-bold text-gray-400 uppercase font-mono mb-2">// PROFILE</h4>
                  <p className="font-space text-sm leading-relaxed text-gray-800">
                    I am Bruno Clemente, an independent graphic designer and art director. With nearly a decade of experience, I specialize in building digital products and brand identities that cut through the noise.
                  </p>
                </div>

                <div>
                  <h4 className="text-[9px] tracking-widest font-bold text-gray-400 uppercase font-mono mb-3">// WORK STYLE & EXPERTISE</h4>
                  <ul className="space-y-3 font-sans text-xs text-gray-650 leading-relaxed">
                    <li className="flex gap-2">
                      <span className="text-black font-bold">01.</span>
                      <div>
                        <strong className="text-black uppercase tracking-wider block font-space text-[10px]">Brand Architectures</strong>
                        Designing systematic visual languages, logo marks, and color strategies that give companies a premium and commanding market presence.
                      </div>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-black font-bold">02.</span>
                      <div>
                        <strong className="text-black uppercase tracking-wider block font-space text-[10px]">Digital Product Design</strong>
                        Crafting intuitive user journeys, websites, and technical application interfaces that prioritize usability without compromising aesthetic authority.
                      </div>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-black font-bold">03.</span>
                      <div>
                        <strong className="text-black uppercase tracking-wider block font-space text-[10px]">Creative Restraint</strong>
                        Stripping away standard marketing clutter to let key visual concepts speak, delivering clean, high-impact results that resonate with modern clients.
                      </div>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-[9px] tracking-widest font-bold text-gray-400 uppercase font-mono mb-2">// INQUIRIES & COLLABORATIONS</h4>
                  <p className="font-space text-xs text-gray-600 leading-relaxed">
                    Currently accepting selective design commissions, consulting roles, and strategic art direction partnerships globally.
                  </p>
                </div>
              </div>

              {/* Close controls */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center text-[10px] tracking-widest font-bold uppercase text-gray-400 font-mono">
                <span>© 2026 BRUNO CLEMENTE</span>
                <button 
                  onClick={() => setShowAboutModal(false)}
                  className="text-black hover:opacity-50 transition-opacity underline decoration-2 underline-offset-4 cursor-pointer"
                >
                  Close [ESC]
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Overlay Modal */}
      <AnimatePresence>
        {showContactModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-md flex justify-center items-center p-4"
          >
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={() => setShowContactModal(false)} />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative bg-[#F8F7F5] border border-gray-200 rounded-sm shadow-2xl p-8 md:p-12 max-w-md w-full noise-bg z-10 text-gray-900"
            >
              {/* Header Branding */}
              <div className="flex flex-col items-center text-center mb-8 border-b border-gray-200 pb-6">
                <div className="w-12 h-12 mb-3">
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-lg font-bold tracking-wider font-space uppercase">Bruno Clemente</h3>
                <span className="text-[7px] tracking-[0.27em] text-gray-500 font-light font-lexend uppercase mt-1">Graphic Design</span>
              </div>

              {/* Contact Content */}
              <div className="space-y-6 text-left">
                <div>
                  <h4 className="text-[9px] tracking-widest font-bold text-gray-400 uppercase font-mono mb-2">// INQUIRIES & NEW PROJECTS</h4>
                  <button 
                    onClick={copyEmail}
                    className="w-full text-center py-4 px-6 border border-dashed border-gray-300 rounded-sm hover:border-black bg-gray-50/50 hover:bg-gray-100/50 transition-all cursor-pointer group mt-1"
                  >
                    <span className="font-space text-base md:text-lg font-bold tracking-tight block text-gray-800 group-hover:text-black transition-colors">
                      contact@jbclemente.pt
                    </span>
                    <span className="text-[8px] font-mono tracking-widest text-gray-400 uppercase group-hover:text-gray-600 mt-1 block">
                      {copied ? '✓ COPIED TO CLIPBOARD' : 'CLICK TO COPY EMAIL'}
                    </span>
                  </button>
                </div>

                <div>
                  <h4 className="text-[9px] tracking-widest font-bold text-gray-400 uppercase font-mono mb-3">// CONNECT & FOLLOW</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <a 
                      href="https://www.linkedin.com/in/bruno-clemente-43391b16b/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center justify-between p-3 border border-gray-250 hover:border-black rounded-sm bg-white transition-colors group text-left cursor-pointer"
                    >
                      <div>
                        <span className="text-[7px] font-mono text-gray-400 block">// PROFESSIONAL</span>
                        <span className="font-space text-[11px] font-semibold text-black block">LinkedIn</span>
                      </div>
                      <span className="text-xs text-gray-400 group-hover:translate-x-0.5 transition-transform">→</span>
                    </a>
                    <a 
                      href="https://instagram.com/jbrunoclemente" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center justify-between p-3 border border-gray-250 hover:border-black rounded-sm bg-white transition-colors group text-left cursor-pointer"
                    >
                      <div>
                        <span className="text-[7px] font-mono text-gray-400 block">// JOURNAL</span>
                        <span className="font-space text-[11px] font-semibold text-black block">Instagram</span>
                      </div>
                      <span className="text-xs text-gray-400 group-hover:translate-x-0.5 transition-transform">→</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Close controls */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center text-[10px] tracking-widest font-bold uppercase text-gray-400 font-mono">
                <span>© 2026 BRUNO CLEMENTE</span>
                <button 
                  onClick={() => setShowContactModal(false)}
                  className="text-black hover:opacity-50 transition-opacity underline decoration-2 underline-offset-4 cursor-pointer"
                >
                  Close [ESC]
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="h-screen w-full relative">
        <WheelCarousel 
          onSelectProject={(p) => setSelectedProject(p)} 
          selectedId={selectedProject?.id || null}
          isLocked={showAboutModal || showContactModal || showWorksDropdown}
        />
      </main>

      {/* Project Overlay */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectView 
            key={selectedProject.id}
            project={selectedProject} 
            onBack={() => setSelectedProject(null)} 
            onNextProject={handleNextProject}
          />
        )}
      </AnimatePresence>


    </div>
  );
}

export default App;
