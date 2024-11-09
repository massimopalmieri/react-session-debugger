import React, { Suspense, useState, useEffect } from "react";
import { z } from "zod";
// import * as Editor from "react-simple-code-editor";
const Editor = require("react-simple-code-editor").default;

import Prism from "prismjs";
import "prismjs/components/prism-json.js";
import "prismjs/themes/prism.css";
import "./styles.css";

interface SessionStorageDebuggerProps {
  schema?: z.ZodObject<any, any>;
  defaultValue?: Record<string, any>;
  storageKey?: string;
}

export function SessionStorageDebugger({
  schema,
  defaultValue = { name: "John Doe", age: 30 },
  storageKey = "userData",
}: SessionStorageDebuggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [jsonValue, setJsonValue] = useState<string>(() => {
    const stored = sessionStorage.getItem(storageKey);
    if (stored) {
      return JSON.stringify(JSON.parse(stored), null, 2);
    }
    return JSON.stringify(defaultValue, null, 2);
  });
  const [error, setError] = useState<string[] | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  function handleOutsideClick(event: React.MouseEvent) {
    if (event.target === event.currentTarget) {
      setIsOpen(false);
    }
  }

  function validateJson(value: string) {
    try {
      const parsed = JSON.parse(value);

      if (schema) {
        schema.parse(parsed);
      }

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
    <div className="ssd-fixed ssd-bottom-4 ssd-right-4 ssd-z-[9999] ssd-font-sans">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="ssd-flex ssd-items-center ssd-justify-center ssd-bg-blue-600 ssd-text-white ssd-rounded-full ssd-p-3.5 ssd-shadow-lg hover:ssd-bg-blue-700 ssd-transition-all ssd-duration-200 ssd-ease-in-out hover:ssd-shadow-xl ssd-border-0 ssd-cursor-pointer ssd-outline-none focus:ssd-outline-none"
        title="Session Storage Debugger"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="ssd-h-6 ssd-w-6 ssd-text-white"
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
        <div
          className="ssd-text-left ssd-fixed ssd-inset-0 ssd-bg-gray-900/50 ssd-backdrop-blur-sm ssd-flex ssd-items-center ssd-justify-center ssd-z-[9999] ssd-font-sans"
          onClick={handleOutsideClick}
        >
          <div className="ssd-bg-white ssd-rounded-xl ssd-shadow-2xl ssd-w-full ssd-max-w-2xl ssd-m-4 ssd-p-6 ssd-relative ssd-animate-fadeIn">
            <div className="ssd-flex ssd-justify-between ssd-items-center ssd-mb-6">
              <h2 className="ssd-text-xl ssd-font-semibold ssd-text-gray-900 ssd-m-0 ssd-font-sans">
                Session Storage Debugger
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="ssd-flex ssd-items-center ssd-justify-center ssd-p-2 ssd-rounded-full ssd-text-gray-500 hover:ssd-text-gray-700 ssd-bg-gray-50 hover:ssd-bg-gray-100 ssd-transition-all ssd-border-0 ssd-cursor-pointer ssd-outline-none focus:ssd-outline-none"
                type="button"
              >
                <svg
                  className="ssd-w-5 ssd-h-5 ssd-text-current"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="ssd-space-y-5">
              <div className="ssd-space-y-3">
                <label className="ssd-block ssd-text-sm ssd-font-medium ssd-text-gray-700 ssd-font-sans">
                  JSON Input
                </label>
                <div className="ssd-w-full ssd-border ssd-border-gray-200 ssd-rounded-lg ssd-overflow-hidden ssd-shadow-sm ssd-bg-gray-50">
                  <Suspense>
                    <Editor.default
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
                          return `<span class="ssd-text-gray-900">${code}</span>`;
                        }
                      }}
                      padding={16}
                      style={{
                        fontFamily: '"Fira code", "Fira Mono", monospace',
                        fontSize: 14,
                        minHeight: "200px",
                        caretColor: "black",
                        color: "rgb(17 24 39)",
                        backgroundColor: "rgb(249 250 251)",
                        border: "none",
                        outline: "none",
                      }}
                      className="ssd-w-full ssd-focus:outline-none"
                    />
                  </Suspense>
                </div>
              </div>

              {error && (
                <div className="ssd-p-4 ssd-bg-red-50 ssd-border ssd-border-red-200 ssd-rounded-lg ssd-shadow-sm ssd-font-sans">
                  {error.map((err, index) => (
                    <div key={index} className="ssd-text-red-600 ssd-text-sm">
                      {err}
                    </div>
                  ))}
                </div>
              )}

              {success && (
                <div className="ssd-p-4 ssd-bg-green-50 ssd-border ssd-border-green-200 ssd-rounded-lg ssd-shadow-sm ssd-text-green-600 ssd-text-sm ssd-font-sans">
                  {success}
                </div>
              )}

              <button
                type="submit"
                className="ssd-w-full ssd-px-4 ssd-py-2.5 ssd-bg-blue-600 ssd-text-white ssd-rounded-lg hover:ssd-bg-blue-700 ssd-transition-colors disabled:ssd-opacity-50 ssd-shadow-sm hover:ssd-shadow ssd-font-medium"
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
