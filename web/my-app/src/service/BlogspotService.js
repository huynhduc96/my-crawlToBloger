export async function postToBlogspot(data) {
  const response = await fetch(`/api/blogspot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inputParam: data }),
  });
  return await response.json();
}
