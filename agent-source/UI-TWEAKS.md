# UI tweaks made when embedding the agent into broughton.com.au

The original `AndrewAgent` component (uploaded as a standalone widget) needed four small adjustments to work inside the live website's modal popup. **Any future regenerated version of `andrew-agent.jsx` must preserve these changes — otherwise the chat won't render correctly inside the popup.**

When asking the Claude.ai project to "rebuild the agent", include this file in the project knowledge so the regeneration keeps these in.

## Required changes from the original standalone widget

### 1. No ES module imports
The agent is loaded via Babel-standalone in the browser. Browser Babel doesn't support `import` / `export`. Replace the original first line with:

```js
const { useState, useRef, useEffect } = React;
```

(React, ReactDOM are loaded as globals from CDN before the agent is fetched and compiled.)

### 2. Component declared as a plain function, not a default export
The original was `export default function AndrewAgent()`. Change to:

```js
function AndrewAgent() { ... }
```

### 3. Outer container uses `height: 100%` not `100vh`, no maxWidth/margin auto
The original used `height: "100vh"` (full viewport) and `maxWidth: 520, margin: "0 auto"`. Inside the popup this caused the chat to overflow vertically and float in transparent space horizontally. Replace the outer div style with:

```jsx
<div style={{ fontFamily: "'Outfit', sans-serif", height: "100%", width: "100%", display: "flex", flexDirection: "column", background: "#5B4FD6", overflow: "hidden", borderRadius: 12 }}>
```

### 4. Removed the duplicate UI in the chat header and the chat's own ticker
The original chat header had email + LinkedIn icons on the right. The site's main nav already has these — duplicates were noisy. The header should just have the AB avatar + "Andrew B." + "Design & Innovation" status. Delete the entire `<div style={{ display: "flex", gap: 12 }}>...email and LinkedIn anchors...</div>` block from the header.

The original also had a ticker/marquee just above the input ("Making the unreal real → Design everything → ..."). The site's footer already has a permanent ticker — duplicating it inside the chat was redundant. Remove the entire `<div style={{ overflow: "hidden", borderTop: ... }}>...marquee div...</div>` block.

The input wrapper that follows should now have a top border instead, since the marquee used to provide that visual separation:

```jsx
<div style={{ padding: "12px 16px 28px", borderTop: "1.5px solid rgba(232,164,184,0.3)" }}>
```

### 5. Expose globally at the end of the file
Browser Babel doesn't handle module exports. After the component definition, add:

```js
window.AndrewAgent = AndrewAgent;
```

## Everything else stays the same

All persona inference, topic scoring, response data, animations, font loading, message bubbles, typing indicator, chips, suggestion bar, send button, "AI representation · Responses from Andrew's portfolio" footnote — all preserved exactly as in the original.
