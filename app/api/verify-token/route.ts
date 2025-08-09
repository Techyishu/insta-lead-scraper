function extractToken(raw?: string | null) {
  if (!raw) return undefined
  const trimmed = String(raw).trim()
  const urlMatch = trimmed.match(/[?&]token=([^&]+)/i)
  if (urlMatch) return decodeURIComponent(urlMatch[1])
  if (trimmed.toLowerCase().startsWith("token=")) {
    return trimmed.slice(6)
  }
  return trimmed
}

export async function POST(req: Request) {
  try {
    const { token } = (await req.json()) as { token?: string }
    const provided = extractToken(token)
    const apiToken = provided || extractToken(process.env.APIFY_API_TOKEN || "")

    if (!apiToken) {
      return Response.json(
        { valid: false, message: "No token provided. Paste a token or configure APIFY_API_TOKEN." },
        { status: 400 },
      )
    }

    const endpoint = "https://api.apify.com/v2/me?token=" + encodeURIComponent(apiToken)
    const res = await fetch(endpoint, {
      headers: {
        Accept: "application/json",
        "X-Apify-Token": apiToken,
        Authorization: `Bearer ${apiToken}`,
      },
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const message =
        data?.error?.message ||
        (res.status === 401 ? "Token is invalid or user not found." : `Failed to verify (status ${res.status}).`)
      return Response.json({ valid: false, message }, { status: 200 })
    }

    const username = data?.data?.username || data?.username
    const userId = data?.data?.id || data?.id
    return Response.json({ valid: true, username, userId }, { status: 200 })
  } catch {
    return Response.json({ valid: false, message: "Unexpected error verifying token." }, { status: 200 })
  }
}
