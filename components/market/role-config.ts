const FALLBACK_ROLE_OPTIONS = [
  "Software Engineer",
  "Data Analyst",
  "Data Scientist",
  "DevOps Engineer",
  "Product Manager",
  "UI/UX Designer",
  "QA Engineer",
  "Cybersecurity Analyst",
  "AI Engineer",
];

const uniqueRoles = (roles: string[]) => {
  const seen = new Set<string>();
  return roles.filter((role) => {
    const key = role.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const normalizeRole = (role?: string | null) => role?.trim().toLowerCase() ?? "";

export const parseRoleOptions = (value?: string) =>
  uniqueRoles(
    (value ?? "")
      .split(/[,\n;]/)
      .map((item) => item.trim())
      .filter(Boolean),
  );

export const CAREER_MARKET_ROLE_OPTIONS = uniqueRoles([
  ...parseRoleOptions(process.env.NEXT_PUBLIC_CAREER_MARKET_ROLE_OPTIONS),
  ...FALLBACK_ROLE_OPTIONS,
]);

export const mergeRoleOptions = (...groups: Array<Array<string | undefined | null>>) =>
  uniqueRoles(
    groups.flatMap((group) =>
      group
        .map((role) => role?.trim() ?? "")
        .filter(Boolean),
    ),
  );

export const resolveCareerRole = (...candidates: Array<string | undefined | null>) =>
  mergeRoleOptions(candidates, CAREER_MARKET_ROLE_OPTIONS)[0] ?? "Target Role";
