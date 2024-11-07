import React, { Suspense, useState } from "react";
import { z } from "zod";
import Prism from "prismjs";
import "prismjs/components/prism-json";
import "prismjs/themes/prism.css";

const Editor = React.lazy(() => import("react-simple-code-editor"));

interface SessionStorageDebuggerProps {
  schema?: z.ZodObject<any, any>;
  defaultValue?: Record<string, any>;
  storageKey?: string;
}

export function SessionStorageDebugger({
  schema = z
    .object({
      name: z.string({ required_error: "name is required" }),
      age: z.number().optional(),
    })
    .strict(),
  defaultValue = { name: "John Doe", age: 30 },
  storageKey = "userData",
}: SessionStorageDebuggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [jsonValue, setJsonValue] = useState<string>(() => {
    if (typeof window === "undefined")
      return JSON.stringify(defaultValue, null, 2);

    const stored = sessionStorage.getItem(storageKey);
    if (stored) {
      return JSON.stringify(JSON.parse(stored), null, 2);
    }
    return JSON.stringify(defaultValue, null, 2);
  });
  const [error, setError] = useState<string[] | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function validateJson(value: string) {
    try {
      const parsed = JSON.parse(value);
      schema.parse(parsed);
      setError(null);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((error) => {
          const propertyName = error.path[error.path.length - 1];
          return `${propertyName}: ${error.message}`;
        });
        setError(errors);
      } else {
        setError(["Invalid JSON format"]);
      }
      return false;
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (validateJson(jsonValue)) {
      sessionStorage.setItem(storageKey, jsonValue);
      setSuccess("Data saved to session storage successfully!");
    }
  }

  // Only render in development
  if (typeof window === "undefined" || process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 text-white rounded-full p-3 shadow-lg hover:bg-gray-700"
        title="Session Storage Debugger"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                Session Storage Debugger
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  JSON Input
                </label>
                <div className="w-full border rounded-md overflow-hidden">
                  <Suspense>
                    <Editor
                      value={jsonValue}
                      onValueChange={(value) => {
                        setJsonValue(value);
                        validateJson(value);
                        setSuccess(null);
                      }}
                      highlight={(code) => {
                        try {
                          JSON.parse(code);
                          return Prism.highlight(
                            code,
                            Prism.languages.json,
                            "json"
                          );
                        } catch {
                          return `<span class="text-gray-900">${code}</span>`;
                        }
                      }}
                      padding={10}
                      style={{
                        fontFamily: '"Fira code", "Fira Mono", monospace',
                        fontSize: 14,
                        minHeight: "200px",
                        caretColor: "black",
                        color: "rgb(17 24 39)",
                      }}
                      className="w-full focus:outline-none"
                    />
                  </Suspense>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  {error.map((err, index) => (
                    <div key={index} className="text-red-600 text-sm">
                      {err}
                    </div>
                  ))}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
                  {success}
                </div>
              )}

              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                disabled={!!error}
              >
                Save to Session Storage
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
