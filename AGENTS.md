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

- Administration pages use a shared workspace and navigation; every privileged server handler rechecks the database role so revocation affects existing sessions.
- Guest checkout sends identifiers and quantities only to atomic database order creation; browser totals are never authoritative.
- Product uploads go through authenticated server validation before private storage; the browser must not upload directly.
- Password recovery completes on a public callback page; password changes alone never grant a staff role.
