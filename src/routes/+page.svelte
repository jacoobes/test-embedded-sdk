<script>
    import Counter from './Counter.svelte';
    import welcome from '$lib/images/svelte-welcome.webp';
    import welcome_fallback from '$lib/images/svelte-welcome.png';
    import { onMount } from 'svelte'
    import { usr } from '$lib/stores/user.js'
    import { sdk } from '$lib/stores/sdk.js'
    
    let mounted = false;
    async function appendVoiceChannelName() {

      let activityChannelName = 'Unknown';
      // Requesting the channel in GDMs (when the guild ID is null) requires
      // the dm_channels.read scope which requires Discord approval.
      if ($sdk.channelId != null && $sdk.guildId != null) {
        // Over RPC collect info about the channel
        const channel = await $sdk.commands.getChannel({channel_id: $sdk.channelId});
        if (channel.name != null) {
          activityChannelName = channel.name;
        }
      }
      // Update the UI with the name of the current voice channel
      return `Activity Channel: "${activityChannelName}"`;
    }
    onMount(async () => {
        if($sdk) return
        const { DiscordSDK } = await import("@discord/embedded-app-sdk"); 
        const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);
        await discordSdk.ready();
        const {code} = await discordSdk.commands.authorize({
            client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
            response_type: 'code',
            state: '',
            prompt: 'none',
            // More info on scopes here: https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes
            scope: [
              // "applications.builds.upload",
              // "applications.builds.read",
              // "applications.store.update",
              // "applications.entitlements",
              // "bot",
              'identify',
              // "connections",
              // "email",
              // "gdm.join",
              'guilds',
              // "guilds.join",
              // "guilds.members.read",
              // "messages.read",
              // "relationships.read",
              // 'rpc.activities.write',
              // "rpc.notifications.read",
              // "rpc.voice.write",
              'rpc.voice.read',
              // "webhook.incoming",
            ],
          });
          const response = await fetch('/api/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });
          const {access_token} = await response.json();
          let auth = await discordSdk.commands.authenticate({
                access_token,
          });
            
          if (auth == null) {
            throw new Error('Authenticate command failed');
          }
          usr.set(auth);
          sdk.set(discordSdk);
          mounted = true
    })

</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>

{#if mounted }
	<h1>
	    <span class="welcome">
		    <picture>
                            <source srcset={welcome} type="image/webp" />
                            <img src={welcome_fallback} alt="Welcome" />
                    </picture>
    	    </span>
	    to your new<br />SvelteKit app
	</h1>

	<h2>
            {#await appendVoiceChannelName()}
                    <p>...waiting</p>
            {:then msg}
                    <p>{msg}</p>
            {:catch error}
                    <p style="color: red">{error.message}</p>
            {/await}
	</h2>
	<Counter />

{:else}
	<p>Loading...</p>
{/if}

</section>
<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}

	.welcome {
		display: block;
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	}

	.welcome img {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		display: block;
	}
</style>
