export interface Piece {
  imgIdx: number;
  pieceIdx: number;
  src: string;
}

export type Difficulty = 'easy' | 'medium' | 'hard';
export type PieceShape = 'all' | 'corner' | 'edge' | 'center';

export interface CubeGameProps {
  onClose: () => void;
  images: { src: string }[];
  onNextStep?: () => void;
}