// API request/response shapes
export type ApiError = { error: string; code?: string };

// ─── Board types ────────────────────────────────────────────────────────────

export type BoardListItem = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  role: "owner" | "editor" | "viewer";
  memberCount: number;
};

export type BoardDetail = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  members: {
    id: string;
    userId: string;
    role: "owner" | "editor" | "viewer";
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
  }[];
  columns: {
    id: string;
    title: string;
    position: number;
    _count: { cards: number };
  }[];
};

export type CreateBoardRequest = {
  name: string;
};

export type UpdateBoardRequest = {
  name?: string;
};
