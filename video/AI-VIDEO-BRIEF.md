> Status: the final video is already installed as `video/lesson.mp4` (see README). This brief is kept as the original plan.

# AI video brief — "Business dining etiquette in 60 seconds"

Goal: a ~60–75 s video with **fictional, AI-generated people** (not real individuals) that explains business-dining manners ("modales en la mesa de negocios").

## Rules
- Generate **fictional** people. Do not use the face or voice of a real person (classmates, professor, celebrities) without their written consent.
- Disclose it: the site labels the video "AI-generated video with fictional people".
- Check the license/terms of the tool you use, and keep subtitles on (English; Spanish optional).

## Suggested tools (verify current features and pricing yourself)
Any text-to-video / avatar tool that lets you export MP4 (for example Sora, Veo, Runway, Kling, HeyGen, Synthesia). I cannot confirm which are available to you.

## Style prompt (prepend to every scene)
"Cinematic, warm natural light, upscale restaurant interior, shallow depth of field, two business professionals (woman late 30s, man early 30s, fictional), realistic, 16:9, no text on screen, no logos."

## Storyboard (≈10 s each) + narration (EN)
1. **Arrive early** — Prompt: *man checks his watch, enters restaurant, silences phone, smiles to the host.* Narration: "Arrive a few minutes early and silence your phone."
2. **Greeting & seating** — *host stands, shakes hands, lets the guest sit first.* "Greet standing, and let your guest sit first."
3. **Napkin & host's lead** — *napkin unfolded onto lap; both begin eating after the host.* "Napkin on your lap. Start when your host starts."
4. **Place setting (overhead)** — *top-down shot of a formal table: forks left, knife and spoon right, bread plate left, glasses right.* "Work from the outside in. Remember BMW: bread, meal, water."
5. **Conversation** — *relaxed small talk, no phones, warm laughter.* "Keep it light, then let the host lead into business."
6. **Staff & close** — *guest thanks the server; host pays discreetly; handshake at the door.* "Thank the staff, thank your host, and send a note within a day."

## Final steps
1. Export as MP4 (H.264), 1280×720, ideally under ~20 MB.
2. Save it as `video/lesson.mp4` in this repository.
3. In `index.html`, set `data-video-src="video/lesson.mp4"` on `<div id="ytWrap">`. It appears under the animated lesson. (A YouTube ID in `data-video-id` also works.)
