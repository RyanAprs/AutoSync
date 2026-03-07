/** Reusable class name utility. Add clsx + tailwind-merge when using shadcn. */
export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
