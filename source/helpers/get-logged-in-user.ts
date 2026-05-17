import waitFor from "./wait-for.js";

export default async function getLoggedInUser(): Promise<string | undefined> {
  const immediate = document.querySelectorAll<HTMLElement>(".navbar-right .dropdown .header strong");
  const current = immediate[immediate.length - 1]?.textContent?.trim();
  if (current) {
    return current;
  }

  if (document.querySelector(".navbar-right a[href*='/user/login']")) {
    return undefined;
  }

  let username: string | undefined;

  await waitFor(() => {
    const headers = document.querySelectorAll<HTMLElement>(".navbar-right .dropdown .header strong");
    username = headers[headers.length - 1]?.textContent?.trim() || undefined;
    return !!username;
  }).catch(() => {
    // Not signed in, or the header hasn't rendered yet.
  });

  return username;
}
