export const AppInfo = {
  name: "AE Check",
  koGuideLink:
    "https://aecheck.tistory.com/category/%EC%A0%95%EB%B3%B4%2C%EB%AC%B8%EC%9D%98",
  enGuideLink: "https://github.com/BeaverHouse/aecheck-v3/wiki",
} as const;

export const AEData = {
  elementTags: [0, 1, 2, 3, 4, 5, 6, 7].map((a) => `personality00${a}`),
  weaponTags: [0, 1, 2, 3, 4, 5, 6, 7].map((a) => `personality01${a}`),
} as const;
