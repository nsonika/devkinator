# Devkinator

A snarky tech guessing game that roasts your answers.  
Think **Akinator**, but for developers — with memes, sarcasm, and attitude.

---

## Features
- 🔮 Guesses frameworks, tools & algorithms in ~20 questions  
- 🎭 Humor modes: *Gentle*, *Snark*, *Unhinged*  
- 🎉 Meme/GIF celebrations on correct guesses  
- 📚 Built-in knowledge base of popular tech  

---

## Quick Start
```bash
# Install dependencies
npm install

# Run development server
npm run dev
````

Open [http://localhost:3000](http://localhost:3000) and let the roasting begin.

---

## How to Play

* Start a new game
* Answer Devkinator’s witty, sarcastic questions
* Endure the roast 👀
* Watch it (hopefully) guess your stack

---

## Built With

* ⚡ Next.js + React + TypeScript
* 🤖 GLM-4.5 for sarcastic banter
* 🎥 CogVideoX-3 for meme-style celebrations

---

## Knowledge Base

The game uses a `knowledge.json` file to store entities that can be guessed.

Example entry:

```json
{
  "name": "React",
  "type": "library",
  "domain": "frontend",
  "language": "JavaScript",
  "ui": true,
  "db": false,
  "realtime": false,
  "company": "Meta",
  "humor": "Where every junior dev thinks they're a 10x engineer after making a todo list"
}
```

---

## API Key Setup

This project requires a **ZAI API Key** for generating witty banter and celebratory videos.

- Go to [ZAI API Keys](https://z.ai/manage-apikey/apikey-list)
- Create a new API key
- Add it to your `.env.local` file:

```bash
ZAI_API_KEY=your_api_key_here
```

---

## Contributing

Want to make Devkinator roast harder?
We welcome PRs for new tech, better roasts, or game features.

* 🍴 Fork the repo

* 🔧 Add your tech entry in `knowledge.json`

  ```json
  {
    "name": "Elon Musk",
    "type": "human-ish",
    "domain": "twitter drama",
    "language": "Dogecoin",
    "ui": false,
    "db": false,
    "realtime": true,
    "company": "X",
    "humor": "The only CEO who can tank a stock with a meme"
  }
  ```

* 📝 Commit & push your changes

* 🔄 Open a pull request

* 🎤 Wait for Devkinator’s judgment

⚠️ *Keep the roasts funny, not offensive. Sarcasm ≠ bullying.*

---


