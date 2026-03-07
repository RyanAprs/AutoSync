// Column CRUD + reorder — to be implemented
export const columnService = {
  listByBoard: async (boardId: string) => [],
  create: async (boardId: string, data: { title: string; position: number }) => null,
  update: async (id: string, data: object) => null,
  reorder: async (boardId: string, columnIds: string[]) => {},
  delete: async (id: string) => {},
};
