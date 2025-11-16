export const fetchAPI = async (endpoint: string, options?: RequestInit) => {
  // Static export에서는 외부 API URL 직접 호출
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`, {
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
