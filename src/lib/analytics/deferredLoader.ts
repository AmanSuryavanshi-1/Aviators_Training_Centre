/**
 * Deferred Analytics Loader
 * 
 * Utility to lazy-load third-party analytics scripts after critical content.
 * Reduces Total Blocking Time by deferring non-critical JavaScript.
 * 
 * Strategy:
 * - Load scripts after 3 seconds OR on first user interaction
 * - Use requestIdleCallback for optimal timing
 * - Preserve all tracking functionality
 */

type DeferredScriptConfig = {
    name: string;
    loadScript: () => void;
    defer?: number; // milliseconds to defer (default: 3000)
};

class DeferredAnalyticsLoader {
    private loaded: Set<string> = new Set();
    private scripts: DeferredScriptConfig[] = [];
    private userInteracted = false;

    constructor() {
        if (typeof window !== 'undefined') {
            this.setupInteractionListeners();
        }
    }

    /**
     * Register a script to be loaded with deferred strategy
     */
    register(config: DeferredScriptConfig) {
        this.scripts.push(config);
    }

    /**
     * Initialize deferred loading for all registered scripts
     */
    init() {
        if (typeof window === 'undefined') return;

        this.scripts.forEach((script) => {
            const deferTime = script.defer || 3000;

            // Strategy 1: Load after delay
            setTimeout(() => {
                this.loadScript(script);
            }, deferTime);

            // Strategy 2: Load on user interaction (whichever comes first)
            if (!this.userInteracted) {
                this.setupEarlyLoad(script);
            }
        });
    }

    /**
     * Load script if user interacts before timeout
     */
    private setupEarlyLoad(script: DeferredScriptConfig) {
        const loadOnInteraction = () => {
            if (!this.userInteracted) {
                this.userInteracted = true;
                this.loadScript(script);
            }
        };

        // Listen for first interaction
        const interactionEvents = ['mousedown', 'touchstart', 'keydown', 'scroll'];
        interactionEvents.forEach((event) => {
            window.addEventListener(event, loadOnInteraction, {
                once: true,
                passive: true,
            });
        });
    }

    /**
     * Setup listeners for user interactions
     */
    private setupInteractionListeners() {
        const events = ['mousedown', 'touchstart', 'keydown', 'scroll'];

        const markInteraction = () => {
            this.userInteracted = true;
        };

        events.forEach((event) => {
            window.addEventListener(event, markInteraction, {
                once: true,
                passive: true,
            });
        });
    }

    /**
     * Load script using optimal timing strategy
     */
    private loadScript(script: DeferredScriptConfig) {
        if (this.loaded.has(script.name)) return;

        this.loaded.add(script.name);

        // Use requestIdleCallback for optimal timing
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                script.loadScript();
            });
        } else {
            // Fallback: Use setTimeout
            setTimeout(() => {
                script.loadScript();
            }, 0);
        }
    }

    /**
     * Check if a script has been loaded
     */
    isLoaded(name: string): boolean {
        return this.loaded.has(name);
    }
}

// Singleton instance
let loaderInstance: DeferredAnalyticsLoader | null = null;

export function getDeferredAnalyticsLoader(): DeferredAnalyticsLoader {
    if (!loaderInstance) {
        loaderInstance = new DeferredAnalyticsLoader();
    }
    return loaderInstance;
}

/**
 * Initialize deferred analytics loading
 * Call this in your app layout or _app.tsx
 */
export function initializeDeferredAnalytics() {
    if (typeof window === 'undefined') return;

    const loader = getDeferredAnalyticsLoader();

    // Wait for page to be interactive
    if (document.readyState === 'complete') {
        loader.init();
    } else {
        window.addEventListener('load', () => {
            loader.init();
        });
    }
}

export default DeferredAnalyticsLoader;
