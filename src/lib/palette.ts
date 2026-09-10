import { ColorPalette } from '../types/canvas';

export const PALETTES: ColorPalette[] = [
  {
    id: 'chroma',
    name: 'Neo Chroma',
    colors: [
      '#FF4D26', // Electric Persimmon (Signature)
      '#121316', // Obsidian Charcoal
      '#4F46E5', // Electric Indigo
      '#10B981', // Vivid Mint
      '#F59E0B', // Solar Amber
      '#EC4899', // Hyper Pink
      '#06B6D4', // Cyber Cyan
      '#8B5CF6', // Royal Violet
      '#71717A', // Slate Gray
      '#FFFFFF', // Porcelain White
    ],
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    colors: [
      '#FF4D26', // Electric Persimmon
      '#9945FF', // Solana Purple
      '#14F195', // Solana Green
      '#00FF94', // Neon Mint
      '#FF4FD8', // Cyber Pink
      '#F5B93C', // Golden Yellow
      '#2E5BFF', // MagicBlock Blue
      '#5EEAD4', // Electric Aqua
      '#FFFFFF', // Pure White
      '#0A0A0F', // Obsidian Black
    ],
  },
  {
    id: 'solana',
    name: 'Solana Classic',
    colors: [
      '#14F195', // Solana Green
      '#9945FF', // Solana Purple
      '#00C2FF', // Electric Cyan
      '#FF4D26', // Electric Persimmon
      '#FFFFFF', // White
      '#E4E4E7', // Zinc Light
      '#71717A', // Zinc Dark
      '#18181B', // Charcoal
      '#FF6B6B', // Coral
      '#FFE66D', // Warm Yellow
    ],
  },
  {
    id: 'retro8bit',
    name: '8-Bit Arcade',
    colors: [
      '#000000',
      '#FFFFFF',
      '#888888',
      '#E03C28',
      '#1B92D1',
      '#239063',
      '#F4922C',
      '#EDC92E',
      '#A35496',
      '#FF4D26',
    ],
  },
  {
    id: 'pastel',
    name: 'Lo-Fi Pastel',
    colors: [
      '#FFB5E8',
      '#B28DFF',
      '#BFFCC6',
      '#FFC9DE',
      '#FFABAB',
      '#DCD3FF',
      '#AFF8DB',
      '#F3FFE3',
      '#85E3FF',
      '#ECEAE4',
    ],
  },
];

export const DEFAULT_COLOR = '#FF4D26';
