export type SchoolSearchable = {
  name: string;
  short_name: string;
  location: string;
};

export function filterSchoolsByQuery<T extends SchoolSearchable>(
  schools: T[],
  query: string,
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return schools;

  return schools.filter((school) => {
    const haystack = [
      school.name,
      school.short_name,
      school.location,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
