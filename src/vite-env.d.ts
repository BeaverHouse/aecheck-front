/// <reference types="vite/client" />

type APIResponse<T> = {
  status: number;
  message: string;
  data: T;
};

type CheckStateV4 = {
  inven: Array<number>;
  manifest: Array<number>;
  grasta: Array<number>;
  staralign: Array<number>;
  buddy: Array<number>;
};

// API Data type

type IDInfo = {
  id: string;
};

type MappingInfo = {
  id: string;
  description: string;
};

type DungeonInfo = MappingInfo & {
  links: {
    altemaURL?: string;
    aewikiURL?: string;
  };
};

type CharacterSummary = {
  id: string;
  code: string;
  category: string;
  style: string;
  lightShadow: string;
  maxManifest: number;
  isAwaken: boolean;
  isAlter: boolean;
  alterCharacter?: string;
  updateDate?: Date;
  lastUpdated?: Date;
  personalities: MappingInfo[];
  dungeons: DungeonInfo[];
  buddy?: BuddyDetail;
};

type BuddyDetail = {
  id: string;
  characterID?: string;
  path?: string;
  seesaaURL?: string;
  aewikiURL?: string;
  lastUpdated?: Date;
};

type CharacterDetail = CharacterSummary & {
  seesaaURL?: string;
  aewikiURL?: string;
};

interface AnnouncementData {
  state: string;
  title: string;
  link: string;
  createdTime: string;
  effect: Array<string>;
  category: string;
}

// Common props

interface AnalysisProps {
  allCharacters: CharacterSummary[];
}

type DashboardProps = AnalysisProps & {
  filteredCharacters: CharacterSummary[];
};
