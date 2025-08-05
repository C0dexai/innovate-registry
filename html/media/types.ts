
export interface Track {
  id: number | string;
  name: string;
  url: string;
  file?: File;
  type: 'file' | 'stream';
  artist?: string;
}

export enum View {
  Library,
  Favorites,
  Radio,
  EQ,
}
