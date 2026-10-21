export function useThemeTransition() {
    const colorMode = useColorMode();

    const toggle = (event: MouseEvent) => {
        const nextTheme = colorMode.value === "dark" ? "light" : "dark";

        if (!document.startViewTransition) {
            colorMode.preference = nextTheme;
            return;
        }

        const x = event.clientX;
        const y = event.clientY;
        const endRadius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

        const transition = document.startViewTransition(() => {
            colorMode.preference = nextTheme;
        });

        transition.ready.then(() => {
            document.documentElement.animate(
                { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
                { duration: 450, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" },
            );
        });
    };

    return { colorMode, toggle };
}