/**
 * Inline styles used by the UnicornScene component.
 *
 * @remarks
 * These styles provide the base layout and error display styling.
 * The container uses CSS custom properties (`--unicorn-width` and `--unicorn-height`)
 * for dynamic dimension handling.
 */
export const unicornStyles = {
  /**
   * Styles for the main scene container element.
   *
   * @remarks
   * Uses CSS custom properties for width and height to allow dynamic sizing.
   */
  container: {
    position: "relative" as const,
    width: "var(--unicorn-width)",
    height: "var(--unicorn-height)",
  },

  /**
   * Styles for the error message wrapper.
   */
  errorWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },

  /**
   * Styles for the error message box.
   */
  errorBox: {
    textAlign: "center" as const,
    padding: "1rem",
    borderRadius: "0.5rem",
    backgroundColor: "rgb(254 242 242)",
    color: "rgb(239 68 68)",
  },

  /**
   * Styles for the error title text.
   */
  errorTitle: {
    fontWeight: "600",
    marginBottom: "0.25rem",
  },

  /**
   * Styles for the error message text.
   */
  errorMessage: {
    fontSize: "0.875rem",
    marginTop: "0.25rem",
  },
};
