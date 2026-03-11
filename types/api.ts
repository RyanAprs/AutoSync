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

export type CardDetail = {
  id: string;
  columnId: string;
  title: string;
  description: string | null;
  position: number;
  deadline: string | null;
  assignee: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
  labels?: { id: string; name: string; color: string }[];
  _count?: { comments: number; attachments: number };
};

export type ColumnDetail = {
  id: string;
  title: string;
  position: number;
  cards: CardDetail[];
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
  columns: (ColumnDetail & { _count: { cards: number } })[];
};

// ─── Label / Comment / Attachment types ─────────────────────────────────────

export type LabelDetail = {
  id: string;
  name: string;
  color: string;
};

export type CommentDetail = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

export type AttachmentDetail = {
  id: string;
  name: string;
  url: string;
  mimeType: string | null;
  sizeBytes: number | null;
  createdAt: string;
};

export type CardFullDetail = {
  id: string;
  columnId: string;
  columnTitle: string;
  boardId: string;
  title: string;
  description: string | null;
  position: number;
  deadline: string | null;
  assignee: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
  labels: LabelDetail[];
  comments: CommentDetail[];
  attachments: AttachmentDetail[];
};

// ─── Board mutation types ───────────────────────────────────────────────────

export type CreateBoardRequest = {
  name: string;
};

export type UpdateBoardRequest = {
  name?: string;
};
