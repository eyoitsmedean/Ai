# Security

## Reporting a vulnerability

Please report privately. Use GitHub's private vulnerability reporting: this repository's **Security** tab → **Report a vulnerability**. Do not open a public issue.

Include what you found, how to reproduce it, and what it could expose. You will get an acknowledgement, and a fix or a reason when there is none.

## What counts

Red Letter handles crisis-sensitive text. People type shame, grief, and sometimes thoughts of ending their life. So in addition to the usual (secrets, injection, data leaking between readers, bypassing `API_ACCESS_KEY`):

- **A crisis-detection miss is a security-severity bug.** If crisis language reaches the Advisor and the page does not show 988 / Find A Helpline, report it here, privately, with the exact text.
- Anything that shows one reader's journal or letters to another on a shared device, or survives `?fresh=1` / **Begin again**.
- A quoted verse that does not match the King James text it cites.

Journal and letters live in the browser on the reader's device. The server keeps no conversation store; with live generation on, Advisor messages are sent to the Anthropic API to be answered. The only thing the server writes to disk is waitlist emails (`data/waitlist.json`).
