# 🌌 Mind Palace - Thought Particles Game

An interactive physics-based thought visualization tool where your ideas become living particles that interact, attract, and evolve in a cosmic environment.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Kaushlendra-Kumar/thought-particles-game)

## ✨ Features

### 🎨 Interactive Zones

- **Creative Zone** 🎨 - High chaos, low gravity for wild ideas
- **Focus Zone** 🎯 - Strong gravity, minimal chaos for concentrated thinking
- **Organize Zone** 📊 - Balanced physics for structured thoughts
- **Relax Zone** 🌙 - Gentle gravity, peaceful atmosphere

### 🧲 Antonym Attraction

Opposite thoughts attract each other! Watch "sad" and "happy" particles pull together, or "chaos" and "calm" find balance.

### 🎮 Physics Engine

- **Drag & Throw** - Move thoughts with mouse or touch and throw them with momentum
- **Drop into a Zone** - Release a thought inside a zone to move it there
- **Zone Return** - Thoughts pulled out of their zone wander for 5-10 seconds, then drift home
- **Collisions** - Particles bounce off each other
- **Pan & Zoom** - Drag empty space to pan, scroll or use the buttons to zoom
- **Frame-rate independent** - Same speed on 60Hz and 120Hz screens

### 💾 Save & Share

- **Autosave** - Your layout is saved when you leave and restored when you return
- **Share link** - Copy a link that opens your exact layout on any device
- **Export** - Download the canvas as a PNG
- **Undo** - Deleting or clearing thoughts can be undone

### 📱 Works Everywhere

- Touch support and a mobile layout
- Keyboard controls and a screen-reader list of thoughts
- Respects "reduce motion" settings

## 🚀 Live Demo

**[View Live Demo](https://thought-particles-game.vercel.app)** 

## 🛠️ Tech Stack

- **React 19** + **Vite** - UI framework and build tool
- **Tailwind CSS** - Styling
- **HTML5 Canvas** - Rendering engine
- **Custom Physics Engine** - Particle interactions
- **Vitest** - Unit tests
- **Lucide React** - Icons

## 📦 Installation

```bash
git clone https://github.com/Kaushlendra-Kumar/thought-particles-game.git
cd thought-particles-game
npm install
npm run dev     # start the dev server
npm test        # run the tests
npm run build   # production build in ./build
```

## 🎯 How to Use

1. **Add Thoughts** - Type in the input field and press Enter
2. **Choose a Zone** - Select a zone or leave it as "Free floating"
3. **Drag Thoughts** - Drag bubbles around, or drop them into another zone
4. **Watch Interactions** - Opposite thoughts attract each other (turn on **Links** to see the pairs)
5. **Edit** - Double-click or double-tap a thought to rename it
6. **Share** - Press Share to copy a link to your layout

## ⌨️ Controls

| Action | Control |
| --- | --- |
| Add thought | `Enter` in the input |
| Edit thought | Double-click / double-tap, or `Enter` on the selected thought |
| Pause / Play | `Space` |
| Delete selected | `Delete` / `Backspace` |
| Save | `Ctrl+S` / `⌘+S` |
| Zoom | Mouse wheel or the zoom buttons |
| Pan | Drag empty space |
| Select / nudge | `Tab` / arrow keys (when the canvas is focused) |

## 🎨 Antonym Pairs

Whole words in these pairs attract each other: sad ↔ happy, chaos ↔ calm, chaos ↔ peace, angry ↔ peaceful,
dark ↔ light, stress ↔ relax, fear ↔ brave, hate ↔ love, good ↔ bad, hope ↔ despair, start ↔ end,
past ↔ future, दुख ↔ सुख, डर ↔ हिम्मत, नफरत ↔ प्यार.

## 🏗️ Project Structure

```
thought-particles-game/
├── index.html
├── src/
│   ├── config/zones.js     # Zone definitions and responsive layout
│   ├── engine/             # Game loop, physics, rendering, input, camera
│   ├── models/             # Thought, particle and vector helpers
│   ├── ui/                 # React components (panel, stats, toast)
│   ├── storage.js          # Autosave and share links
│   ├── App.jsx             # Wires the engine to the UI
│   └── main.jsx            # Entry point
└── public/
```

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

MIT License - feel free to use this project for learning or inspiration!

## 👨‍💻 Author

**Krypt0nite**

- GitHub: [@Krypt0nite](https://github.com/Krypt0nite)

## 🙏 Acknowledgments

- Built with Vite
- Physics inspired by particle simulation systems
- UI design inspired by cosmic themes

---

**Made with ❤️ and lots of ☕**

_"Your thoughts deserve a beautiful space to exist."_
