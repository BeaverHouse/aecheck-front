// Google Analytics gtag
interface Window {
  gtag?: (
    command: 'event' | 'config' | 'js',
    targetId: string | Date,
    config?: Record<string, unknown>
  ) => void;
  dataLayer?: unknown[];
}

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
  weaponTempering: Array<number>;
};

// API Data type

type IDInfo = {
  id: string;
};

type DungeonInfo = {
  id: string;
  altemaURL?: string | null;
  aewikiURL?: string | null;
};

type CharacterSummary = {
  id: string;
  code: string;
  category: string;
  style: string;
  lightShadow: string;
  maxManifest: number;
  customManifest: boolean;
  isAwaken: boolean;
  isAlter: boolean;
  alterCharacter?: string | null;
  updateDate?: Date;
  lastUpdated?: Date;
  personalityIds: string[];
  dungeons: DungeonInfo[];
  buddy?: BuddyDetail | null;
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
