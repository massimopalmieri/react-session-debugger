# React Session Debugger

A development tool for debugging session storage in React applications.

## Installation

```bash
npm install react-session-debugger
or
yarn add react-session-debugger
or
bun add react-session-debugger
```

## Usage

```tsx
import { SessionStorageDebugger } from "react-session-debugger";
import { z } from "zod";

// Optional: Define your own schema
const schema = z.object({
  name: z.string(),
  email: z.string().email(),
});

export default function App() {
  return (
    <div>
      {/* Your app content */}
      {process.env.NODE_ENV === "development" && (
        <SessionStorageDebugger
          schema={schema}
          defaultValue={{ name: "", email: "" }}
          storageKey="myData"
        />
      )}
    </div>
  );
}
```

## Props

- `schema`: (optional) A Zod schema for validating the JSON data
- `defaultValue`: (optional) Default value to show in the editor
- `storageKey`: (optional) Key to use for sessionStorage (default: "userData")

## Development

Only shows in development mode (`NODE_ENV === "development"`). Now the code blocks should be properly formatted. Let me know if you'd like any changes to the content!
