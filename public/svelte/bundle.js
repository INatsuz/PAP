
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(component, store, callback) {
        const unsub = store.subscribe(callback);
        component.$$.on_destroy.push(unsub.unsubscribe
            ? () => unsub.unsubscribe()
            : unsub);
    }
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        for (const key in attributes) {
            if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key in node) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = current_component;
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.shift()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            while (render_callbacks.length) {
                const callback = render_callbacks.pop();
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_render);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_render.forEach(add_render_callback);
        }
    }
    let outros;
    function group_outros() {
        outros = {
            remaining: 0,
            callbacks: []
        };
    }
    function check_outros() {
        if (!outros.remaining) {
            run_all(outros.callbacks);
        }
    }
    function on_outro(callback) {
        outros.callbacks.push(callback);
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_render } = component.$$;
        fragment.m(target, anchor);
        // onMount happens after the initial afterUpdate. Because
        // afterUpdate callbacks happen in reverse order (inner first)
        // we schedule onMount callbacks before afterUpdate callbacks
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_render.forEach(add_render_callback);
    }
    function destroy(component, detaching) {
        if (component.$$) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal$$1, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal: not_equal$$1,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_render: [],
            after_render: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal$$1($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_render);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro && component.$$.fragment.i)
                component.$$.fragment.i();
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy(this, true);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (!stop) {
                    return; // not ready
                }
                subscribers.forEach((s) => s[1]());
                subscribers.forEach((s) => s[0](value));
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                }
            };
        }
        return { set, update, subscribe };
    }
    /**
     * Derived value store by synchronizing one or more readable stores and
     * applying an aggregation function over its input values.
     * @param {Stores} stores input stores
     * @param {function(Stores=, function(*)=):*}fn function callback that aggregates the values
     * @param {*=}initial_value when used asynchronously
     */
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        const invalidators = [];
        const store = readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => store.subscribe((value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                run_all(invalidators);
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
        return {
            subscribe(run, invalidate = noop) {
                invalidators.push(invalidate);
                const unsubscribe = store.subscribe(run, invalidate);
                return () => {
                    const index = invalidators.indexOf(invalidate);
                    if (index !== -1) {
                        invalidators.splice(index, 1);
                    }
                    unsubscribe();
                };
            }
        };
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `string` starts with `search`
     * @param {string} string
     * @param {string} search
     * @return {boolean}
     */
    function startsWith(string, search) {
      return string.substr(0, search.length) === search;
    }

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    function addQuery(pathname, query) {
      return pathname + (query ? `?${query}` : "");
    }

    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    function resolve(to, base) {
      // /foo/bar, /baz/qux => /foo/bar
      if (startsWith(to, "/")) {
        return to;
      }

      const [toPathname, toQuery] = to.split("?");
      const [basePathname] = base.split("?");
      const toSegments = segmentize(toPathname);
      const baseSegments = segmentize(basePathname);

      // ?a=b, /users?b=c => /users?a=b
      if (toSegments[0] === "") {
        return addQuery(basePathname, toQuery);
      }

      // profile, /users/789 => /users/789/profile
      if (!startsWith(toSegments[0], ".")) {
        const pathname = baseSegments.concat(toSegments).join("/");

        return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
      }

      // ./       , /users/123 => /users/123
      // ../      , /users/123 => /users
      // ../..    , /users/123 => /
      // ../../one, /a/b/c/d   => /a/b/one
      // .././one , /a/b/c/d   => /a/b/c/one
      const allSegments = baseSegments.concat(toSegments);
      const segments = [];

      allSegments.forEach(segment => {
        if (segment === "..") {
          segments.pop();
        } else if (segment !== ".") {
          segments.push(segment);
        }
      });

      return addQuery("/" + segments.join("/"), toQuery);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
      return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      );
    }

    /* node_modules\svelte-routing\src\Router.svelte generated by Svelte v3.5.1 */

    function create_fragment(ctx) {
    	var current;

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	return {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (default_slot && default_slot.i) default_slot.i(local);
    			current = true;
    		},

    		o: function outro(local) {
    			if (default_slot && default_slot.o) default_slot.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let $base, $location, $routes;

    	

      let { basepath = "/", url = null } = $$props;

      const locationContext = getContext(LOCATION);
      const routerContext = getContext(ROUTER);

      const routes = writable([]); validate_store(routes, 'routes'); subscribe($$self, routes, $$value => { $routes = $$value; $$invalidate('$routes', $routes); });
      const activeRoute = writable(null);
      let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

      // If locationContext is not set, this is the topmost Router in the tree.
      // If the `url` prop is given we force the location to it.
      const location =
        locationContext ||
        writable(url ? { pathname: url } : globalHistory.location); validate_store(location, 'location'); subscribe($$self, location, $$value => { $location = $$value; $$invalidate('$location', $location); });

      // If routerContext is set, the routerBase of the parent Router
      // will be the base for this Router's descendants.
      // If routerContext is not set, the path and resolved uri will both
      // have the value of the basepath prop.
      const base = routerContext
        ? routerContext.routerBase
        : writable({
            path: basepath,
            uri: basepath
          }); validate_store(base, 'base'); subscribe($$self, base, $$value => { $base = $$value; $$invalidate('$base', $base); });

      const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
        // If there is no activeRoute, the routerBase will be identical to the base.
        if (activeRoute === null) {
          return base;
        }

        const { path: basepath } = base;
        const { route, uri } = activeRoute;
        // Remove the potential /* or /*splatname from
        // the end of the child Routes relative paths.
        const path = route.default ? basepath : route.path.replace(/\*.*$/, "");

        return { path, uri };
      });

      function registerRoute(route) {
        const { path: basepath } = $base;
        let { path } = route;

        // We store the original path in the _path property so we can reuse
        // it when the basepath changes. The only thing that matters is that
        // the route reference is intact, so mutation is fine.
        route._path = path;
        route.path = combinePaths(basepath, path);

        if (typeof window === "undefined") {
          // In SSR we should set the activeRoute immediately if it is a match.
          // If there are more Routes being registered after a match is found,
          // we just skip them.
          if (hasActiveRoute) {
            return;
          }

          const matchingRoute = match(route, $location.pathname);
          if (matchingRoute) {
            activeRoute.set(matchingRoute);
            hasActiveRoute = true;
          }
        } else {
          routes.update(rs => {
            rs.push(route);
            return rs;
          });
        }
      }

      function unregisterRoute(route) {
        routes.update(rs => {
          const index = rs.indexOf(route);
          rs.splice(index, 1);
          return rs;
        });
      }

      if (!locationContext) {
        // The topmost Router in the tree is responsible for updating
        // the location store and supplying it through context.
        onMount(() => {
          const unlisten = globalHistory.listen(history => {
            location.set(history.location);
          });

          return unlisten;
        });

        setContext(LOCATION, location);
      }

      setContext(ROUTER, {
        activeRoute,
        base,
        routerBase,
        registerRoute,
        unregisterRoute
      });

    	const writable_props = ['basepath', 'url'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('basepath' in $$props) $$invalidate('basepath', basepath = $$props.basepath);
    		if ('url' in $$props) $$invalidate('url', url = $$props.url);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = ($$dirty = { $base: 1, $routes: 1, $location: 1 }) => {
    		if ($$dirty.$base) { {
            const { path: basepath } = $base;
            routes.update(rs => {
              rs.forEach(r => (r.path = combinePaths(basepath, r._path)));
              return rs;
            });
          } }
    		if ($$dirty.$routes || $$dirty.$location) { {
            const bestMatch = pick($routes, $location.pathname);
            activeRoute.set(bestMatch);
          } }
    	};

    	return {
    		basepath,
    		url,
    		routes,
    		location,
    		base,
    		$$slots,
    		$$scope
    	};
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["basepath", "url"]);
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-routing\src\Route.svelte generated by Svelte v3.5.1 */

    // (39:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block(ctx) {
    	var current_block_type_index, if_block, if_block_anchor, current;

    	var if_block_creators = [
    		create_if_block_1,
    		create_else_block
    	];

    	var if_blocks = [];

    	function select_block_type(ctx) {
    		if (ctx.component !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				on_outro(() => {
    					if_blocks[previous_block_index].d(1);
    					if_blocks[previous_block_index] = null;
    				});
    				if_block.o(1);
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				if_block.i(1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (if_block) if_block.i();
    			current = true;
    		},

    		o: function outro(local) {
    			if (if_block) if_block.o();
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    // (42:2) {:else}
    function create_else_block(ctx) {
    	var current;

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	return {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    		},

    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (default_slot && default_slot.i) default_slot.i(local);
    			current = true;
    		},

    		o: function outro(local) {
    			if (default_slot && default_slot.o) default_slot.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    // (40:2) {#if component !== null}
    function create_if_block_1(ctx) {
    	var switch_instance_anchor, current;

    	var switch_instance_spread_levels = [
    		ctx.routeParams,
    		ctx.routeProps
    	];

    	var switch_value = ctx.component;

    	function switch_props(ctx) {
    		let switch_instance_props = {};
    		for (var i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}
    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    	}

    	return {
    		c: function create() {
    			if (switch_instance) switch_instance.$$.fragment.c();
    			switch_instance_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert(target, switch_instance_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var switch_instance_changes = (changed.routeParams || changed.routeProps) ? get_spread_update(switch_instance_spread_levels, [
    				(changed.routeParams) && ctx.routeParams,
    				(changed.routeProps) && ctx.routeProps
    			]) : {};

    			if (switch_value !== (switch_value = ctx.component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;
    					on_outro(() => {
    						old_component.$destroy();
    					});
    					old_component.$$.fragment.o(1);
    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());

    					switch_instance.$$.fragment.c();
    					switch_instance.$$.fragment.i(1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}

    			else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) switch_instance.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			if (switch_instance) switch_instance.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(switch_instance_anchor);
    			}

    			if (switch_instance) switch_instance.$destroy(detaching);
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	var if_block_anchor, current;

    	var if_block = (ctx.$activeRoute !== null && ctx.$activeRoute.route === ctx.route) && create_if_block(ctx);

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.$activeRoute !== null && ctx.$activeRoute.route === ctx.route) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					if_block.i(1);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.i(1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();
    				on_outro(() => {
    					if_block.d(1);
    					if_block = null;
    				});

    				if_block.o(1);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (if_block) if_block.i();
    			current = true;
    		},

    		o: function outro(local) {
    			if (if_block) if_block.o();
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $activeRoute;

    	

      let { path = "", component = null } = $$props;

      const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER); validate_store(activeRoute, 'activeRoute'); subscribe($$self, activeRoute, $$value => { $activeRoute = $$value; $$invalidate('$activeRoute', $activeRoute); });

      const route = {
        path,
        // If no path prop is given, this Route will act as the default Route
        // that is rendered if no other Route in the Router is a match.
        default: path === ""
      };
      let routeParams = {};
      let routeProps = {};

      registerRoute(route);

      // There is no need to unregister Routes in SSR since it will all be
      // thrown away anyway.
      if (typeof window !== "undefined") {
        onDestroy(() => {
          unregisterRoute(route);
        });
      }

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('path' in $$props) $$invalidate('path', path = $$props.path);
    		if ('component' in $$props) $$invalidate('component', component = $$props.component);
    		if ('$$scope' in $$new_props) $$invalidate('$$scope', $$scope = $$new_props.$$scope);
    	};

    	$$self.$$.update = ($$dirty = { $activeRoute: 1, $$props: 1 }) => {
    		if ($$dirty.$activeRoute) { if ($activeRoute && $activeRoute.route === route) {
            $$invalidate('routeParams', routeParams = $activeRoute.params);
          } }
    		{
            const { path, component, ...rest } = $$props;
            $$invalidate('routeProps', routeProps = rest);
          }
    	};

    	return {
    		path,
    		component,
    		activeRoute,
    		route,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$$props: $$props = exclude_internal_props($$props),
    		$$slots,
    		$$scope
    	};
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["path", "component"]);
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-routing\src\Link.svelte generated by Svelte v3.5.1 */

    const file = "node_modules\\svelte-routing\\src\\Link.svelte";

    function create_fragment$2(ctx) {
    	var a, current, dispose;

    	const default_slot_1 = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_1, ctx, null);

    	var a_levels = [
    		{ href: ctx.href },
    		{ "aria-current": ctx.ariaCurrent },
    		ctx.props
    	];

    	var a_data = {};
    	for (var i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	return {
    		c: function create() {
    			a = element("a");

    			if (default_slot) default_slot.c();

    			set_attributes(a, a_data);
    			add_location(a, file, 40, 0, 1249);
    			dispose = listen(a, "click", ctx.onClick);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(a_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(get_slot_changes(default_slot_1, ctx, changed, null), get_slot_context(default_slot_1, ctx, null));
    			}

    			set_attributes(a, get_spread_update(a_levels, [
    				(changed.href) && { href: ctx.href },
    				(changed.ariaCurrent) && { "aria-current": ctx.ariaCurrent },
    				(changed.props) && ctx.props
    			]));
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (default_slot && default_slot.i) default_slot.i(local);
    			current = true;
    		},

    		o: function outro(local) {
    			if (default_slot && default_slot.o) default_slot.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(a);
    			}

    			if (default_slot) default_slot.d(detaching);
    			dispose();
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $base, $location;

    	

      let { to = "#", replace = false, state = {}, getProps = () => ({}) } = $$props;

      const { base } = getContext(ROUTER); validate_store(base, 'base'); subscribe($$self, base, $$value => { $base = $$value; $$invalidate('$base', $base); });
      const location = getContext(LOCATION); validate_store(location, 'location'); subscribe($$self, location, $$value => { $location = $$value; $$invalidate('$location', $location); });
      const dispatch = createEventDispatcher();

      let href, isPartiallyCurrent, isCurrent, props;

      function onClick(event) {
        dispatch("click", event);

        if (shouldNavigate(event)) {
          event.preventDefault();
          // Don't push another entry to the history stack when the user
          // clicks on a Link to the page they are currently on.
          const shouldReplace = $location.pathname === href || replace;
          navigate(href, { state, replace: shouldReplace });
        }
      }

    	const writable_props = ['to', 'replace', 'state', 'getProps'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Link> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('to' in $$props) $$invalidate('to', to = $$props.to);
    		if ('replace' in $$props) $$invalidate('replace', replace = $$props.replace);
    		if ('state' in $$props) $$invalidate('state', state = $$props.state);
    		if ('getProps' in $$props) $$invalidate('getProps', getProps = $$props.getProps);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	let ariaCurrent;

    	$$self.$$.update = ($$dirty = { to: 1, $base: 1, $location: 1, href: 1, isCurrent: 1, getProps: 1, isPartiallyCurrent: 1 }) => {
    		if ($$dirty.to || $$dirty.$base) { $$invalidate('href', href = to === "/" ? $base.uri : resolve(to, $base.uri)); }
    		if ($$dirty.$location || $$dirty.href) { $$invalidate('isPartiallyCurrent', isPartiallyCurrent = startsWith($location.pathname, href)); }
    		if ($$dirty.href || $$dirty.$location) { $$invalidate('isCurrent', isCurrent = href === $location.pathname); }
    		if ($$dirty.isCurrent) { $$invalidate('ariaCurrent', ariaCurrent = isCurrent ? "page" : undefined); }
    		if ($$dirty.getProps || $$dirty.$location || $$dirty.href || $$dirty.isPartiallyCurrent || $$dirty.isCurrent) { $$invalidate('props', props = getProps({
            location: $location,
            href,
            isPartiallyCurrent,
            isCurrent
          })); }
    	};

    	return {
    		to,
    		replace,
    		state,
    		getProps,
    		base,
    		location,
    		href,
    		props,
    		onClick,
    		ariaCurrent,
    		$$slots,
    		$$scope
    	};
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["to", "replace", "state", "getProps"]);
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getProps() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getProps(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var bind = function bind(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        return fn.apply(thisArg, args);
      };
    };

    /*!
     * Determine if an object is a Buffer
     *
     * @author   Feross Aboukhadijeh <https://feross.org>
     * @license  MIT
     */

    var isBuffer = function isBuffer (obj) {
      return obj != null && obj.constructor != null &&
        typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
    };

    /*global toString:true*/

    // utils is a library of generic helper functions non-specific to axios

    var toString = Object.prototype.toString;

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Array, otherwise false
     */
    function isArray(val) {
      return toString.call(val) === '[object Array]';
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    function isArrayBuffer(val) {
      return toString.call(val) === '[object ArrayBuffer]';
    }

    /**
     * Determine if a value is a FormData
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    function isFormData(val) {
      return (typeof FormData !== 'undefined') && (val instanceof FormData);
    }

    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      var result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a String, otherwise false
     */
    function isString(val) {
      return typeof val === 'string';
    }

    /**
     * Determine if a value is a Number
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Number, otherwise false
     */
    function isNumber(val) {
      return typeof val === 'number';
    }

    /**
     * Determine if a value is undefined
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    function isUndefined(val) {
      return typeof val === 'undefined';
    }

    /**
     * Determine if a value is an Object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Object, otherwise false
     */
    function isObject(val) {
      return val !== null && typeof val === 'object';
    }

    /**
     * Determine if a value is a Date
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Date, otherwise false
     */
    function isDate(val) {
      return toString.call(val) === '[object Date]';
    }

    /**
     * Determine if a value is a File
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    function isFile(val) {
      return toString.call(val) === '[object File]';
    }

    /**
     * Determine if a value is a Blob
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    function isBlob(val) {
      return toString.call(val) === '[object Blob]';
    }

    /**
     * Determine if a value is a Function
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    function isFunction(val) {
      return toString.call(val) === '[object Function]';
    }

    /**
     * Determine if a value is a Stream
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    function isStream(val) {
      return isObject(val) && isFunction(val.pipe);
    }

    /**
     * Determine if a value is a URLSearchParams object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    function isURLSearchParams(val) {
      return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
    }

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     * @returns {String} The String freed of excess whitespace
     */
    function trim(str) {
      return str.replace(/^\s*/, '').replace(/\s*$/, '');
    }

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     */
    function isStandardBrowserEnv() {
      if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                               navigator.product === 'NativeScript' ||
                                               navigator.product === 'NS')) {
        return false;
      }
      return (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined'
      );
    }

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     */
    function forEach(obj, fn) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray(obj)) {
        // Iterate over array values
        for (var i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            fn.call(null, obj[key], key, obj);
          }
        }
      }
    }

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (typeof result[key] === 'object' && typeof val === 'object') {
          result[key] = merge(result[key], val);
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Function equal to merge with the difference being that no reference
     * to original objects is kept.
     *
     * @see merge
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function deepMerge(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (typeof result[key] === 'object' && typeof val === 'object') {
          result[key] = deepMerge(result[key], val);
        } else if (typeof val === 'object') {
          result[key] = deepMerge({}, val);
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     * @return {Object} The resulting value of object a
     */
    function extend(a, b, thisArg) {
      forEach(b, function assignValue(val, key) {
        if (thisArg && typeof val === 'function') {
          a[key] = bind(val, thisArg);
        } else {
          a[key] = val;
        }
      });
      return a;
    }

    var utils = {
      isArray: isArray,
      isArrayBuffer: isArrayBuffer,
      isBuffer: isBuffer,
      isFormData: isFormData,
      isArrayBufferView: isArrayBufferView,
      isString: isString,
      isNumber: isNumber,
      isObject: isObject,
      isUndefined: isUndefined,
      isDate: isDate,
      isFile: isFile,
      isBlob: isBlob,
      isFunction: isFunction,
      isStream: isStream,
      isURLSearchParams: isURLSearchParams,
      isStandardBrowserEnv: isStandardBrowserEnv,
      forEach: forEach,
      merge: merge,
      deepMerge: deepMerge,
      extend: extend,
      trim: trim
    };

    function encode(val) {
      return encodeURIComponent(val).
        replace(/%40/gi, '@').
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @returns {string} The formatted url
     */
    var buildURL = function buildURL(url, params, paramsSerializer) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }

      var serializedParams;
      if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
      } else if (utils.isURLSearchParams(params)) {
        serializedParams = params.toString();
      } else {
        var parts = [];

        utils.forEach(params, function serialize(val, key) {
          if (val === null || typeof val === 'undefined') {
            return;
          }

          if (utils.isArray(val)) {
            key = key + '[]';
          } else {
            val = [val];
          }

          utils.forEach(val, function parseValue(v) {
            if (utils.isDate(v)) {
              v = v.toISOString();
            } else if (utils.isObject(v)) {
              v = JSON.stringify(v);
            }
            parts.push(encode(key) + '=' + encode(v));
          });
        });

        serializedParams = parts.join('&');
      }

      if (serializedParams) {
        var hashmarkIndex = url.indexOf('#');
        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }

        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    };

    function InterceptorManager() {
      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    InterceptorManager.prototype.use = function use(fulfilled, rejected) {
      this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected
      });
      return this.handlers.length - 1;
    };

    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     */
    InterceptorManager.prototype.eject = function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    };

    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     */
    InterceptorManager.prototype.forEach = function forEach(fn) {
      utils.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    };

    var InterceptorManager_1 = InterceptorManager;

    /**
     * Transform the data for a request or a response
     *
     * @param {Object|String} data The data to be transformed
     * @param {Array} headers The headers for the request or response
     * @param {Array|Function} fns A single function or Array of functions
     * @returns {*} The resulting transformed data
     */
    var transformData = function transformData(data, headers, fns) {
      /*eslint no-param-reassign:0*/
      utils.forEach(fns, function transform(fn) {
        data = fn(data, headers);
      });

      return data;
    };

    var isCancel = function isCancel(value) {
      return !!(value && value.__CANCEL__);
    };

    var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
      utils.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };

    /**
     * Update an Error with the specified config, error code, and response.
     *
     * @param {Error} error The error to update.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The error.
     */
    var enhanceError = function enhanceError(error, config, code, request, response) {
      error.config = config;
      if (code) {
        error.code = code;
      }

      error.request = request;
      error.response = response;
      error.isAxiosError = true;

      error.toJSON = function() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: this.config,
          code: this.code
        };
      };
      return error;
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The created error.
     */
    var createError = function createError(message, config, code, request, response) {
      var error = new Error(message);
      return enhanceError(error, config, code, request, response);
    };

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     */
    var settle = function settle(resolve, reject, response) {
      var validateStatus = response.config.validateStatus;
      if (!validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(createError(
          'Request failed with status code ' + response.status,
          response.config,
          null,
          response.request,
          response
        ));
      }
    };

    // Headers whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    var ignoreDuplicateOf = [
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ];

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} headers Headers needing to be parsed
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders = function parseHeaders(headers) {
      var parsed = {};
      var key;
      var val;
      var i;

      if (!headers) { return parsed; }

      utils.forEach(headers.split('\n'), function parser(line) {
        i = line.indexOf(':');
        key = utils.trim(line.substr(0, i)).toLowerCase();
        val = utils.trim(line.substr(i + 1));

        if (key) {
          if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
            return;
          }
          if (key === 'set-cookie') {
            parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
          } else {
            parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
          }
        }
      });

      return parsed;
    };

    var isURLSameOrigin = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs have full support of the APIs needed to test
      // whether the request URL is of the same origin as current location.
        (function standardBrowserEnv() {
          var msie = /(msie|trident)/i.test(navigator.userAgent);
          var urlParsingNode = document.createElement('a');
          var originURL;

          /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
          function resolveURL(url) {
            var href = url;

            if (msie) {
            // IE needs attribute set twice to normalize properties
              urlParsingNode.setAttribute('href', href);
              href = urlParsingNode.href;
            }

            urlParsingNode.setAttribute('href', href);

            // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
            return {
              href: urlParsingNode.href,
              protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
              host: urlParsingNode.host,
              search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
              hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
              hostname: urlParsingNode.hostname,
              port: urlParsingNode.port,
              pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                urlParsingNode.pathname :
                '/' + urlParsingNode.pathname
            };
          }

          originURL = resolveURL(window.location.href);

          /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
          return function isURLSameOrigin(requestURL) {
            var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
            return (parsed.protocol === originURL.protocol &&
                parsed.host === originURL.host);
          };
        })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return function isURLSameOrigin() {
            return true;
          };
        })()
    );

    var cookies = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs support document.cookie
        (function standardBrowserEnv() {
          return {
            write: function write(name, value, expires, path, domain, secure) {
              var cookie = [];
              cookie.push(name + '=' + encodeURIComponent(value));

              if (utils.isNumber(expires)) {
                cookie.push('expires=' + new Date(expires).toGMTString());
              }

              if (utils.isString(path)) {
                cookie.push('path=' + path);
              }

              if (utils.isString(domain)) {
                cookie.push('domain=' + domain);
              }

              if (secure === true) {
                cookie.push('secure');
              }

              document.cookie = cookie.join('; ');
            },

            read: function read(name) {
              var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
              return (match ? decodeURIComponent(match[3]) : null);
            },

            remove: function remove(name) {
              this.write(name, '', Date.now() - 86400000);
            }
          };
        })() :

      // Non standard browser env (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return {
            write: function write() {},
            read: function read() { return null; },
            remove: function remove() {}
          };
        })()
    );

    var xhr = function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        var requestData = config.data;
        var requestHeaders = config.headers;

        if (utils.isFormData(requestData)) {
          delete requestHeaders['Content-Type']; // Let the browser set it
        }

        var request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          var username = config.auth.username || '';
          var password = config.auth.password || '';
          requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
        }

        request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        // Listen for ready state
        request.onreadystatechange = function handleLoad() {
          if (!request || request.readyState !== 4) {
            return;
          }

          // The request errored out and we didn't get a response, this will be
          // handled by onerror instead
          // With one exception: request that using file: protocol, most browsers
          // will return status as 0 even though it's a successful request
          if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
            return;
          }

          // Prepare the response
          var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
          var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
          var response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config: config,
            request: request
          };

          settle(resolve, reject, response);

          // Clean up request
          request = null;
        };

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(createError('Request aborted', config, 'ECONNABORTED', request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(createError('Network Error', config, null, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED',
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if (utils.isStandardBrowserEnv()) {
          var cookies$1 = cookies;

          // Add xsrf header
          var xsrfValue = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ?
            cookies$1.read(config.xsrfCookieName) :
            undefined;

          if (xsrfValue) {
            requestHeaders[config.xsrfHeaderName] = xsrfValue;
          }
        }

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils.forEach(requestHeaders, function setRequestHeader(val, key) {
            if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
              // Remove Content-Type if data is undefined
              delete requestHeaders[key];
            } else {
              // Otherwise add header to the request
              request.setRequestHeader(key, val);
            }
          });
        }

        // Add withCredentials to request if needed
        if (config.withCredentials) {
          request.withCredentials = true;
        }

        // Add responseType to request if needed
        if (config.responseType) {
          try {
            request.responseType = config.responseType;
          } catch (e) {
            // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
            // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
            if (config.responseType !== 'json') {
              throw e;
            }
          }
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', config.onDownloadProgress);
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', config.onUploadProgress);
        }

        if (config.cancelToken) {
          // Handle cancellation
          config.cancelToken.promise.then(function onCanceled(cancel) {
            if (!request) {
              return;
            }

            request.abort();
            reject(cancel);
            // Clean up request
            request = null;
          });
        }

        if (requestData === undefined) {
          requestData = null;
        }

        // Send the request
        request.send(requestData);
      });
    };

    var DEFAULT_CONTENT_TYPE = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    function setContentTypeIfUnset(headers, value) {
      if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
        headers['Content-Type'] = value;
      }
    }

    function getDefaultAdapter() {
      var adapter;
      // Only Node.JS has a process variable that is of [[Class]] process
      if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
        // For node use HTTP adapter
        adapter = xhr;
      } else if (typeof XMLHttpRequest !== 'undefined') {
        // For browsers use XHR adapter
        adapter = xhr;
      }
      return adapter;
    }

    var defaults = {
      adapter: getDefaultAdapter(),

      transformRequest: [function transformRequest(data, headers) {
        normalizeHeaderName(headers, 'Accept');
        normalizeHeaderName(headers, 'Content-Type');
        if (utils.isFormData(data) ||
          utils.isArrayBuffer(data) ||
          utils.isBuffer(data) ||
          utils.isStream(data) ||
          utils.isFile(data) ||
          utils.isBlob(data)
        ) {
          return data;
        }
        if (utils.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
          setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
          return data.toString();
        }
        if (utils.isObject(data)) {
          setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
          return JSON.stringify(data);
        }
        return data;
      }],

      transformResponse: [function transformResponse(data) {
        /*eslint no-param-reassign:0*/
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) { /* Ignore */ }
        }
        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      }
    };

    defaults.headers = {
      common: {
        'Accept': 'application/json, text/plain, */*'
      }
    };

    utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
      defaults.headers[method] = {};
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
    });

    var defaults_1 = defaults;

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    var isAbsoluteURL = function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
    };

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     * @returns {string} The combined URL
     */
    var combineURLs = function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    };

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     * @returns {Promise} The Promise to be fulfilled
     */
    var dispatchRequest = function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      // Support baseURL config
      if (config.baseURL && !isAbsoluteURL(config.url)) {
        config.url = combineURLs(config.baseURL, config.url);
      }

      // Ensure headers exist
      config.headers = config.headers || {};

      // Transform request data
      config.data = transformData(
        config.data,
        config.headers,
        config.transformRequest
      );

      // Flatten headers
      config.headers = utils.merge(
        config.headers.common || {},
        config.headers[config.method] || {},
        config.headers || {}
      );

      utils.forEach(
        ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        function cleanHeaderConfig(method) {
          delete config.headers[method];
        }
      );

      var adapter = config.adapter || defaults_1.adapter;

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData(
          response.data,
          response.headers,
          config.transformResponse
        );

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData(
              reason.response.data,
              reason.response.headers,
              config.transformResponse
            );
          }
        }

        return Promise.reject(reason);
      });
    };

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     * @returns {Object} New object resulting from merging config2 to config1
     */
    var mergeConfig = function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      var config = {};

      utils.forEach(['url', 'method', 'params', 'data'], function valueFromConfig2(prop) {
        if (typeof config2[prop] !== 'undefined') {
          config[prop] = config2[prop];
        }
      });

      utils.forEach(['headers', 'auth', 'proxy'], function mergeDeepProperties(prop) {
        if (utils.isObject(config2[prop])) {
          config[prop] = utils.deepMerge(config1[prop], config2[prop]);
        } else if (typeof config2[prop] !== 'undefined') {
          config[prop] = config2[prop];
        } else if (utils.isObject(config1[prop])) {
          config[prop] = utils.deepMerge(config1[prop]);
        } else if (typeof config1[prop] !== 'undefined') {
          config[prop] = config1[prop];
        }
      });

      utils.forEach([
        'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
        'timeout', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
        'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'maxContentLength',
        'validateStatus', 'maxRedirects', 'httpAgent', 'httpsAgent', 'cancelToken',
        'socketPath'
      ], function defaultToConfig2(prop) {
        if (typeof config2[prop] !== 'undefined') {
          config[prop] = config2[prop];
        } else if (typeof config1[prop] !== 'undefined') {
          config[prop] = config1[prop];
        }
      });

      return config;
    };

    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     */
    function Axios(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager_1(),
        response: new InterceptorManager_1()
      };
    }

    /**
     * Dispatch a request
     *
     * @param {Object} config The config specific for this request (merged with this.defaults)
     */
    Axios.prototype.request = function request(config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof config === 'string') {
        config = arguments[1] || {};
        config.url = arguments[0];
      } else {
        config = config || {};
      }

      config = mergeConfig(this.defaults, config);
      config.method = config.method ? config.method.toLowerCase() : 'get';

      // Hook up interceptors middleware
      var chain = [dispatchRequest, undefined];
      var promise = Promise.resolve(config);

      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        chain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        chain.push(interceptor.fulfilled, interceptor.rejected);
      });

      while (chain.length) {
        promise = promise.then(chain.shift(), chain.shift());
      }

      return promise;
    };

    Axios.prototype.getUri = function getUri(config) {
      config = mergeConfig(this.defaults, config);
      return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
    };

    // Provide aliases for supported request methods
    utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, config) {
        return this.request(utils.merge(config || {}, {
          method: method,
          url: url
        }));
      };
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, data, config) {
        return this.request(utils.merge(config || {}, {
          method: method,
          url: url,
          data: data
        }));
      };
    });

    var Axios_1 = Axios;

    /**
     * A `Cancel` is an object that is thrown when an operation is canceled.
     *
     * @class
     * @param {string=} message The message.
     */
    function Cancel(message) {
      this.message = message;
    }

    Cancel.prototype.toString = function toString() {
      return 'Cancel' + (this.message ? ': ' + this.message : '');
    };

    Cancel.prototype.__CANCEL__ = true;

    var Cancel_1 = Cancel;

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @class
     * @param {Function} executor The executor function.
     */
    function CancelToken(executor) {
      if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
      }

      var resolvePromise;
      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });

      var token = this;
      executor(function cancel(message) {
        if (token.reason) {
          // Cancellation has already been requested
          return;
        }

        token.reason = new Cancel_1(message);
        resolvePromise(token.reason);
      });
    }

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    CancelToken.prototype.throwIfRequested = function throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    };

    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    CancelToken.source = function source() {
      var cancel;
      var token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token: token,
        cancel: cancel
      };
    };

    var CancelToken_1 = CancelToken;

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     * @returns {Function}
     */
    var spread = function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    };

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     * @return {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      var context = new Axios_1(defaultConfig);
      var instance = bind(Axios_1.prototype.request, context);

      // Copy axios.prototype to instance
      utils.extend(instance, Axios_1.prototype, context);

      // Copy context to instance
      utils.extend(instance, context);

      return instance;
    }

    // Create the default instance to be exported
    var axios = createInstance(defaults_1);

    // Expose Axios class to allow class inheritance
    axios.Axios = Axios_1;

    // Factory for creating new instances
    axios.create = function create(instanceConfig) {
      return createInstance(mergeConfig(axios.defaults, instanceConfig));
    };

    // Expose Cancel & CancelToken
    axios.Cancel = Cancel_1;
    axios.CancelToken = CancelToken_1;
    axios.isCancel = isCancel;

    // Expose all/spread
    axios.all = function all(promises) {
      return Promise.all(promises);
    };
    axios.spread = spread;

    var axios_1 = axios;

    // Allow use of default import syntax in TypeScript
    var default_1 = axios;
    axios_1.default = default_1;

    var axios$1 = axios_1;

    /* src\components\Header.svelte generated by Svelte v3.5.1 */

    const file$1 = "src\\components\\Header.svelte";

    // (14:2) <Link class="navbar-brand" to="/svelte/projects">
    function create_default_slot_3(ctx) {
    	var img;

    	return {
    		c: function create() {
    			img = element("img");
    			img.className = "h-50px d-none d-sm-block";
    			img.src = "/../imgs/esl.png";
    			img.alt = "Logo ESL";
    			add_location(img, file$1, 13, 51, 327);
    		},

    		m: function mount(target, anchor) {
    			insert(target, img, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(img);
    			}
    		}
    	};
    }

    // (19:4) <Link to="/svelte/projects">
    function create_default_slot_2(ctx) {
    	var li, span;

    	return {
    		c: function create() {
    			li = element("li");
    			span = element("span");
    			span.textContent = "Projects";
    			span.className = "nav-link";
    			add_location(span, file$1, 18, 53, 804);
    			li.className = "nav-item";
    			add_location(li, file$1, 18, 32, 783);
    		},

    		m: function mount(target, anchor) {
    			insert(target, li, anchor);
    			append(li, span);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(li);
    			}
    		}
    	};
    }

    // (20:4) <Link to="/svelte/mobilities">
    function create_default_slot_1(ctx) {
    	var li, span;

    	return {
    		c: function create() {
    			li = element("li");
    			span = element("span");
    			span.textContent = "Mobilities";
    			span.className = "nav-link";
    			add_location(span, file$1, 19, 55, 911);
    			li.className = "nav-item";
    			add_location(li, file$1, 19, 34, 890);
    		},

    		m: function mount(target, anchor) {
    			insert(target, li, anchor);
    			append(li, span);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(li);
    			}
    		}
    	};
    }

    // (21:4) <Link to="/svelte/countries">
    function create_default_slot(ctx) {
    	var li, span;

    	return {
    		c: function create() {
    			li = element("li");
    			span = element("span");
    			span.textContent = "Countries";
    			span.className = "nav-link";
    			add_location(span, file$1, 20, 54, 1019);
    			li.className = "nav-item";
    			add_location(li, file$1, 20, 33, 998);
    		},

    		m: function mount(target, anchor) {
    			insert(target, li, anchor);
    			append(li, span);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(li);
    			}
    		}
    	};
    }

    // (27:3) {:else}
    function create_else_block$1(ctx) {
    	var li, span, i, t;

    	return {
    		c: function create() {
    			li = element("li");
    			span = element("span");
    			i = element("i");
    			t = text(" Login");
    			i.className = "fas fa-user";
    			add_location(i, file$1, 27, 125, 1451);
    			span.className = "nav-link text-nowrap cursor-pointer";
    			span.dataset.toggle = "modal";
    			span.dataset.target = "#login-modal";
    			add_location(span, file$1, 27, 28, 1354);
    			li.className = "nav-item";
    			add_location(li, file$1, 27, 7, 1333);
    		},

    		m: function mount(target, anchor) {
    			insert(target, li, anchor);
    			append(li, span);
    			append(span, i);
    			append(span, t);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(li);
    			}
    		}
    	};
    }

    // (25:6) {#if is_logged_in}
    function create_if_block$1(ctx) {
    	var li, span, i, t, dispose;

    	return {
    		c: function create() {
    			li = element("li");
    			span = element("span");
    			i = element("i");
    			t = text(" Logout");
    			i.className = "fas fa-user";
    			add_location(i, file$1, 25, 107, 1266);
    			span.className = "nav-link text-nowrap cursor-pointer";
    			add_location(span, file$1, 25, 28, 1187);
    			li.className = "nav-item";
    			add_location(li, file$1, 25, 7, 1166);
    			dispose = listen(span, "click", ctx.handleLogoutClick);
    		},

    		m: function mount(target, anchor) {
    			insert(target, li, anchor);
    			append(li, span);
    			append(span, i);
    			append(span, t);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(li);
    			}

    			dispose();
    		}
    	};
    }

    function create_fragment$3(ctx) {
    	var header, nav, t0, button, span, t1, div, ul0, t2, t3, t4, ul1, current;

    	var link0 = new Link({
    		props: {
    		class: "navbar-brand",
    		to: "/svelte/projects",
    		$$slots: { default: [create_default_slot_3] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var link1 = new Link({
    		props: {
    		to: "/svelte/projects",
    		$$slots: { default: [create_default_slot_2] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var link2 = new Link({
    		props: {
    		to: "/svelte/mobilities",
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var link3 = new Link({
    		props: {
    		to: "/svelte/countries",
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	function select_block_type(ctx) {
    		if (ctx.is_logged_in) return create_if_block$1;
    		return create_else_block$1;
    	}

    	var current_block_type = select_block_type(ctx);
    	var if_block = current_block_type(ctx);

    	return {
    		c: function create() {
    			header = element("header");
    			nav = element("nav");
    			link0.$$.fragment.c();
    			t0 = space();
    			button = element("button");
    			span = element("span");
    			t1 = space();
    			div = element("div");
    			ul0 = element("ul");
    			link1.$$.fragment.c();
    			t2 = space();
    			link2.$$.fragment.c();
    			t3 = space();
    			link3.$$.fragment.c();
    			t4 = space();
    			ul1 = element("ul");
    			if_block.c();
    			span.className = "navbar-toggler-icon";
    			add_location(span, file$1, 15, 3, 609);
    			button.className = "navbar-toggler mr-auto";
    			button.type = "button";
    			button.dataset.toggle = "collapse";
    			button.dataset.target = "#navbarCollapse";
    			attr(button, "aria-controls", "navbarCollapse");
    			attr(button, "aria-expanded", "false");
    			attr(button, "aria-label", "Toggle Navigation");
    			add_location(button, file$1, 14, 2, 414);
    			ul0.className = "navbar-nav";
    			add_location(ul0, file$1, 17, 3, 726);
    			div.className = "collapse navbar-collapse";
    			div.id = "navbarCollapse";
    			add_location(div, file$1, 16, 2, 663);
    			ul1.className = "navbar-nav mr-2 flex-row";
    			add_location(ul1, file$1, 23, 2, 1094);
    			nav.className = "navbar navbar-expand-xl navbar-dark bg-darker";
    			add_location(nav, file$1, 12, 1, 215);
    			header.className = "sticky-top";
    			add_location(header, file$1, 11, 0, 185);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, header, anchor);
    			append(header, nav);
    			mount_component(link0, nav, null);
    			append(nav, t0);
    			append(nav, button);
    			append(button, span);
    			append(nav, t1);
    			append(nav, div);
    			append(div, ul0);
    			mount_component(link1, ul0, null);
    			append(ul0, t2);
    			mount_component(link2, ul0, null);
    			append(ul0, t3);
    			mount_component(link3, ul0, null);
    			append(nav, t4);
    			append(nav, ul1);
    			if_block.m(ul1, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var link0_changes = {};
    			if (changed.$$scope) link0_changes.$$scope = { changed, ctx };
    			link0.$set(link0_changes);

    			var link1_changes = {};
    			if (changed.$$scope) link1_changes.$$scope = { changed, ctx };
    			link1.$set(link1_changes);

    			var link2_changes = {};
    			if (changed.$$scope) link2_changes.$$scope = { changed, ctx };
    			link2.$set(link2_changes);

    			var link3_changes = {};
    			if (changed.$$scope) link3_changes.$$scope = { changed, ctx };
    			link3.$set(link3_changes);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(changed, ctx);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);
    				if (if_block) {
    					if_block.c();
    					if_block.m(ul1, null);
    				}
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			link0.$$.fragment.i(local);

    			link1.$$.fragment.i(local);

    			link2.$$.fragment.i(local);

    			link3.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			link0.$$.fragment.o(local);
    			link1.$$.fragment.o(local);
    			link2.$$.fragment.o(local);
    			link3.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(header);
    			}

    			link0.$destroy();

    			link1.$destroy();

    			link2.$destroy();

    			link3.$destroy();

    			if_block.d();
    		}
    	};
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { is_logged_in, logout } = $$props;

        function handleLogoutClick() {
            logout();
        }

    	const writable_props = ['is_logged_in', 'logout'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('is_logged_in' in $$props) $$invalidate('is_logged_in', is_logged_in = $$props.is_logged_in);
    		if ('logout' in $$props) $$invalidate('logout', logout = $$props.logout);
    	};

    	return { is_logged_in, logout, handleLogoutClick };
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, ["is_logged_in", "logout"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.is_logged_in === undefined && !('is_logged_in' in props)) {
    			console.warn("<Header> was created without expected prop 'is_logged_in'");
    		}
    		if (ctx.logout === undefined && !('logout' in props)) {
    			console.warn("<Header> was created without expected prop 'logout'");
    		}
    	}

    	get is_logged_in() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set is_logged_in(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get logout() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set logout(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\LoginModal.svelte generated by Svelte v3.5.1 */

    const file$2 = "src\\components\\LoginModal.svelte";

    function create_fragment$4(ctx) {
    	var div13, div12, div11, div0, h5, t1, button0, span, t3, div9, div4, div3, div2, div1, t5, input0, t6, div8, div7, div6, div5, t8, input1, t9, div10, button1, dispose;

    	return {
    		c: function create() {
    			div13 = element("div");
    			div12 = element("div");
    			div11 = element("div");
    			div0 = element("div");
    			h5 = element("h5");
    			h5.textContent = "Login";
    			t1 = space();
    			button0 = element("button");
    			span = element("span");
    			span.textContent = "x";
    			t3 = space();
    			div9 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div1.textContent = "Username";
    			t5 = space();
    			input0 = element("input");
    			t6 = space();
    			div8 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			div5.textContent = "Password";
    			t8 = space();
    			input1 = element("input");
    			t9 = space();
    			div10 = element("div");
    			button1 = element("button");
    			button1.textContent = "Login";
    			h5.className = "modal-title";
    			add_location(h5, file$2, 16, 38, 425);
    			add_location(span, file$2, 17, 73, 534);
    			button0.className = "close";
    			button0.type = "button";
    			button0.dataset.dismiss = "modal";
    			add_location(button0, file$2, 17, 16, 477);
    			div0.className = "modal-header";
    			add_location(div0, file$2, 16, 12, 399);
    			div1.className = "input-group-text";
    			add_location(div1, file$2, 23, 28, 793);
    			div2.className = "input-group-prepend";
    			add_location(div2, file$2, 22, 24, 730);
    			input0.className = "form-control";
    			attr(input0, "type", "text");
    			input0.placeholder = "Username";
    			input0.name = "username";
    			add_location(input0, file$2, 25, 24, 895);
    			div3.className = "input-group";
    			add_location(div3, file$2, 21, 20, 679);
    			div4.className = "form-group";
    			add_location(div4, file$2, 20, 16, 633);
    			div5.className = "input-group-text";
    			add_location(div5, file$2, 30, 28, 1240);
    			div6.className = "input-group-prepend";
    			add_location(div6, file$2, 29, 24, 1177);
    			input1.className = "form-control";
    			attr(input1, "type", "password");
    			input1.placeholder = "Password";
    			input1.name = "password";
    			add_location(input1, file$2, 32, 24, 1342);
    			div7.className = "input-group";
    			add_location(div7, file$2, 28, 20, 1126);
    			div8.className = "form-group mb-0";
    			add_location(div8, file$2, 27, 16, 1075);
    			div9.className = "modal-body";
    			add_location(div9, file$2, 19, 12, 591);
    			button1.className = "btn btn-primary mr-auto w-25";
    			add_location(button1, file$2, 36, 16, 1586);
    			div10.className = "modal-footer";
    			add_location(div10, file$2, 35, 12, 1542);
    			div11.className = "modal-content";
    			add_location(div11, file$2, 15, 8, 358);
    			div12.className = "modal-dialog";
    			attr(div12, "role", "document");
    			add_location(div12, file$2, 14, 4, 306);
    			div13.className = "modal fade";
    			div13.id = "login-modal";
    			div13.tabIndex = "-1";
    			attr(div13, "role", "dialog");
    			add_location(div13, file$2, 13, 0, 231);

    			dispose = [
    				listen(input0, "change", ctx.change_handler),
    				listen(input1, "change", ctx.change_handler_1),
    				listen(button1, "click", ctx.handleLoginClick)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div13, anchor);
    			append(div13, div12);
    			append(div12, div11);
    			append(div11, div0);
    			append(div0, h5);
    			append(div0, t1);
    			append(div0, button0);
    			append(button0, span);
    			append(div11, t3);
    			append(div11, div9);
    			append(div9, div4);
    			append(div4, div3);
    			append(div3, div2);
    			append(div2, div1);
    			append(div3, t5);
    			append(div3, input0);
    			append(div9, t6);
    			append(div9, div8);
    			append(div8, div7);
    			append(div7, div6);
    			append(div6, div5);
    			append(div7, t8);
    			append(div7, input1);
    			append(div11, t9);
    			append(div11, div10);
    			append(div10, button1);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div13);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { login } = $$props;

        let username = "";
        let password= "";

        function handleLoginClick(event) {
            login(username, password);

            window.$("#login-modal").modal("hide");
        }

    	const writable_props = ['login'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<LoginModal> was created with unknown prop '${key}'`);
    	});

    	function change_handler(event) {
    		const $$result = username = event.target.value;
    		$$invalidate('username', username);
    		return $$result;
    	}

    	function change_handler_1(event) {
    		const $$result = password = event.target.value;
    		$$invalidate('password', password);
    		return $$result;
    	}

    	$$self.$set = $$props => {
    		if ('login' in $$props) $$invalidate('login', login = $$props.login);
    	};

    	return {
    		login,
    		username,
    		password,
    		handleLoginClick,
    		change_handler,
    		change_handler_1
    	};
    }

    class LoginModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, ["login"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.login === undefined && !('login' in props)) {
    			console.warn("<LoginModal> was created without expected prop 'login'");
    		}
    	}

    	get login() {
    		throw new Error("<LoginModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set login(value) {
    		throw new Error("<LoginModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\BasicTable.svelte generated by Svelte v3.5.1 */

    const file$3 = "src\\components\\BasicTable.svelte";

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.action = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.header = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.row = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.header = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    // (71:16) {#each table_headers as header, i}
    function create_each_block_3(ctx) {
    	var th, t_value = ctx.header.columnName, t, th_class_value;

    	return {
    		c: function create() {
    			th = element("th");
    			t = text(t_value);
    			th.scope = "col";
    			th.className = th_class_value = "position-sticky border-bottom-0 border-top-0 top-0px bg-darkest shadow-y-dark-1px " + (ctx.header.actions ? ' text-center' : '') + " svelte-1c7h2sc";
    			add_location(th, file$3, 71, 20, 2071);
    		},

    		m: function mount(target, anchor) {
    			insert(target, th, anchor);
    			append(th, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.table_headers) && t_value !== (t_value = ctx.header.columnName)) {
    				set_data(t, t_value);
    			}

    			if ((changed.table_headers) && th_class_value !== (th_class_value = "position-sticky border-bottom-0 border-top-0 top-0px bg-darkest shadow-y-dark-1px " + (ctx.header.actions ? ' text-center' : '') + " svelte-1c7h2sc")) {
    				th.className = th_class_value;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(th);
    			}
    		}
    	};
    }

    // (90:28) {:else}
    function create_else_block$2(ctx) {
    	var td, t_value = ctx.row[ctx.header.key], t, td_class_value;

    	return {
    		c: function create() {
    			td = element("td");
    			t = text(t_value);
    			td.className = td_class_value = ctx.header.wrap ? 'wrap' : '';
    			add_location(td, file$3, 90, 32, 3384);
    		},

    		m: function mount(target, anchor) {
    			insert(target, td, anchor);
    			append(td, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.data || changed.table_headers) && t_value !== (t_value = ctx.row[ctx.header.key])) {
    				set_data(t, t_value);
    			}

    			if ((changed.table_headers) && td_class_value !== (td_class_value = ctx.header.wrap ? 'wrap' : '')) {
    				td.className = td_class_value;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(td);
    			}
    		}
    	};
    }

    // (88:28) {#if header.toggler}
    function create_if_block_1$1(ctx) {
    	var td, t, td_class_value, dispose;

    	function click_handler(...args) {
    		return ctx.click_handler(ctx, ...args);
    	}

    	return {
    		c: function create() {
    			td = element("td");
    			t = space();
    			td.className = td_class_value = "" + (ctx.row[ctx.header.key] === 'true' ? 'bg-success' : 'bg-danger') + " cursor-pointer toggler" + " svelte-1c7h2sc";
    			add_location(td, file$3, 88, 32, 3162);
    			dispose = listen(td, "click", click_handler);
    		},

    		m: function mount(target, anchor) {
    			insert(target, td, anchor);
    			append(td, t);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if ((changed.data || changed.table_headers) && td_class_value !== (td_class_value = "" + (ctx.row[ctx.header.key] === 'true' ? 'bg-success' : 'bg-danger') + " cursor-pointer toggler" + " svelte-1c7h2sc")) {
    				td.className = td_class_value;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(td);
    			}

    			dispose();
    		}
    	};
    }

    // (81:24) {#if header.actions}
    function create_if_block$2(ctx) {
    	var td, current;

    	var each_value_2 = ctx.header.actions;

    	var each_blocks = [];

    	for (var i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	function outro_block(i, detaching, local) {
    		if (each_blocks[i]) {
    			if (detaching) {
    				on_outro(() => {
    					each_blocks[i].d(detaching);
    					each_blocks[i] = null;
    				});
    			}

    			each_blocks[i].o(local);
    		}
    	}

    	return {
    		c: function create() {
    			td = element("td");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			td.className = "text-center vertical-align-middle";
    			add_location(td, file$3, 81, 28, 2695);
    		},

    		m: function mount(target, anchor) {
    			insert(target, td, anchor);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(td, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.table_headers || changed.data) {
    				each_value_2 = ctx.header.actions;

    				for (var i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						each_blocks[i].i(1);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].i(1);
    						each_blocks[i].m(td, null);
    					}
    				}

    				group_outros();
    				for (; i < each_blocks.length; i += 1) outro_block(i, 1, 1);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value_2.length; i += 1) each_blocks[i].i();

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) outro_block(i, 0, 0);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(td);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (84:32) <Link to={`${action.link}${row[action.query_field]}`}>
    function create_default_slot$1(ctx) {
    	var i, i_class_value;

    	return {
    		c: function create() {
    			i = element("i");
    			i.className = i_class_value = "" + (`fas ${ctx.action.icon} fa-fw cursor-pointer mr-1 text-light`) + " svelte-1c7h2sc";
    			add_location(i, file$3, 83, 86, 2891);
    		},

    		m: function mount(target, anchor) {
    			insert(target, i, anchor);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.table_headers) && i_class_value !== (i_class_value = "" + (`fas ${ctx.action.icon} fa-fw cursor-pointer mr-1 text-light`) + " svelte-1c7h2sc")) {
    				i.className = i_class_value;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(i);
    			}
    		}
    	};
    }

    // (83:28) {#each header.actions as action}
    function create_each_block_2(ctx) {
    	var current;

    	var link = new Link({
    		props: {
    		to: `${ctx.action.link}${ctx.row[ctx.action.query_field]}`,
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			link.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(link, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var link_changes = {};
    			if (changed.table_headers || changed.data) link_changes.to = `${ctx.action.link}${ctx.row[ctx.action.query_field]}`;
    			if (changed.$$scope || changed.table_headers) link_changes.$$scope = { changed, ctx };
    			link.$set(link_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			link.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			link.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			link.$destroy(detaching);
    		}
    	};
    }

    // (80:20) {#each table_headers as header, i}
    function create_each_block_1(ctx) {
    	var current_block_type_index, if_block, if_block_anchor, current;

    	var if_block_creators = [
    		create_if_block$2,
    		create_if_block_1$1,
    		create_else_block$2
    	];

    	var if_blocks = [];

    	function select_block_type(ctx) {
    		if (ctx.header.actions) return 0;
    		if (ctx.header.toggler) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				on_outro(() => {
    					if_blocks[previous_block_index].d(1);
    					if_blocks[previous_block_index] = null;
    				});
    				if_block.o(1);
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				if_block.i(1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (if_block) if_block.i();
    			current = true;
    		},

    		o: function outro(local) {
    			if (if_block) if_block.o();
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    // (77:12) {#each data as row, i}
    function create_each_block(ctx) {
    	var tr, t, tr_class_value, current, dispose;

    	var each_value_1 = ctx.table_headers;

    	var each_blocks = [];

    	for (var i_1 = 0; i_1 < each_value_1.length; i_1 += 1) {
    		each_blocks[i_1] = create_each_block_1(get_each_context_1(ctx, each_value_1, i_1));
    	}

    	function outro_block(i, detaching, local) {
    		if (each_blocks[i]) {
    			if (detaching) {
    				on_outro(() => {
    					each_blocks[i].d(detaching);
    					each_blocks[i] = null;
    				});
    			}

    			each_blocks[i].o(local);
    		}
    	}

    	function click_handler_1(...args) {
    		return ctx.click_handler_1(ctx, ...args);
    	}

    	return {
    		c: function create() {
    			tr = element("tr");

    			for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
    				each_blocks[i_1].c();
    			}

    			t = space();
    			tr.className = tr_class_value = ctx.selectedRows.indexOf(ctx.row[ctx.selection_field]) === -1 ? 'table-row' : 'table-row bg-secondary';
    			add_location(tr, file$3, 77, 16, 2373);
    			dispose = listen(tr, "click", click_handler_1);
    		},

    		m: function mount(target, anchor) {
    			insert(target, tr, anchor);

    			for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
    				each_blocks[i_1].m(tr, null);
    			}

    			append(tr, t);
    			current = true;
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if (changed.table_headers || changed.data) {
    				each_value_1 = ctx.table_headers;

    				for (var i_1 = 0; i_1 < each_value_1.length; i_1 += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i_1);

    					if (each_blocks[i_1]) {
    						each_blocks[i_1].p(changed, child_ctx);
    						each_blocks[i_1].i(1);
    					} else {
    						each_blocks[i_1] = create_each_block_1(child_ctx);
    						each_blocks[i_1].c();
    						each_blocks[i_1].i(1);
    						each_blocks[i_1].m(tr, t);
    					}
    				}

    				group_outros();
    				for (; i_1 < each_blocks.length; i_1 += 1) outro_block(i_1, 1, 1);
    				check_outros();
    			}

    			if ((!current || changed.selectedRows || changed.data || changed.selection_field) && tr_class_value !== (tr_class_value = ctx.selectedRows.indexOf(ctx.row[ctx.selection_field]) === -1 ? 'table-row' : 'table-row bg-secondary')) {
    				tr.className = tr_class_value;
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i_1 = 0; i_1 < each_value_1.length; i_1 += 1) each_blocks[i_1].i();

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i_1 = 0; i_1 < each_blocks.length; i_1 += 1) outro_block(i_1, 0, 0);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(tr);
    			}

    			destroy_each(each_blocks, detaching);

    			dispose();
    		}
    	};
    }

    function create_fragment$5(ctx) {
    	var div, table_1, thead, tr, t, tbody, current;

    	var each_value_3 = ctx.table_headers;

    	var each_blocks_1 = [];

    	for (var i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_1[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	var each_value = ctx.data;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	function outro_block(i, detaching, local) {
    		if (each_blocks[i]) {
    			if (detaching) {
    				on_outro(() => {
    					each_blocks[i].d(detaching);
    					each_blocks[i] = null;
    				});
    			}

    			each_blocks[i].o(local);
    		}
    	}

    	return {
    		c: function create() {
    			div = element("div");
    			table_1 = element("table");
    			thead = element("thead");
    			tr = element("tr");

    			for (var i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t = space();
    			tbody = element("tbody");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			tr.className = "table-headers";
    			add_location(tr, file$3, 69, 12, 1971);
    			add_location(thead, file$3, 68, 8, 1950);
    			add_location(tbody, file$3, 75, 8, 2312);
    			table_1.className = "table table-dark table-bordered table-scrollable table-hover nowrap m-0";
    			add_location(table_1, file$3, 67, 4, 1853);
    			div.className = "table-responsive rounded dark-scroll";
    			add_location(div, file$3, 66, 0, 1797);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, table_1);
    			append(table_1, thead);
    			append(thead, tr);

    			for (var i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(tr, null);
    			}

    			append(table_1, t);
    			append(table_1, tbody);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.table_headers) {
    				each_value_3 = ctx.table_headers;

    				for (var i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(changed, child_ctx);
    					} else {
    						each_blocks_1[i] = create_each_block_3(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(tr, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}
    				each_blocks_1.length = each_value_3.length;
    			}

    			if (changed.selectedRows || changed.data || changed.selection_field || changed.table_headers) {
    				each_value = ctx.data;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						each_blocks[i].i(1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].i(1);
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				group_outros();
    				for (; i < each_blocks.length; i += 1) outro_block(i, 1, 1);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value.length; i += 1) each_blocks[i].i();

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) outro_block(i, 0, 0);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_each(each_blocks_1, detaching);

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	

        let { getToken, table, table_headers, data, toggleRowSelect, selectedRows, selection_field, toggle_fields, onToggle } = $$props;

        function handleToggleClick(row){
            if (row.ID !== null){
            	console.log("Hey");
                axios$1.delete(`/api/delete/${table}`, {
                    data: {
                        rows: [row.ID]
                    },
                    headers: {
                        Authorization: getToken()
                    }
                }).then(res => {
                    onToggle();
                }).catch(err =>{
                    console.log(err.response);
                });
            } else {
            	console.log("Bye");
            	let data = {ID: null};
            	console.log(toggle_fields);
            	for(let i = 0; i < toggle_fields.length; i++) {
            		console.log(toggle_fields[i].field);
            	    data[toggle_fields[i].field] = row[toggle_fields[i].field];
            	}
            	console.log(data);

                axios$1.post(`/api/insert/${table}`, data, {headers: {Authorization: getToken()}}).then(res => {
                    console.log(`Successfully added relation`);
                    onToggle();
                }).catch(err => {
                    console.log(err.response);
                });
            }
            console.log(row);
        }

        function handleRowClick(event, id) {
        	if (!event.target.classList.contains("toggler")) {
                toggleRowSelect(id);
        	}
        	// event.currentTarget.classList.toggle("bg-secondary");
        }

    	const writable_props = ['getToken', 'table', 'table_headers', 'data', 'toggleRowSelect', 'selectedRows', 'selection_field', 'toggle_fields', 'onToggle'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<BasicTable> was created with unknown prop '${key}'`);
    	});

    	function click_handler({ row }, event) {handleToggleClick(row);}

    	function click_handler_1({ row }, event) {handleRowClick(event, row[selection_field]);}

    	$$self.$set = $$props => {
    		if ('getToken' in $$props) $$invalidate('getToken', getToken = $$props.getToken);
    		if ('table' in $$props) $$invalidate('table', table = $$props.table);
    		if ('table_headers' in $$props) $$invalidate('table_headers', table_headers = $$props.table_headers);
    		if ('data' in $$props) $$invalidate('data', data = $$props.data);
    		if ('toggleRowSelect' in $$props) $$invalidate('toggleRowSelect', toggleRowSelect = $$props.toggleRowSelect);
    		if ('selectedRows' in $$props) $$invalidate('selectedRows', selectedRows = $$props.selectedRows);
    		if ('selection_field' in $$props) $$invalidate('selection_field', selection_field = $$props.selection_field);
    		if ('toggle_fields' in $$props) $$invalidate('toggle_fields', toggle_fields = $$props.toggle_fields);
    		if ('onToggle' in $$props) $$invalidate('onToggle', onToggle = $$props.onToggle);
    	};

    	return {
    		getToken,
    		table,
    		table_headers,
    		data,
    		toggleRowSelect,
    		selectedRows,
    		selection_field,
    		toggle_fields,
    		onToggle,
    		handleToggleClick,
    		handleRowClick,
    		click_handler,
    		click_handler_1
    	};
    }

    class BasicTable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, ["getToken", "table", "table_headers", "data", "toggleRowSelect", "selectedRows", "selection_field", "toggle_fields", "onToggle"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.getToken === undefined && !('getToken' in props)) {
    			console.warn("<BasicTable> was created without expected prop 'getToken'");
    		}
    		if (ctx.table === undefined && !('table' in props)) {
    			console.warn("<BasicTable> was created without expected prop 'table'");
    		}
    		if (ctx.table_headers === undefined && !('table_headers' in props)) {
    			console.warn("<BasicTable> was created without expected prop 'table_headers'");
    		}
    		if (ctx.data === undefined && !('data' in props)) {
    			console.warn("<BasicTable> was created without expected prop 'data'");
    		}
    		if (ctx.toggleRowSelect === undefined && !('toggleRowSelect' in props)) {
    			console.warn("<BasicTable> was created without expected prop 'toggleRowSelect'");
    		}
    		if (ctx.selectedRows === undefined && !('selectedRows' in props)) {
    			console.warn("<BasicTable> was created without expected prop 'selectedRows'");
    		}
    		if (ctx.selection_field === undefined && !('selection_field' in props)) {
    			console.warn("<BasicTable> was created without expected prop 'selection_field'");
    		}
    		if (ctx.toggle_fields === undefined && !('toggle_fields' in props)) {
    			console.warn("<BasicTable> was created without expected prop 'toggle_fields'");
    		}
    		if (ctx.onToggle === undefined && !('onToggle' in props)) {
    			console.warn("<BasicTable> was created without expected prop 'onToggle'");
    		}
    	}

    	get getToken() {
    		throw new Error("<BasicTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getToken(value) {
    		throw new Error("<BasicTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get table() {
    		throw new Error("<BasicTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set table(value) {
    		throw new Error("<BasicTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get table_headers() {
    		throw new Error("<BasicTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set table_headers(value) {
    		throw new Error("<BasicTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get data() {
    		throw new Error("<BasicTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<BasicTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toggleRowSelect() {
    		throw new Error("<BasicTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toggleRowSelect(value) {
    		throw new Error("<BasicTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedRows() {
    		throw new Error("<BasicTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedRows(value) {
    		throw new Error("<BasicTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selection_field() {
    		throw new Error("<BasicTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selection_field(value) {
    		throw new Error("<BasicTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toggle_fields() {
    		throw new Error("<BasicTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toggle_fields(value) {
    		throw new Error("<BasicTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onToggle() {
    		throw new Error("<BasicTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onToggle(value) {
    		throw new Error("<BasicTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\BasicModal.svelte generated by Svelte v3.5.1 */

    const file$4 = "src\\components\\BasicModal.svelte";

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.option = list[i];
    	return child_ctx;
    }

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.field = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    // (111:36) {:else}
    function create_else_block_1(ctx) {
    	var input, input_type_value, input_value_value, input_placeholder_value, dispose;

    	function change_handler_3(...args) {
    		return ctx.change_handler_3(ctx, ...args);
    	}

    	return {
    		c: function create() {
    			input = element("input");
    			input.className = "form-control";
    			attr(input, "type", input_type_value = ctx.field.type);
    			input.value = input_value_value = ctx.field.value;
    			input.placeholder = input_placeholder_value = ctx.field.placeholder;
    			add_location(input, file$4, 111, 40, 4255);
    			dispose = listen(input, "change", change_handler_3);
    		},

    		m: function mount(target, anchor) {
    			insert(target, input, anchor);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if ((changed.fields) && input_type_value !== (input_type_value = ctx.field.type)) {
    				attr(input, "type", input_type_value);
    			}

    			if ((changed.fields) && input_value_value !== (input_value_value = ctx.field.value)) {
    				input.value = input_value_value;
    			}

    			if ((changed.fields) && input_placeholder_value !== (input_placeholder_value = ctx.field.placeholder)) {
    				input.placeholder = input_placeholder_value;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(input);
    			}

    			dispose();
    		}
    	};
    }

    // (109:36) {#if field.value !== ""}
    function create_if_block_4(ctx) {
    	var input, input_type_value, input_value_value, input_placeholder_value, dispose;

    	function change_handler_2(...args) {
    		return ctx.change_handler_2(ctx, ...args);
    	}

    	return {
    		c: function create() {
    			input = element("input");
    			input.className = "form-control";
    			attr(input, "type", input_type_value = ctx.field.type);
    			input.value = input_value_value = ctx.field.value;
    			input.placeholder = input_placeholder_value = ctx.field.placeholder;
    			add_location(input, file$4, 109, 40, 4010);
    			dispose = listen(input, "change", change_handler_2);
    		},

    		m: function mount(target, anchor) {
    			insert(target, input, anchor);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if ((changed.fields) && input_type_value !== (input_type_value = ctx.field.type)) {
    				attr(input, "type", input_type_value);
    			}

    			if ((changed.fields) && input_value_value !== (input_value_value = ctx.field.value)) {
    				input.value = input_value_value;
    			}

    			if ((changed.fields) && input_placeholder_value !== (input_placeholder_value = ctx.field.placeholder)) {
    				input.placeholder = input_placeholder_value;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(input);
    			}

    			dispose();
    		}
    	};
    }

    // (106:32) {#if field.type === "textarea"}
    function create_if_block_3(ctx) {
    	var textarea, textarea_placeholder_value, textarea_value_value, dispose;

    	function change_handler_1(...args) {
    		return ctx.change_handler_1(ctx, ...args);
    	}

    	return {
    		c: function create() {
    			textarea = element("textarea");
    			textarea.className = "form-control";
    			textarea.placeholder = textarea_placeholder_value = ctx.field.placeholder;
    			textarea.value = textarea_value_value = ctx.field.value;
    			add_location(textarea, file$4, 106, 36, 3720);
    			dispose = listen(textarea, "change", change_handler_1);
    		},

    		m: function mount(target, anchor) {
    			insert(target, textarea, anchor);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if ((changed.fields) && textarea_placeholder_value !== (textarea_placeholder_value = ctx.field.placeholder)) {
    				textarea.placeholder = textarea_placeholder_value;
    			}

    			if ((changed.fields) && textarea_value_value !== (textarea_value_value = ctx.field.value)) {
    				textarea.value = textarea_value_value;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(textarea);
    			}

    			dispose();
    		}
    	};
    }

    // (92:28) {#if field.type === "select"}
    function create_if_block$3(ctx) {
    	var select, if_block_anchor, dispose;

    	var if_block = (ctx.field.value === "") && create_if_block_2();

    	var each_value_1 = ctx.field.options;

    	var each_blocks = [];

    	for (var i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	function change_handler(...args) {
    		return ctx.change_handler(ctx, ...args);
    	}

    	return {
    		c: function create() {
    			select = element("select");
    			if (if_block) if_block.c();
    			if_block_anchor = empty();

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			select.className = "form-control";
    			add_location(select, file$4, 92, 32, 2733);
    			dispose = listen(select, "change", change_handler);
    		},

    		m: function mount(target, anchor) {
    			insert(target, select, anchor);
    			if (if_block) if_block.m(select, null);
    			append(select, if_block_anchor);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if (ctx.field.value === "") {
    				if (!if_block) {
    					if_block = create_if_block_2();
    					if_block.c();
    					if_block.m(select, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (changed.fields) {
    				each_value_1 = ctx.field.options;

    				for (var i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value_1.length;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(select);
    			}

    			if (if_block) if_block.d();

    			destroy_each(each_blocks, detaching);

    			dispose();
    		}
    	};
    }

    // (94:36) {#if field.value === ""}
    function create_if_block_2(ctx) {
    	var option;

    	return {
    		c: function create() {
    			option = element("option");
    			option.textContent = "Choose an option";
    			option.className = "d-none";
    			option.__value = "null";
    			option.value = option.__value;
    			option.selected = true;
    			option.disabled = true;
    			add_location(option, file$4, 94, 36, 2920);
    		},

    		m: function mount(target, anchor) {
    			insert(target, option, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(option);
    			}
    		}
    	};
    }

    // (100:40) {:else}
    function create_else_block$3(ctx) {
    	var option, t_value = ctx.option.display, t, option_value_value;

    	return {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = ctx.option.value;
    			option.value = option.__value;
    			add_location(option, file$4, 100, 44, 3391);
    		},

    		m: function mount(target, anchor) {
    			insert(target, option, anchor);
    			append(option, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.fields) && t_value !== (t_value = ctx.option.display)) {
    				set_data(t, t_value);
    			}

    			if ((changed.fields) && option_value_value !== (option_value_value = ctx.option.value)) {
    				option.__value = option_value_value;
    			}

    			option.value = option.__value;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(option);
    			}
    		}
    	};
    }

    // (98:40) {#if field.value === option.value}
    function create_if_block_1$2(ctx) {
    	var option, t_value = ctx.option.display, t, option_value_value;

    	return {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = ctx.option.value;
    			option.value = option.__value;
    			option.selected = true;
    			add_location(option, file$4, 98, 44, 3233);
    		},

    		m: function mount(target, anchor) {
    			insert(target, option, anchor);
    			append(option, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.fields) && t_value !== (t_value = ctx.option.display)) {
    				set_data(t, t_value);
    			}

    			if ((changed.fields) && option_value_value !== (option_value_value = ctx.option.value)) {
    				option.__value = option_value_value;
    			}

    			option.value = option.__value;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(option);
    			}
    		}
    	};
    }

    // (97:36) {#each field.options as option}
    function create_each_block_1$1(ctx) {
    	var if_block_anchor;

    	function select_block_type_1(ctx) {
    		if (ctx.field.value === ctx.option.value) return create_if_block_1$2;
    		return create_else_block$3;
    	}

    	var current_block_type = select_block_type_1(ctx);
    	var if_block = current_block_type(ctx);

    	return {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(changed, ctx);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);
    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},

    		d: function destroy(detaching) {
    			if_block.d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    // (86:16) {#each fields.fields as field, i}
    function create_each_block$1(ctx) {
    	var div3, div2, div1, div0, t0_value = ctx.field.display, t0, t1;

    	function select_block_type(ctx) {
    		if (ctx.field.type === "select") return create_if_block$3;
    		if (ctx.field.type === "textarea") return create_if_block_3;
    		if (ctx.field.value !== "") return create_if_block_4;
    		return create_else_block_1;
    	}

    	var current_block_type = select_block_type(ctx);
    	var if_block = current_block_type(ctx);

    	return {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			if_block.c();
    			div0.className = "input-group-text w-100";
    			add_location(div0, file$4, 89, 32, 2547);
    			div1.className = "input-group-prepend w-25";
    			add_location(div1, file$4, 88, 28, 2475);
    			div2.className = "input-group";
    			add_location(div2, file$4, 87, 24, 2420);
    			div3.className = "form-group";
    			add_location(div3, file$4, 86, 20, 2370);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div3, anchor);
    			append(div3, div2);
    			append(div2, div1);
    			append(div1, div0);
    			append(div0, t0);
    			append(div2, t1);
    			if_block.m(div2, null);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.fields) && t0_value !== (t0_value = ctx.field.display)) {
    				set_data(t0, t0_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(changed, ctx);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);
    				if (if_block) {
    					if_block.c();
    					if_block.m(div2, null);
    				}
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div3);
    			}

    			if_block.d();
    		}
    	};
    }

    function create_fragment$6(ctx) {
    	var div5, div4, div3, div0, h5, t0_value = ctx.mode === "add" ? "Add" : "Edit", t0, t1, t2, t3, button0, span, t5, div1, t6, div2, button1, t7_value = ctx.mode === "add" ? "Add" : "Edit", t7, button1_class_value, button1_id_value, div5_id_value, dispose;

    	var each_value = ctx.fields.fields;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	return {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			h5 = element("h5");
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(ctx.table_title);
    			t3 = space();
    			button0 = element("button");
    			span = element("span");
    			span.textContent = "x";
    			t5 = space();
    			div1 = element("div");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			div2 = element("div");
    			button1 = element("button");
    			t7 = text(t7_value);
    			h5.className = "modal-title";
    			add_location(h5, file$4, 81, 16, 2065);
    			add_location(span, file$4, 82, 73, 2216);
    			button0.className = "close";
    			button0.type = "button";
    			button0.dataset.dismiss = "modal";
    			add_location(button0, file$4, 82, 16, 2159);
    			div0.className = "modal-header";
    			add_location(div0, file$4, 80, 12, 2021);
    			div1.className = "modal-body";
    			add_location(div1, file$4, 84, 12, 2273);
    			button1.className = button1_class_value = "btn " + (ctx.mode === 'add' ? 'btn-success' : 'btn-info') + " w-100";
    			button1.id = button1_id_value = `modal-${ctx.mode}-btn`;
    			add_location(button1, file$4, 120, 16, 4693);
    			div2.className = "modal-footer";
    			add_location(div2, file$4, 119, 12, 4649);
    			div3.className = "modal-content";
    			add_location(div3, file$4, 79, 8, 1980);
    			div4.className = "modal-dialog";
    			attr(div4, "role", "document");
    			add_location(div4, file$4, 78, 4, 1928);
    			div5.className = "modal fade";
    			div5.id = div5_id_value = `${ctx.mode}-modal`;
    			div5.tabIndex = "-1";
    			add_location(div5, file$4, 77, 0, 1863);
    			dispose = listen(button1, "click", ctx.handleSubmit);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div5, anchor);
    			append(div5, div4);
    			append(div4, div3);
    			append(div3, div0);
    			append(div0, h5);
    			append(h5, t0);
    			append(h5, t1);
    			append(h5, t2);
    			append(div0, t3);
    			append(div0, button0);
    			append(button0, span);
    			append(div3, t5);
    			append(div3, div1);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append(div3, t6);
    			append(div3, div2);
    			append(div2, button1);
    			append(button1, t7);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.mode) && t0_value !== (t0_value = ctx.mode === "add" ? "Add" : "Edit")) {
    				set_data(t0, t0_value);
    			}

    			if (changed.table_title) {
    				set_data(t2, ctx.table_title);
    			}

    			if (changed.fields) {
    				each_value = ctx.fields.fields;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}

    			if ((changed.mode) && t7_value !== (t7_value = ctx.mode === "add" ? "Add" : "Edit")) {
    				set_data(t7, t7_value);
    			}

    			if ((changed.mode) && button1_class_value !== (button1_class_value = "btn " + (ctx.mode === 'add' ? 'btn-success' : 'btn-info') + " w-100")) {
    				button1.className = button1_class_value;
    			}

    			if ((changed.mode) && button1_id_value !== (button1_id_value = `modal-${ctx.mode}-btn`)) {
    				button1.id = button1_id_value;
    			}

    			if ((changed.mode) && div5_id_value !== (div5_id_value = `${ctx.mode}-modal`)) {
    				div5.id = div5_id_value;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div5);
    			}

    			destroy_each(each_blocks, detaching);

    			dispose();
    		}
    	};
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { getToken, table, table_title, fields, isOpen, setIsOpen, onAdd, onEdit, mode } = $$props;

        function add() {
            console.log(`Attempting to add ${table}`);

            let data = {ID: null};
            for(let i = 0; i < fields.fields.length; i++) {
                data[fields.fields[i].field] = fields.fields[i].value;
            }
            console.log(data);

            axios$1.post(`/api/insert/${table}`, data, {headers: {Authorization: getToken()}}).then(res => {
            	console.log(`Successfully added ${table_title}`);
            	onAdd();
            	close();
            }).catch(err => {
            	console.log(err.response);
            });
        }

        function edit() {
            console.log(`Attempting to add ${table}`);

            let data = {ID: fields.ID};
            for (let i = 0; i < fields.fields.length; i++) {
                data[fields.fields[i].field] = fields.fields[i].value;
            }
            console.log(data);

            axios$1.put(`/api/edit/${table}`, data, {headers: {Authorization: getToken()}}).then(res => {
            	console.log(`Successfully edited ${table_title}`);
            	onEdit();
            	close();
            }).catch(err => {
            	console.log(err.response);
            });
        }

        function handleSubmit(event) {
            if (mode === "add") {
            	add();
            } else if(mode === "edit") {
            	edit();
            }
        }

        function close(){
        	setIsOpen(false);
            window.$(`#${mode}-modal`).modal('hide');
        }

        function open(){
        	setIsOpen(true);
            window.$(`#${mode}-modal`).modal('show');
        }

    	const writable_props = ['getToken', 'table', 'table_title', 'fields', 'isOpen', 'setIsOpen', 'onAdd', 'onEdit', 'mode'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<BasicModal> was created with unknown prop '${key}'`);
    	});

    	function change_handler({ field }, event) {field.value = event.target.value; $$invalidate('field', field);}

    	function change_handler_1({ field }, event) {field.value = event.target.value; $$invalidate('field', field);}

    	function change_handler_2({ field }, event) {field.value = event.target.value; $$invalidate('field', field);}

    	function change_handler_3({ field }, event) {field.value = event.target.value; $$invalidate('field', field);}

    	$$self.$set = $$props => {
    		if ('getToken' in $$props) $$invalidate('getToken', getToken = $$props.getToken);
    		if ('table' in $$props) $$invalidate('table', table = $$props.table);
    		if ('table_title' in $$props) $$invalidate('table_title', table_title = $$props.table_title);
    		if ('fields' in $$props) $$invalidate('fields', fields = $$props.fields);
    		if ('isOpen' in $$props) $$invalidate('isOpen', isOpen = $$props.isOpen);
    		if ('setIsOpen' in $$props) $$invalidate('setIsOpen', setIsOpen = $$props.setIsOpen);
    		if ('onAdd' in $$props) $$invalidate('onAdd', onAdd = $$props.onAdd);
    		if ('onEdit' in $$props) $$invalidate('onEdit', onEdit = $$props.onEdit);
    		if ('mode' in $$props) $$invalidate('mode', mode = $$props.mode);
    	};

    	$$self.$$.update = ($$dirty = { isOpen: 1, setIsOpen: 1 }) => {
    		if ($$dirty.isOpen || $$dirty.setIsOpen) { if (isOpen) {
                    open();
                    setIsOpen(false);
                } }
    	};

    	return {
    		getToken,
    		table,
    		table_title,
    		fields,
    		isOpen,
    		setIsOpen,
    		onAdd,
    		onEdit,
    		mode,
    		handleSubmit,
    		change_handler,
    		change_handler_1,
    		change_handler_2,
    		change_handler_3
    	};
    }

    class BasicModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, ["getToken", "table", "table_title", "fields", "isOpen", "setIsOpen", "onAdd", "onEdit", "mode"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.getToken === undefined && !('getToken' in props)) {
    			console.warn("<BasicModal> was created without expected prop 'getToken'");
    		}
    		if (ctx.table === undefined && !('table' in props)) {
    			console.warn("<BasicModal> was created without expected prop 'table'");
    		}
    		if (ctx.table_title === undefined && !('table_title' in props)) {
    			console.warn("<BasicModal> was created without expected prop 'table_title'");
    		}
    		if (ctx.fields === undefined && !('fields' in props)) {
    			console.warn("<BasicModal> was created without expected prop 'fields'");
    		}
    		if (ctx.isOpen === undefined && !('isOpen' in props)) {
    			console.warn("<BasicModal> was created without expected prop 'isOpen'");
    		}
    		if (ctx.setIsOpen === undefined && !('setIsOpen' in props)) {
    			console.warn("<BasicModal> was created without expected prop 'setIsOpen'");
    		}
    		if (ctx.onAdd === undefined && !('onAdd' in props)) {
    			console.warn("<BasicModal> was created without expected prop 'onAdd'");
    		}
    		if (ctx.onEdit === undefined && !('onEdit' in props)) {
    			console.warn("<BasicModal> was created without expected prop 'onEdit'");
    		}
    		if (ctx.mode === undefined && !('mode' in props)) {
    			console.warn("<BasicModal> was created without expected prop 'mode'");
    		}
    	}

    	get getToken() {
    		throw new Error("<BasicModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getToken(value) {
    		throw new Error("<BasicModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get table() {
    		throw new Error("<BasicModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set table(value) {
    		throw new Error("<BasicModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get table_title() {
    		throw new Error("<BasicModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set table_title(value) {
    		throw new Error("<BasicModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fields() {
    		throw new Error("<BasicModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fields(value) {
    		throw new Error("<BasicModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isOpen() {
    		throw new Error("<BasicModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isOpen(value) {
    		throw new Error("<BasicModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setIsOpen() {
    		throw new Error("<BasicModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set setIsOpen(value) {
    		throw new Error("<BasicModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onAdd() {
    		throw new Error("<BasicModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onAdd(value) {
    		throw new Error("<BasicModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onEdit() {
    		throw new Error("<BasicModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onEdit(value) {
    		throw new Error("<BasicModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mode() {
    		throw new Error("<BasicModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mode(value) {
    		throw new Error("<BasicModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\countries\Countries.svelte generated by Svelte v3.5.1 */

    const file$5 = "src\\components\\countries\\Countries.svelte";

    // (135:0) {#if is_logged_in}
    function create_if_block$4(ctx) {
    	var t0, t1, div1, div0, h2, span0, t3, span1, button0, t5, button1, t6, button1_class_value, t7, button2, t8_value = ctx.confirm_del ? "Are you sure?" : "Delete", t8, button2_class_value, t9, current, dispose;

    	var basicmodal0 = new BasicModal({
    		props: {
    		mode: "add",
    		getToken: ctx.getToken,
    		table: "countries",
    		table_title: "Countries",
    		fields: ctx.add_modal_fields,
    		isOpen: ctx.isAddModalOpen,
    		setIsOpen: ctx.setIsAddModalOpen,
    		onAdd: ctx.getCountries
    	},
    		$$inline: true
    	});

    	var basicmodal1 = new BasicModal({
    		props: {
    		mode: "edit",
    		getToken: ctx.getToken,
    		table: "countries",
    		table_title: "Countries",
    		fields: ctx.edit_modal_fields,
    		isOpen: ctx.isEditModalOpen,
    		setIsOpen: ctx.setIsEditModalOpen,
    		onEdit: ctx.getCountries
    	},
    		$$inline: true
    	});

    	var basictable = new BasicTable({
    		props: {
    		table_headers: ctx.table_headers,
    		data: ctx.countries,
    		toggleRowSelect: ctx.toggleRowSelect,
    		selectedRows: ctx.selectedRows
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			basicmodal0.$$.fragment.c();
    			t0 = space();
    			basicmodal1.$$.fragment.c();
    			t1 = space();
    			div1 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			span0 = element("span");
    			span0.textContent = "Countries";
    			t3 = space();
    			span1 = element("span");
    			button0 = element("button");
    			button0.textContent = "Add +";
    			t5 = space();
    			button1 = element("button");
    			t6 = text("Edit");
    			t7 = space();
    			button2 = element("button");
    			t8 = text(t8_value);
    			t9 = space();
    			basictable.$$.fragment.c();
    			span0.className = "border-bottom-3px border-top-3px border-dark px-2 d-inline-block";
    			add_location(span0, file$5, 139, 35, 4272);
    			h2.className = "mb-3 text-dark";
    			add_location(h2, file$5, 139, 8, 4245);
    			button0.className = "btn btn-success mb-2";
    			add_location(button0, file$5, 141, 16, 4410);
    			button1.className = button1_class_value = ctx.selectedRows.length !== 1 ? 'btn btn-info mb-2 mx-2 disabled' : 'btn btn-info mb-2 mx-2';
    			button1.id = "edit-btn";
    			add_location(button1, file$5, 142, 16, 4511);
    			button2.className = button2_class_value = `btn btn-danger mb-2 ${ctx.selectedRows.length >= 1 ? '' : 'disabled'}`;
    			button2.id = "delete-btn";
    			add_location(button2, file$5, 143, 16, 4696);
    			add_location(span1, file$5, 140, 12, 4386);
    			div0.className = "container rounded p-4 bg-light shadow h-max-100 d-flex flex-flow-column";
    			add_location(div0, file$5, 138, 8, 4150);
    			div1.className = "p-5 position-absolute bottom-0px top-76px left-0px right-0px";
    			add_location(div1, file$5, 137, 4, 4031);

    			dispose = [
    				listen(button0, "click", ctx.handleAddButtonClick),
    				listen(button1, "click", ctx.handleEditButtonClick),
    				listen(button2, "click", ctx.handleDeleteClick),
    				listen(div1, "click", ctx.handleOutsideTableClick)
    			];
    		},

    		m: function mount(target, anchor) {
    			mount_component(basicmodal0, target, anchor);
    			insert(target, t0, anchor);
    			mount_component(basicmodal1, target, anchor);
    			insert(target, t1, anchor);
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, h2);
    			append(h2, span0);
    			append(div0, t3);
    			append(div0, span1);
    			append(span1, button0);
    			append(span1, t5);
    			append(span1, button1);
    			append(button1, t6);
    			append(span1, t7);
    			append(span1, button2);
    			append(button2, t8);
    			append(div0, t9);
    			mount_component(basictable, div0, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var basicmodal0_changes = {};
    			if (changed.getToken) basicmodal0_changes.getToken = ctx.getToken;
    			if (changed.add_modal_fields) basicmodal0_changes.fields = ctx.add_modal_fields;
    			if (changed.isAddModalOpen) basicmodal0_changes.isOpen = ctx.isAddModalOpen;
    			if (changed.setIsAddModalOpen) basicmodal0_changes.setIsOpen = ctx.setIsAddModalOpen;
    			if (changed.getCountries) basicmodal0_changes.onAdd = ctx.getCountries;
    			basicmodal0.$set(basicmodal0_changes);

    			var basicmodal1_changes = {};
    			if (changed.getToken) basicmodal1_changes.getToken = ctx.getToken;
    			if (changed.edit_modal_fields) basicmodal1_changes.fields = ctx.edit_modal_fields;
    			if (changed.isEditModalOpen) basicmodal1_changes.isOpen = ctx.isEditModalOpen;
    			if (changed.setIsEditModalOpen) basicmodal1_changes.setIsOpen = ctx.setIsEditModalOpen;
    			if (changed.getCountries) basicmodal1_changes.onEdit = ctx.getCountries;
    			basicmodal1.$set(basicmodal1_changes);

    			if ((!current || changed.selectedRows) && button1_class_value !== (button1_class_value = ctx.selectedRows.length !== 1 ? 'btn btn-info mb-2 mx-2 disabled' : 'btn btn-info mb-2 mx-2')) {
    				button1.className = button1_class_value;
    			}

    			if ((!current || changed.confirm_del) && t8_value !== (t8_value = ctx.confirm_del ? "Are you sure?" : "Delete")) {
    				set_data(t8, t8_value);
    			}

    			if ((!current || changed.selectedRows) && button2_class_value !== (button2_class_value = `btn btn-danger mb-2 ${ctx.selectedRows.length >= 1 ? '' : 'disabled'}`)) {
    				button2.className = button2_class_value;
    			}

    			var basictable_changes = {};
    			if (changed.table_headers) basictable_changes.table_headers = ctx.table_headers;
    			if (changed.countries) basictable_changes.data = ctx.countries;
    			if (changed.toggleRowSelect) basictable_changes.toggleRowSelect = ctx.toggleRowSelect;
    			if (changed.selectedRows) basictable_changes.selectedRows = ctx.selectedRows;
    			basictable.$set(basictable_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			basicmodal0.$$.fragment.i(local);

    			basicmodal1.$$.fragment.i(local);

    			basictable.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			basicmodal0.$$.fragment.o(local);
    			basicmodal1.$$.fragment.o(local);
    			basictable.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			basicmodal0.$destroy(detaching);

    			if (detaching) {
    				detach(t0);
    			}

    			basicmodal1.$destroy(detaching);

    			if (detaching) {
    				detach(t1);
    				detach(div1);
    			}

    			basictable.$destroy();

    			run_all(dispose);
    		}
    	};
    }

    function create_fragment$7(ctx) {
    	var if_block_anchor, current;

    	var if_block = (ctx.is_logged_in) && create_if_block$4(ctx);

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.is_logged_in) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					if_block.i(1);
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					if_block.i(1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();
    				on_outro(() => {
    					if_block.d(1);
    					if_block = null;
    				});

    				if_block.o(1);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (if_block) if_block.i();
    			current = true;
    		},

    		o: function outro(local) {
    			if (if_block) if_block.o();
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    function instance$7($$self, $$props, $$invalidate) {
    	

        let { is_logged_in, getToken } = $$props;

        let countries = [];
        let table_headers = [
            {columnName: '#', key: "ID"},
            {columnName: "Country", key: "country"}
        ];
        let selectedRows = [];

        let confirm_del = false;

        let isAddModalOpen = false;
        let isEditModalOpen = false;

        let add_modal_fields = {
            fields: [{
        		field: "country",
        		type: "text",
        		display: "Country",
        		placeholder: "eg. Portugal",
        		value: ""
            }]
        };

        let edit_modal_fields = {
        	ID: null,
            fields: [{
        		field: "country",
        		type: "text",
        		display: "Country",
        		placeholder: "eg. Portugal",
        		value: ""
            }]
        };

        // axios.defaults.withCredentials = true;

        function toggleRowSelect(id) {
        	let index = selectedRows.indexOf(id);
        	if(index === -1){
                $$invalidate('selectedRows', selectedRows = [...selectedRows, id]);
        	}else {
                selectedRows.splice(index, 1);
                $$invalidate('selectedRows', selectedRows);
        	}

        	console.log(selectedRows);
        }

        function handleOutsideTableClick(event) {
            if (event.target.tagName.toLowerCase() === "button"){
                return;
            }
            let table = event.currentTarget.querySelector("table");
            if(table != null ){
                if(table.contains(event.target)){
                    console.log("Hello there General Kenobi");
                    return;
                }
            }

            $$invalidate('confirm_del', confirm_del = false);
            $$invalidate('selectedRows', selectedRows = []);
        }

        function handleDeleteClick(event) {
        	let del_btn_el = event.currentTarget;
        	if(!del_btn_el.classList.contains("disabled")){
        	    if(!confirm_del){
                   $$invalidate('confirm_del', confirm_del = true);
        	    }else if(selectedRows.length > 0){
                    axios$1.delete("/api/delete/countries", {
                        data: {
                            rows: selectedRows
                        },
                        headers: {
                            Authorization: getToken()
                        }
                    }).then(res =>{
                    	$$invalidate('confirm_del', confirm_del = false);
                        getCountries();
                    }).catch(err =>{
                        console.log(err.response);
                    });
                }
        	}
        }

        function getCountries() {
        	console.log("Trying to fetch countries");
            axios$1.get("/api/get/countries", {headers: {Authorization: getToken()}}).then(function(res) {
            	$$invalidate('countries', countries = res.data);
                console.log(res.data);
            });
        }

        function setIsAddModalOpen(value){
        	$$invalidate('isAddModalOpen', isAddModalOpen = value);
        }

        function setIsEditModalOpen(value){
        	$$invalidate('isEditModalOpen', isEditModalOpen = value);
        }

        function handleAddButtonClick(){
            setIsAddModalOpen(true);
        }

        function handleEditButtonClick(){
        	if(selectedRows.length === 1){
        		for (let i = 0; i < countries.length; i++) {
                    if (countries[i].ID === selectedRows[0]) {
                        edit_modal_fields.ID = selectedRows[0]; $$invalidate('edit_modal_fields', edit_modal_fields);
                        for (let j = 0; j < edit_modal_fields.fields.length; j++) {
                            edit_modal_fields.fields[j].value = countries[i][edit_modal_fields.fields[j].field]; $$invalidate('edit_modal_fields', edit_modal_fields);
                        }
                    }
                }

        		setIsEditModalOpen(true);
        	}
        }

    	const writable_props = ['is_logged_in', 'getToken'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Countries> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('is_logged_in' in $$props) $$invalidate('is_logged_in', is_logged_in = $$props.is_logged_in);
    		if ('getToken' in $$props) $$invalidate('getToken', getToken = $$props.getToken);
    	};

    	$$self.$$.update = ($$dirty = { is_logged_in: 1 }) => {
    		if ($$dirty.is_logged_in) { if(is_logged_in){
                	getCountries();
                } }
    	};

    	return {
    		is_logged_in,
    		getToken,
    		countries,
    		table_headers,
    		selectedRows,
    		confirm_del,
    		isAddModalOpen,
    		isEditModalOpen,
    		add_modal_fields,
    		edit_modal_fields,
    		toggleRowSelect,
    		handleOutsideTableClick,
    		handleDeleteClick,
    		getCountries,
    		setIsAddModalOpen,
    		setIsEditModalOpen,
    		handleAddButtonClick,
    		handleEditButtonClick
    	};
    }

    class Countries extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, ["is_logged_in", "getToken"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.is_logged_in === undefined && !('is_logged_in' in props)) {
    			console.warn("<Countries> was created without expected prop 'is_logged_in'");
    		}
    		if (ctx.getToken === undefined && !('getToken' in props)) {
    			console.warn("<Countries> was created without expected prop 'getToken'");
    		}
    	}

    	get is_logged_in() {
    		throw new Error("<Countries>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set is_logged_in(value) {
    		throw new Error("<Countries>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getToken() {
    		throw new Error("<Countries>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getToken(value) {
    		throw new Error("<Countries>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\projects\ProjectsTable.svelte generated by Svelte v3.5.1 */

    const file$6 = "src\\components\\projects\\ProjectsTable.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.project = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    // (47:24) <Link to={`/svelte/project_partners/${project.ID}`}>
    function create_default_slot_1$1(ctx) {
    	var i;

    	return {
    		c: function create() {
    			i = element("i");
    			i.className = "fas fa-school fa-fw cursor-pointer mr-1 text-light";
    			add_location(i, file$6, 46, 76, 2550);
    		},

    		m: function mount(target, anchor) {
    			insert(target, i, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(i);
    			}
    		}
    	};
    }

    // (48:24) <Link to={`/svelte/mobilities/${project.ID}`}>
    function create_default_slot$2(ctx) {
    	var i;

    	return {
    		c: function create() {
    			i = element("i");
    			i.className = "fas fa-plane fa-fw cursor-pointer ml-1 text-light";
    			add_location(i, file$6, 47, 70, 2695);
    		},

    		m: function mount(target, anchor) {
    			insert(target, i, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(i);
    			}
    		}
    	};
    }

    // (34:12) {#each projects as project, i}
    function create_each_block$2(ctx) {
    	var tr, td0, t0_value = ctx.project.ID, t0, t1, td1, t2_value = ctx.project.projectCode, t2, t3, td2, t4_value = ctx.project.name, t4, t5, td3, input, input_name_value, input_id_value, t6, label, img, img_src_value, img_id_value, label_for_value, t7, td4, t8, t9, tr_class_value, current, dispose;

    	function change_handler(...args) {
    		return ctx.change_handler(ctx, ...args);
    	}

    	var link0 = new Link({
    		props: {
    		to: `/svelte/project_partners/${ctx.project.ID}`,
    		$$slots: { default: [create_default_slot_1$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var link1 = new Link({
    		props: {
    		to: `/svelte/mobilities/${ctx.project.ID}`,
    		$$slots: { default: [create_default_slot$2] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	function click_handler(...args) {
    		return ctx.click_handler(ctx, ...args);
    	}

    	return {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			input = element("input");
    			t6 = space();
    			label = element("label");
    			img = element("img");
    			t7 = space();
    			td4 = element("td");
    			link0.$$.fragment.c();
    			t8 = space();
    			link1.$$.fragment.c();
    			t9 = space();
    			add_location(td0, file$6, 36, 20, 1766);
    			add_location(td1, file$6, 37, 20, 1809);
    			add_location(td2, file$6, 38, 20, 1861);
    			attr(input, "type", "file");
    			input.className = "d-none";
    			input.name = input_name_value = ctx.project.ID;
    			input.id = input_id_value = `image-input-${ctx.project.ID}`;
    			add_location(input, file$6, 40, 24, 1956);
    			img.src = img_src_value = `/imgs/projects/${ctx.project.ID}.png`;
    			img.id = img_id_value = `image-${ctx.project.ID}`;
    			img.height = "50";
    			img.className = "cursor-pointer";
    			img.alt = "Project Logo";
    			add_location(img, file$6, 42, 28, 2214);
    			label.htmlFor = label_for_value = `image-input-${ctx.project.ID}`;
    			add_location(label, file$6, 41, 24, 2143);
    			td3.className = "text-center";
    			add_location(td3, file$6, 39, 20, 1906);
    			td4.className = "text-center vertical-align-middle";
    			add_location(td4, file$6, 45, 20, 2426);
    			tr.className = tr_class_value = ctx.selectedRows.indexOf(ctx.project.ID) === -1 ? 'table-row' : 'table-row bg-secondary';
    			add_location(tr, file$6, 34, 16, 1574);

    			dispose = [
    				listen(input, "change", change_handler),
    				listen(tr, "click", click_handler)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert(target, tr, anchor);
    			append(tr, td0);
    			append(td0, t0);
    			append(tr, t1);
    			append(tr, td1);
    			append(td1, t2);
    			append(tr, t3);
    			append(tr, td2);
    			append(td2, t4);
    			append(tr, t5);
    			append(tr, td3);
    			append(td3, input);
    			append(td3, t6);
    			append(td3, label);
    			append(label, img);
    			append(tr, t7);
    			append(tr, td4);
    			mount_component(link0, td4, null);
    			append(td4, t8);
    			mount_component(link1, td4, null);
    			append(tr, t9);
    			current = true;
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if ((!current || changed.projects) && t0_value !== (t0_value = ctx.project.ID)) {
    				set_data(t0, t0_value);
    			}

    			if ((!current || changed.projects) && t2_value !== (t2_value = ctx.project.projectCode)) {
    				set_data(t2, t2_value);
    			}

    			if ((!current || changed.projects) && t4_value !== (t4_value = ctx.project.name)) {
    				set_data(t4, t4_value);
    			}

    			if ((!current || changed.projects) && input_name_value !== (input_name_value = ctx.project.ID)) {
    				input.name = input_name_value;
    			}

    			if ((!current || changed.projects) && input_id_value !== (input_id_value = `image-input-${ctx.project.ID}`)) {
    				input.id = input_id_value;
    			}

    			if ((!current || changed.projects) && img_src_value !== (img_src_value = `/imgs/projects/${ctx.project.ID}.png`)) {
    				img.src = img_src_value;
    			}

    			if ((!current || changed.projects) && img_id_value !== (img_id_value = `image-${ctx.project.ID}`)) {
    				img.id = img_id_value;
    			}

    			if ((!current || changed.projects) && label_for_value !== (label_for_value = `image-input-${ctx.project.ID}`)) {
    				label.htmlFor = label_for_value;
    			}

    			var link0_changes = {};
    			if (changed.projects) link0_changes.to = `/svelte/project_partners/${ctx.project.ID}`;
    			if (changed.$$scope) link0_changes.$$scope = { changed, ctx };
    			link0.$set(link0_changes);

    			var link1_changes = {};
    			if (changed.projects) link1_changes.to = `/svelte/mobilities/${ctx.project.ID}`;
    			if (changed.$$scope) link1_changes.$$scope = { changed, ctx };
    			link1.$set(link1_changes);

    			if ((!current || changed.selectedRows || changed.projects) && tr_class_value !== (tr_class_value = ctx.selectedRows.indexOf(ctx.project.ID) === -1 ? 'table-row' : 'table-row bg-secondary')) {
    				tr.className = tr_class_value;
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			link0.$$.fragment.i(local);

    			link1.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			link0.$$.fragment.o(local);
    			link1.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(tr);
    			}

    			link0.$destroy();

    			link1.$destroy();

    			run_all(dispose);
    		}
    	};
    }

    function create_fragment$8(ctx) {
    	var div, table, thead, tr, th0, t1, th1, t3, th2, t5, th3, i, t6, th4, t8, tbody, current;

    	var each_value = ctx.projects;

    	var each_blocks = [];

    	for (var i_1 = 0; i_1 < each_value.length; i_1 += 1) {
    		each_blocks[i_1] = create_each_block$2(get_each_context$2(ctx, each_value, i_1));
    	}

    	function outro_block(i, detaching, local) {
    		if (each_blocks[i]) {
    			if (detaching) {
    				on_outro(() => {
    					each_blocks[i].d(detaching);
    					each_blocks[i] = null;
    				});
    			}

    			each_blocks[i].o(local);
    		}
    	}

    	return {
    		c: function create() {
    			div = element("div");
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "#";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Project Code";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Name";
    			t5 = space();
    			th3 = element("th");
    			i = element("i");
    			t6 = space();
    			th4 = element("th");
    			th4.textContent = "Actions";
    			t8 = space();
    			tbody = element("tbody");

    			for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
    				each_blocks[i_1].c();
    			}
    			th0.scope = "col";
    			th0.className = "position-sticky border-bottom-0 border-top-0 top-0px bg-darkest shadow-y-dark-1px";
    			add_location(th0, file$6, 25, 16, 748);
    			th1.scope = "col";
    			th1.className = "position-sticky border-bottom-0 border-top-0 top-0px bg-darkest shadow-y-dark-1px";
    			add_location(th1, file$6, 26, 16, 878);
    			th2.scope = "col";
    			th2.className = "position-sticky border-bottom-0 border-top-0 top-0px bg-darkest shadow-y-dark-1px";
    			add_location(th2, file$6, 27, 16, 1019);
    			i.className = "fas fa-images fa-fw";
    			add_location(i, file$6, 28, 134, 1270);
    			th3.scope = "col";
    			th3.className = "position-sticky border-bottom-0 border-top-0 top-0px bg-darkest shadow-y-dark-1px text-center";
    			add_location(th3, file$6, 28, 16, 1152);
    			th4.scope = "col";
    			th4.className = "position-sticky border-bottom-0 border-top-0 top-0px bg-darkest shadow-y-dark-1px text-center";
    			add_location(th4, file$6, 29, 16, 1328);
    			tr.className = "table-headers";
    			add_location(tr, file$6, 24, 12, 704);
    			add_location(thead, file$6, 23, 8, 683);
    			add_location(tbody, file$6, 32, 8, 1505);
    			table.className = "table table-dark table-bordered table-hover nowrap m-0";
    			add_location(table, file$6, 22, 4, 603);
    			div.className = "table-responsive rounded dark-scroll";
    			add_location(div, file$6, 21, 0, 547);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, table);
    			append(table, thead);
    			append(thead, tr);
    			append(tr, th0);
    			append(tr, t1);
    			append(tr, th1);
    			append(tr, t3);
    			append(tr, th2);
    			append(tr, t5);
    			append(tr, th3);
    			append(th3, i);
    			append(tr, t6);
    			append(tr, th4);
    			append(table, t8);
    			append(table, tbody);

    			for (var i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
    				each_blocks[i_1].m(tbody, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.selectedRows || changed.projects) {
    				each_value = ctx.projects;

    				for (var i_1 = 0; i_1 < each_value.length; i_1 += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i_1);

    					if (each_blocks[i_1]) {
    						each_blocks[i_1].p(changed, child_ctx);
    						each_blocks[i_1].i(1);
    					} else {
    						each_blocks[i_1] = create_each_block$2(child_ctx);
    						each_blocks[i_1].c();
    						each_blocks[i_1].i(1);
    						each_blocks[i_1].m(tbody, null);
    					}
    				}

    				group_outros();
    				for (; i_1 < each_blocks.length; i_1 += 1) outro_block(i_1, 1, 1);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i_1 = 0; i_1 < each_value.length; i_1 += 1) each_blocks[i_1].i();

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i_1 = 0; i_1 < each_blocks.length; i_1 += 1) outro_block(i_1, 0, 0);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { projects, toggleRowSelect, selectedRows, updateImage } = $$props;

        function handleRowClick(event, id) {
            toggleRowSelect(id);
        }

        function handleImageChange(file, id) {
            updateImage(file, id).then(res => {
            	let image_el = document.querySelector(`#image-${id}`);
            	image_el.setAttribute("src", image_el.getAttribute("src") + "?time="+ new Date().getTime());
            });
        }

    	const writable_props = ['projects', 'toggleRowSelect', 'selectedRows', 'updateImage'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<ProjectsTable> was created with unknown prop '${key}'`);
    	});

    	function change_handler({ project }, event) {
    		return handleImageChange(event.target.files[0], project.ID);
    	}

    	function click_handler({ project }, event) {handleRowClick(event, project.ID);}

    	$$self.$set = $$props => {
    		if ('projects' in $$props) $$invalidate('projects', projects = $$props.projects);
    		if ('toggleRowSelect' in $$props) $$invalidate('toggleRowSelect', toggleRowSelect = $$props.toggleRowSelect);
    		if ('selectedRows' in $$props) $$invalidate('selectedRows', selectedRows = $$props.selectedRows);
    		if ('updateImage' in $$props) $$invalidate('updateImage', updateImage = $$props.updateImage);
    	};

    	return {
    		projects,
    		toggleRowSelect,
    		selectedRows,
    		updateImage,
    		handleRowClick,
    		handleImageChange,
    		change_handler,
    		click_handler
    	};
    }

    class ProjectsTable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, ["projects", "toggleRowSelect", "selectedRows", "updateImage"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.projects === undefined && !('projects' in props)) {
    			console.warn("<ProjectsTable> was created without expected prop 'projects'");
    		}
    		if (ctx.toggleRowSelect === undefined && !('toggleRowSelect' in props)) {
    			console.warn("<ProjectsTable> was created without expected prop 'toggleRowSelect'");
    		}
    		if (ctx.selectedRows === undefined && !('selectedRows' in props)) {
    			console.warn("<ProjectsTable> was created without expected prop 'selectedRows'");
    		}
    		if (ctx.updateImage === undefined && !('updateImage' in props)) {
    			console.warn("<ProjectsTable> was created without expected prop 'updateImage'");
    		}
    	}

    	get projects() {
    		throw new Error("<ProjectsTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set projects(value) {
    		throw new Error("<ProjectsTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toggleRowSelect() {
    		throw new Error("<ProjectsTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toggleRowSelect(value) {
    		throw new Error("<ProjectsTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedRows() {
    		throw new Error("<ProjectsTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedRows(value) {
    		throw new Error("<ProjectsTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get updateImage() {
    		throw new Error("<ProjectsTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set updateImage(value) {
    		throw new Error("<ProjectsTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\projects\Projects.svelte generated by Svelte v3.5.1 */

    const file$7 = "src\\components\\projects\\Projects.svelte";

    // (169:0) {#if is_logged_in}
    function create_if_block$5(ctx) {
    	var t0, t1, div1, div0, h2, span0, t3, span1, button0, t5, button1, t6, button1_class_value, t7, button2, t8_value = ctx.confirm_del ? "Are you sure?" : "Delete", t8, button2_class_value, t9, current, dispose;

    	var basicmodal0 = new BasicModal({
    		props: {
    		mode: "add",
    		getToken: ctx.getToken,
    		table: "projects",
    		table_title: "Projects",
    		fields: ctx.add_modal_fields,
    		isOpen: ctx.isAddModalOpen,
    		setIsOpen: ctx.setIsAddModalOpen,
    		onAdd: ctx.getProjects
    	},
    		$$inline: true
    	});

    	var basicmodal1 = new BasicModal({
    		props: {
    		mode: "edit",
    		getToken: ctx.getToken,
    		table: "projects",
    		table_title: "Projects",
    		fields: ctx.edit_modal_fields,
    		isOpen: ctx.isEditModalOpen,
    		setIsOpen: ctx.setIsEditModalOpen,
    		onEdit: ctx.getProjects
    	},
    		$$inline: true
    	});

    	var projectstable = new ProjectsTable({
    		props: {
    		projects: ctx.projects,
    		toggleRowSelect: ctx.toggleRowSelect,
    		selectedRows: ctx.selectedRows,
    		updateImage: ctx.updateImage
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			basicmodal0.$$.fragment.c();
    			t0 = space();
    			basicmodal1.$$.fragment.c();
    			t1 = space();
    			div1 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			span0 = element("span");
    			span0.textContent = "Projects";
    			t3 = space();
    			span1 = element("span");
    			button0 = element("button");
    			button0.textContent = "Add +";
    			t5 = space();
    			button1 = element("button");
    			t6 = text("Edit");
    			t7 = space();
    			button2 = element("button");
    			t8 = text(t8_value);
    			t9 = space();
    			projectstable.$$.fragment.c();
    			span0.className = "border-bottom-3px border-top-3px border-dark px-2 d-inline-block";
    			add_location(span0, file$7, 173, 35, 5146);
    			h2.className = "mb-3 text-dark";
    			add_location(h2, file$7, 173, 8, 5119);
    			button0.className = "btn btn-success mb-2";
    			add_location(button0, file$7, 175, 16, 5283);
    			button1.className = button1_class_value = ctx.selectedRows.length !== 1 ? 'btn btn-info mb-2 mx-2 disabled' : 'btn btn-info mb-2 mx-2';
    			button1.id = "edit-btn";
    			add_location(button1, file$7, 176, 16, 5384);
    			button2.className = button2_class_value = `btn btn-danger mb-2 ${ctx.selectedRows.length >= 1 ? '' : 'disabled'}`;
    			button2.id = "delete-btn";
    			add_location(button2, file$7, 177, 16, 5571);
    			add_location(span1, file$7, 174, 12, 5259);
    			div0.className = "container rounded p-4 bg-light shadow h-max-100 d-flex flex-flow-column";
    			add_location(div0, file$7, 172, 8, 5024);
    			div1.className = "p-5 position-absolute bottom-0px top-76px left-0px right-0px";
    			add_location(div1, file$7, 171, 4, 4905);

    			dispose = [
    				listen(button0, "click", ctx.handleAddButtonClick),
    				listen(button1, "click", ctx.handleEditButtonClick),
    				listen(button2, "click", ctx.handleDeleteClick),
    				listen(div1, "click", ctx.handleOutsideTableClick)
    			];
    		},

    		m: function mount(target, anchor) {
    			mount_component(basicmodal0, target, anchor);
    			insert(target, t0, anchor);
    			mount_component(basicmodal1, target, anchor);
    			insert(target, t1, anchor);
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, h2);
    			append(h2, span0);
    			append(div0, t3);
    			append(div0, span1);
    			append(span1, button0);
    			append(span1, t5);
    			append(span1, button1);
    			append(button1, t6);
    			append(span1, t7);
    			append(span1, button2);
    			append(button2, t8);
    			append(div0, t9);
    			mount_component(projectstable, div0, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var basicmodal0_changes = {};
    			if (changed.getToken) basicmodal0_changes.getToken = ctx.getToken;
    			if (changed.add_modal_fields) basicmodal0_changes.fields = ctx.add_modal_fields;
    			if (changed.isAddModalOpen) basicmodal0_changes.isOpen = ctx.isAddModalOpen;
    			if (changed.setIsAddModalOpen) basicmodal0_changes.setIsOpen = ctx.setIsAddModalOpen;
    			if (changed.getProjects) basicmodal0_changes.onAdd = ctx.getProjects;
    			basicmodal0.$set(basicmodal0_changes);

    			var basicmodal1_changes = {};
    			if (changed.getToken) basicmodal1_changes.getToken = ctx.getToken;
    			if (changed.edit_modal_fields) basicmodal1_changes.fields = ctx.edit_modal_fields;
    			if (changed.isEditModalOpen) basicmodal1_changes.isOpen = ctx.isEditModalOpen;
    			if (changed.setIsEditModalOpen) basicmodal1_changes.setIsOpen = ctx.setIsEditModalOpen;
    			if (changed.getProjects) basicmodal1_changes.onEdit = ctx.getProjects;
    			basicmodal1.$set(basicmodal1_changes);

    			if ((!current || changed.selectedRows) && button1_class_value !== (button1_class_value = ctx.selectedRows.length !== 1 ? 'btn btn-info mb-2 mx-2 disabled' : 'btn btn-info mb-2 mx-2')) {
    				button1.className = button1_class_value;
    			}

    			if ((!current || changed.confirm_del) && t8_value !== (t8_value = ctx.confirm_del ? "Are you sure?" : "Delete")) {
    				set_data(t8, t8_value);
    			}

    			if ((!current || changed.selectedRows) && button2_class_value !== (button2_class_value = `btn btn-danger mb-2 ${ctx.selectedRows.length >= 1 ? '' : 'disabled'}`)) {
    				button2.className = button2_class_value;
    			}

    			var projectstable_changes = {};
    			if (changed.projects) projectstable_changes.projects = ctx.projects;
    			if (changed.toggleRowSelect) projectstable_changes.toggleRowSelect = ctx.toggleRowSelect;
    			if (changed.selectedRows) projectstable_changes.selectedRows = ctx.selectedRows;
    			if (changed.updateImage) projectstable_changes.updateImage = ctx.updateImage;
    			projectstable.$set(projectstable_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			basicmodal0.$$.fragment.i(local);

    			basicmodal1.$$.fragment.i(local);

    			projectstable.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			basicmodal0.$$.fragment.o(local);
    			basicmodal1.$$.fragment.o(local);
    			projectstable.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			basicmodal0.$destroy(detaching);

    			if (detaching) {
    				detach(t0);
    			}

    			basicmodal1.$destroy(detaching);

    			if (detaching) {
    				detach(t1);
    				detach(div1);
    			}

    			projectstable.$destroy();

    			run_all(dispose);
    		}
    	};
    }

    function create_fragment$9(ctx) {
    	var if_block_anchor, current;

    	var if_block = (ctx.is_logged_in) && create_if_block$5(ctx);

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.is_logged_in) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					if_block.i(1);
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					if_block.i(1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();
    				on_outro(() => {
    					if_block.d(1);
    					if_block = null;
    				});

    				if_block.o(1);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (if_block) if_block.i();
    			current = true;
    		},

    		o: function outro(local) {
    			if (if_block) if_block.o();
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    function instance$9($$self, $$props, $$invalidate) {
    	

        let { is_logged_in, getToken } = $$props;

        let projects = [];
        let selectedRows = [];

        let confirm_del = false;

        let isAddModalOpen = false;
        let isEditModalOpen = false;

        let add_modal_fields = {
        	fields: [{
        		field: "projectCode",
        		type: "text",
        		display: "Project Code",
        		placeholder: "eg. KA+ 123456798",
        		value: ""
        	}, {
        		field: "name",
        		type: "text",
        		display: "Name",
        		placeholder: "eg. Trails2Education",
        		value: ""
        	}, {
        		field: "description",
        		type: "textarea",
        		display: "Description",
        		placeholder: "eg. This is a project description",
        		value: ""
        	}]
        };
        let edit_modal_fields = {
        	ID: null,
        	fields: [{
        		field: "projectCode",
        		type: "text",
        		display: "Project Code",
        		placeholder: "eg. KA+ 123456798",
        		value: ""
        	}, {
        		field: "name",
        		type: "text",
        		display: "Name",
        		placeholder: "eg. Trails2Education",
        		value: ""
        	}, {
        		field: "description",
        		type: "textarea",
        		display: "Description",
        		placeholder: "eg. This is a project description",
        		value: ""
        	}]
        };

        function getProjects() {
        	console.log("Trying to fetch projects");
            axios$1.get("/api/get/projects", {headers: {Authorization: getToken()}}).then(function(res) {
            	$$invalidate('projects', projects = res.data);
            });
        }

        function updateImage(image, id) {
        	let form_data = new FormData();
        	form_data.append(`${id}`, image);
        	form_data.append("ID", id);

        	return axios$1.put("/api/edit/project_logo", form_data, {headers: {Authorization: getToken()}}).then(function(res) {
                console.log("Hello");
                return res;
        	}).catch(err => {
        		console.log(err.response);
        		return err;
        	});
        }

        function toggleRowSelect(id) {
        	let index = selectedRows.indexOf(id);
        	if(index === -1){
                $$invalidate('selectedRows', selectedRows = [...selectedRows, id]);
        	}else {
                selectedRows.splice(index, 1);
                $$invalidate('selectedRows', selectedRows);
        	}

        	console.log(selectedRows);
        }

        function handleOutsideTableClick(event) {
            if (event.target.tagName.toLowerCase() === "button"){
                return;
            }
            let table = event.currentTarget.querySelector("table");
            if(table != null ){
                if(table.contains(event.target)){
                    console.log("Hello there General Kenobi");
                    return;
                }
            }

            $$invalidate('confirm_del', confirm_del = false);
            $$invalidate('selectedRows', selectedRows = []);
        }

        function handleDeleteClick(event) {
        	let del_btn_el = event.currentTarget;
        	if(!del_btn_el.classList.contains("disabled")){
        	    if(!confirm_del){
                   $$invalidate('confirm_del', confirm_del = true);
        	    }else if(selectedRows.length > 0){
                    axios$1.delete("/api/delete/projects", {
                        data: {
                            rows: selectedRows
                        },
                        headers: {
                            Authorization: getToken()
                        }
                    }).then(res => {
                        $$invalidate('confirm_del', confirm_del = false);
                        getProjects();
                    }).catch(err =>{
                        console.log(err.response);
                    });
                }
        	}
        }

        function setIsAddModalOpen(value){
        	$$invalidate('isAddModalOpen', isAddModalOpen = value);
        }

        function setIsEditModalOpen(value){
        	$$invalidate('isEditModalOpen', isEditModalOpen = value);
        }

        function handleAddButtonClick(){
            setIsAddModalOpen(true);
        }

        function handleEditButtonClick(){
        	if(selectedRows.length === 1){
                for (let i = 0; i < projects.length; i++) {
                    if (projects[i].ID === selectedRows[0]) {
                    	edit_modal_fields.ID = selectedRows[0]; $$invalidate('edit_modal_fields', edit_modal_fields);
        		        for (let j = 0; j < edit_modal_fields.fields.length; j++) {
        		            edit_modal_fields.fields[j].value = projects[i][edit_modal_fields.fields[j].field]; $$invalidate('edit_modal_fields', edit_modal_fields);
        			    }
        			}
        		}

        		setIsEditModalOpen(true);
        	}
        }

    	const writable_props = ['is_logged_in', 'getToken'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Projects> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('is_logged_in' in $$props) $$invalidate('is_logged_in', is_logged_in = $$props.is_logged_in);
    		if ('getToken' in $$props) $$invalidate('getToken', getToken = $$props.getToken);
    	};

    	$$self.$$.update = ($$dirty = { is_logged_in: 1 }) => {
    		if ($$dirty.is_logged_in) { if(is_logged_in){
                	getProjects();
                } }
    	};

    	return {
    		is_logged_in,
    		getToken,
    		projects,
    		selectedRows,
    		confirm_del,
    		isAddModalOpen,
    		isEditModalOpen,
    		add_modal_fields,
    		edit_modal_fields,
    		getProjects,
    		updateImage,
    		toggleRowSelect,
    		handleOutsideTableClick,
    		handleDeleteClick,
    		setIsAddModalOpen,
    		setIsEditModalOpen,
    		handleAddButtonClick,
    		handleEditButtonClick
    	};
    }

    class Projects extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, ["is_logged_in", "getToken"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.is_logged_in === undefined && !('is_logged_in' in props)) {
    			console.warn("<Projects> was created without expected prop 'is_logged_in'");
    		}
    		if (ctx.getToken === undefined && !('getToken' in props)) {
    			console.warn("<Projects> was created without expected prop 'getToken'");
    		}
    	}

    	get is_logged_in() {
    		throw new Error("<Projects>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set is_logged_in(value) {
    		throw new Error("<Projects>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getToken() {
    		throw new Error("<Projects>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getToken(value) {
    		throw new Error("<Projects>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\mobilities\MobilitiesTable.svelte generated by Svelte v3.5.1 */

    const file$8 = "src\\components\\mobilities\\MobilitiesTable.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.mobility = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    // (36:24) <Link to={`/svelte/mobility_teachers/${mobility.ID}`}>
    function create_default_slot_1$2(ctx) {
    	var i;

    	return {
    		c: function create() {
    			i = element("i");
    			i.className = "fas fa-chalkboard-teacher fa-fw cursor-pointer mr-1 text-light";
    			i.title = "Teachers";
    			add_location(i, file$8, 35, 78, 1978);
    		},

    		m: function mount(target, anchor) {
    			insert(target, i, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(i);
    			}
    		}
    	};
    }

    // (37:24) <Link to={`/svelte/mobility_students/${mobility.ID}`}>
    function create_default_slot$3(ctx) {
    	var i;

    	return {
    		c: function create() {
    			i = element("i");
    			i.className = "fas fa-user-graduate fa-fw cursor-pointer ml-1 text-light";
    			i.title = "Students";
    			add_location(i, file$8, 36, 78, 2157);
    		},

    		m: function mount(target, anchor) {
    			insert(target, i, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(i);
    			}
    		}
    	};
    }

    // (27:12) {#each mobilities as mobility, i}
    function create_each_block$3(ctx) {
    	var tr, td0, t0_value = ctx.mobility.ID, t0, t1, td1, t2_value = ctx.mobility.origin, t2, t3, td2, t4_value = ctx.mobility.target, t4, t5, td3, t6_value = ctx.mobility.departureDate.slice(0, -14), t6, t7, td4, t8_value = ctx.mobility.arrivalDate.slice(0, -14), t8, t9, td5, t10, t11, tr_class_value, current, dispose;

    	var link0 = new Link({
    		props: {
    		to: `/svelte/mobility_teachers/${ctx.mobility.ID}`,
    		$$slots: { default: [create_default_slot_1$2] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var link1 = new Link({
    		props: {
    		to: `/svelte/mobility_students/${ctx.mobility.ID}`,
    		$$slots: { default: [create_default_slot$3] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	function click_handler(...args) {
    		return ctx.click_handler(ctx, ...args);
    	}

    	return {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			t6 = text(t6_value);
    			t7 = space();
    			td4 = element("td");
    			t8 = text(t8_value);
    			t9 = space();
    			td5 = element("td");
    			link0.$$.fragment.c();
    			t10 = space();
    			link1.$$.fragment.c();
    			t11 = space();
    			add_location(td0, file$8, 29, 20, 1576);
    			add_location(td1, file$8, 30, 20, 1620);
    			add_location(td2, file$8, 31, 20, 1668);
    			add_location(td3, file$8, 32, 20, 1716);
    			add_location(td4, file$8, 33, 20, 1785);
    			td5.className = "text-center vertical-align-middle";
    			add_location(td5, file$8, 34, 20, 1852);
    			tr.className = tr_class_value = ctx.selectedRows.indexOf(ctx.mobility.ID) === -1 ? 'table-row' : 'table-row bg-secondary';
    			add_location(tr, file$8, 27, 16, 1382);
    			dispose = listen(tr, "click", click_handler);
    		},

    		m: function mount(target, anchor) {
    			insert(target, tr, anchor);
    			append(tr, td0);
    			append(td0, t0);
    			append(tr, t1);
    			append(tr, td1);
    			append(td1, t2);
    			append(tr, t3);
    			append(tr, td2);
    			append(td2, t4);
    			append(tr, t5);
    			append(tr, td3);
    			append(td3, t6);
    			append(tr, t7);
    			append(tr, td4);
    			append(td4, t8);
    			append(tr, t9);
    			append(tr, td5);
    			mount_component(link0, td5, null);
    			append(td5, t10);
    			mount_component(link1, td5, null);
    			append(tr, t11);
    			current = true;
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if ((!current || changed.mobilities) && t0_value !== (t0_value = ctx.mobility.ID)) {
    				set_data(t0, t0_value);
    			}

    			if ((!current || changed.mobilities) && t2_value !== (t2_value = ctx.mobility.origin)) {
    				set_data(t2, t2_value);
    			}

    			if ((!current || changed.mobilities) && t4_value !== (t4_value = ctx.mobility.target)) {
    				set_data(t4, t4_value);
    			}

    			if ((!current || changed.mobilities) && t6_value !== (t6_value = ctx.mobility.departureDate.slice(0, -14))) {
    				set_data(t6, t6_value);
    			}

    			if ((!current || changed.mobilities) && t8_value !== (t8_value = ctx.mobility.arrivalDate.slice(0, -14))) {
    				set_data(t8, t8_value);
    			}

    			var link0_changes = {};
    			if (changed.mobilities) link0_changes.to = `/svelte/mobility_teachers/${ctx.mobility.ID}`;
    			if (changed.$$scope) link0_changes.$$scope = { changed, ctx };
    			link0.$set(link0_changes);

    			var link1_changes = {};
    			if (changed.mobilities) link1_changes.to = `/svelte/mobility_students/${ctx.mobility.ID}`;
    			if (changed.$$scope) link1_changes.$$scope = { changed, ctx };
    			link1.$set(link1_changes);

    			if ((!current || changed.selectedRows || changed.mobilities) && tr_class_value !== (tr_class_value = ctx.selectedRows.indexOf(ctx.mobility.ID) === -1 ? 'table-row' : 'table-row bg-secondary')) {
    				tr.className = tr_class_value;
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			link0.$$.fragment.i(local);

    			link1.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			link0.$$.fragment.o(local);
    			link1.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(tr);
    			}

    			link0.$destroy();

    			link1.$destroy();

    			dispose();
    		}
    	};
    }

    function create_fragment$a(ctx) {
    	var div, table, thead, tr, th0, t1, th1, t3, th2, t5, th3, t7, th4, t9, th5, t11, tbody, current;

    	var each_value = ctx.mobilities;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	function outro_block(i, detaching, local) {
    		if (each_blocks[i]) {
    			if (detaching) {
    				on_outro(() => {
    					each_blocks[i].d(detaching);
    					each_blocks[i] = null;
    				});
    			}

    			each_blocks[i].o(local);
    		}
    	}

    	return {
    		c: function create() {
    			div = element("div");
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "#";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Origin";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Destination";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Departure";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Arrival";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "Actions";
    			t11 = space();
    			tbody = element("tbody");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			th0.scope = "col";
    			th0.className = "position-sticky border-bottom-0 border-top-0 top-0px bg-darkest shadow-dark-1px";
    			add_location(th0, file$8, 17, 16, 442);
    			th1.scope = "col";
    			th1.className = "position-sticky border-bottom-0 border-top-0 top-0px bg-darkest shadow-dark-1px";
    			add_location(th1, file$8, 18, 16, 570);
    			th2.scope = "col";
    			th2.className = "position-sticky border-bottom-0 border-top-0 top-0px bg-darkest shadow-dark-1px";
    			add_location(th2, file$8, 19, 16, 703);
    			th3.scope = "col";
    			th3.className = "position-sticky border-bottom-0 border-top-0 top-0px bg-darkest shadow-dark-1px text-center";
    			add_location(th3, file$8, 20, 16, 841);
    			th4.scope = "col";
    			th4.className = "position-sticky border-bottom-0 border-top-0 top-0px bg-darkest shadow-dark-1px text-center";
    			add_location(th4, file$8, 21, 16, 989);
    			th5.scope = "col";
    			th5.className = "position-sticky border-bottom-0 border-top-0 top-0px bg-darkest shadow-dark-1px text-center";
    			add_location(th5, file$8, 22, 16, 1135);
    			tr.className = "table-headers";
    			add_location(tr, file$8, 16, 12, 398);
    			add_location(thead, file$8, 15, 8, 377);
    			add_location(tbody, file$8, 25, 8, 1310);
    			table.className = "table table-dark table-bordered table-hover nowrap m-0";
    			add_location(table, file$8, 14, 4, 297);
    			div.className = "table-responsive rounded dark-scroll";
    			add_location(div, file$8, 13, 0, 241);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, table);
    			append(table, thead);
    			append(thead, tr);
    			append(tr, th0);
    			append(tr, t1);
    			append(tr, th1);
    			append(tr, t3);
    			append(tr, th2);
    			append(tr, t5);
    			append(tr, th3);
    			append(tr, t7);
    			append(tr, th4);
    			append(tr, t9);
    			append(tr, th5);
    			append(table, t11);
    			append(table, tbody);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.selectedRows || changed.mobilities) {
    				each_value = ctx.mobilities;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						each_blocks[i].i(1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].i(1);
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				group_outros();
    				for (; i < each_blocks.length; i += 1) outro_block(i, 1, 1);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value.length; i += 1) each_blocks[i].i();

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) outro_block(i, 0, 0);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { mobilities, toggleRowSelect, selectedRows } = $$props;

        function handleRowClick(event, id) {
            toggleRowSelect(id);
        }

    	const writable_props = ['mobilities', 'toggleRowSelect', 'selectedRows'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<MobilitiesTable> was created with unknown prop '${key}'`);
    	});

    	function click_handler({ mobility }, event) {handleRowClick(event, mobility.ID);}

    	$$self.$set = $$props => {
    		if ('mobilities' in $$props) $$invalidate('mobilities', mobilities = $$props.mobilities);
    		if ('toggleRowSelect' in $$props) $$invalidate('toggleRowSelect', toggleRowSelect = $$props.toggleRowSelect);
    		if ('selectedRows' in $$props) $$invalidate('selectedRows', selectedRows = $$props.selectedRows);
    	};

    	return {
    		mobilities,
    		toggleRowSelect,
    		selectedRows,
    		handleRowClick,
    		click_handler
    	};
    }

    class MobilitiesTable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, ["mobilities", "toggleRowSelect", "selectedRows"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.mobilities === undefined && !('mobilities' in props)) {
    			console.warn("<MobilitiesTable> was created without expected prop 'mobilities'");
    		}
    		if (ctx.toggleRowSelect === undefined && !('toggleRowSelect' in props)) {
    			console.warn("<MobilitiesTable> was created without expected prop 'toggleRowSelect'");
    		}
    		if (ctx.selectedRows === undefined && !('selectedRows' in props)) {
    			console.warn("<MobilitiesTable> was created without expected prop 'selectedRows'");
    		}
    	}

    	get mobilities() {
    		throw new Error("<MobilitiesTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mobilities(value) {
    		throw new Error("<MobilitiesTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get toggleRowSelect() {
    		throw new Error("<MobilitiesTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set toggleRowSelect(value) {
    		throw new Error("<MobilitiesTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedRows() {
    		throw new Error("<MobilitiesTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedRows(value) {
    		throw new Error("<MobilitiesTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\mobilities\AddMobilityModal.svelte generated by Svelte v3.5.1 */

    const file$9 = "src\\components\\mobilities\\AddMobilityModal.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.project = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.partner = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.partner = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    // (100:28) {#each partners as partner, i}
    function create_each_block_2$1(ctx) {
    	var option, t_value = ctx.partner.name, t, option_value_value;

    	return {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = ctx.partner.ID;
    			option.value = option.__value;
    			add_location(option, file$9, 100, 32, 3423);
    		},

    		m: function mount(target_1, anchor) {
    			insert(target_1, option, anchor);
    			append(option, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.partners) && t_value !== (t_value = ctx.partner.name)) {
    				set_data(t, t_value);
    			}

    			if ((changed.partners) && option_value_value !== (option_value_value = ctx.partner.ID)) {
    				option.__value = option_value_value;
    			}

    			option.value = option.__value;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(option);
    			}
    		}
    	};
    }

    // (121:28) {#each partners as partner, i}
    function create_each_block_1$2(ctx) {
    	var option, t_value = ctx.partner.name, t, option_value_value;

    	return {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = ctx.partner.ID;
    			option.value = option.__value;
    			add_location(option, file$9, 121, 32, 4648);
    		},

    		m: function mount(target_1, anchor) {
    			insert(target_1, option, anchor);
    			append(option, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.partners) && t_value !== (t_value = ctx.partner.name)) {
    				set_data(t, t_value);
    			}

    			if ((changed.partners) && option_value_value !== (option_value_value = ctx.partner.ID)) {
    				option.__value = option_value_value;
    			}

    			option.value = option.__value;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(option);
    			}
    		}
    	};
    }

    // (143:16) {#if projectID == null}
    function create_if_block$6(ctx) {
    	var div3, div2, div1, div0, t_1, select, option, div3_class_value, dispose;

    	var each_value = ctx.projects;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	return {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "Project";
    			t_1 = space();
    			select = element("select");
    			option = element("option");
    			option.textContent = "Select Project";

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			div0.className = "input-group-text w-100";
    			add_location(div0, file$9, 146, 32, 6022);
    			div1.className = "input-group-prepend w-25";
    			add_location(div1, file$9, 145, 28, 5950);
    			option.__value = "0";
    			option.value = option.__value;
    			option.disabled = true;
    			option.selected = true;
    			option.className = "d-none";
    			add_location(option, file$9, 149, 32, 6252);
    			select.className = "form-control";
    			add_location(select, file$9, 148, 28, 6137);
    			div2.className = "input-group";
    			add_location(div2, file$9, 144, 24, 5895);
    			div3.className = div3_class_value = `form-group ${ctx.projectID != null ? '' : 'mb-0'}`;
    			add_location(div3, file$9, 143, 20, 5806);
    			dispose = listen(select, "change", ctx.change_handler_6);
    		},

    		m: function mount(target_1, anchor) {
    			insert(target_1, div3, anchor);
    			append(div3, div2);
    			append(div2, div1);
    			append(div1, div0);
    			append(div2, t_1);
    			append(div2, select);
    			append(select, option);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			if (changed.projects) {
    				each_value = ctx.projects;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}

    			if ((changed.projectID) && div3_class_value !== (div3_class_value = `form-group ${ctx.projectID != null ? '' : 'mb-0'}`)) {
    				div3.className = div3_class_value;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div3);
    			}

    			destroy_each(each_blocks, detaching);

    			dispose();
    		}
    	};
    }

    // (151:32) {#each projects as project, i}
    function create_each_block$4(ctx) {
    	var option, t_value = ctx.project.name, t, option_value_value;

    	return {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = ctx.project.ID;
    			option.value = option.__value;
    			add_location(option, file$9, 151, 36, 6428);
    		},

    		m: function mount(target_1, anchor) {
    			insert(target_1, option, anchor);
    			append(option, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.projects) && t_value !== (t_value = ctx.project.name)) {
    				set_data(t, t_value);
    			}

    			if ((changed.projects) && option_value_value !== (option_value_value = ctx.project.ID)) {
    				option.__value = option_value_value;
    			}

    			option.value = option.__value;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(option);
    			}
    		}
    	};
    }

    function create_fragment$b(ctx) {
    	var div29, div28, div27, div0, h5, t1, button0, span, t3, div25, div4, div3, div2, div1, t5, input0, t6, div8, div7, div6, div5, t8, select0, option0, t10, div12, div11, div10, div9, t12, input1, t13, div16, div15, div14, div13, t15, select1, option1, t17, div20, div19, div18, div17, t19, input2, t20, div24, div23, div22, div21, t22, input3, div24_class_value, t23, t24, div26, button1, dispose;

    	var each_value_2 = ctx.partners;

    	var each_blocks_1 = [];

    	for (var i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	var each_value_1 = ctx.partners;

    	var each_blocks = [];

    	for (var i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	var if_block = (ctx.projectID == null) && create_if_block$6(ctx);

    	return {
    		c: function create() {
    			div29 = element("div");
    			div28 = element("div");
    			div27 = element("div");
    			div0 = element("div");
    			h5 = element("h5");
    			h5.textContent = "Add Mobility";
    			t1 = space();
    			button0 = element("button");
    			span = element("span");
    			span.textContent = "x";
    			t3 = space();
    			div25 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div1.textContent = "Origin";
    			t5 = space();
    			input0 = element("input");
    			t6 = space();
    			div8 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			div5.textContent = "Origin Partner";
    			t8 = space();
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "Select Partner";

    			for (var i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t10 = space();
    			div12 = element("div");
    			div11 = element("div");
    			div10 = element("div");
    			div9 = element("div");
    			div9.textContent = "Target";
    			t12 = space();
    			input1 = element("input");
    			t13 = space();
    			div16 = element("div");
    			div15 = element("div");
    			div14 = element("div");
    			div13 = element("div");
    			div13.textContent = "Target Partner";
    			t15 = space();
    			select1 = element("select");
    			option1 = element("option");
    			option1.textContent = "Select Partner";

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t17 = space();
    			div20 = element("div");
    			div19 = element("div");
    			div18 = element("div");
    			div17 = element("div");
    			div17.textContent = "Departure";
    			t19 = space();
    			input2 = element("input");
    			t20 = space();
    			div24 = element("div");
    			div23 = element("div");
    			div22 = element("div");
    			div21 = element("div");
    			div21.textContent = "Arrival";
    			t22 = space();
    			input3 = element("input");
    			t23 = space();
    			if (if_block) if_block.c();
    			t24 = space();
    			div26 = element("div");
    			button1 = element("button");
    			button1.textContent = "Add";
    			h5.className = "modal-title";
    			add_location(h5, file$9, 80, 16, 2175);
    			add_location(span, file$9, 81, 73, 2291);
    			button0.className = "close";
    			button0.type = "button";
    			button0.dataset.dismiss = "modal";
    			add_location(button0, file$9, 81, 16, 2234);
    			div0.className = "modal-header";
    			add_location(div0, file$9, 79, 12, 2131);
    			div1.className = "input-group-text w-100";
    			add_location(div1, file$9, 87, 28, 2555);
    			div2.className = "input-group-prepend w-25";
    			add_location(div2, file$9, 86, 24, 2487);
    			input0.className = "form-control";
    			attr(input0, "type", "text");
    			input0.placeholder = "eg. Sweden, Stockholm";
    			add_location(input0, file$9, 89, 24, 2661);
    			div3.className = "input-group";
    			add_location(div3, file$9, 85, 20, 2436);
    			div4.className = "form-group";
    			add_location(div4, file$9, 84, 16, 2390);
    			div5.className = "input-group-text w-100";
    			add_location(div5, file$9, 95, 28, 3024);
    			div6.className = "input-group-prepend w-25";
    			add_location(div6, file$9, 94, 24, 2956);
    			option0.__value = "0";
    			option0.value = option0.__value;
    			option0.disabled = true;
    			option0.selected = true;
    			option0.className = "d-none";
    			add_location(option0, file$9, 98, 28, 3255);
    			select0.className = "form-control";
    			add_location(select0, file$9, 97, 24, 3138);
    			div7.className = "input-group";
    			add_location(div7, file$9, 93, 20, 2905);
    			div8.className = "form-group";
    			add_location(div8, file$9, 92, 16, 2859);
    			div9.className = "input-group-text w-100";
    			add_location(div9, file$9, 108, 28, 3780);
    			div10.className = "input-group-prepend w-25";
    			add_location(div10, file$9, 107, 24, 3712);
    			input1.className = "form-control";
    			attr(input1, "type", "text");
    			input1.placeholder = "eg. Sweden, Stockholm";
    			add_location(input1, file$9, 110, 24, 3886);
    			div11.className = "input-group";
    			add_location(div11, file$9, 106, 20, 3661);
    			div12.className = "form-group";
    			add_location(div12, file$9, 105, 16, 3615);
    			div13.className = "input-group-text w-100";
    			add_location(div13, file$9, 116, 28, 4249);
    			div14.className = "input-group-prepend w-25";
    			add_location(div14, file$9, 115, 24, 4181);
    			option1.__value = "0";
    			option1.value = option1.__value;
    			option1.disabled = true;
    			option1.selected = true;
    			option1.className = "d-none";
    			add_location(option1, file$9, 119, 28, 4480);
    			select1.className = "form-control";
    			add_location(select1, file$9, 118, 24, 4363);
    			div15.className = "input-group";
    			add_location(div15, file$9, 114, 20, 4130);
    			div16.className = "form-group";
    			add_location(div16, file$9, 113, 16, 4084);
    			div17.className = "input-group-text w-100";
    			add_location(div17, file$9, 129, 28, 5005);
    			div18.className = "input-group-prepend w-25";
    			add_location(div18, file$9, 128, 24, 4937);
    			attr(input2, "type", "date");
    			input2.className = "form-control";
    			add_location(input2, file$9, 131, 24, 5114);
    			div19.className = "input-group";
    			add_location(div19, file$9, 127, 20, 4886);
    			div20.className = "form-group";
    			add_location(div20, file$9, 126, 16, 4840);
    			div21.className = "input-group-text w-100";
    			add_location(div21, file$9, 137, 28, 5487);
    			div22.className = "input-group-prepend w-25";
    			add_location(div22, file$9, 136, 24, 5419);
    			attr(input3, "type", "date");
    			input3.className = "form-control";
    			add_location(input3, file$9, 139, 24, 5594);
    			div23.className = "input-group";
    			add_location(div23, file$9, 135, 20, 5368);
    			div24.className = div24_class_value = `form-group ${ctx.projectID != null ? 'mb-0' : ''}`;
    			add_location(div24, file$9, 134, 16, 5283);
    			div25.className = "modal-body";
    			add_location(div25, file$9, 83, 12, 2348);
    			button1.className = "btn btn-success w-100";
    			button1.id = "modal-add-btn";
    			add_location(button1, file$9, 159, 16, 6719);
    			div26.className = "modal-footer";
    			add_location(div26, file$9, 158, 12, 6675);
    			div27.className = "modal-content";
    			add_location(div27, file$9, 78, 8, 2090);
    			div28.className = "modal-dialog";
    			attr(div28, "role", "document");
    			add_location(div28, file$9, 77, 4, 2038);
    			div29.className = "modal fade";
    			div29.id = "add-modal";
    			div29.tabIndex = "-1";
    			add_location(div29, file$9, 76, 0, 1979);

    			dispose = [
    				listen(input0, "change", ctx.change_handler),
    				listen(select0, "change", ctx.change_handler_1),
    				listen(input1, "change", ctx.change_handler_2),
    				listen(select1, "change", ctx.change_handler_3),
    				listen(input2, "change", ctx.change_handler_4),
    				listen(input3, "change", ctx.change_handler_5),
    				listen(button1, "click", ctx.addMobility)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target_1, anchor) {
    			insert(target_1, div29, anchor);
    			append(div29, div28);
    			append(div28, div27);
    			append(div27, div0);
    			append(div0, h5);
    			append(div0, t1);
    			append(div0, button0);
    			append(button0, span);
    			append(div27, t3);
    			append(div27, div25);
    			append(div25, div4);
    			append(div4, div3);
    			append(div3, div2);
    			append(div2, div1);
    			append(div3, t5);
    			append(div3, input0);
    			append(div25, t6);
    			append(div25, div8);
    			append(div8, div7);
    			append(div7, div6);
    			append(div6, div5);
    			append(div7, t8);
    			append(div7, select0);
    			append(select0, option0);

    			for (var i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select0, null);
    			}

    			append(div25, t10);
    			append(div25, div12);
    			append(div12, div11);
    			append(div11, div10);
    			append(div10, div9);
    			append(div11, t12);
    			append(div11, input1);
    			append(div25, t13);
    			append(div25, div16);
    			append(div16, div15);
    			append(div15, div14);
    			append(div14, div13);
    			append(div15, t15);
    			append(div15, select1);
    			append(select1, option1);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select1, null);
    			}

    			append(div25, t17);
    			append(div25, div20);
    			append(div20, div19);
    			append(div19, div18);
    			append(div18, div17);
    			append(div19, t19);
    			append(div19, input2);
    			append(div25, t20);
    			append(div25, div24);
    			append(div24, div23);
    			append(div23, div22);
    			append(div22, div21);
    			append(div23, t22);
    			append(div23, input3);
    			append(div25, t23);
    			if (if_block) if_block.m(div25, null);
    			append(div27, t24);
    			append(div27, div26);
    			append(div26, button1);
    		},

    		p: function update(changed, ctx) {
    			if (changed.partners) {
    				each_value_2 = ctx.partners;

    				for (var i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(changed, child_ctx);
    					} else {
    						each_blocks_1[i] = create_each_block_2$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}
    				each_blocks_1.length = each_value_2.length;
    			}

    			if (changed.partners) {
    				each_value_1 = ctx.partners;

    				for (var i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value_1.length;
    			}

    			if ((changed.projectID) && div24_class_value !== (div24_class_value = `form-group ${ctx.projectID != null ? 'mb-0' : ''}`)) {
    				div24.className = div24_class_value;
    			}

    			if (ctx.projectID == null) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					if_block.m(div25, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div29);
    			}

    			destroy_each(each_blocks_1, detaching);

    			destroy_each(each_blocks, detaching);

    			if (if_block) if_block.d();
    			run_all(dispose);
    		}
    	};
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { getMobilities, partners, getToken, projectID, isOpen, setIsOpen } = $$props;

        let projects = [];

        let origin = "";
        let originPartner = 0;
        let target = "";
        let targetPartner = 0;
        let departureDate = "";
        let arrivalDate = "";
        let project = 0;

        function addMobility() {
            console.log("Attempting to add mobility");
            let data = {
                ID: null,
                origin: origin,
                IDOriginPartner: originPartner,
                target: target,
                IDTargetPartner: targetPartner,
                departureDate: departureDate,
                arrivalDate: arrivalDate,
                IDProject: projectID != null ? projectID : project
            };
            console.log(data);

            axios$1.post("/api/insert/mobilities", data, {headers: {Authorization: getToken()}}).then(res => {
            	console.log("Successfully added mobility");
                getMobilities();
            }).catch(err => {
            	console.log(err.response);
            });
        }

        function getProjects() {
            console.log("Attempting to fetch projects");
            axios$1.get("/api/get/projects", {headers: {Authorization: getToken()}}).then(res => {
                $$invalidate('projects', projects = res.data);
                console.log("Successfully fetched projects");
            }).catch(err => {
                console.log("There was an error fetching the projects");
                console.log(err.response);
            });
        }

        function open(){
        	setIsOpen(true);
            window.$("#add-modal").modal('show');
        }

        console.log(projectID);

    	const writable_props = ['getMobilities', 'partners', 'getToken', 'projectID', 'isOpen', 'setIsOpen'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<AddMobilityModal> was created with unknown prop '${key}'`);
    	});

    	function change_handler(event) {
    		const $$result = origin = event.target.value;
    		$$invalidate('origin', origin);
    		return $$result;
    	}

    	function change_handler_1(event) {
    		const $$result = originPartner = event.target.value;
    		$$invalidate('originPartner', originPartner);
    		return $$result;
    	}

    	function change_handler_2(event) {
    		const $$result = target = event.target.value;
    		$$invalidate('target', target);
    		return $$result;
    	}

    	function change_handler_3(event) {
    		const $$result = targetPartner = event.target.value;
    		$$invalidate('targetPartner', targetPartner);
    		return $$result;
    	}

    	function change_handler_4(event) {
    		const $$result = departureDate = event.target.value;
    		$$invalidate('departureDate', departureDate);
    		return $$result;
    	}

    	function change_handler_5(event) {
    		const $$result = arrivalDate = event.target.value;
    		$$invalidate('arrivalDate', arrivalDate);
    		return $$result;
    	}

    	function change_handler_6(event) {
    		const $$result = project = event.target.value;
    		$$invalidate('project', project);
    		return $$result;
    	}

    	$$self.$set = $$props => {
    		if ('getMobilities' in $$props) $$invalidate('getMobilities', getMobilities = $$props.getMobilities);
    		if ('partners' in $$props) $$invalidate('partners', partners = $$props.partners);
    		if ('getToken' in $$props) $$invalidate('getToken', getToken = $$props.getToken);
    		if ('projectID' in $$props) $$invalidate('projectID', projectID = $$props.projectID);
    		if ('isOpen' in $$props) $$invalidate('isOpen', isOpen = $$props.isOpen);
    		if ('setIsOpen' in $$props) $$invalidate('setIsOpen', setIsOpen = $$props.setIsOpen);
    	};

    	$$self.$$.update = ($$dirty = { isOpen: 1, projectID: 1, setIsOpen: 1 }) => {
    		if ($$dirty.isOpen || $$dirty.projectID || $$dirty.setIsOpen) { if (isOpen) {
                    if (projectID == null){
                        getProjects();
                    }
            
                    open();
                    setIsOpen(false);
                } }
    	};

    	return {
    		getMobilities,
    		partners,
    		getToken,
    		projectID,
    		isOpen,
    		setIsOpen,
    		projects,
    		origin,
    		originPartner,
    		target,
    		targetPartner,
    		departureDate,
    		arrivalDate,
    		project,
    		addMobility,
    		change_handler,
    		change_handler_1,
    		change_handler_2,
    		change_handler_3,
    		change_handler_4,
    		change_handler_5,
    		change_handler_6
    	};
    }

    class AddMobilityModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, ["getMobilities", "partners", "getToken", "projectID", "isOpen", "setIsOpen"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.getMobilities === undefined && !('getMobilities' in props)) {
    			console.warn("<AddMobilityModal> was created without expected prop 'getMobilities'");
    		}
    		if (ctx.partners === undefined && !('partners' in props)) {
    			console.warn("<AddMobilityModal> was created without expected prop 'partners'");
    		}
    		if (ctx.getToken === undefined && !('getToken' in props)) {
    			console.warn("<AddMobilityModal> was created without expected prop 'getToken'");
    		}
    		if (ctx.projectID === undefined && !('projectID' in props)) {
    			console.warn("<AddMobilityModal> was created without expected prop 'projectID'");
    		}
    		if (ctx.isOpen === undefined && !('isOpen' in props)) {
    			console.warn("<AddMobilityModal> was created without expected prop 'isOpen'");
    		}
    		if (ctx.setIsOpen === undefined && !('setIsOpen' in props)) {
    			console.warn("<AddMobilityModal> was created without expected prop 'setIsOpen'");
    		}
    	}

    	get getMobilities() {
    		throw new Error("<AddMobilityModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getMobilities(value) {
    		throw new Error("<AddMobilityModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get partners() {
    		throw new Error("<AddMobilityModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set partners(value) {
    		throw new Error("<AddMobilityModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getToken() {
    		throw new Error("<AddMobilityModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getToken(value) {
    		throw new Error("<AddMobilityModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get projectID() {
    		throw new Error("<AddMobilityModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set projectID(value) {
    		throw new Error("<AddMobilityModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isOpen() {
    		throw new Error("<AddMobilityModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isOpen(value) {
    		throw new Error("<AddMobilityModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setIsOpen() {
    		throw new Error("<AddMobilityModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set setIsOpen(value) {
    		throw new Error("<AddMobilityModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\mobilities\EditMobilityModal.svelte generated by Svelte v3.5.1 */

    const file$a = "src\\components\\mobilities\\EditMobilityModal.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.partner = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    function get_each_context_1$3(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.partner = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    // (106:36) {:else}
    function create_else_block_1$1(ctx) {
    	var option, t_value = ctx.partner.name, t, option_value_value;

    	return {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = ctx.partner.ID;
    			option.value = option.__value;
    			add_location(option, file$a, 106, 40, 3758);
    		},

    		m: function mount(target_1, anchor) {
    			insert(target_1, option, anchor);
    			append(option, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.partners) && t_value !== (t_value = ctx.partner.name)) {
    				set_data(t, t_value);
    			}

    			if ((changed.partners) && option_value_value !== (option_value_value = ctx.partner.ID)) {
    				option.__value = option_value_value;
    			}

    			option.value = option.__value;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(option);
    			}
    		}
    	};
    }

    // (104:36) {#if partner.ID === originPartner}
    function create_if_block_1$3(ctx) {
    	var option, t_value = ctx.partner.name, t, option_value_value;

    	return {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = ctx.partner.ID;
    			option.value = option.__value;
    			option.selected = true;
    			add_location(option, file$a, 104, 40, 3612);
    		},

    		m: function mount(target_1, anchor) {
    			insert(target_1, option, anchor);
    			append(option, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.partners) && t_value !== (t_value = ctx.partner.name)) {
    				set_data(t, t_value);
    			}

    			if ((changed.partners) && option_value_value !== (option_value_value = ctx.partner.ID)) {
    				option.__value = option_value_value;
    			}

    			option.value = option.__value;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(option);
    			}
    		}
    	};
    }

    // (103:32) {#each partners as partner, i}
    function create_each_block_1$3(ctx) {
    	var if_block_anchor;

    	function select_block_type(ctx) {
    		if (ctx.partner.ID === ctx.originPartner) return create_if_block_1$3;
    		return create_else_block_1$1;
    	}

    	var current_block_type = select_block_type(ctx);
    	var if_block = current_block_type(ctx);

    	return {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target_1, anchor) {
    			if_block.m(target_1, anchor);
    			insert(target_1, if_block_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(changed, ctx);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);
    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},

    		d: function destroy(detaching) {
    			if_block.d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    // (130:36) {:else}
    function create_else_block$4(ctx) {
    	var option, t_value = ctx.partner.name, t, option_value_value;

    	return {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = ctx.partner.ID;
    			option.value = option.__value;
    			add_location(option, file$a, 130, 40, 5239);
    		},

    		m: function mount(target_1, anchor) {
    			insert(target_1, option, anchor);
    			append(option, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.partners) && t_value !== (t_value = ctx.partner.name)) {
    				set_data(t, t_value);
    			}

    			if ((changed.partners) && option_value_value !== (option_value_value = ctx.partner.ID)) {
    				option.__value = option_value_value;
    			}

    			option.value = option.__value;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(option);
    			}
    		}
    	};
    }

    // (128:36) {#if partner.ID === targetPartner}
    function create_if_block$7(ctx) {
    	var option, t_value = ctx.partner.name, t, option_value_value;

    	return {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = ctx.partner.ID;
    			option.value = option.__value;
    			option.selected = true;
    			add_location(option, file$a, 128, 40, 5093);
    		},

    		m: function mount(target_1, anchor) {
    			insert(target_1, option, anchor);
    			append(option, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.partners) && t_value !== (t_value = ctx.partner.name)) {
    				set_data(t, t_value);
    			}

    			if ((changed.partners) && option_value_value !== (option_value_value = ctx.partner.ID)) {
    				option.__value = option_value_value;
    			}

    			option.value = option.__value;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(option);
    			}
    		}
    	};
    }

    // (127:32) {#each partners as partner, i}
    function create_each_block$5(ctx) {
    	var if_block_anchor;

    	function select_block_type_1(ctx) {
    		if (ctx.partner.ID === ctx.targetPartner) return create_if_block$7;
    		return create_else_block$4;
    	}

    	var current_block_type = select_block_type_1(ctx);
    	var if_block = current_block_type(ctx);

    	return {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target_1, anchor) {
    			if_block.m(target_1, anchor);
    			insert(target_1, if_block_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(changed, ctx);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);
    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},

    		d: function destroy(detaching) {
    			if_block.d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    function create_fragment$c(ctx) {
    	var div30, div29, div28, div0, h5, t1, button0, span, t3, div26, div25, div4, div3, div2, div1, t5, input0, t6, div8, div7, div6, div5, t8, select0, t9, div12, div11, div10, div9, t11, input1, t12, div16, div15, div14, div13, t14, select1, t15, div20, div19, div18, div17, t17, input2, input2_value_value, t18, div24, div23, div22, div21, t20, input3, input3_value_value, t21, div27, button1, dispose;

    	var each_value_1 = ctx.partners;

    	var each_blocks_1 = [];

    	for (var i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$3(get_each_context_1$3(ctx, each_value_1, i));
    	}

    	var each_value = ctx.partners;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	return {
    		c: function create() {
    			div30 = element("div");
    			div29 = element("div");
    			div28 = element("div");
    			div0 = element("div");
    			h5 = element("h5");
    			h5.textContent = "Edit Project";
    			t1 = space();
    			button0 = element("button");
    			span = element("span");
    			span.textContent = "x";
    			t3 = space();
    			div26 = element("div");
    			div25 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div1.textContent = "Origin";
    			t5 = space();
    			input0 = element("input");
    			t6 = space();
    			div8 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			div5 = element("div");
    			div5.textContent = "Origin Partner";
    			t8 = space();
    			select0 = element("select");

    			for (var i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t9 = space();
    			div12 = element("div");
    			div11 = element("div");
    			div10 = element("div");
    			div9 = element("div");
    			div9.textContent = "Target";
    			t11 = space();
    			input1 = element("input");
    			t12 = space();
    			div16 = element("div");
    			div15 = element("div");
    			div14 = element("div");
    			div13 = element("div");
    			div13.textContent = "Target Partner";
    			t14 = space();
    			select1 = element("select");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t15 = space();
    			div20 = element("div");
    			div19 = element("div");
    			div18 = element("div");
    			div17 = element("div");
    			div17.textContent = "Departure";
    			t17 = space();
    			input2 = element("input");
    			t18 = space();
    			div24 = element("div");
    			div23 = element("div");
    			div22 = element("div");
    			div21 = element("div");
    			div21.textContent = "Arrival";
    			t20 = space();
    			input3 = element("input");
    			t21 = space();
    			div27 = element("div");
    			button1 = element("button");
    			button1.textContent = "Edit";
    			h5.className = "modal-title";
    			add_location(h5, file$a, 83, 16, 2271);
    			add_location(span, file$a, 84, 73, 2387);
    			button0.className = "close";
    			button0.type = "button";
    			button0.dataset.dismiss = "modal";
    			add_location(button0, file$a, 84, 16, 2330);
    			div0.className = "modal-header";
    			add_location(div0, file$a, 82, 12, 2227);
    			div1.className = "input-group-text w-100";
    			add_location(div1, file$a, 91, 32, 2709);
    			div2.className = "input-group-prepend w-25";
    			add_location(div2, file$a, 90, 28, 2637);
    			input0.className = "form-control";
    			attr(input0, "type", "text");
    			input0.value = ctx.origin;
    			input0.placeholder = "eg. Sweden, Stockholm";
    			add_location(input0, file$a, 93, 28, 2823);
    			div3.className = "input-group";
    			add_location(div3, file$a, 89, 24, 2582);
    			div4.className = "form-group";
    			add_location(div4, file$a, 88, 20, 2532);
    			div5.className = "input-group-text w-100";
    			add_location(div5, file$a, 99, 32, 3225);
    			div6.className = "input-group-prepend w-25";
    			add_location(div6, file$a, 98, 28, 3153);
    			select0.className = "form-control";
    			add_location(select0, file$a, 101, 28, 3347);
    			div7.className = "input-group";
    			add_location(div7, file$a, 97, 24, 3098);
    			div8.className = "form-group";
    			add_location(div8, file$a, 96, 20, 3048);
    			div9.className = "input-group-text w-100";
    			add_location(div9, file$a, 115, 32, 4190);
    			div10.className = "input-group-prepend w-25";
    			add_location(div10, file$a, 114, 28, 4118);
    			input1.className = "form-control";
    			attr(input1, "type", "text");
    			input1.value = ctx.target;
    			input1.placeholder = "eg. Sweden, Stockholm";
    			add_location(input1, file$a, 117, 28, 4304);
    			div11.className = "input-group";
    			add_location(div11, file$a, 113, 24, 4063);
    			div12.className = "form-group";
    			add_location(div12, file$a, 112, 20, 4013);
    			div13.className = "input-group-text w-100";
    			add_location(div13, file$a, 123, 32, 4706);
    			div14.className = "input-group-prepend w-25";
    			add_location(div14, file$a, 122, 28, 4634);
    			select1.className = "form-control";
    			add_location(select1, file$a, 125, 28, 4828);
    			div15.className = "input-group";
    			add_location(div15, file$a, 121, 24, 4579);
    			div16.className = "form-group";
    			add_location(div16, file$a, 120, 20, 4529);
    			div17.className = "input-group-text w-100";
    			add_location(div17, file$a, 139, 32, 5671);
    			div18.className = "input-group-prepend w-25";
    			add_location(div18, file$a, 138, 28, 5599);
    			attr(input2, "type", "date");
    			input2.value = input2_value_value = ctx.departureDate.slice(0, -14);
    			input2.className = "form-control";
    			add_location(input2, file$a, 141, 28, 5788);
    			div19.className = "input-group";
    			add_location(div19, file$a, 137, 24, 5544);
    			div20.className = "form-group";
    			add_location(div20, file$a, 136, 20, 5494);
    			div21.className = "input-group-text w-100";
    			add_location(div21, file$a, 147, 32, 6189);
    			div22.className = "input-group-prepend w-25";
    			add_location(div22, file$a, 146, 28, 6117);
    			attr(input3, "type", "date");
    			input3.value = input3_value_value = ctx.arrivalDate.slice(0, -14);
    			input3.className = "form-control";
    			add_location(input3, file$a, 149, 28, 6304);
    			div23.className = "input-group";
    			add_location(div23, file$a, 145, 24, 6062);
    			div24.className = "form-group mb-0";
    			add_location(div24, file$a, 144, 20, 6007);
    			div25.className = "modal-body";
    			add_location(div25, file$a, 87, 16, 2486);
    			div26.className = "modal-body";
    			add_location(div26, file$a, 86, 12, 2444);
    			button1.className = "btn btn-info w-100";
    			add_location(button1, file$a, 155, 16, 6599);
    			div27.className = "modal-footer";
    			add_location(div27, file$a, 154, 12, 6555);
    			div28.className = "modal-content";
    			add_location(div28, file$a, 81, 8, 2186);
    			div29.className = "modal-dialog";
    			attr(div29, "role", "document");
    			add_location(div29, file$a, 80, 4, 2134);
    			div30.className = "modal fade";
    			div30.id = "edit-modal";
    			div30.tabIndex = "-1";
    			add_location(div30, file$a, 79, 0, 2074);

    			dispose = [
    				listen(input0, "change", ctx.change_handler),
    				listen(select0, "change", ctx.change_handler_1),
    				listen(input1, "change", ctx.change_handler_2),
    				listen(select1, "change", ctx.change_handler_3),
    				listen(input2, "change", ctx.change_handler_4),
    				listen(input3, "change", ctx.change_handler_5),
    				listen(button1, "click", ctx.editMobility)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target_1, anchor) {
    			insert(target_1, div30, anchor);
    			append(div30, div29);
    			append(div29, div28);
    			append(div28, div0);
    			append(div0, h5);
    			append(div0, t1);
    			append(div0, button0);
    			append(button0, span);
    			append(div28, t3);
    			append(div28, div26);
    			append(div26, div25);
    			append(div25, div4);
    			append(div4, div3);
    			append(div3, div2);
    			append(div2, div1);
    			append(div3, t5);
    			append(div3, input0);
    			append(div25, t6);
    			append(div25, div8);
    			append(div8, div7);
    			append(div7, div6);
    			append(div6, div5);
    			append(div7, t8);
    			append(div7, select0);

    			for (var i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select0, null);
    			}

    			append(div25, t9);
    			append(div25, div12);
    			append(div12, div11);
    			append(div11, div10);
    			append(div10, div9);
    			append(div11, t11);
    			append(div11, input1);
    			append(div25, t12);
    			append(div25, div16);
    			append(div16, div15);
    			append(div15, div14);
    			append(div14, div13);
    			append(div15, t14);
    			append(div15, select1);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select1, null);
    			}

    			append(div25, t15);
    			append(div25, div20);
    			append(div20, div19);
    			append(div19, div18);
    			append(div18, div17);
    			append(div19, t17);
    			append(div19, input2);
    			append(div25, t18);
    			append(div25, div24);
    			append(div24, div23);
    			append(div23, div22);
    			append(div22, div21);
    			append(div23, t20);
    			append(div23, input3);
    			append(div28, t21);
    			append(div28, div27);
    			append(div27, button1);
    		},

    		p: function update(changed, ctx) {
    			if (changed.origin) {
    				input0.value = ctx.origin;
    			}

    			if (changed.partners || changed.originPartner) {
    				each_value_1 = ctx.partners;

    				for (var i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$3(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(changed, child_ctx);
    					} else {
    						each_blocks_1[i] = create_each_block_1$3(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}
    				each_blocks_1.length = each_value_1.length;
    			}

    			if (changed.target) {
    				input1.value = ctx.target;
    			}

    			if (changed.partners || changed.targetPartner) {
    				each_value = ctx.partners;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}

    			if ((changed.departureDate) && input2_value_value !== (input2_value_value = ctx.departureDate.slice(0, -14))) {
    				input2.value = input2_value_value;
    			}

    			if ((changed.arrivalDate) && input3_value_value !== (input3_value_value = ctx.arrivalDate.slice(0, -14))) {
    				input3.value = input3_value_value;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div30);
    			}

    			destroy_each(each_blocks_1, detaching);

    			destroy_each(each_blocks, detaching);

    			run_all(dispose);
    		}
    	};
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { getMobilities, getToken, mobilities, partners, selectedRows, isOpen, setIsOpen } = $$props;

        let id = 0;
        let origin = "";
        let originPartner = 0;
        let target = "";
        let targetPartner = 0;
        let departureDate = "";
        let arrivalDate = "";
        
        function editMobility() {
        	let data = {
        		ID: id,
        		origin: origin,
        		IDOriginPartner: originPartner,
        		target: target,
        		IDTargetPartner: targetPartner,
        		departureDate: departureDate,
        		arrivalDate: arrivalDate
        	};
        	console.log(data);


        	console.log("Trying to edit mobilities");
            axios$1.put("/api/edit/mobilities", data, {headers: {Authorization: getToken()}}).then(res => {
            	console.log("Successfully edited mobility");

            	getMobilities();
            	close();
            }).catch(err => {
            	console.log("There was an error editing the project");
            });
        }

        function close(){
        	setIsOpen(false);
            window.$("#edit-modal").modal('hide');
        }

        function open(){
        	setIsOpen(true);
            window.$("#edit-modal").modal('show');
        }

    	const writable_props = ['getMobilities', 'getToken', 'mobilities', 'partners', 'selectedRows', 'isOpen', 'setIsOpen'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<EditMobilityModal> was created with unknown prop '${key}'`);
    	});

    	function change_handler(event) {
    		const $$result = origin = event.target.value;
    		$$invalidate('origin', origin), $$invalidate('isOpen', isOpen), $$invalidate('mobilities', mobilities), $$invalidate('selectedRows', selectedRows), $$invalidate('departureDate', departureDate), $$invalidate('arrivalDate', arrivalDate), $$invalidate('setIsOpen', setIsOpen);
    		return $$result;
    	}

    	function change_handler_1(event) {
    		const $$result = originPartner = event.target.value;
    		$$invalidate('originPartner', originPartner), $$invalidate('isOpen', isOpen), $$invalidate('mobilities', mobilities), $$invalidate('selectedRows', selectedRows), $$invalidate('departureDate', departureDate), $$invalidate('arrivalDate', arrivalDate), $$invalidate('setIsOpen', setIsOpen);
    		return $$result;
    	}

    	function change_handler_2(event) {
    		const $$result = target = event.target.value;
    		$$invalidate('target', target), $$invalidate('isOpen', isOpen), $$invalidate('mobilities', mobilities), $$invalidate('selectedRows', selectedRows), $$invalidate('departureDate', departureDate), $$invalidate('arrivalDate', arrivalDate), $$invalidate('setIsOpen', setIsOpen);
    		return $$result;
    	}

    	function change_handler_3(event) {
    		const $$result = targetPartner = event.target.value;
    		$$invalidate('targetPartner', targetPartner), $$invalidate('isOpen', isOpen), $$invalidate('mobilities', mobilities), $$invalidate('selectedRows', selectedRows), $$invalidate('departureDate', departureDate), $$invalidate('arrivalDate', arrivalDate), $$invalidate('setIsOpen', setIsOpen);
    		return $$result;
    	}

    	function change_handler_4(event) {
    		const $$result = departureDate = event.target.value;
    		$$invalidate('departureDate', departureDate), $$invalidate('isOpen', isOpen), $$invalidate('mobilities', mobilities), $$invalidate('selectedRows', selectedRows), $$invalidate('arrivalDate', arrivalDate), $$invalidate('setIsOpen', setIsOpen);
    		return $$result;
    	}

    	function change_handler_5(event) {
    		const $$result = arrivalDate = event.target.value;
    		$$invalidate('arrivalDate', arrivalDate), $$invalidate('isOpen', isOpen), $$invalidate('mobilities', mobilities), $$invalidate('selectedRows', selectedRows), $$invalidate('departureDate', departureDate), $$invalidate('setIsOpen', setIsOpen);
    		return $$result;
    	}

    	$$self.$set = $$props => {
    		if ('getMobilities' in $$props) $$invalidate('getMobilities', getMobilities = $$props.getMobilities);
    		if ('getToken' in $$props) $$invalidate('getToken', getToken = $$props.getToken);
    		if ('mobilities' in $$props) $$invalidate('mobilities', mobilities = $$props.mobilities);
    		if ('partners' in $$props) $$invalidate('partners', partners = $$props.partners);
    		if ('selectedRows' in $$props) $$invalidate('selectedRows', selectedRows = $$props.selectedRows);
    		if ('isOpen' in $$props) $$invalidate('isOpen', isOpen = $$props.isOpen);
    		if ('setIsOpen' in $$props) $$invalidate('setIsOpen', setIsOpen = $$props.setIsOpen);
    	};

    	$$self.$$.update = ($$dirty = { isOpen: 1, mobilities: 1, selectedRows: 1, departureDate: 1, arrivalDate: 1, setIsOpen: 1 }) => {
    		if ($$dirty.isOpen || $$dirty.mobilities || $$dirty.selectedRows || $$dirty.departureDate || $$dirty.arrivalDate || $$dirty.setIsOpen) { if (isOpen) {
                	open();
            
                	console.log(mobilities);
                	console.log(selectedRows);
            
                	for(let i = 0; i < mobilities.length; i++) {
                	    if(mobilities[i].ID === selectedRows[0]){
                            id = selectedRows[0];
                            $$invalidate('origin', origin = mobilities[i].origin);
                            $$invalidate('originPartner', originPartner = mobilities[i].IDOriginPartner);
                            $$invalidate('target', target = mobilities[i].target);
                            $$invalidate('targetPartner', targetPartner = mobilities[i].IDTargetPartner);
                            $$invalidate('departureDate', departureDate = mobilities[i].departureDate);
                            $$invalidate('arrivalDate', arrivalDate = mobilities[i].arrivalDate);
                            console.log("Hey");
                            console.log(departureDate);
                            console.log(arrivalDate);
                	    }
                	}
            
                	setIsOpen(false);
                } }
    	};

    	return {
    		getMobilities,
    		getToken,
    		mobilities,
    		partners,
    		selectedRows,
    		isOpen,
    		setIsOpen,
    		origin,
    		originPartner,
    		target,
    		targetPartner,
    		departureDate,
    		arrivalDate,
    		editMobility,
    		change_handler,
    		change_handler_1,
    		change_handler_2,
    		change_handler_3,
    		change_handler_4,
    		change_handler_5
    	};
    }

    class EditMobilityModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, ["getMobilities", "getToken", "mobilities", "partners", "selectedRows", "isOpen", "setIsOpen"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.getMobilities === undefined && !('getMobilities' in props)) {
    			console.warn("<EditMobilityModal> was created without expected prop 'getMobilities'");
    		}
    		if (ctx.getToken === undefined && !('getToken' in props)) {
    			console.warn("<EditMobilityModal> was created without expected prop 'getToken'");
    		}
    		if (ctx.mobilities === undefined && !('mobilities' in props)) {
    			console.warn("<EditMobilityModal> was created without expected prop 'mobilities'");
    		}
    		if (ctx.partners === undefined && !('partners' in props)) {
    			console.warn("<EditMobilityModal> was created without expected prop 'partners'");
    		}
    		if (ctx.selectedRows === undefined && !('selectedRows' in props)) {
    			console.warn("<EditMobilityModal> was created without expected prop 'selectedRows'");
    		}
    		if (ctx.isOpen === undefined && !('isOpen' in props)) {
    			console.warn("<EditMobilityModal> was created without expected prop 'isOpen'");
    		}
    		if (ctx.setIsOpen === undefined && !('setIsOpen' in props)) {
    			console.warn("<EditMobilityModal> was created without expected prop 'setIsOpen'");
    		}
    	}

    	get getMobilities() {
    		throw new Error("<EditMobilityModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getMobilities(value) {
    		throw new Error("<EditMobilityModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getToken() {
    		throw new Error("<EditMobilityModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getToken(value) {
    		throw new Error("<EditMobilityModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mobilities() {
    		throw new Error("<EditMobilityModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mobilities(value) {
    		throw new Error("<EditMobilityModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get partners() {
    		throw new Error("<EditMobilityModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set partners(value) {
    		throw new Error("<EditMobilityModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedRows() {
    		throw new Error("<EditMobilityModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedRows(value) {
    		throw new Error("<EditMobilityModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isOpen() {
    		throw new Error("<EditMobilityModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isOpen(value) {
    		throw new Error("<EditMobilityModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setIsOpen() {
    		throw new Error("<EditMobilityModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set setIsOpen(value) {
    		throw new Error("<EditMobilityModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\mobilities\Mobilities.svelte generated by Svelte v3.5.1 */

    const file$b = "src\\components\\mobilities\\Mobilities.svelte";

    // (123:0) {#if is_logged_in}
    function create_if_block$8(ctx) {
    	var t0, t1, div1, div0, h2, span0, t3, span1, button0, t5, button1, t6, button1_class_value, t7, button2, t8_value = ctx.confirm_del ? "Are you sure?" : "Delete", t8, button2_class_value, t9, current, dispose;

    	var addmobilitymodal = new AddMobilityModal({
    		props: {
    		getMobilities: ctx.getMobilities,
    		partners: ctx.partners,
    		getToken: ctx.getToken,
    		projectID: ctx.id,
    		isOpen: ctx.isAddModalOpen,
    		setIsOpen: ctx.setIsAddModalOpen
    	},
    		$$inline: true
    	});

    	var editmobilitymodal = new EditMobilityModal({
    		props: {
    		getMobilities: ctx.getMobilities,
    		mobilities: ctx.mobilities,
    		partners: ctx.partners,
    		getToken: ctx.getToken,
    		selectedRows: ctx.selectedRows,
    		isOpen: ctx.isEditModalOpen,
    		setIsOpen: ctx.setIsEditModalOpen
    	},
    		$$inline: true
    	});

    	var mobilitiestable = new MobilitiesTable({
    		props: {
    		mobilities: ctx.mobilities,
    		toggleRowSelect: ctx.toggleRowSelect,
    		selectedRows: ctx.selectedRows
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			addmobilitymodal.$$.fragment.c();
    			t0 = space();
    			editmobilitymodal.$$.fragment.c();
    			t1 = space();
    			div1 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			span0 = element("span");
    			span0.textContent = "Mobilities";
    			t3 = space();
    			span1 = element("span");
    			button0 = element("button");
    			button0.textContent = "Add +";
    			t5 = space();
    			button1 = element("button");
    			t6 = text("Edit");
    			t7 = space();
    			button2 = element("button");
    			t8 = text(t8_value);
    			t9 = space();
    			mobilitiestable.$$.fragment.c();
    			span0.className = "border-bottom-3px border-top-3px border-dark px-2 d-inline-block";
    			add_location(span0, file$b, 127, 35, 4135);
    			h2.className = "mb-3 text-dark";
    			add_location(h2, file$b, 127, 8, 4108);
    			button0.className = "btn btn-success mb-2";
    			add_location(button0, file$b, 129, 16, 4274);
    			button1.className = button1_class_value = ctx.selectedRows.length !== 1 ? 'btn btn-info mb-2 mx-2 disabled' : 'btn btn-info mb-2 mx-2';
    			button1.id = "edit-btn";
    			add_location(button1, file$b, 130, 16, 4375);
    			button2.className = button2_class_value = `btn btn-danger mb-2 ${ctx.selectedRows.length >= 1 ? '' : 'disabled'}`;
    			button2.id = "delete-btn";
    			add_location(button2, file$b, 131, 16, 4560);
    			add_location(span1, file$b, 128, 12, 4250);
    			div0.className = "container rounded p-4 bg-light shadow h-max-100 d-flex flex-flow-column";
    			add_location(div0, file$b, 126, 8, 4013);
    			div1.className = "p-5 position-absolute bottom-0px top-76px left-0px right-0px";
    			add_location(div1, file$b, 125, 4, 3894);

    			dispose = [
    				listen(button0, "click", ctx.handleAddButtonClick),
    				listen(button1, "click", ctx.handleEditButtonClick),
    				listen(button2, "click", ctx.handleDeleteClick),
    				listen(div1, "click", ctx.handleOutsideTableClick)
    			];
    		},

    		m: function mount(target, anchor) {
    			mount_component(addmobilitymodal, target, anchor);
    			insert(target, t0, anchor);
    			mount_component(editmobilitymodal, target, anchor);
    			insert(target, t1, anchor);
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, h2);
    			append(h2, span0);
    			append(div0, t3);
    			append(div0, span1);
    			append(span1, button0);
    			append(span1, t5);
    			append(span1, button1);
    			append(button1, t6);
    			append(span1, t7);
    			append(span1, button2);
    			append(button2, t8);
    			append(div0, t9);
    			mount_component(mobilitiestable, div0, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var addmobilitymodal_changes = {};
    			if (changed.getMobilities) addmobilitymodal_changes.getMobilities = ctx.getMobilities;
    			if (changed.partners) addmobilitymodal_changes.partners = ctx.partners;
    			if (changed.getToken) addmobilitymodal_changes.getToken = ctx.getToken;
    			if (changed.id) addmobilitymodal_changes.projectID = ctx.id;
    			if (changed.isAddModalOpen) addmobilitymodal_changes.isOpen = ctx.isAddModalOpen;
    			if (changed.setIsAddModalOpen) addmobilitymodal_changes.setIsOpen = ctx.setIsAddModalOpen;
    			addmobilitymodal.$set(addmobilitymodal_changes);

    			var editmobilitymodal_changes = {};
    			if (changed.getMobilities) editmobilitymodal_changes.getMobilities = ctx.getMobilities;
    			if (changed.mobilities) editmobilitymodal_changes.mobilities = ctx.mobilities;
    			if (changed.partners) editmobilitymodal_changes.partners = ctx.partners;
    			if (changed.getToken) editmobilitymodal_changes.getToken = ctx.getToken;
    			if (changed.selectedRows) editmobilitymodal_changes.selectedRows = ctx.selectedRows;
    			if (changed.isEditModalOpen) editmobilitymodal_changes.isOpen = ctx.isEditModalOpen;
    			if (changed.setIsEditModalOpen) editmobilitymodal_changes.setIsOpen = ctx.setIsEditModalOpen;
    			editmobilitymodal.$set(editmobilitymodal_changes);

    			if ((!current || changed.selectedRows) && button1_class_value !== (button1_class_value = ctx.selectedRows.length !== 1 ? 'btn btn-info mb-2 mx-2 disabled' : 'btn btn-info mb-2 mx-2')) {
    				button1.className = button1_class_value;
    			}

    			if ((!current || changed.confirm_del) && t8_value !== (t8_value = ctx.confirm_del ? "Are you sure?" : "Delete")) {
    				set_data(t8, t8_value);
    			}

    			if ((!current || changed.selectedRows) && button2_class_value !== (button2_class_value = `btn btn-danger mb-2 ${ctx.selectedRows.length >= 1 ? '' : 'disabled'}`)) {
    				button2.className = button2_class_value;
    			}

    			var mobilitiestable_changes = {};
    			if (changed.mobilities) mobilitiestable_changes.mobilities = ctx.mobilities;
    			if (changed.toggleRowSelect) mobilitiestable_changes.toggleRowSelect = ctx.toggleRowSelect;
    			if (changed.selectedRows) mobilitiestable_changes.selectedRows = ctx.selectedRows;
    			mobilitiestable.$set(mobilitiestable_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			addmobilitymodal.$$.fragment.i(local);

    			editmobilitymodal.$$.fragment.i(local);

    			mobilitiestable.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			addmobilitymodal.$$.fragment.o(local);
    			editmobilitymodal.$$.fragment.o(local);
    			mobilitiestable.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			addmobilitymodal.$destroy(detaching);

    			if (detaching) {
    				detach(t0);
    			}

    			editmobilitymodal.$destroy(detaching);

    			if (detaching) {
    				detach(t1);
    				detach(div1);
    			}

    			mobilitiestable.$destroy();

    			run_all(dispose);
    		}
    	};
    }

    function create_fragment$d(ctx) {
    	var if_block_anchor, current;

    	var if_block = (ctx.is_logged_in) && create_if_block$8(ctx);

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.is_logged_in) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					if_block.i(1);
    				} else {
    					if_block = create_if_block$8(ctx);
    					if_block.c();
    					if_block.i(1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();
    				on_outro(() => {
    					if_block.d(1);
    					if_block = null;
    				});

    				if_block.o(1);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (if_block) if_block.i();
    			current = true;
    		},

    		o: function outro(local) {
    			if (if_block) if_block.o();
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    function instance$d($$self, $$props, $$invalidate) {
    	

        let { id, is_logged_in, getToken } = $$props;

        let mobilities = [];
        let partners = [];
        let selectedRows = [];

        let confirm_del = false;
        let isAddModalOpen = false;
        let isEditModalOpen = false;

        function toggleRowSelect(id) {
        	let index = selectedRows.indexOf(id);
        	if(index === -1){
                $$invalidate('selectedRows', selectedRows = [...selectedRows, id]);
        	}else {
                selectedRows.splice(index, 1);
                $$invalidate('selectedRows', selectedRows);
        	}

        	console.log(selectedRows);
        }

        function handleOutsideTableClick(event) {
            if (event.target.tagName.toLowerCase() === "button"){
                return;
            }
            let table = event.currentTarget.querySelector("table");
            if(table != null){
                if(table.contains(event.target)){
                    return;
                }
            }

            $$invalidate('confirm_del', confirm_del = false);
            $$invalidate('selectedRows', selectedRows = []);
        }

        function handleDeleteClick(event) {
        	let del_btn_el = event.currentTarget;
        	if(!del_btn_el.classList.contains("disabled")){
        	    if (!confirm_del) {
                   $$invalidate('confirm_del', confirm_del = true);
        	    } else if(selectedRows.length > 0) {
                    axios$1.delete("/api/delete/mobilities", {
                        data: {
                            rows: selectedRows
                        },
                        headers: {
                            Authorization: getToken()
                        }
                    }).then(res => {
                        $$invalidate('confirm_del', confirm_del = false);
                        $$invalidate('selectedRows', selectedRows = []);
                        getMobilities();
                    }).catch(err => {
                        console.log(err.response);
                    });
                }
        	}
        }

        function setIsAddModalOpen(value){
        	$$invalidate('isAddModalOpen', isAddModalOpen = value);
        }

        function setIsEditModalOpen(value){
        	$$invalidate('isEditModalOpen', isEditModalOpen = value);
        }

        function getMobilities() {
        	console.log("Attempting to fetch mobilities");
            axios$1.get(`/api/get/mobilities${id != null ? `?IDProject=${id}` : ""}`, {headers: {Authorization: getToken()}}).then(function(res) {
            	$$invalidate('mobilities', mobilities = res.data);
            	console.log("Mobilities fetched successfully");
            }).catch(err => {
            	console.log("There was an error fetching the mobilities");
            	console.log(err.response);
            });
        }

        function getPartners() {
        	console.log("Attempting to fetch partners");
        	axios$1.get("/api/get/partners", {headers: {Authorization: getToken()}}).then(res => {
        		$$invalidate('partners', partners = res.data);
        		console.log("Successfully fetched partners");
        	}).catch(err => {
        		console.log("There was an error fetching the partners");
        		console.log(err.response);
        	});
        }

        function handleAddButtonClick(){
        	if (partners.length === 0) {
                getPartners();
            }
            setIsAddModalOpen(true);
        }

        function handleEditButtonClick(){
        	if(selectedRows.length === 1){
                if (partners.length === 0) {
                    getPartners();
                }
        		setIsEditModalOpen(true);
        	}
        }

    	const writable_props = ['id', 'is_logged_in', 'getToken'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Mobilities> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('id' in $$props) $$invalidate('id', id = $$props.id);
    		if ('is_logged_in' in $$props) $$invalidate('is_logged_in', is_logged_in = $$props.is_logged_in);
    		if ('getToken' in $$props) $$invalidate('getToken', getToken = $$props.getToken);
    	};

    	$$self.$$.update = ($$dirty = { is_logged_in: 1 }) => {
    		if ($$dirty.is_logged_in) { if (is_logged_in) {
                	console.log("Hello");
                	getMobilities();
                } }
    	};

    	return {
    		id,
    		is_logged_in,
    		getToken,
    		mobilities,
    		partners,
    		selectedRows,
    		confirm_del,
    		isAddModalOpen,
    		isEditModalOpen,
    		toggleRowSelect,
    		handleOutsideTableClick,
    		handleDeleteClick,
    		setIsAddModalOpen,
    		setIsEditModalOpen,
    		getMobilities,
    		handleAddButtonClick,
    		handleEditButtonClick
    	};
    }

    class Mobilities extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, ["id", "is_logged_in", "getToken"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.id === undefined && !('id' in props)) {
    			console.warn("<Mobilities> was created without expected prop 'id'");
    		}
    		if (ctx.is_logged_in === undefined && !('is_logged_in' in props)) {
    			console.warn("<Mobilities> was created without expected prop 'is_logged_in'");
    		}
    		if (ctx.getToken === undefined && !('getToken' in props)) {
    			console.warn("<Mobilities> was created without expected prop 'getToken'");
    		}
    	}

    	get id() {
    		throw new Error("<Mobilities>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Mobilities>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get is_logged_in() {
    		throw new Error("<Mobilities>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set is_logged_in(value) {
    		throw new Error("<Mobilities>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getToken() {
    		throw new Error("<Mobilities>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getToken(value) {
    		throw new Error("<Mobilities>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\mobility_students\MobilityStudents.svelte generated by Svelte v3.5.1 */

    const file$c = "src\\components\\mobility_students\\MobilityStudents.svelte";

    // (263:0) {#if is_logged_in}
    function create_if_block$9(ctx) {
    	var t0, t1, div1, div0, h2, span0, t3, h3, span1, t4, t5, span2, button0, t7, button1, t8, button1_class_value, t9, button2, t10_value = ctx.confirm_del ? "Are you sure?" : "Delete", t10, button2_class_value, t11, current, dispose;

    	var basicmodal0 = new BasicModal({
    		props: {
    		mode: "add",
    		getToken: ctx.getToken,
    		table: "students",
    		fields: ctx.add_modal_fields,
    		table_title: "Students",
    		isOpen: ctx.isAddModalOpen,
    		setIsOpen: ctx.setIsAddModalOpen,
    		onAdd: ctx.getMobilityStudents
    	},
    		$$inline: true
    	});

    	var basicmodal1 = new BasicModal({
    		props: {
    		mode: "edit",
    		getToken: ctx.getToken,
    		table: "students",
    		fields: ctx.edit_modal_fields,
    		table_title: "Students",
    		isOpen: ctx.isEditModalOpen,
    		setIsOpen: ctx.setIsEditModalOpen,
    		onEdit: ctx.getMobilityStudents
    	},
    		$$inline: true
    	});

    	var basictable = new BasicTable({
    		props: {
    		getToken: ctx.getToken,
    		table: "mobilities_students",
    		table_headers: ctx.table_headers,
    		data: ctx.mobility_students,
    		toggle_fields: ctx.toggle_fields,
    		onToggle: ctx.getMobilityStudents,
    		selectedRows: ctx.selectedRows,
    		toggleRowSelect: ctx.toggleRowSelect,
    		selection_field: selection_field
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			basicmodal0.$$.fragment.c();
    			t0 = space();
    			basicmodal1.$$.fragment.c();
    			t1 = space();
    			div1 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			span0 = element("span");
    			span0.textContent = "Mobility Students";
    			t3 = space();
    			h3 = element("h3");
    			span1 = element("span");
    			t4 = text(ctx.mobility);
    			t5 = space();
    			span2 = element("span");
    			button0 = element("button");
    			button0.textContent = "Add +";
    			t7 = space();
    			button1 = element("button");
    			t8 = text("Edit");
    			t9 = space();
    			button2 = element("button");
    			t10 = text(t10_value);
    			t11 = space();
    			basictable.$$.fragment.c();
    			span0.className = "border-bottom-3px border-top-3px border-dark px-2 d-inline-block";
    			add_location(span0, file$c, 267, 39, 8365);
    			h2.className = "mb-3 text-dark";
    			add_location(h2, file$c, 267, 12, 8338);
    			span1.className = "border-bottom-3px border-top-3px border-dark px-2 d-inline-block";
    			add_location(span1, file$c, 268, 39, 8514);
    			h3.className = "mb-3 text-dark";
    			add_location(h3, file$c, 268, 12, 8487);
    			button0.className = "btn btn-success mb-2";
    			add_location(button0, file$c, 270, 16, 8653);
    			button1.className = button1_class_value = ctx.selectedRows.length !== 1 ? 'btn btn-info mb-2 mx-2 disabled' : 'btn btn-info mb-2 mx-2';
    			button1.id = "edit-btn";
    			add_location(button1, file$c, 271, 16, 8754);
    			button2.className = button2_class_value = `btn btn-danger mb-2 ${ctx.selectedRows.length >= 1 ? '' : 'disabled'}`;
    			button2.id = "delete-btn";
    			add_location(button2, file$c, 272, 16, 8939);
    			add_location(span2, file$c, 269, 12, 8629);
    			div0.className = "container rounded p-4 bg-light shadow h-max-100 d-flex flex-flow-column";
    			add_location(div0, file$c, 266, 8, 8239);
    			div1.className = "p-5 position-absolute bottom-0px top-76px left-0px right-0px";
    			add_location(div1, file$c, 265, 4, 8120);

    			dispose = [
    				listen(button0, "click", ctx.handleAddButtonClick),
    				listen(button1, "click", ctx.handleEditButtonClick),
    				listen(button2, "click", ctx.handleDeleteClick),
    				listen(div1, "click", ctx.handleOutsideTableClick)
    			];
    		},

    		m: function mount(target, anchor) {
    			mount_component(basicmodal0, target, anchor);
    			insert(target, t0, anchor);
    			mount_component(basicmodal1, target, anchor);
    			insert(target, t1, anchor);
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, h2);
    			append(h2, span0);
    			append(div0, t3);
    			append(div0, h3);
    			append(h3, span1);
    			append(span1, t4);
    			append(div0, t5);
    			append(div0, span2);
    			append(span2, button0);
    			append(span2, t7);
    			append(span2, button1);
    			append(button1, t8);
    			append(span2, t9);
    			append(span2, button2);
    			append(button2, t10);
    			append(div0, t11);
    			mount_component(basictable, div0, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var basicmodal0_changes = {};
    			if (changed.getToken) basicmodal0_changes.getToken = ctx.getToken;
    			if (changed.add_modal_fields) basicmodal0_changes.fields = ctx.add_modal_fields;
    			if (changed.isAddModalOpen) basicmodal0_changes.isOpen = ctx.isAddModalOpen;
    			if (changed.setIsAddModalOpen) basicmodal0_changes.setIsOpen = ctx.setIsAddModalOpen;
    			if (changed.getMobilityStudents) basicmodal0_changes.onAdd = ctx.getMobilityStudents;
    			basicmodal0.$set(basicmodal0_changes);

    			var basicmodal1_changes = {};
    			if (changed.getToken) basicmodal1_changes.getToken = ctx.getToken;
    			if (changed.edit_modal_fields) basicmodal1_changes.fields = ctx.edit_modal_fields;
    			if (changed.isEditModalOpen) basicmodal1_changes.isOpen = ctx.isEditModalOpen;
    			if (changed.setIsEditModalOpen) basicmodal1_changes.setIsOpen = ctx.setIsEditModalOpen;
    			if (changed.getMobilityStudents) basicmodal1_changes.onEdit = ctx.getMobilityStudents;
    			basicmodal1.$set(basicmodal1_changes);

    			if (!current || changed.mobility) {
    				set_data(t4, ctx.mobility);
    			}

    			if ((!current || changed.selectedRows) && button1_class_value !== (button1_class_value = ctx.selectedRows.length !== 1 ? 'btn btn-info mb-2 mx-2 disabled' : 'btn btn-info mb-2 mx-2')) {
    				button1.className = button1_class_value;
    			}

    			if ((!current || changed.confirm_del) && t10_value !== (t10_value = ctx.confirm_del ? "Are you sure?" : "Delete")) {
    				set_data(t10, t10_value);
    			}

    			if ((!current || changed.selectedRows) && button2_class_value !== (button2_class_value = `btn btn-danger mb-2 ${ctx.selectedRows.length >= 1 ? '' : 'disabled'}`)) {
    				button2.className = button2_class_value;
    			}

    			var basictable_changes = {};
    			if (changed.getToken) basictable_changes.getToken = ctx.getToken;
    			if (changed.table_headers) basictable_changes.table_headers = ctx.table_headers;
    			if (changed.mobility_students) basictable_changes.data = ctx.mobility_students;
    			if (changed.toggle_fields) basictable_changes.toggle_fields = ctx.toggle_fields;
    			if (changed.getMobilityStudents) basictable_changes.onToggle = ctx.getMobilityStudents;
    			if (changed.selectedRows) basictable_changes.selectedRows = ctx.selectedRows;
    			if (changed.toggleRowSelect) basictable_changes.toggleRowSelect = ctx.toggleRowSelect;
    			if (changed.selection_field) basictable_changes.selection_field = selection_field;
    			basictable.$set(basictable_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			basicmodal0.$$.fragment.i(local);

    			basicmodal1.$$.fragment.i(local);

    			basictable.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			basicmodal0.$$.fragment.o(local);
    			basicmodal1.$$.fragment.o(local);
    			basictable.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			basicmodal0.$destroy(detaching);

    			if (detaching) {
    				detach(t0);
    			}

    			basicmodal1.$destroy(detaching);

    			if (detaching) {
    				detach(t1);
    				detach(div1);
    			}

    			basictable.$destroy();

    			run_all(dispose);
    		}
    	};
    }

    function create_fragment$e(ctx) {
    	var if_block_anchor, current;

    	var if_block = (ctx.is_logged_in) && create_if_block$9(ctx);

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.is_logged_in) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					if_block.i(1);
    				} else {
    					if_block = create_if_block$9(ctx);
    					if_block.c();
    					if_block.i(1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();
    				on_outro(() => {
    					if_block.d(1);
    					if_block = null;
    				});

    				if_block.o(1);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (if_block) if_block.i();
    			current = true;
    		},

    		o: function outro(local) {
    			if (if_block) if_block.o();
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    let selection_field = "IDStudent";

    function instance$e($$self, $$props, $$invalidate) {
    	

        let { is_logged_in, getToken, id } = $$props;

        let selectedRows = [];

        let mobility_students = [];
        let student_groups = [];
        let genders = [
        	{
        		display: "Male",
        		value: "Male",
        	},
        	{
        		display: "Female",
        		value: "Female",
        	}
        ];

        let mobility = "";

        let table_headers = [
            {columnName: ' ', key: "isParticipating", toggler: true},
            {columnName: "Name", key: "name"},
            {columnName: "Student #", key: "studentNumber"},
            {columnName: "Age", key: "age"},
            {columnName: "Gender", key: "gender"},
            {columnName: "Email", key: "email"},
        ];
        let toggle_fields = [
        	{field: "IDMobility"},
        	{field: "IDStudent"}
        ];


        let confirm_del = false;

        let isAddModalOpen = false;
        let isEditModalOpen = false;

        let add_modal_fields = {
        	fields: [{
        		field: "studentNumber",
        	    type: "text",
        	    display: "Student #",
        	    placeholder: "eg. a701617004",
        	    value: ""
            }, {
        	    field: "name",
        	    type: "text",
        	    display: "Name",
        	    placeholder: "eg. Vasco Raminhos",
        	    value: ""
            }, {
        	    field: "birthday",
        	    type: "date",
        	    display: "Birthday",
        	    placeholder: "",
        	    value: ""
            }, {
        	    field: "gender",
        	    type: "select",
        	    display: "Gender",
        	    placeholder: "Choose a gender",
        	    value: "",
        	    options: genders
            }, {
                field: "email",
                type: "email",
                display: "Email",
                placeholder: "eg. student.email@gmail.com",
                value: ""
            }, {
                field: "IDClass",
                type: "select",
                display: "Class",
                placeholder: "Choose the student's class",
                value: "",
                options: student_groups
            }]
        };
        let edit_modal_fields = {
        	ID: null,
        	fields: [{
        		field: "studentNumber",
        	    type: "text",
        	    display: "Student #",
        	    placeholder: "eg. a701617004",
        	    value: ""
            }, {
        	    field: "name",
        	    type: "text",
        	    display: "Name",
        	    placeholder: "eg. Vasco Raminhos",
        	    value: ""
            }, {
        	    field: "birthday",
        	    type: "date",
        	    display: "Birthday",
        	    placeholder: "",
        	    value: ""
            }, {
        	    field: "gender",
        	    type: "select",
        	    display: "Gender",
        	    placeholder: "Choose a gender",
        	    value: "",
        	    options: genders
            }, {
                field: "email",
                type: "email",
                display: "Email",
                placeholder: "eg. student.email@gmail.com",
                value: ""
            }, {
                field: "IDClass",
                type: "select",
                display: "Class",
                placeholder: "Choose the student's class",
                value: "",
                options: student_groups
            }]
        };

        function getMobilityStudents(){
        	axios$1.get(`/api/get/mobility_students?IDMobility=${id}`, {headers: {Authorization: getToken()}}).then(function(res) {
        		$$invalidate('mobility_students', mobility_students = res.data);
        		for(let i = 0; i < mobility_students.length; i++) {
                    let age = new Date(new Date() - new Date(mobility_students[i].birthday)).getFullYear() - 1970;
                    if(isNaN(age)){
                        age = 0;
                    }
                    mobility_students[i].age = age; $$invalidate('mobility_students', mobility_students);
                    console.log(age);
                }
        		$$invalidate('mobility', mobility = res.data[0].mobility);
        		console.log(res.data);
        	}).catch(err => {
        		console.log(err.response);
        	});
        }


        function getStudentGroups() {
        	console.log("Trying to fetch classes");
            axios$1.get("/api/get/studentgroups", {headers: {Authorization: getToken()}}).then(function(res) {
                for(let i = 0; i < res.data.length; i++) {
                    student_groups.push({value: res.data[i].ID, display: res.data[i].grade + res.data[i].designation, original: res.data[i]});
                }
                $$invalidate('add_modal_fields', add_modal_fields);
                $$invalidate('edit_modal_fields', edit_modal_fields);
            }).catch(err => {
            	console.log(err.response);
            });
        }

        function toggleRowSelect(id) {
        	let index = selectedRows.indexOf(id);
        	if(index === -1){
                $$invalidate('selectedRows', selectedRows = [...selectedRows, id]);
        	}else {
                selectedRows.splice(index, 1);
                $$invalidate('selectedRows', selectedRows);
        	}

        	console.log(selectedRows);
        }

        function handleOutsideTableClick(event) {
            if (event.target.tagName.toLowerCase() === "button"){
                return;
            }
            let table = event.currentTarget.querySelector("table");
            if(table != null ){
                if(table.contains(event.target)){
                    console.log("Hello there General Kenobi");
                    return;
                }
            }

            $$invalidate('confirm_del', confirm_del = false);
            $$invalidate('selectedRows', selectedRows = []);
        }

        function setIsAddModalOpen(value){
        	$$invalidate('isAddModalOpen', isAddModalOpen = value);
        }

        function setIsEditModalOpen(value){
        	$$invalidate('isEditModalOpen', isEditModalOpen = value);
        }

        function handleAddButtonClick(){
        	if (student_groups.length === 0) {
        	    getStudentGroups();
        	}

            setIsAddModalOpen(true);
        }

        function handleEditButtonClick(){
        	if(selectedRows.length === 1){
        		if (student_groups.length === 0) {
                    getStudentGroups();
                }
                for (let i = 0; i < mobility_students.length; i++) {
                    if (mobility_students[i][selection_field] === selectedRows[0]) {
                    	edit_modal_fields.ID = selectedRows[0]; $$invalidate('edit_modal_fields', edit_modal_fields);
        		        for (let j = 0; j < edit_modal_fields.fields.length; j++) {
        		        	if (edit_modal_fields.fields[j].type === "date") {
                                edit_modal_fields.fields[j].value = mobility_students[i][edit_modal_fields.fields[j].field].slice(0, -14); $$invalidate('edit_modal_fields', edit_modal_fields);
                                console.log(mobility_students[i][edit_modal_fields.fields[j].field]);
        		        	} else {
                                edit_modal_fields.fields[j].value = mobility_students[i][edit_modal_fields.fields[j].field]; $$invalidate('edit_modal_fields', edit_modal_fields);
                                console.log(edit_modal_fields.fields[j].value);
        		        	}
        			    }
        			}
        		}

        		setIsEditModalOpen(true);
        	}
        }

        function handleDeleteClick(event) {
        	let del_btn_el = event.currentTarget;
        	if(!del_btn_el.classList.contains("disabled")){
        	    if(!confirm_del){
                   $$invalidate('confirm_del', confirm_del = true);
        	    }else if(selectedRows.length > 0){
                    axios$1.delete("/api/delete/students", {
                        data: {
                            rows: selectedRows
                        },
                        headers: {
                            Authorization: getToken()
                        }
                    }).then(res => {
                    	$$invalidate('confirm_del', confirm_del = false);
                    	$$invalidate('selectedRows', selectedRows = []);
                        getMobilityStudents();
                    }).catch(err =>{
                        console.log(err.response);
                    });
                }
        	}
        }

    	const writable_props = ['is_logged_in', 'getToken', 'id'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<MobilityStudents> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('is_logged_in' in $$props) $$invalidate('is_logged_in', is_logged_in = $$props.is_logged_in);
    		if ('getToken' in $$props) $$invalidate('getToken', getToken = $$props.getToken);
    		if ('id' in $$props) $$invalidate('id', id = $$props.id);
    	};

    	$$self.$$.update = ($$dirty = { is_logged_in: 1 }) => {
    		if ($$dirty.is_logged_in) { if(is_logged_in){
                	getMobilityStudents();
                } }
    	};

    	return {
    		is_logged_in,
    		getToken,
    		id,
    		selectedRows,
    		mobility_students,
    		mobility,
    		table_headers,
    		toggle_fields,
    		confirm_del,
    		isAddModalOpen,
    		isEditModalOpen,
    		add_modal_fields,
    		edit_modal_fields,
    		getMobilityStudents,
    		toggleRowSelect,
    		handleOutsideTableClick,
    		setIsAddModalOpen,
    		setIsEditModalOpen,
    		handleAddButtonClick,
    		handleEditButtonClick,
    		handleDeleteClick
    	};
    }

    class MobilityStudents extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, ["is_logged_in", "getToken", "id"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.is_logged_in === undefined && !('is_logged_in' in props)) {
    			console.warn("<MobilityStudents> was created without expected prop 'is_logged_in'");
    		}
    		if (ctx.getToken === undefined && !('getToken' in props)) {
    			console.warn("<MobilityStudents> was created without expected prop 'getToken'");
    		}
    		if (ctx.id === undefined && !('id' in props)) {
    			console.warn("<MobilityStudents> was created without expected prop 'id'");
    		}
    	}

    	get is_logged_in() {
    		throw new Error("<MobilityStudents>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set is_logged_in(value) {
    		throw new Error("<MobilityStudents>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getToken() {
    		throw new Error("<MobilityStudents>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getToken(value) {
    		throw new Error("<MobilityStudents>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<MobilityStudents>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<MobilityStudents>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\mobility_teachers\MobilityTeachers.svelte generated by Svelte v3.5.1 */

    const file$d = "src\\components\\mobility_teachers\\MobilityTeachers.svelte";

    // (230:0) {#if is_logged_in}
    function create_if_block$a(ctx) {
    	var t0, t1, div1, div0, h2, span0, t3, h3, span1, t4, t5, span2, button0, t7, button1, t8, button1_class_value, t9, button2, t10_value = ctx.confirm_del ? "Are you sure?" : "Delete", t10, button2_class_value, t11, current, dispose;

    	var basicmodal0 = new BasicModal({
    		props: {
    		mode: "add",
    		getToken: ctx.getToken,
    		table: "teachers",
    		fields: ctx.add_modal_fields,
    		table_title: "Teachers",
    		isOpen: ctx.isAddModalOpen,
    		setIsOpen: ctx.setIsAddModalOpen,
    		onAdd: ctx.getMobilityTeachers
    	},
    		$$inline: true
    	});

    	var basicmodal1 = new BasicModal({
    		props: {
    		mode: "edit",
    		getToken: ctx.getToken,
    		table: "teachers",
    		fields: ctx.edit_modal_fields,
    		table_title: "Teachers",
    		isOpen: ctx.isEditModalOpen,
    		setIsOpen: ctx.setIsEditModalOpen,
    		onEdit: ctx.getMobilityTeachers
    	},
    		$$inline: true
    	});

    	var basictable = new BasicTable({
    		props: {
    		getToken: ctx.getToken,
    		table: "mobilities_teachers",
    		table_headers: ctx.table_headers,
    		data: ctx.mobility_teachers,
    		toggle_fields: ctx.toggle_fields,
    		onToggle: ctx.getMobilityTeachers,
    		selectedRows: ctx.selectedRows,
    		toggleRowSelect: ctx.toggleRowSelect,
    		selection_field: selection_field$1
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			basicmodal0.$$.fragment.c();
    			t0 = space();
    			basicmodal1.$$.fragment.c();
    			t1 = space();
    			div1 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			span0 = element("span");
    			span0.textContent = "Mobility Teachers";
    			t3 = space();
    			h3 = element("h3");
    			span1 = element("span");
    			t4 = text(ctx.mobility);
    			t5 = space();
    			span2 = element("span");
    			button0 = element("button");
    			button0.textContent = "Add +";
    			t7 = space();
    			button1 = element("button");
    			t8 = text("Edit");
    			t9 = space();
    			button2 = element("button");
    			t10 = text(t10_value);
    			t11 = space();
    			basictable.$$.fragment.c();
    			span0.className = "border-bottom-3px border-top-3px border-dark px-2 d-inline-block";
    			add_location(span0, file$d, 234, 39, 7445);
    			h2.className = "mb-3 text-dark";
    			add_location(h2, file$d, 234, 12, 7418);
    			span1.className = "border-bottom-3px border-top-3px border-dark px-2 d-inline-block";
    			add_location(span1, file$d, 235, 39, 7594);
    			h3.className = "mb-3 text-dark";
    			add_location(h3, file$d, 235, 12, 7567);
    			button0.className = "btn btn-success mb-2";
    			add_location(button0, file$d, 237, 16, 7733);
    			button1.className = button1_class_value = ctx.selectedRows.length !== 1 ? 'btn btn-info mb-2 mx-2 disabled' : 'btn btn-info mb-2 mx-2';
    			button1.id = "edit-btn";
    			add_location(button1, file$d, 238, 16, 7834);
    			button2.className = button2_class_value = `btn btn-danger mb-2 ${ctx.selectedRows.length >= 1 ? '' : 'disabled'}`;
    			button2.id = "delete-btn";
    			add_location(button2, file$d, 239, 16, 8019);
    			add_location(span2, file$d, 236, 12, 7709);
    			div0.className = "container rounded p-4 bg-light shadow h-max-100 d-flex flex-flow-column";
    			add_location(div0, file$d, 233, 8, 7319);
    			div1.className = "p-5 position-absolute bottom-0px top-76px left-0px right-0px";
    			add_location(div1, file$d, 232, 4, 7200);

    			dispose = [
    				listen(button0, "click", ctx.handleAddButtonClick),
    				listen(button1, "click", ctx.handleEditButtonClick),
    				listen(button2, "click", ctx.handleDeleteClick),
    				listen(div1, "click", ctx.handleOutsideTableClick)
    			];
    		},

    		m: function mount(target, anchor) {
    			mount_component(basicmodal0, target, anchor);
    			insert(target, t0, anchor);
    			mount_component(basicmodal1, target, anchor);
    			insert(target, t1, anchor);
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, h2);
    			append(h2, span0);
    			append(div0, t3);
    			append(div0, h3);
    			append(h3, span1);
    			append(span1, t4);
    			append(div0, t5);
    			append(div0, span2);
    			append(span2, button0);
    			append(span2, t7);
    			append(span2, button1);
    			append(button1, t8);
    			append(span2, t9);
    			append(span2, button2);
    			append(button2, t10);
    			append(div0, t11);
    			mount_component(basictable, div0, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var basicmodal0_changes = {};
    			if (changed.getToken) basicmodal0_changes.getToken = ctx.getToken;
    			if (changed.add_modal_fields) basicmodal0_changes.fields = ctx.add_modal_fields;
    			if (changed.isAddModalOpen) basicmodal0_changes.isOpen = ctx.isAddModalOpen;
    			if (changed.setIsAddModalOpen) basicmodal0_changes.setIsOpen = ctx.setIsAddModalOpen;
    			if (changed.getMobilityTeachers) basicmodal0_changes.onAdd = ctx.getMobilityTeachers;
    			basicmodal0.$set(basicmodal0_changes);

    			var basicmodal1_changes = {};
    			if (changed.getToken) basicmodal1_changes.getToken = ctx.getToken;
    			if (changed.edit_modal_fields) basicmodal1_changes.fields = ctx.edit_modal_fields;
    			if (changed.isEditModalOpen) basicmodal1_changes.isOpen = ctx.isEditModalOpen;
    			if (changed.setIsEditModalOpen) basicmodal1_changes.setIsOpen = ctx.setIsEditModalOpen;
    			if (changed.getMobilityTeachers) basicmodal1_changes.onEdit = ctx.getMobilityTeachers;
    			basicmodal1.$set(basicmodal1_changes);

    			if (!current || changed.mobility) {
    				set_data(t4, ctx.mobility);
    			}

    			if ((!current || changed.selectedRows) && button1_class_value !== (button1_class_value = ctx.selectedRows.length !== 1 ? 'btn btn-info mb-2 mx-2 disabled' : 'btn btn-info mb-2 mx-2')) {
    				button1.className = button1_class_value;
    			}

    			if ((!current || changed.confirm_del) && t10_value !== (t10_value = ctx.confirm_del ? "Are you sure?" : "Delete")) {
    				set_data(t10, t10_value);
    			}

    			if ((!current || changed.selectedRows) && button2_class_value !== (button2_class_value = `btn btn-danger mb-2 ${ctx.selectedRows.length >= 1 ? '' : 'disabled'}`)) {
    				button2.className = button2_class_value;
    			}

    			var basictable_changes = {};
    			if (changed.getToken) basictable_changes.getToken = ctx.getToken;
    			if (changed.table_headers) basictable_changes.table_headers = ctx.table_headers;
    			if (changed.mobility_teachers) basictable_changes.data = ctx.mobility_teachers;
    			if (changed.toggle_fields) basictable_changes.toggle_fields = ctx.toggle_fields;
    			if (changed.getMobilityTeachers) basictable_changes.onToggle = ctx.getMobilityTeachers;
    			if (changed.selectedRows) basictable_changes.selectedRows = ctx.selectedRows;
    			if (changed.toggleRowSelect) basictable_changes.toggleRowSelect = ctx.toggleRowSelect;
    			if (changed.selection_field) basictable_changes.selection_field = selection_field$1;
    			basictable.$set(basictable_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			basicmodal0.$$.fragment.i(local);

    			basicmodal1.$$.fragment.i(local);

    			basictable.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			basicmodal0.$$.fragment.o(local);
    			basicmodal1.$$.fragment.o(local);
    			basictable.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			basicmodal0.$destroy(detaching);

    			if (detaching) {
    				detach(t0);
    			}

    			basicmodal1.$destroy(detaching);

    			if (detaching) {
    				detach(t1);
    				detach(div1);
    			}

    			basictable.$destroy();

    			run_all(dispose);
    		}
    	};
    }

    function create_fragment$f(ctx) {
    	var if_block_anchor, current;

    	var if_block = (ctx.is_logged_in) && create_if_block$a(ctx);

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.is_logged_in) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					if_block.i(1);
    				} else {
    					if_block = create_if_block$a(ctx);
    					if_block.c();
    					if_block.i(1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();
    				on_outro(() => {
    					if_block.d(1);
    					if_block = null;
    				});

    				if_block.o(1);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (if_block) if_block.i();
    			current = true;
    		},

    		o: function outro(local) {
    			if (if_block) if_block.o();
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    let selection_field$1 = "IDTeacher";

    function instance$f($$self, $$props, $$invalidate) {
    	

        let { is_logged_in, getToken, id } = $$props;

        let selectedRows = [];

        let mobility_teachers = [];
        let genders = [
            {
                display: "Male",
                value: "Male",
            },
            {
                display: "Female",
                value: "Female",
            }
        ];

        let mobility = "";

        let table_headers = [
            {columnName: ' ', key: "isParticipating", toggler: true},
            {columnName: "Name", key: "name"},
            {columnName: "Teacher #", key: "teacherNumber"},
            {columnName: 'Age', key: "age"},
            {columnName: 'Gender', key: "gender"},
            {columnName: 'Email', key: "email"},
            {columnName: 'Actions', actions: [
                {icon: "fa-book", link: "/svelte/teacher_subjects/", query_field: "IDTeacher"}
            ]},
        ];
        let toggle_fields = [
        	{field: "IDMobility"},
        	{field: "IDTeacher"}
        ];


        let confirm_del = false;

        let isAddModalOpen = false;
        let isEditModalOpen = false;

        let add_modal_fields = {
        	fields: [{
                field: "teacherNumber",
                type: "text",
                display: "Teacher #",
                placeholder: "eg. p701617004",
                value: ""
            }, {
                field: "name",
                type: "text",
                display: "Name",
                placeholder: "eg. Duarte Duarte",
                value: ""
            }, {
                field: "birthday",
                type: "date",
                display: "Birthday",
                placeholder: "",
                value: ""
            }, {
                field: "gender",
                type: "select",
                display: "Gender",
                placeholder: "Choose a gender",
                value: "",
                options: genders
            }, {
                field: "email",
                type: "email",
                display: "Email",
                placeholder: "eg. teacher.email@gmail.com",
                value: ""
            }]
        };
        let edit_modal_fields = {
        	ID: null,
        	fields: [{
                field: "teacherNumber",
                type: "text",
                display: "Teacher #",
                placeholder: "eg. p701617004",
                value: ""
            }, {
                field: "name",
                type: "text",
                display: "Name",
                placeholder: "eg. Duarte Duarte",
                value: ""
            }, {
                field: "birthday",
                type: "date",
                display: "Birthday",
                placeholder: "",
                value: ""
            }, {
                field: "gender",
                type: "select",
                display: "Gender",
                placeholder: "Choose a gender",
                value: "",
                options: genders
            }, {
                field: "email",
                type: "email",
                display: "Email",
                placeholder: "eg. teacher.email@gmail.com",
                value: ""
            }]
        };

        function getMobilityTeachers(){
        	axios$1.get(`/api/get/mobility_teachers?IDMobility=${id}`, {headers: {Authorization: getToken()}}).then(function(res) {
        		$$invalidate('mobility_teachers', mobility_teachers = res.data);
        		$$invalidate('mobility', mobility = res.data[0].mobility);
        		for(let i = 0; i < mobility_teachers.length; i++) {
                    let age = new Date(new Date() - new Date(mobility_teachers[i].birthday)).getFullYear() - 1970;
                    if(isNaN(age)){
                        age = 0;
                    }
                    mobility_teachers[i].age = age; $$invalidate('mobility_teachers', mobility_teachers);
                    console.log(age);
                }
        		console.log(res.data);
        	}).catch(err => {
        		console.log(err.response);
        	});
        }

        function toggleRowSelect(id) {
        	let index = selectedRows.indexOf(id);
        	if(index === -1){
                $$invalidate('selectedRows', selectedRows = [...selectedRows, id]);
        	}else {
                selectedRows.splice(index, 1);
                $$invalidate('selectedRows', selectedRows);
        	}

        	console.log(selectedRows);
        }

        function handleOutsideTableClick(event) {
            if (event.target.tagName.toLowerCase() === "button"){
                return;
            }
            let table = event.currentTarget.querySelector("table");
            if(table != null ){
                if(table.contains(event.target)){
                    console.log("Hello there General Kenobi");
                    return;
                }
            }

            $$invalidate('confirm_del', confirm_del = false);
            $$invalidate('selectedRows', selectedRows = []);
        }

        function setIsAddModalOpen(value){
        	$$invalidate('isAddModalOpen', isAddModalOpen = value);
        }

        function setIsEditModalOpen(value){
        	$$invalidate('isEditModalOpen', isEditModalOpen = value);
        }

        function handleAddButtonClick(){
            setIsAddModalOpen(true);
        }

        function handleEditButtonClick(){
        	if(selectedRows.length === 1){
                for (let i = 0; i < mobility_teachers.length; i++) {
                    if (mobility_teachers[i][selection_field$1] === selectedRows[0]) {
                    	edit_modal_fields.ID = selectedRows[0]; $$invalidate('edit_modal_fields', edit_modal_fields);
        		        for (let j = 0; j < edit_modal_fields.fields.length; j++) {
        		        	if (edit_modal_fields.fields[j].type === "date") {
                                edit_modal_fields.fields[j].value = mobility_teachers[i][edit_modal_fields.fields[j].field].slice(0, -14); $$invalidate('edit_modal_fields', edit_modal_fields);
                                console.log(mobility_teachers[i][edit_modal_fields.fields[j].field]);
        		        	} else {
                                edit_modal_fields.fields[j].value = mobility_teachers[i][edit_modal_fields.fields[j].field]; $$invalidate('edit_modal_fields', edit_modal_fields);
                                console.log(edit_modal_fields.fields[j].value);
        		        	}
        			    }
        			}
        		}

        		setIsEditModalOpen(true);
        	}
        }

        function handleDeleteClick(event) {
        	let del_btn_el = event.currentTarget;
        	if(!del_btn_el.classList.contains("disabled")){
        	    if(!confirm_del){
                   $$invalidate('confirm_del', confirm_del = true);
        	    }else if(selectedRows.length > 0){
                    axios$1.delete("/api/delete/teachers", {
                        data: {
                            rows: selectedRows
                        },
                        headers: {
                            Authorization: getToken()
                        }
                    }).then(res => {
                    	$$invalidate('confirm_del', confirm_del = false);
                    	$$invalidate('selectedRows', selectedRows = []);
                        getMobilityTeachers();
                    }).catch(err =>{
                        console.log(err.response);
                    });
                }
        	}
        }

    	const writable_props = ['is_logged_in', 'getToken', 'id'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<MobilityTeachers> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('is_logged_in' in $$props) $$invalidate('is_logged_in', is_logged_in = $$props.is_logged_in);
    		if ('getToken' in $$props) $$invalidate('getToken', getToken = $$props.getToken);
    		if ('id' in $$props) $$invalidate('id', id = $$props.id);
    	};

    	$$self.$$.update = ($$dirty = { is_logged_in: 1 }) => {
    		if ($$dirty.is_logged_in) { if(is_logged_in){
                	getMobilityTeachers();
                } }
    	};

    	return {
    		is_logged_in,
    		getToken,
    		id,
    		selectedRows,
    		mobility_teachers,
    		mobility,
    		table_headers,
    		toggle_fields,
    		confirm_del,
    		isAddModalOpen,
    		isEditModalOpen,
    		add_modal_fields,
    		edit_modal_fields,
    		getMobilityTeachers,
    		toggleRowSelect,
    		handleOutsideTableClick,
    		setIsAddModalOpen,
    		setIsEditModalOpen,
    		handleAddButtonClick,
    		handleEditButtonClick,
    		handleDeleteClick
    	};
    }

    class MobilityTeachers extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, ["is_logged_in", "getToken", "id"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.is_logged_in === undefined && !('is_logged_in' in props)) {
    			console.warn("<MobilityTeachers> was created without expected prop 'is_logged_in'");
    		}
    		if (ctx.getToken === undefined && !('getToken' in props)) {
    			console.warn("<MobilityTeachers> was created without expected prop 'getToken'");
    		}
    		if (ctx.id === undefined && !('id' in props)) {
    			console.warn("<MobilityTeachers> was created without expected prop 'id'");
    		}
    	}

    	get is_logged_in() {
    		throw new Error("<MobilityTeachers>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set is_logged_in(value) {
    		throw new Error("<MobilityTeachers>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getToken() {
    		throw new Error("<MobilityTeachers>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getToken(value) {
    		throw new Error("<MobilityTeachers>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<MobilityTeachers>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<MobilityTeachers>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\partners\Partners.svelte generated by Svelte v3.5.1 */

    const file$e = "src\\components\\partners\\Partners.svelte";

    // (186:0) {#if is_logged_in}
    function create_if_block$b(ctx) {
    	var t0, t1, div1, div0, h2, span0, t3, span1, button0, t5, button1, t6, button1_class_value, t7, button2, t8_value = ctx.confirm_del ? "Are you sure?" : "Delete", t8, button2_class_value, t9, current, dispose;

    	var basicmodal0 = new BasicModal({
    		props: {
    		mode: "add",
    		getToken: ctx.getToken,
    		table: "partners",
    		fields: ctx.add_modal_fields,
    		table_title: "Partners",
    		isOpen: ctx.isAddModalOpen,
    		setIsOpen: ctx.setIsAddModalOpen,
    		onAdd: ctx.getPartners
    	},
    		$$inline: true
    	});

    	var basicmodal1 = new BasicModal({
    		props: {
    		mode: "edit",
    		getToken: ctx.getToken,
    		table: "partners",
    		fields: ctx.edit_modal_fields,
    		table_title: "Partners",
    		isOpen: ctx.isEditModalOpen,
    		setIsOpen: ctx.setIsEditModalOpen,
    		onEdit: ctx.getPartners
    	},
    		$$inline: true
    	});

    	var basictable = new BasicTable({
    		props: {
    		table_headers: ctx.table_headers,
    		data: ctx.partners,
    		toggleRowSelect: ctx.toggleRowSelect,
    		selectedRows: ctx.selectedRows
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			basicmodal0.$$.fragment.c();
    			t0 = space();
    			basicmodal1.$$.fragment.c();
    			t1 = space();
    			div1 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			span0 = element("span");
    			span0.textContent = "Partners";
    			t3 = space();
    			span1 = element("span");
    			button0 = element("button");
    			button0.textContent = "Add +";
    			t5 = space();
    			button1 = element("button");
    			t6 = text("Edit");
    			t7 = space();
    			button2 = element("button");
    			t8 = text(t8_value);
    			t9 = space();
    			basictable.$$.fragment.c();
    			span0.className = "border-bottom-3px border-top-3px border-dark px-2 d-inline-block";
    			add_location(span0, file$e, 190, 35, 5967);
    			h2.className = "mb-3 text-dark";
    			add_location(h2, file$e, 190, 8, 5940);
    			button0.className = "btn btn-success mb-2";
    			add_location(button0, file$e, 192, 16, 6104);
    			button1.className = button1_class_value = ctx.selectedRows.length !== 1 ? 'btn btn-info mb-2 mx-2 disabled' : 'btn btn-info mb-2 mx-2';
    			button1.id = "edit-btn";
    			add_location(button1, file$e, 193, 16, 6205);
    			button2.className = button2_class_value = `btn btn-danger mb-2 ${ctx.selectedRows.length >= 1 ? '' : 'disabled'}`;
    			button2.id = "delete-btn";
    			add_location(button2, file$e, 194, 16, 6390);
    			add_location(span1, file$e, 191, 12, 6080);
    			div0.className = "container rounded p-4 bg-light shadow h-max-100 d-flex flex-flow-column";
    			add_location(div0, file$e, 189, 8, 5845);
    			div1.className = "p-5 position-absolute bottom-0px top-76px left-0px right-0px";
    			add_location(div1, file$e, 188, 4, 5726);

    			dispose = [
    				listen(button0, "click", ctx.handleAddButtonClick),
    				listen(button1, "click", ctx.handleEditButtonClick),
    				listen(button2, "click", ctx.handleDeleteClick),
    				listen(div1, "click", ctx.handleOutsideTableClick)
    			];
    		},

    		m: function mount(target, anchor) {
    			mount_component(basicmodal0, target, anchor);
    			insert(target, t0, anchor);
    			mount_component(basicmodal1, target, anchor);
    			insert(target, t1, anchor);
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, h2);
    			append(h2, span0);
    			append(div0, t3);
    			append(div0, span1);
    			append(span1, button0);
    			append(span1, t5);
    			append(span1, button1);
    			append(button1, t6);
    			append(span1, t7);
    			append(span1, button2);
    			append(button2, t8);
    			append(div0, t9);
    			mount_component(basictable, div0, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var basicmodal0_changes = {};
    			if (changed.getToken) basicmodal0_changes.getToken = ctx.getToken;
    			if (changed.add_modal_fields) basicmodal0_changes.fields = ctx.add_modal_fields;
    			if (changed.isAddModalOpen) basicmodal0_changes.isOpen = ctx.isAddModalOpen;
    			if (changed.setIsAddModalOpen) basicmodal0_changes.setIsOpen = ctx.setIsAddModalOpen;
    			if (changed.getPartners) basicmodal0_changes.onAdd = ctx.getPartners;
    			basicmodal0.$set(basicmodal0_changes);

    			var basicmodal1_changes = {};
    			if (changed.getToken) basicmodal1_changes.getToken = ctx.getToken;
    			if (changed.edit_modal_fields) basicmodal1_changes.fields = ctx.edit_modal_fields;
    			if (changed.isEditModalOpen) basicmodal1_changes.isOpen = ctx.isEditModalOpen;
    			if (changed.setIsEditModalOpen) basicmodal1_changes.setIsOpen = ctx.setIsEditModalOpen;
    			if (changed.getPartners) basicmodal1_changes.onEdit = ctx.getPartners;
    			basicmodal1.$set(basicmodal1_changes);

    			if ((!current || changed.selectedRows) && button1_class_value !== (button1_class_value = ctx.selectedRows.length !== 1 ? 'btn btn-info mb-2 mx-2 disabled' : 'btn btn-info mb-2 mx-2')) {
    				button1.className = button1_class_value;
    			}

    			if ((!current || changed.confirm_del) && t8_value !== (t8_value = ctx.confirm_del ? "Are you sure?" : "Delete")) {
    				set_data(t8, t8_value);
    			}

    			if ((!current || changed.selectedRows) && button2_class_value !== (button2_class_value = `btn btn-danger mb-2 ${ctx.selectedRows.length >= 1 ? '' : 'disabled'}`)) {
    				button2.className = button2_class_value;
    			}

    			var basictable_changes = {};
    			if (changed.table_headers) basictable_changes.table_headers = ctx.table_headers;
    			if (changed.partners) basictable_changes.data = ctx.partners;
    			if (changed.toggleRowSelect) basictable_changes.toggleRowSelect = ctx.toggleRowSelect;
    			if (changed.selectedRows) basictable_changes.selectedRows = ctx.selectedRows;
    			basictable.$set(basictable_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			basicmodal0.$$.fragment.i(local);

    			basicmodal1.$$.fragment.i(local);

    			basictable.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			basicmodal0.$$.fragment.o(local);
    			basicmodal1.$$.fragment.o(local);
    			basictable.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			basicmodal0.$destroy(detaching);

    			if (detaching) {
    				detach(t0);
    			}

    			basicmodal1.$destroy(detaching);

    			if (detaching) {
    				detach(t1);
    				detach(div1);
    			}

    			basictable.$destroy();

    			run_all(dispose);
    		}
    	};
    }

    function create_fragment$g(ctx) {
    	var if_block_anchor, current;

    	var if_block = (ctx.is_logged_in) && create_if_block$b(ctx);

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.is_logged_in) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					if_block.i(1);
    				} else {
    					if_block = create_if_block$b(ctx);
    					if_block.c();
    					if_block.i(1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();
    				on_outro(() => {
    					if_block.d(1);
    					if_block = null;
    				});

    				if_block.o(1);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (if_block) if_block.i();
    			current = true;
    		},

    		o: function outro(local) {
    			if (if_block) if_block.o();
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    function instance$g($$self, $$props, $$invalidate) {
    	

        let { is_logged_in, getToken } = $$props;

        let selectedRows = [];

        let partners = [];
        let countries = [];

        let table_headers = [
            {columnName: '#', key: "ID"},
            {columnName: 'Name', key: "name"},
            {columnName: "Country", key: "country"},
            {columnName: "Description", key: "description", wrap: true}
        ];

        let confirm_del = false;

        let isAddModalOpen = false;
        let isEditModalOpen = false;

        let add_modal_fields = {
        	fields: [{
            	field: "name",
            	type: "text",
            	display: "Name",
            	placeholder: "eg. Escola Secundária de Loulé",
            	value: ""
            }, {
            	field: "IDCountry",
            	type: "select",
            	display: "Country",
            	placeholder: "Choose a country",
            	value: "",
            	options: countries
            }, {
            	field: "description",
            	type: "textarea",
            	display: "Description",
            	placeholder: "eg. This is a school based in...",
            	value: ""
            }]
        };
        let edit_modal_fields = {
        	ID: null,
        	fields: [{
            	field: "name",
            	type: "text",
            	display: "Name",
            	placeholder: "eg. Escola Secundária de Loulé",
            	value: ""
            }, {
            	field: "IDCountry",
            	type: "select",
            	display: "Country",
            	placeholder: "Choose a country",
            	value: "",
            	options: countries
            }, {
            	field: "description",
            	type: "textarea",
            	display: "Description",
            	placeholder: "eg. This is a school based in...",
            	value: ""
            }]
        };

        function toggleRowSelect(id) {
        	let index = selectedRows.indexOf(id);
        	if (index === -1) {
                $$invalidate('selectedRows', selectedRows = [...selectedRows, id]);
        	}else {
                selectedRows.splice(index, 1);
                $$invalidate('selectedRows', selectedRows);
        	}

        	console.log(selectedRows);
        }

        function handleOutsideTableClick(event) {
            if (event.target.tagName.toLowerCase() === "button"){
                return;
            }
            let table = event.currentTarget.querySelector("table");
            if(table != null){
                if(table.contains(event.target)){
                    return;
                }
            }

            $$invalidate('confirm_del', confirm_del = false);
            $$invalidate('selectedRows', selectedRows = []);
        }

        function handleDeleteClick(event) {
        	let del_btn_el = event.currentTarget;
        	if(!del_btn_el.classList.contains("disabled")){
        	    if (!confirm_del) {
                   $$invalidate('confirm_del', confirm_del = true);
        	    } else if(selectedRows.length > 0) {
                    axios$1.delete("/api/delete/partners", {
                        data: {
                            rows: selectedRows
                        },
                        headers: {
                            Authorization: getToken()
                        }
                    }).then(res => {
                        $$invalidate('confirm_del', confirm_del = false);
                        getPartners();
                    }).catch(err => {
                        console.log(err.response);
                    });
                }
        	}
        }

        function getPartners() {
        	console.log("Attempting to fetch partners");
        	axios$1.get("/api/get/partners", {headers: {Authorization: getToken()}}).then(res => {
        		$$invalidate('partners', partners = res.data);
        		console.log("Successfully fetched partners");
        	}).catch(err => {
        		console.log("There was an error fetching the partners");
        		console.log(err.response);
        	});
        }

        function getCountries() {
        	console.log("Attempting to fetch countries");
        	axios$1.get("/api/get/countries", {headers: {Authorization: getToken()}}).then(res => {
        		for(let i = 0; i < res.data.length; i++) {
        		    countries.push({value: res.data[i].ID, display: res.data[i].country, original: res.data[i]});
        		}
        		$$invalidate('add_modal_fields', add_modal_fields);
        		$$invalidate('edit_modal_fields', edit_modal_fields);
        		console.log("Successfully fetched countries");
        	}).catch(err => {
        		console.log("There was an error fetching the countries");
        		console.log(err.response);
        	});
        }

        function setIsAddModalOpen(value){
        	$$invalidate('isAddModalOpen', isAddModalOpen = value);
        }

        function setIsEditModalOpen(value){
        	$$invalidate('isEditModalOpen', isEditModalOpen = value);
        }

        function handleAddButtonClick(){
        	if (countries.length === 0) {
        		getCountries();
        	}
            setIsAddModalOpen(true);
        }

        function handleEditButtonClick(){
        	if(selectedRows.length === 1){
        	    if (countries.length === 0) {
                    getCountries();
                }
                for (let i = 0; i < partners.length; i++) {
                    if (partners[i].ID === selectedRows[0]) {
                    	edit_modal_fields.ID = selectedRows[0]; $$invalidate('edit_modal_fields', edit_modal_fields);
        		        for (let j = 0; j < edit_modal_fields.fields.length; j++) {
        		            edit_modal_fields.fields[j].value = partners[i][edit_modal_fields.fields[j].field]; $$invalidate('edit_modal_fields', edit_modal_fields);
        			    }
        			}
        		}

        		setIsEditModalOpen(true);
        	}
        }

    	const writable_props = ['is_logged_in', 'getToken'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Partners> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('is_logged_in' in $$props) $$invalidate('is_logged_in', is_logged_in = $$props.is_logged_in);
    		if ('getToken' in $$props) $$invalidate('getToken', getToken = $$props.getToken);
    	};

    	$$self.$$.update = ($$dirty = { is_logged_in: 1 }) => {
    		if ($$dirty.is_logged_in) { if (is_logged_in) {
                	getPartners();
                } }
    	};

    	return {
    		is_logged_in,
    		getToken,
    		selectedRows,
    		partners,
    		table_headers,
    		confirm_del,
    		isAddModalOpen,
    		isEditModalOpen,
    		add_modal_fields,
    		edit_modal_fields,
    		toggleRowSelect,
    		handleOutsideTableClick,
    		handleDeleteClick,
    		getPartners,
    		setIsAddModalOpen,
    		setIsEditModalOpen,
    		handleAddButtonClick,
    		handleEditButtonClick
    	};
    }

    class Partners extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, ["is_logged_in", "getToken"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.is_logged_in === undefined && !('is_logged_in' in props)) {
    			console.warn("<Partners> was created without expected prop 'is_logged_in'");
    		}
    		if (ctx.getToken === undefined && !('getToken' in props)) {
    			console.warn("<Partners> was created without expected prop 'getToken'");
    		}
    	}

    	get is_logged_in() {
    		throw new Error("<Partners>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set is_logged_in(value) {
    		throw new Error("<Partners>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getToken() {
    		throw new Error("<Partners>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getToken(value) {
    		throw new Error("<Partners>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\project_partners\ProjectPartners.svelte generated by Svelte v3.5.1 */

    const file$f = "src\\components\\project_partners\\ProjectPartners.svelte";

    // (206:0) {#if is_logged_in}
    function create_if_block$c(ctx) {
    	var t0, t1, div1, div0, h2, span0, t3, h3, span1, t4, t5, span2, button0, t7, button1, t8, button1_class_value, t9, button2, t10_value = ctx.confirm_del ? "Are you sure?" : "Delete", t10, button2_class_value, t11, current, dispose;

    	var basicmodal0 = new BasicModal({
    		props: {
    		mode: "add",
    		getToken: ctx.getToken,
    		table: "partners",
    		fields: ctx.add_modal_fields,
    		table_title: "Partners",
    		isOpen: ctx.isAddModalOpen,
    		setIsOpen: ctx.setIsAddModalOpen,
    		onAdd: ctx.getProjectPartners
    	},
    		$$inline: true
    	});

    	var basicmodal1 = new BasicModal({
    		props: {
    		mode: "edit",
    		getToken: ctx.getToken,
    		table: "partners",
    		fields: ctx.edit_modal_fields,
    		table_title: "Partners",
    		isOpen: ctx.isEditModalOpen,
    		setIsOpen: ctx.setIsEditModalOpen,
    		onEdit: ctx.getProjectPartners
    	},
    		$$inline: true
    	});

    	var basictable = new BasicTable({
    		props: {
    		getToken: ctx.getToken,
    		table: "partners_projects",
    		table_headers: ctx.table_headers,
    		data: ctx.project_partners,
    		toggle_fields: ctx.toggle_fields,
    		onToggle: ctx.getProjectPartners,
    		selectedRows: ctx.selectedRows,
    		toggleRowSelect: ctx.toggleRowSelect,
    		selection_field: selection_field$2
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			basicmodal0.$$.fragment.c();
    			t0 = space();
    			basicmodal1.$$.fragment.c();
    			t1 = space();
    			div1 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			span0 = element("span");
    			span0.textContent = "Project Partners";
    			t3 = space();
    			h3 = element("h3");
    			span1 = element("span");
    			t4 = text(ctx.project_name);
    			t5 = space();
    			span2 = element("span");
    			button0 = element("button");
    			button0.textContent = "Add +";
    			t7 = space();
    			button1 = element("button");
    			t8 = text("Edit");
    			t9 = space();
    			button2 = element("button");
    			t10 = text(t10_value);
    			t11 = space();
    			basictable.$$.fragment.c();
    			span0.className = "border-bottom-3px border-top-3px border-dark px-2 d-inline-block";
    			add_location(span0, file$f, 210, 39, 6769);
    			h2.className = "mb-3 text-dark";
    			add_location(h2, file$f, 210, 12, 6742);
    			span1.className = "border-bottom-3px border-top-3px border-dark px-2 d-inline-block";
    			add_location(span1, file$f, 211, 39, 6917);
    			h3.className = "mb-3 text-dark";
    			add_location(h3, file$f, 211, 12, 6890);
    			button0.className = "btn btn-success mb-2";
    			add_location(button0, file$f, 213, 16, 7060);
    			button1.className = button1_class_value = ctx.selectedRows.length !== 1 ? 'btn btn-info mb-2 mx-2 disabled' : 'btn btn-info mb-2 mx-2';
    			button1.id = "edit-btn";
    			add_location(button1, file$f, 214, 16, 7161);
    			button2.className = button2_class_value = `btn btn-danger mb-2 ${ctx.selectedRows.length >= 1 ? '' : 'disabled'}`;
    			button2.id = "delete-btn";
    			add_location(button2, file$f, 215, 16, 7346);
    			add_location(span2, file$f, 212, 12, 7036);
    			div0.className = "container rounded p-4 bg-light shadow h-max-100 d-flex flex-flow-column";
    			add_location(div0, file$f, 209, 8, 6643);
    			div1.className = "p-5 position-absolute bottom-0px top-76px left-0px right-0px";
    			add_location(div1, file$f, 208, 4, 6522);

    			dispose = [
    				listen(button0, "click", ctx.handleAddButtonClick),
    				listen(button1, "click", ctx.handleEditButtonClick),
    				listen(button2, "click", ctx.handleDeleteClick),
    				listen(div1, "click", ctx.handleOutsideTableClick)
    			];
    		},

    		m: function mount(target, anchor) {
    			mount_component(basicmodal0, target, anchor);
    			insert(target, t0, anchor);
    			mount_component(basicmodal1, target, anchor);
    			insert(target, t1, anchor);
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, h2);
    			append(h2, span0);
    			append(div0, t3);
    			append(div0, h3);
    			append(h3, span1);
    			append(span1, t4);
    			append(div0, t5);
    			append(div0, span2);
    			append(span2, button0);
    			append(span2, t7);
    			append(span2, button1);
    			append(button1, t8);
    			append(span2, t9);
    			append(span2, button2);
    			append(button2, t10);
    			append(div0, t11);
    			mount_component(basictable, div0, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var basicmodal0_changes = {};
    			if (changed.getToken) basicmodal0_changes.getToken = ctx.getToken;
    			if (changed.add_modal_fields) basicmodal0_changes.fields = ctx.add_modal_fields;
    			if (changed.isAddModalOpen) basicmodal0_changes.isOpen = ctx.isAddModalOpen;
    			if (changed.setIsAddModalOpen) basicmodal0_changes.setIsOpen = ctx.setIsAddModalOpen;
    			if (changed.getProjectPartners) basicmodal0_changes.onAdd = ctx.getProjectPartners;
    			basicmodal0.$set(basicmodal0_changes);

    			var basicmodal1_changes = {};
    			if (changed.getToken) basicmodal1_changes.getToken = ctx.getToken;
    			if (changed.edit_modal_fields) basicmodal1_changes.fields = ctx.edit_modal_fields;
    			if (changed.isEditModalOpen) basicmodal1_changes.isOpen = ctx.isEditModalOpen;
    			if (changed.setIsEditModalOpen) basicmodal1_changes.setIsOpen = ctx.setIsEditModalOpen;
    			if (changed.getProjectPartners) basicmodal1_changes.onEdit = ctx.getProjectPartners;
    			basicmodal1.$set(basicmodal1_changes);

    			if (!current || changed.project_name) {
    				set_data(t4, ctx.project_name);
    			}

    			if ((!current || changed.selectedRows) && button1_class_value !== (button1_class_value = ctx.selectedRows.length !== 1 ? 'btn btn-info mb-2 mx-2 disabled' : 'btn btn-info mb-2 mx-2')) {
    				button1.className = button1_class_value;
    			}

    			if ((!current || changed.confirm_del) && t10_value !== (t10_value = ctx.confirm_del ? "Are you sure?" : "Delete")) {
    				set_data(t10, t10_value);
    			}

    			if ((!current || changed.selectedRows) && button2_class_value !== (button2_class_value = `btn btn-danger mb-2 ${ctx.selectedRows.length >= 1 ? '' : 'disabled'}`)) {
    				button2.className = button2_class_value;
    			}

    			var basictable_changes = {};
    			if (changed.getToken) basictable_changes.getToken = ctx.getToken;
    			if (changed.table_headers) basictable_changes.table_headers = ctx.table_headers;
    			if (changed.project_partners) basictable_changes.data = ctx.project_partners;
    			if (changed.toggle_fields) basictable_changes.toggle_fields = ctx.toggle_fields;
    			if (changed.getProjectPartners) basictable_changes.onToggle = ctx.getProjectPartners;
    			if (changed.selectedRows) basictable_changes.selectedRows = ctx.selectedRows;
    			if (changed.toggleRowSelect) basictable_changes.toggleRowSelect = ctx.toggleRowSelect;
    			if (changed.selection_field) basictable_changes.selection_field = selection_field$2;
    			basictable.$set(basictable_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			basicmodal0.$$.fragment.i(local);

    			basicmodal1.$$.fragment.i(local);

    			basictable.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			basicmodal0.$$.fragment.o(local);
    			basicmodal1.$$.fragment.o(local);
    			basictable.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			basicmodal0.$destroy(detaching);

    			if (detaching) {
    				detach(t0);
    			}

    			basicmodal1.$destroy(detaching);

    			if (detaching) {
    				detach(t1);
    				detach(div1);
    			}

    			basictable.$destroy();

    			run_all(dispose);
    		}
    	};
    }

    function create_fragment$h(ctx) {
    	var if_block_anchor, current;

    	var if_block = (ctx.is_logged_in) && create_if_block$c(ctx);

    	return {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.is_logged_in) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					if_block.i(1);
    				} else {
    					if_block = create_if_block$c(ctx);
    					if_block.c();
    					if_block.i(1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();
    				on_outro(() => {
    					if_block.d(1);
    					if_block = null;
    				});

    				if_block.o(1);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (if_block) if_block.i();
    			current = true;
    		},

    		o: function outro(local) {
    			if (if_block) if_block.o();
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach(if_block_anchor);
    			}
    		}
    	};
    }

    let selection_field$2 = "IDPartner";

    function instance$h($$self, $$props, $$invalidate) {
    	

        let { is_logged_in, getToken, id } = $$props;

        let selectedRows = [];

        let project_partners = [];
        let countries = [];
        let project_name = "";

        let table_headers = [
            {columnName: ' ', key: "isPartner", toggler: true},
            {columnName: 'Name', key: "name"},
            {columnName: "Country", key: "country"},
            {columnName: "Description", key: "description", wrap: true}
        ];
        let toggle_fields = [
        	{field: "IDPartner"},
        	{field: "IDProject"}
        ];


        let confirm_del = false;

        let isAddModalOpen = false;
        let isEditModalOpen = false;

        let add_modal_fields = {
        	fields: [{
            	field: "name",
            	type: "text",
            	display: "Name",
            	placeholder: "eg. Escola Secundária de Loulé",
            	value: ""
            }, {
            	field: "IDCountry",
            	type: "select",
            	display: "Country",
            	placeholder: "Choose a country",
            	value: "",
            	options: countries
            }, {
            	field: "description",
            	type: "textarea",
            	display: "Description",
            	placeholder: "eg. This is a school based in...",
            	value: ""
            }]
        };
        let edit_modal_fields = {
        	ID: null,
        	fields: [{
            	field: "name",
            	type: "text",
            	display: "Name",
            	placeholder: "eg. Escola Secundária de Loulé",
            	value: ""
            }, {
            	field: "IDCountry",
            	type: "select",
            	display: "Country",
            	placeholder: "Choose a country",
            	value: "",
            	options: countries
            }, {
            	field: "description",
            	type: "textarea",
            	display: "Description",
            	placeholder: "eg. This is a school based in...",
            	value: ""
            }]
        };

        function getProjectPartners(){
        	axios$1.get(`/api/get/project_partners?IDProject=${id}`, {headers: {Authorization: getToken()}}).then(function(res) {
        		$$invalidate('project_partners', project_partners = res.data);
        		$$invalidate('project_name', project_name = res.data[0].projectName);
        		console.log(res.data);
        	}).catch(err => {
        		console.log(err.response);
        	});
        }

        function getCountries() {
        	console.log("Attempting to fetch countries");
        	axios$1.get("/api/get/countries", {headers: {Authorization: getToken()}}).then(res => {
        		for(let i = 0; i < res.data.length; i++) {
        		    countries.push({value: res.data[i].ID, display: res.data[i].country, original: res.data[i]});
        		}
        		$$invalidate('add_modal_fields', add_modal_fields);
        		$$invalidate('edit_modal_fields', edit_modal_fields);
        		console.log("Successfully fetched countries");
        	}).catch(err => {
        		console.log("There was an error fetching the countries");
        		console.log(err.response);
        	});
        }

        function toggleRowSelect(id) {
        	let index = selectedRows.indexOf(id);
        	if(index === -1){
                $$invalidate('selectedRows', selectedRows = [...selectedRows, id]);
        	}else {
                selectedRows.splice(index, 1);
                $$invalidate('selectedRows', selectedRows);
        	}

        	console.log(selectedRows);
        }

        function handleOutsideTableClick(event) {
            if (event.target.tagName.toLowerCase() === "button"){
                return;
            }
            let table = event.currentTarget.querySelector("table");
            if(table != null ){
                if(table.contains(event.target)){
                    console.log("Hello there General Kenobi");
                    return;
                }
            }

            $$invalidate('confirm_del', confirm_del = false);
            $$invalidate('selectedRows', selectedRows = []);
        }

        function setIsAddModalOpen(value){
        	$$invalidate('isAddModalOpen', isAddModalOpen = value);
        }

        function setIsEditModalOpen(value){
        	$$invalidate('isEditModalOpen', isEditModalOpen = value);
        }

        function handleAddButtonClick(){
        	if (countries.length === 0) {
                getCountries();
            }

            setIsAddModalOpen(true);
        }

        function handleEditButtonClick(){
        	if(selectedRows.length === 1){
        		if (countries.length === 0) {
        			getCountries();
        		}

                for (let i = 0; i < project_partners.length; i++) {
                    if (project_partners[i][selection_field$2] === selectedRows[0]) {
                    	edit_modal_fields.ID = selectedRows[0]; $$invalidate('edit_modal_fields', edit_modal_fields);
        		        for (let j = 0; j < edit_modal_fields.fields.length; j++) {
        		        	if (edit_modal_fields.fields[j].type === "date") {
                                edit_modal_fields.fields[j].value = project_partners[i][edit_modal_fields.fields[j].field].slice(0, -14); $$invalidate('edit_modal_fields', edit_modal_fields);
                                console.log(project_partners[i][edit_modal_fields.fields[j].field]);
        		        	} else {
                                edit_modal_fields.fields[j].value = project_partners[i][edit_modal_fields.fields[j].field]; $$invalidate('edit_modal_fields', edit_modal_fields);
                                console.log(edit_modal_fields.fields[j].value);
        		        	}
        			    }
        			}
        		}

        		setIsEditModalOpen(true);
        	}
        }

        function handleDeleteClick(event) {
        	let del_btn_el = event.currentTarget;
        	if(!del_btn_el.classList.contains("disabled")){
        	    if(!confirm_del){
                   $$invalidate('confirm_del', confirm_del = true);
        	    }else if(selectedRows.length > 0){
                    axios$1.delete("/api/delete/partners", {
                        data: {
                            rows: selectedRows
                        },
                        headers: {
                            Authorization: getToken()
                        }
                    }).then(res => {
                    	$$invalidate('confirm_del', confirm_del = false);
                    	$$invalidate('selectedRows', selectedRows = []);
                        getProjectPartners();
                    }).catch(err =>{
                        console.log(err.response);
                    });
                }
        	}
        }

    	const writable_props = ['is_logged_in', 'getToken', 'id'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<ProjectPartners> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('is_logged_in' in $$props) $$invalidate('is_logged_in', is_logged_in = $$props.is_logged_in);
    		if ('getToken' in $$props) $$invalidate('getToken', getToken = $$props.getToken);
    		if ('id' in $$props) $$invalidate('id', id = $$props.id);
    	};

    	$$self.$$.update = ($$dirty = { is_logged_in: 1 }) => {
    		if ($$dirty.is_logged_in) { if(is_logged_in){
                	getProjectPartners();
                } }
    	};

    	return {
    		is_logged_in,
    		getToken,
    		id,
    		selectedRows,
    		project_partners,
    		project_name,
    		table_headers,
    		toggle_fields,
    		confirm_del,
    		isAddModalOpen,
    		isEditModalOpen,
    		add_modal_fields,
    		edit_modal_fields,
    		getProjectPartners,
    		toggleRowSelect,
    		handleOutsideTableClick,
    		setIsAddModalOpen,
    		setIsEditModalOpen,
    		handleAddButtonClick,
    		handleEditButtonClick,
    		handleDeleteClick
    	};
    }

    class ProjectPartners extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, ["is_logged_in", "getToken", "id"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.is_logged_in === undefined && !('is_logged_in' in props)) {
    			console.warn("<ProjectPartners> was created without expected prop 'is_logged_in'");
    		}
    		if (ctx.getToken === undefined && !('getToken' in props)) {
    			console.warn("<ProjectPartners> was created without expected prop 'getToken'");
    		}
    		if (ctx.id === undefined && !('id' in props)) {
    			console.warn("<ProjectPartners> was created without expected prop 'id'");
    		}
    	}

    	get is_logged_in() {
    		throw new Error("<ProjectPartners>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set is_logged_in(value) {
    		throw new Error("<ProjectPartners>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getToken() {
    		throw new Error("<ProjectPartners>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getToken(value) {
    		throw new Error("<ProjectPartners>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<ProjectPartners>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<ProjectPartners>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.5.1 */

    const file$g = "src\\App.svelte";

    // (62:8) {#if !is_logged_in}
    function create_if_block_1$4(ctx) {
    	var current;

    	var loginmodal = new LoginModal({
    		props: { login: ctx.login },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			loginmodal.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(loginmodal, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var loginmodal_changes = {};
    			if (changed.login) loginmodal_changes.login = ctx.login;
    			loginmodal.$set(loginmodal_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			loginmodal.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			loginmodal.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			loginmodal.$destroy(detaching);
    		}
    	};
    }

    // (76:12) {#if !is_logged_in}
    function create_if_block$d(ctx) {
    	var div, h3;

    	return {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			h3.textContent = "You must login with your account to do anything in the backoffice";
    			h3.className = "m-5 p-3 text-center bg-danger rounded shadow-lg d-inline-block";
    			add_location(h3, file$g, 77, 20, 3220);
    			div.className = "container p-5 d-flex justify-content-center";
    			add_location(div, file$g, 76, 16, 3142);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, h3);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    // (61:4) <Router url="{url}">
    function create_default_slot$4(ctx) {
    	var t0, t1, div, t2, t3, t4, t5, t6, t7, t8, t9, t10, current;

    	var if_block0 = (!ctx.is_logged_in) && create_if_block_1$4(ctx);

    	var header = new Header({
    		props: {
    		is_logged_in: ctx.is_logged_in,
    		logout: ctx.logout
    	},
    		$$inline: true
    	});

    	var route0 = new Route({
    		props: {
    		path: "/svelte/countries",
    		component: Countries,
    		is_logged_in: ctx.is_logged_in,
    		getToken: getToken
    	},
    		$$inline: true
    	});

    	var route1 = new Route({
    		props: {
    		path: "/svelte",
    		component: Projects,
    		is_logged_in: ctx.is_logged_in,
    		getToken: getToken
    	},
    		$$inline: true
    	});

    	var route2 = new Route({
    		props: {
    		path: "/svelte/projects",
    		component: Projects,
    		is_logged_in: ctx.is_logged_in,
    		getToken: getToken
    	},
    		$$inline: true
    	});

    	var route3 = new Route({
    		props: {
    		path: "/svelte/mobilities/:id",
    		component: Mobilities,
    		is_logged_in: ctx.is_logged_in,
    		getToken: getToken
    	},
    		$$inline: true
    	});

    	var route4 = new Route({
    		props: {
    		path: "/svelte/mobilities",
    		component: Mobilities,
    		is_logged_in: ctx.is_logged_in,
    		getToken: getToken
    	},
    		$$inline: true
    	});

    	var route5 = new Route({
    		props: {
    		path: "/svelte/mobility_students/:id",
    		component: MobilityStudents,
    		is_logged_in: ctx.is_logged_in,
    		getToken: getToken
    	},
    		$$inline: true
    	});

    	var route6 = new Route({
    		props: {
    		path: "/svelte/mobility_teachers/:id",
    		component: MobilityTeachers,
    		is_logged_in: ctx.is_logged_in,
    		getToken: getToken
    	},
    		$$inline: true
    	});

    	var route7 = new Route({
    		props: {
    		path: "/svelte/partners",
    		component: Partners,
    		is_logged_in: ctx.is_logged_in,
    		getToken: getToken
    	},
    		$$inline: true
    	});

    	var route8 = new Route({
    		props: {
    		path: "/svelte/project_partners/:id",
    		component: ProjectPartners,
    		is_logged_in: ctx.is_logged_in,
    		getToken: getToken
    	},
    		$$inline: true
    	});

    	var if_block1 = (!ctx.is_logged_in) && create_if_block$d();

    	return {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			header.$$.fragment.c();
    			t1 = space();
    			div = element("div");
    			route0.$$.fragment.c();
    			t2 = space();
    			route1.$$.fragment.c();
    			t3 = space();
    			route2.$$.fragment.c();
    			t4 = space();
    			route3.$$.fragment.c();
    			t5 = space();
    			route4.$$.fragment.c();
    			t6 = space();
    			route5.$$.fragment.c();
    			t7 = space();
    			route6.$$.fragment.c();
    			t8 = space();
    			route7.$$.fragment.c();
    			t9 = space();
    			route8.$$.fragment.c();
    			t10 = space();
    			if (if_block1) if_block1.c();
    			add_location(div, file$g, 65, 8, 1969);
    		},

    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert(target, t0, anchor);
    			mount_component(header, target, anchor);
    			insert(target, t1, anchor);
    			insert(target, div, anchor);
    			mount_component(route0, div, null);
    			append(div, t2);
    			mount_component(route1, div, null);
    			append(div, t3);
    			mount_component(route2, div, null);
    			append(div, t4);
    			mount_component(route3, div, null);
    			append(div, t5);
    			mount_component(route4, div, null);
    			append(div, t6);
    			mount_component(route5, div, null);
    			append(div, t7);
    			mount_component(route6, div, null);
    			append(div, t8);
    			mount_component(route7, div, null);
    			append(div, t9);
    			mount_component(route8, div, null);
    			append(div, t10);
    			if (if_block1) if_block1.m(div, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (!ctx.is_logged_in) {
    				if (if_block0) {
    					if_block0.p(changed, ctx);
    					if_block0.i(1);
    				} else {
    					if_block0 = create_if_block_1$4(ctx);
    					if_block0.c();
    					if_block0.i(1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();
    				on_outro(() => {
    					if_block0.d(1);
    					if_block0 = null;
    				});

    				if_block0.o(1);
    				check_outros();
    			}

    			var header_changes = {};
    			if (changed.is_logged_in) header_changes.is_logged_in = ctx.is_logged_in;
    			if (changed.logout) header_changes.logout = ctx.logout;
    			header.$set(header_changes);

    			var route0_changes = {};
    			if (changed.Countries) route0_changes.component = Countries;
    			if (changed.is_logged_in) route0_changes.is_logged_in = ctx.is_logged_in;
    			if (changed.getToken) route0_changes.getToken = getToken;
    			route0.$set(route0_changes);

    			var route1_changes = {};
    			if (changed.Projects) route1_changes.component = Projects;
    			if (changed.is_logged_in) route1_changes.is_logged_in = ctx.is_logged_in;
    			if (changed.getToken) route1_changes.getToken = getToken;
    			route1.$set(route1_changes);

    			var route2_changes = {};
    			if (changed.Projects) route2_changes.component = Projects;
    			if (changed.is_logged_in) route2_changes.is_logged_in = ctx.is_logged_in;
    			if (changed.getToken) route2_changes.getToken = getToken;
    			route2.$set(route2_changes);

    			var route3_changes = {};
    			if (changed.Mobilities) route3_changes.component = Mobilities;
    			if (changed.is_logged_in) route3_changes.is_logged_in = ctx.is_logged_in;
    			if (changed.getToken) route3_changes.getToken = getToken;
    			route3.$set(route3_changes);

    			var route4_changes = {};
    			if (changed.Mobilities) route4_changes.component = Mobilities;
    			if (changed.is_logged_in) route4_changes.is_logged_in = ctx.is_logged_in;
    			if (changed.getToken) route4_changes.getToken = getToken;
    			route4.$set(route4_changes);

    			var route5_changes = {};
    			if (changed.MobilityStudents) route5_changes.component = MobilityStudents;
    			if (changed.is_logged_in) route5_changes.is_logged_in = ctx.is_logged_in;
    			if (changed.getToken) route5_changes.getToken = getToken;
    			route5.$set(route5_changes);

    			var route6_changes = {};
    			if (changed.MobilityTeachers) route6_changes.component = MobilityTeachers;
    			if (changed.is_logged_in) route6_changes.is_logged_in = ctx.is_logged_in;
    			if (changed.getToken) route6_changes.getToken = getToken;
    			route6.$set(route6_changes);

    			var route7_changes = {};
    			if (changed.Partners) route7_changes.component = Partners;
    			if (changed.is_logged_in) route7_changes.is_logged_in = ctx.is_logged_in;
    			if (changed.getToken) route7_changes.getToken = getToken;
    			route7.$set(route7_changes);

    			var route8_changes = {};
    			if (changed.ProjectPartners) route8_changes.component = ProjectPartners;
    			if (changed.is_logged_in) route8_changes.is_logged_in = ctx.is_logged_in;
    			if (changed.getToken) route8_changes.getToken = getToken;
    			route8.$set(route8_changes);

    			if (!ctx.is_logged_in) {
    				if (!if_block1) {
    					if_block1 = create_if_block$d();
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (if_block0) if_block0.i();

    			header.$$.fragment.i(local);

    			route0.$$.fragment.i(local);

    			route1.$$.fragment.i(local);

    			route2.$$.fragment.i(local);

    			route3.$$.fragment.i(local);

    			route4.$$.fragment.i(local);

    			route5.$$.fragment.i(local);

    			route6.$$.fragment.i(local);

    			route7.$$.fragment.i(local);

    			route8.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			if (if_block0) if_block0.o();
    			header.$$.fragment.o(local);
    			route0.$$.fragment.o(local);
    			route1.$$.fragment.o(local);
    			route2.$$.fragment.o(local);
    			route3.$$.fragment.o(local);
    			route4.$$.fragment.o(local);
    			route5.$$.fragment.o(local);
    			route6.$$.fragment.o(local);
    			route7.$$.fragment.o(local);
    			route8.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);

    			if (detaching) {
    				detach(t0);
    			}

    			header.$destroy(detaching);

    			if (detaching) {
    				detach(t1);
    				detach(div);
    			}

    			route0.$destroy();

    			route1.$destroy();

    			route2.$destroy();

    			route3.$destroy();

    			route4.$destroy();

    			route5.$destroy();

    			route6.$destroy();

    			route7.$destroy();

    			route8.$destroy();

    			if (if_block1) if_block1.d();
    		}
    	};
    }

    function create_fragment$i(ctx) {
    	var div, current;

    	var router = new Router({
    		props: {
    		url: ctx.url,
    		$$slots: { default: [create_default_slot$4] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			div = element("div");
    			router.$$.fragment.c();
    			add_location(div, file$g, 59, 0, 1784);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			mount_component(router, div, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var router_changes = {};
    			if (changed.url) router_changes.url = ctx.url;
    			if (changed.$$scope || changed.is_logged_in) router_changes.$$scope = { changed, ctx };
    			router.$set(router_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			router.$$.fragment.i(local);

    			current = true;
    		},

    		o: function outro(local) {
    			router.$$.fragment.o(local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			router.$destroy();
    		}
    	};
    }

    function getToken() {
    	    return localStorage.getItem("api-auth-token");
    	}

    function removeToken() {
    	    localStorage.removeItem("api-auth-token");
    	}

    function instance$i($$self, $$props, $$invalidate) {
    	

    	let { url = "" } = $$props;

    	let is_logged_in = false;

    	function login(username, password) {
    		console.log("Trying to log in");
            axios$1.post("/api/login", {username: username, password: password}).then(res => {
            	localStorage.setItem("api-auth-token", res.data.token);
            	$$invalidate('is_logged_in', is_logged_in = true);
            	console.log(res.data);
            }).catch(err => {
            	console.log(err.response.data);
            });
    	}

    	function logout() {
            removeToken();
            $$invalidate('is_logged_in', is_logged_in = false);
    	}

    	function checkLogin() {
    	    axios$1.get("/api/logincheck", {headers: {Authorization: getToken()}}).then(res => {
                $$invalidate('is_logged_in', is_logged_in = true);
            }).catch(err => {
            	$$invalidate('is_logged_in', is_logged_in = false);
                console.log(err.response.data);
            });
    	}

    	checkLogin();

    	const writable_props = ['url'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('url' in $$props) $$invalidate('url', url = $$props.url);
    	};

    	return { url, is_logged_in, login, logout };
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, ["url"]);
    	}

    	get url() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
