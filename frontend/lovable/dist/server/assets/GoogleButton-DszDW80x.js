import { jsxs, jsx } from "react/jsx-runtime";
import { B as Button } from "./button-DRiz9d0t.js";
function GoogleButton({
  label,
  onClick,
  disabled
}) {
  return /* @__PURE__ */ jsxs(
    Button,
    {
      type: "button",
      variant: "outline",
      onClick,
      disabled,
      className: "w-full h-11 bg-card font-medium",
      children: [
        /* @__PURE__ */ jsx(GoogleIcon, {}),
        label
      ]
    }
  );
}
function GoogleIcon() {
  return /* @__PURE__ */ jsxs("svg", { width: "18", height: "18", viewBox: "0 0 48 48", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx(
      "path",
      {
        fill: "#FFC107",
        d: "M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.4 6.1 29.5 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.2-.1-2.3-.4-3.5z"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        fill: "#FF3D00",
        d: "M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.4 7.1 29.5 5 24 5 16.3 5 9.7 9.3 6.3 14.7z"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        fill: "#4CAF50",
        d: "M24 44c5.4 0 10.3-2.1 14-5.5l-6.5-5.3C29.6 34.8 26.9 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        fill: "#1976D2",
        d: "M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.5 5.3C41.9 36 44 30.5 44 24c0-1.2-.1-2.3-.4-3.5z"
      }
    )
  ] });
}
export {
  GoogleButton as G
};
