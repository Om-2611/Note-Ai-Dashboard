# **App Name**: NoteAI Dashboard

## Core Features:

- Header: A header/navigation bar component displaying the app name.
- Upload Transcript: Section for uploading meeting transcripts via file input.
- Custom Prompt Input: Input field to enter custom instructions or prompts for summarization.
- Generate Summary: Button to trigger AI summarization based on the transcript and prompt.
- Editable Summary Area: Editable text area to display and refine the generated summary. Make sure this is implemented as a 'tool', as reasoning might be needed to decide which information to keep in the summary
- Email Sharing: Section for sharing the summary via email with input for recipient(s).
- Previous Summaries: Optional sidebar or cards to display a list of previously generated summaries.

## Style Guidelines:

- Primary color: Light green (#B2DAB2) to evoke productivity.
- Background color: Very light green (#F0FAF0). The hue is close to the primary color, but it's heavily desaturated and very bright.
- Accent color: Soft yellow (#DADA92) for interactive elements and highlights. It is close in hue to the primary color.
- Body and headline font: 'Inter', a grotesque-style sans-serif, for a modern, machined look.
- Clean and modern layout using flexbox or grid for responsiveness.
- Use simple, consistent icons for actions like upload, generate, and send.
- Subtle animations or transitions on button hover or when generating summaries.