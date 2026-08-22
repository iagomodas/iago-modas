export type NavigationSection = {
  target: string;
  top: number;
  bottom: number;
};

export function activeNavigationTarget(
  sections: NavigationSection[],
  activationLine: number
): string {
  if (sections.length === 0) return "";

  const passedSection = sections.filter(section => section.top <= activationLine).at(-1);
  const upcomingSection = sections.find(section => section.bottom > activationLine);

  return (passedSection ?? upcomingSection ?? sections[0]).target;
}
