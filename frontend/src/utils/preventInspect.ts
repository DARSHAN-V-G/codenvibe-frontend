export function preventInspect() {
    function blockDevTools() {
        // Block right-click
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        }, { capture: true });

        // Block keyboard shortcuts
        // document.addEventListener('keydown', (e) => {
        //     if (
        //         // F12 key
        //         e.key === 'F12' ||
        //         // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
        //         (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C' || e.key.toLowerCase() === 'i' || e.key.toLowerCase() === 'j' || e.key.toLowerCase() === 'c')) ||
        //         // Cmd+Option+I, Cmd+Option+J, Cmd+Option+C
        //         (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'J' || e.key === 'C' || e.key.toLowerCase() === 'i' || e.key.toLowerCase() === 'j' || e.key.toLowerCase() === 'c')) ||
        //         // Ctrl+Shift+K
        //         (e.ctrlKey && e.shiftKey && (e.key === 'K' || e.key.toLowerCase() === 'k')) ||
        //         // Ctrl+U (View Source)
        //         (e.ctrlKey && (e.key === 'U' || e.key.toLowerCase() === 'u'))
        //     ) {
        //         e.stopPropagation();
        //         e.preventDefault();
        //         return false;
        //     }
        // }, { capture: true });

        // Detect DevTools opening
        // const detectDevTools = () => {
        //     const widthThreshold = window.outerWidth - window.innerWidth > 160;
        //     const heightThreshold = window.outerHeight - window.innerHeight > 160;
            
        //     if(widthThreshold || heightThreshold) {
        //         document.body.innerHTML = 'Developer tools are not allowed.';
        //     }
        // };

        // // Check continuously
        // setInterval(detectDevTools, 1000);

        // // Check on resize
        // window.addEventListener('resize', detectDevTools);

        // Additional protection
        // Overwrite common console methods
        // const consoleTypes = ['log', 'debug', 'info', 'warn', 'error', 'table', 'trace'] as const;
        // type ConsoleType = typeof consoleTypes[number];
        
        // consoleTypes.forEach((type: ConsoleType) => {
        //     (console as any)[type] = () => {
        //         return false;
        //     };
        // });

        // Disable source map
        const noSourceMap = document.createElement('meta');
        noSourceMap.setAttribute('http-equiv', 'Content-Security-Policy');
        noSourceMap.setAttribute('content', "default-src 'self' 'unsafe-inline' 'unsafe-eval' * blob: data:");
        document.head.appendChild(noSourceMap);

        // Monitor screen dimensions for DevTools
        const previousHeight = window.innerHeight;
        // window.addEventListener('resize', () => {
        //     if (window.innerHeight !== previousHeight) {
        //         document.body.innerHTML = 'Developer tools are not allowed.';
        //     }
        // });

        // Monitor for DevTools and debugging attempts
        // setInterval(() => {
        //     // Check for Redux DevTools
        //     const anyWindow = window as any;
        //     if (anyWindow.__REDUX_DEVTOOLS_EXTENSION__) {
        //         document.body.innerHTML = 'Developer tools are not allowed.';
        //     }

        //     // Add debugger statement
        //     debugger;

        //     // Performance check for dev tools
        //     const start = performance.now();
        //     debugger;
        //     const end = performance.now();
        //     if (end - start > 100) {
        //         document.body.innerHTML = 'Developer tools are not allowed.';
        //     }
        // }, 50);
    }

    // Initialize protection
    blockDevTools();

    // Re-apply if any protection is removed
    // setInterval(blockDevTools, 500);

    // Detect and handle iframe embedding
    if (window.self !== window.top && window.top) {
        try {
            window.top.location.href = window.self.location.href;
        } catch (e) {
            // If access to top is denied, reload current window
            window.location.reload();
        }
    }
}