export const fetchAPI = async (endpoint: string, options?: RequestInit) => {
  // Next.js rewrites를 통한 프록시 사용으로 CORS 문제 해결
  const res = await fetch(`/api/${endpoint}`, {
    ...options,
    headers: {
      'X-Access-Token': process.env.NEXT_PUBLIC_API_KEY || '',
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (res.ok) {
    return await res.json();
  }
  return null;
};
