// Board/card permission checks — to be implemented
// requireBoardRole(boardId, ['owner','editor'])
// requireRole(['admin', 'project_manager'])

export type BoardRole = "owner" | "editor" | "viewer";
export type AppRole = "admin" | "project_manager" | "designer" | "finance" | "director";

export async function getBoardRole(
  _userId: string,
  _boardId: string
): Promise<BoardRole | null> {
  return null;
}

export function canEditBoard(role: BoardRole | null): boolean {
  return role === "owner" || role === "editor";
}

export function canViewBoard(role: BoardRole | null): boolean {
  return role !== null;
}
