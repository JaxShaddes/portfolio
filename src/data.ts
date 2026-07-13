export interface Project {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  author: string;
  role: string | string[];
  detailImages?: string[];
  services?: string[];
  slug: string;
}

const defaultProjects: Project[] = [
  {
    id: 1,
    title: "CASA RABELO",
    subtitle: "Casa Rabelo: Wine Boutique",
    description: "Casa Rabelo: A Brazilian wine boutique imbued with the essential soul of Portugal.\n\nThe brand is anchored in the heritage of the Douro River and the iconic Rabelo vessels that navigated its currents, transporting the region's essence. This duality celebrates the enduring link between history, meticulous craft, and the act of discovery, rendered through a precise, contemporary filter.\n\nI directed the complete visual architecture, encompassing logo design, the systematic color theory, the overarching visual language, and the digital cadence for both the web platform and collateral communications. The objective was to synthesize an authentic presence with modern acuity, echoing the tempered warmth and cultivated elegance inherent in Portuguese viticulture.\n\nThe guiding concept leverages the kinetic elegance of the river’s flow against the refined materiality of winemaking—a convergence where archival context meets present-day execution. Drawing from the structural elegance of Porto and the sensory complexity of the vintage, the identity communicates sophistication, assuredness, and implicit reliability.\n\nThe central narrative establishes Casa Rabelo as “a new route through the world of wine,” positioning the boutique not merely as a point of transaction, but as a curated passage of experience, bridging the bedrock of tradition with the palate of the contemporary connoisseur.\n\nA rigorously minimalist emblem, derived from the distilled silhouette of the Rabelo craft, anchored by precise, geometric typography to signify both measured intent and modern luxury.\n\nA disciplined palette featuring deep, resonant tones—Ebony Clay, Arrowtown, and Mirage—selected to evoke the patina of aged timber, the shadows cast by deep water, and the diffused amber of twilight across the Douro valley.\n\nA calculated pairing of refined sans-serif forms characterized by deliberate, generous leading. This configuration mandates clarity, projects unwavering confidence, and substantiates the sense of timeless refinement.\n\nSubtly integrated motifs, inspired by topographical maps and fluid wave dynamics, serve as abstract echoes of the river's trajectory and the sensory complexity inherent in wine tasting.\n\nThe resulting identity is a cohesive, atmospheric construct that effectively spans cultural heritage and contemporary lifestyle. It articulates Casa Rabelo's mission to deliver not only exceptional vintages but curated moments of sensory revelation and meaningful connection.",
    image: "/media/casa-rabelo/CV3.jpg",
    author: "BRUNO CLEMENTE",
    role: ["Lead Designer", "Web Developer"],
    detailImages: [
      "/media/casa-rabelo/CV1.jpg",
      "/media/casa-rabelo/WEB1.jpg",
      "/media/casa-rabelo/CV2.jpg",
      "/media/casa-rabelo/WEB2.jpg",
      "/media/casa-rabelo/CV3.jpg",
      "/media/casa-rabelo/WEB3.jpg",
      "/media/casa-rabelo/BI1.jpg"
    ],
    services: ["Identity", "Branding", "Web Design", "Logo Design", "Card Design"],
    slug: "casa-rabelo"
  },
  {
    id: 2,
    title: "TINTAS SILACA",
    subtitle: "Tintas Silaca",
    description: "A Portuguese company with over four decades of expertise in paints, coatings, adhesives, and specialized chemical solutions, forged since 1981 and trusted across civil construction, automotive refinishing, metalworking, and furniture manufacturing.\n\nThe challenge was to modernize a brand with deep industrial roots, translating its technical excellence and innovative drive into a cohesive, future-ready identity—while honoring its heritage and remaining instantly recognizable.\n\nThe goal was to position Tintas Silaca as a contemporary leader in applied chemistry and material technology, balancing tradition with cutting-edge advancements.\n\nI led the rebranding project, developing everything from the logo redesign and visual system to product packaging, corporate stationery, and a mobile app UI—crafting a unified brand universe that communicates trust, performance, and technical rigor.\n\nThe creative direction focused on modernizing the brand without disrupting its legacy, transitioning it from a traditional 1980s manufacturer to a technologically advanced, design-conscious industrial entity.\n\nA minimalist emblem replaced the former illustrative logo, retaining the original color palette to preserve brand equity while signaling contemporary evolution.\n\nThe new packaging system strengthens shelf presence through simplified layouts, color-coded differentiation, and bold typography—conveying clarity and modern performance, as seen in the redesigned Silaca paint series.\n\nThe mobile app UI for technical and security documentation prioritizes usability and intuitive hierarchy, integrating strong brand colors and direct access to critical information, styled as a fusion of digital futurism and industrial brutalism.\n\nThe rebrand transforms Tintas Silaca into a modern industrial design brand, standing for innovation, consistency, and unwavering technical excellence.\n\nThe identity bridges its forty-year legacy with a future-ready ethos, affirming its role as a visionary in material technology while retaining the trust of long-standing clients.",
    image: "/media/silaca/capa.jpg",
    author: "BRUNO CLEMENTE",
    role: "Lead Designer",
    detailImages: [
      "/media/silaca/latas/before.jpg",
      "/media/silaca/latas/after.jpg",
      "/media/silaca/latas/1.jpg",
      "/media/silaca/latas/2.jpg",
      "/media/silaca/app/1.jpg",
      "/media/silaca/app/2.jpg",
      "/media/silaca/app/3.jpg",
      "/media/silaca/app/4.jpg"
    ],
    services: ["Mobile App Design", "Web Design", "Logo Design", "Packaging Design"],
    slug: "tintas-silaca"
  },
  {
    id: 3,
    title: "HQRZ - PORTFOLIO",
    subtitle: "Hingryd Queiroz",
    description: "hqrz is the artistic name of 'Hingryd Queiroz'. She is a photographer, a poet and an architect. Three disciplines, one singular vision.\n\nThis portfolio explores the harmony between the structures we build and the emotions we inhabit. Inspired by the steady flow of rivers and the breathless ascent of flight, her work captures the intersection of human design and natural wonder.\n\nThrough the lens, the pen, and the drafting table, she seeks one thing: the beauty of love in every form.\n\nCheck out her work at: www.hqrz.pt",
    image: "/media/hqrz/1mk.jpg",
    author: "BRUNO CLEMENTE",
    role: ["Web Designer", "Web Developer"],
    detailImages: [
      "/media/hqrz/1mk.jpg",
      "/media/hqrz/1.jpg",
      "/media/hqrz/2mk.jpg",
      "/media/hqrz/2.jpg",
      "/media/hqrz/3mk.jpg",
      "/media/hqrz/3.jpg"
    ],
    services: ["Web Design", "Web Development"],
    slug: "hqrz"
  },
  {
    id: 4,
    title: "AZUL EMPRÉSTIMO",
    subtitle: "Azul Empréstimo",
    description: "Azul Empréstimo operates as a prominent Brazilian franchise network of credit brokers, dedicated to simplifying access to a wide array of financial solutions in a way that is both secure and personable.\n\nMy work with them was a branding project focused on crafting social media graphics and promotional posters to reinforce visual identity and sector credibility.\n\nFor Azul Empréstimo, I developed a cohesive series of social media graphics and promotional posters aimed at reinforcing the company’s visual identity and credibility within the financial services sector.\n\nThe creative direction centered around the brand’s signature blue tones, symbolizing trust, stability, and reliability, while incorporating modern typographic hierarchy and clear visual storytelling to highlight key offerings such as personal loans, consórcios, and digital payment services.\n\nEach composition balanced photographic realism with clean graphic structure, ensuring information remained accessible and visually engaging across print and digital formats.\n\nThrough consistent layout systems and subtle gradients, the campaign established a strong, unified aesthetic that communicates professionalism and approachability—key values for a financial brand seeking customer confidence and recognition.",
    image: "/media/azul/capa.jpg",
    author: "BRUNO CLEMENTE",
    role: "Lead Designer",
    detailImages: [
      "/media/azul/1.jpg",
      "/media/azul/2.jpg",
      "/media/azul/3.jpg",
      "/media/azul/4.jpg",
      "/media/azul/5.jpg",
      "/media/azul/6.jpg"
    ],
    services: ["Typography", "Social Media", "Consulting"],
    slug: "azul"
  },
  {
    id: 5,
    title: "SIGNATURE COLLECTION",
    subtitle: "Sony PlayStation Game Covers",
    description: "This personal project draws inspiration from Sony’s 2019 \"Only on Playstation\" collection. It explores how minimalism, texture, and tone can redefine the storytelling power of a game cover.\n\nDrawing inspiration from Sony’s iconic “Only on PlayStation” branding, this personal project revisits titles such as Red Dead Redemption 2, God of War: Ragnarök, Ghost of Tsushima, and Marvel’s Spider-Man 2, presenting them through a unified aesthetic, one that honors their emotional core while celebrating the artistry of physical media design.\n\nConcept & Design: The design approach combines cinematic restraint and textural depth, focusing on atmosphere rather than spectacle. Each cover relies on monochromatic palettes, grainy surface textures, and minimal iconography to evoke mood and identity, stripping away marketing clutter in favor of pure visual storytelling. Typography and structure aims to create a collector’s edition sensibility, merging nostalgia with refinement.\n\nCreative Intent: This project pays tribute to the craft of game art direction and the timeless appeal of PlayStation’s exclusive lineup. It’s an exercise in visual storytelling through restraint, showing how a strong emotional tone can live within minimalist composition.",
    image: "/media/signature-collection/capa.jpg",
    author: "BRUNO CLEMENTE",
    role: "Lead Designer",
    detailImages: [
      "/media/signature-collection/cover/rdr2.jpg",
      "/media/signature-collection/box/rdr2.jpg",
      "/media/signature-collection/box-cd/rdr2.jpg",
      "/media/signature-collection/cover/kcd2.jpg",
      "/media/signature-collection/box/kcd2.jpg",
      "/media/signature-collection/box-cd/kcd2.jpg",
      "/media/signature-collection/cover/got.jpg",
      "/media/signature-collection/box/got.jpg",
      "/media/signature-collection/box-cd/got.jpg",
      "/media/signature-collection/cover/gow.jpg",
      "/media/signature-collection/box/gow.jpg",
      "/media/signature-collection/box-cd/gow.jpg",
      "/media/signature-collection/cover/sm2.jpg",
      "/media/signature-collection/box/sm2.jpg",
      "/media/signature-collection/box-cd/sm2.jpg"
    ],
    services: ["Typography", "Cover Design"],
    slug: "signature-collection"
  }
];

const loadProjects = (): Project[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('portfolio_projects');
    const savedDefaults = localStorage.getItem('portfolio_projects_defaults');
    const currentDefaultsStr = JSON.stringify(defaultProjects);

    if (savedDefaults !== currentDefaultsStr) {
      localStorage.setItem('portfolio_projects_defaults', currentDefaultsStr);
      localStorage.setItem('portfolio_projects', currentDefaultsStr);
      return defaultProjects;
    }

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved projects from localStorage", e);
      }
    }
  }
  return defaultProjects;
};

export const projects: Project[] = loadProjects();
