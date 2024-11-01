'use server';

export async function getUUID(username: string) {
  try {
    const res = await fetch(
      `${process.env.API_URL}/api/domains/get?domain=${username}`
    );

    if (!res.ok) {
      return null;
    }

    const data = await res.json();

    return data?.data?.user_id || null;
  } catch (error) {
    return null;
  }
}
