export async function postOneLinkToBlogspot(data) {
  const response = await fetch(`/api/singerlinktoblogspot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inputParam: data }),
  });
  return await response.json();
}

export async function getAllLinkFromPage(data) {
  const response = await fetch(`/api/getalllinkfrompage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inputParam: data }),
  });
  return await response.json();
}

export async function getGoogleStatus() {
  try {
    const response = await fetch("/api/googlestatus");
    return await response.json();
  } catch (error) {
    return false;
  }
}

export async function connectToGoogle() {
  try {
    const response = await fetch("/api/connectgoogle");
    return await response.json();
  } catch (error) {
    return false;
  }
}
