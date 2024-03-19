import { env } from '$env/dynamic/private'

/** @type {import('./$types').RequestHandler} */
export async function POST({ url, fetch, request }) {
    const body = await request.json()
    const response = await fetch(`https://discord.com/api/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: env.VITE_DISCORD_CLIENT_ID,
          client_secret: env.CLIENT_SECRET,
          grant_type: 'authorization_code',
          code: body.code
        }),
      });

    const {access_token} = (await response.json()) 
    if(response.ok) {
        return Response.json({ access_token });
    }
    return Response.json({ error: response.statusText }, { status: 500 });
}
