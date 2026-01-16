export interface FictionEntry {
  id: string;
  title: string;
  description: string;
  status: 'original' | 'inspired';
  inspiredBy?: string;
  coverImage: string;
  author: string;
  readTime: string;
  likes: number;
}

export const fictionEntries: FictionEntry[] = [
  {
    id: '1',
    title: 'THE GEARWORK PROTOCOL',
    description: 'A deep dive into the structural integrity of the lower ring where ancient machinery still hums with forgotten power...',
    status: 'original',
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=225&fit=crop',
    author: 'NEXUS_7',
    readTime: '12 min',
    likes: 2847,
  },
  {
    id: '2',
    title: 'NEON RAIN',
    description: 'Revisiting the lost schematics found in the data core, where digital ghosts whisper secrets...',
    status: 'inspired',
    inspiredBy: 'SECTOR 7',
    coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=225&fit=crop',
    author: 'CIPHER_X',
    readTime: '8 min',
    likes: 1923,
  },
  {
    id: '3',
    title: 'QUANTUM ECHOES',
    description: 'Ripples through time reveal alternate timelines where humanity took different paths...',
    status: 'original',
    coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=225&fit=crop',
    author: 'VOID_WALKER',
    readTime: '15 min',
    likes: 3412,
  },
  {
    id: '4',
    title: 'CHROME DYNASTY',
    description: 'The megacorporations wage silent wars in the shadows of gleaming towers...',
    status: 'inspired',
    inspiredBy: 'NEURAL LINK',
    coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=225&fit=crop',
    author: 'SYNTH_MIND',
    readTime: '10 min',
    likes: 2156,
  },
  {
    id: '5',
    title: 'BINARY SUNSET',
    description: 'On the edge of known space, a lone station keeper watches twin suns die...',
    status: 'original',
    coverImage: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=225&fit=crop',
    author: 'STELLAR_9',
    readTime: '20 min',
    likes: 4521,
  },
  {
    id: '6',
    title: 'GHOST IN THE WIRE',
    description: 'When consciousness uploads fail, fragments of minds drift through the network...',
    status: 'inspired',
    inspiredBy: 'DIGITAL SOUL',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=225&fit=crop',
    author: 'ECHO_NULL',
    readTime: '7 min',
    likes: 1876,
  },
];
