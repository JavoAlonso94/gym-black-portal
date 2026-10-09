<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Auth is simulated client-side (src/lib/auth.ts, localStorage) and /app routes are ssr:false; all module data is mock in src/lib/data.ts — no backend yet.
- Public website templates share a browser-safe definition module and a dynamic layout with separate content leaves; template choice remains session-only to preserve the frontend demo boundary.
- Website training media is shared across templates; generated photos use bundled imports and videos and images are bundled imports from src/assets with user-initiated native playback to avoid unsolicited motion and downloads.

- Website customizations are private per Cloud Auth owner and template, enforced by database and Storage RLS; the existing management demo auth remains separate because simulated roles cannot authorize durable writes.
- User-selected website colors flow through CSS custom properties via one theme adapter, while content uses semantic tokens.
