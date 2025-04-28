export interface Selection {
  text: string;
  position: {
    x: number;
    y: number;
  } | null;
}
