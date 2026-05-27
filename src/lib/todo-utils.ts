export function trimTodoTitle(title: string): string {
  return title.trim();
}

export function validateTodoTitle(title: string): { ok: true; value: string } | { ok: false; error: string } {
  const trimmed = trimTodoTitle(title);

  if (!trimmed) {
    return { ok: false, error: "タイトルを入力してください" };
  }

  return { ok: true, value: trimmed };
}

export function countTodosByStatus(todos: { completed: boolean }[]) {
  const completedCount = todos.filter((todo) => todo.completed).length;

  return {
    total: todos.length,
    completedCount,
    activeCount: todos.length - completedCount,
  };
}

export function filterTodosByTitle<T extends { title: string }>(todos: T[], query: string): T[] {
  const trimmed = query.trim();

  if (!trimmed) {
    return todos;
  }

  const normalized = trimmed.toLowerCase();

  return todos.filter((todo) => todo.title.toLowerCase().includes(normalized));
}
