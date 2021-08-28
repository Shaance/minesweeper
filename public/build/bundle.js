
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
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
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
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

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
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
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
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
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var BoardState;
    (function (BoardState) {
        BoardState["INITIAL"] = "INITIAL";
        BoardState["PLAYING"] = "PLAYING";
        BoardState["WON"] = "WON";
        BoardState["LOST"] = "LOST";
    })(BoardState || (BoardState = {}));
    var BoardState$1 = BoardState;

    var Level;
    (function (Level) {
        Level["EASY"] = "EASY";
        Level["MEDIUM"] = "MEDIUM";
        Level["HARD"] = "HARD";
        Level["CUSTOM"] = "CUSTOM";
    })(Level || (Level = {}));
    var Level$1 = Level;

    const DEFAULT_SIZE = 8;
    const DEFAULT_BOMBS_NUMBER = 10;
    function createMatrix(size, func) {
        let i = 0;
        let j = 0;
        const blankBoard = [];
        while (i !== size) {
            blankBoard.push([]);
            while (j !== size) {
                func(blankBoard, i);
                j += 1;
            }
            j = 0;
            i += 1;
        }
        return blankBoard;
    }
    function coordinatesInBoard(x, y, boardContent) {
        return x >= 0 && y >= 0 && x < boardContent.length && y < boardContent[x].length;
    }
    function getDirectionsWithDiagonals() {
        return [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, -1], [1, -1], [-1, 1]];
    }
    function getDirections() {
        return [[0, 1], [1, 0], [0, -1], [-1, 0]];
    }
    function getNumberMatrix(size, number) {
        return createMatrix(size, (matrix, idx) => matrix[idx].push(number));
    }
    function getBooleanMatrix(size, bool = false) {
        return createMatrix(size, (matrix, idx) => matrix[idx].push(bool));
    }
    function isPlayingState(state) {
        return state === BoardState$1.INITIAL || state === BoardState$1.PLAYING;
    }
    function getGameSettings(level, size, bombsNumber) {
        if (!level || level === Level$1.EASY) {
            return {
                size: DEFAULT_SIZE,
                bombsNumber: DEFAULT_BOMBS_NUMBER,
            };
        }
        if (level === Level$1.CUSTOM) {
            const actualSize = size > 0 ? size : DEFAULT_SIZE;
            return {
                size: actualSize,
                bombsNumber: bombsNumber > 0 && bombsNumber < actualSize
                    ? bombsNumber
                    : DEFAULT_BOMBS_NUMBER,
            };
        }
        if (level === Level$1.MEDIUM) {
            return {
                size: 10,
                bombsNumber: 16,
            };
        }
        return {
            size: 12,
            bombsNumber: 25,
        };
    }

    var BoardInput;
    (function (BoardInput) {
        BoardInput["REVEAL"] = "REVEAL";
        BoardInput["FLAG"] = "FLAG";
    })(BoardInput || (BoardInput = {}));
    var BoardInput$1 = BoardInput;

    var CellType;
    (function (CellType) {
        CellType[CellType["BOMB"] = -1] = "BOMB";
        CellType[CellType["EMPTY"] = 0] = "EMPTY";
    })(CellType || (CellType = {}));
    var CellType$1 = CellType;

    class Board {
        constructor(size, bombsNumber, level) {
            const actualSize = size > 0
                ? size
                : DEFAULT_SIZE;
            const actualBombsNumber = bombsNumber > 0
                ? bombsNumber
                : DEFAULT_BOMBS_NUMBER;
            this.content = getBoardContent(actualSize, actualBombsNumber);
            this.visited = getBooleanMatrix(actualSize);
            this.flagged = getBooleanMatrix(actualSize);
            this.size = actualSize;
            this.level = level;
            this.bombsNumber = actualBombsNumber;
            this.state = BoardState$1.INITIAL;
            this.remainingNotVisited = size * size - bombsNumber;
            this.availableFlags = actualBombsNumber;
        }
        withFlagged(flagged) {
            this.flagged = flagged;
            return this;
        }
        withState(state) {
            this.state = state;
            return this;
        }
    }
    function getBoardContent(size, bombsNumber) {
        const bombPositions = getBombPositions(size, bombsNumber);
        const board = placeBombs(getNumberMatrix(size, 0), bombPositions);
        return markAdjacentCells(board, bombPositions);
    }
    function getBombPositions(size, bombsNumber) {
        const bombPositions = new Set();
        while (bombPositions.size !== bombsNumber) {
            const randomPositions = generatePosition(size);
            bombPositions.add(`${String(randomPositions[0])}-${String(randomPositions[1])}`);
        }
        const positionsArray = Array.from(bombPositions)
            .map((str) => {
            const split = str.split('-');
            return [Number(split[0]), Number(split[1])];
        });
        return new Set(positionsArray);
    }
    function markAdjacentCells(board, bombPositions) {
        const markedBoard = board;
        const directions = getDirectionsWithDiagonals();
        bombPositions.forEach((coord) => {
            const [x, y] = [coord[0], coord[1]];
            directions.forEach((dir) => {
                const xi = x + dir[0];
                const yi = y + dir[1];
                if (coordinatesInBoard(xi, yi, markedBoard) && markedBoard[xi][yi] !== CellType$1.BOMB) {
                    markedBoard[xi][yi] += 1;
                }
            });
        });
        return markedBoard;
    }
    function placeBombs(board, bombPositions) {
        const newBoard = board;
        bombPositions.forEach((coord) => {
            const [x, y] = [coord[0], coord[1]];
            newBoard[x][y] = CellType$1.BOMB;
        });
        return newBoard;
    }
    function generatePosition(size) {
        return [getRandomInt(0, size), getRandomInt(0, size)];
    }
    // The maximum is exclusive and the minimum is inclusive
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    function createBoard(level, size, bombsNumber) {
        const settings = getGameSettings(level, size, bombsNumber);
        return new Board(settings.size, settings.bombsNumber, level);
    }
    function getBoardAfterPlayerMove(inputMode, board, row, col) {
        if (inputMode === BoardInput$1.REVEAL) {
            return playCoordinates(getPlayableBoard(board, row, col), row, col);
        }
        return flagCoordinates(board, row, col);
    }
    /**
     * We always want the first coordinates the player picks to be expandable. This function will
     * regenerate a board as long as the coordinates in input points to either a bomb or a cell
     * that is adjacent to bombs
     */
    function getPlayableBoard(board, row, col) {
        if (board.state !== BoardState$1.INITIAL || !coordinatesInBoard(row, col, board.content) || isEmptyCell(board, row, col)) {
            return board;
        }
        const newBoard = createBoard(board.level, board.size, board.bombsNumber)
            .withFlagged(board.flagged);
        return getPlayableBoard(newBoard, row, col);
    }
    function isEmptyCell(board, row, col) {
        return coordinatesInBoard(row, col, board.content) && board.content[row][col] === CellType$1.EMPTY;
    }
    function revealBombs(board) {
        const revealedBoard = board;
        revealedBoard.content.forEach((row, i) => {
            row.forEach((val, j) => {
                if (val === CellType$1.BOMB) {
                    revealedBoard.visited[i][j] = true;
                }
            });
        });
        return revealedBoard;
    }
    /**
     * This function will play the coordinates given in arguments and will create a new board
     * with it's new content, visited matrix and state accordingly.
     * @param board board on which you want to play
     * @param row row you want to play
     * @param col column you want to play
     * @returns { Board } returns new board
     */
    function playCoordinates(board, row, col) {
        if (!coordinatesInBoard(row, col, board.content)) {
            return board;
        }
        if (board.visited[row][col] || board.flagged[row][col] || !isPlayingState(board.state)) {
            return board;
        }
        if (board.content[row][col] === CellType$1.BOMB) {
            return revealBombs(board).withState(BoardState$1.LOST);
        }
        const expandedBoard = expand(board, row, col);
        if (expandedBoard.remainingNotVisited === 0) {
            expandedBoard.state = BoardState$1.WON;
        }
        if (expandedBoard.state === BoardState$1.INITIAL) {
            expandedBoard.state = BoardState$1.PLAYING;
        }
        return expandedBoard;
    }
    function flagCoordinates(board, row, col) {
        if (!coordinatesInBoard(row, col, board.content) || board.visited[row][col]) {
            return board;
        }
        if (!board.flagged[row][col] && board.availableFlags === 0) {
            return board;
        }
        const newBoard = board;
        newBoard.flagged[row][col] = !newBoard.flagged[row][col];
        if (newBoard.flagged[row][col]) {
            newBoard.availableFlags -= 1;
        }
        else {
            newBoard.availableFlags += 1;
        }
        return newBoard;
    }
    /**
     * This function will expand from starting cell to neighbour cells until it reaches
     * bomb adjacent cells
     * @param board the board on which you want to expand
     * @param row the starting row
     * @param col the starting col
     */
    function expand(board, row, col) {
        const expandedBoard = board;
        const directions = getDirections();
        const { content, visited } = expandedBoard;
        const stack = [[row, col]];
        let visitedCells = 0;
        while (stack.length > 0) {
            const [x, y] = stack.pop();
            if (canExpand(expandedBoard, x, y)) {
                visited[x][y] = true;
                visitedCells += 1;
                if (content[x][y] === CellType$1.EMPTY) {
                    directions.forEach((dir) => {
                        stack.push([x + dir[0], y + dir[1]]);
                    });
                }
            }
        }
        expandedBoard.remainingNotVisited -= visitedCells;
        return expandedBoard;
    }
    function canExpand(board, x, y) {
        const { content, visited, flagged } = board;
        return coordinatesInBoard(x, y, content) && !visited[x][y] && !flagged[x][y];
    }

    const subscriber_queue = [];
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
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
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
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    // eslint-disable-next-line import/no-extraneous-dependencies
    const board = writable(createBoard(Level$1.EASY));

    /* src/Board.svelte generated by Svelte v3.31.2 */
    const file = "src/Board.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[15] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	child_ctx[18] = i;
    	return child_ctx;
    }

    // (85:6) {#each row as value, j}
    function create_each_block_1(ctx) {
    	let div;
    	let button;
    	let t0_value = /*getCellContent*/ ctx[9](/*visited*/ ctx[1], /*flagged*/ ctx[2], /*i*/ ctx[15], /*j*/ ctx[18]) + "";
    	let t0;
    	let button_disabled_value;
    	let button_style_value;
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[11](/*i*/ ctx[15], /*j*/ ctx[18]);
    	}

    	function contextmenu_handler() {
    		return /*contextmenu_handler*/ ctx[12](/*i*/ ctx[15], /*j*/ ctx[18]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(button, "class", "cell-button svelte-1yop23t");
    			button.disabled = button_disabled_value = /*notClickable*/ ctx[8](/*visited*/ ctx[1], /*state*/ ctx[4], /*i*/ ctx[15], /*j*/ ctx[18]);
    			attr_dev(button, "style", button_style_value = "background-color:" + /*getBackgroundColor*/ ctx[6](/*visited*/ ctx[1], /*i*/ ctx[15], /*j*/ ctx[18]) + ";\n              color:" + getColorForValue(/*value*/ ctx[16]) + ";\n              " + /*getCursorStyle*/ ctx[7](/*visited*/ ctx[1], /*flagged*/ ctx[2], /*state*/ ctx[4], /*i*/ ctx[15], /*j*/ ctx[18]));
    			add_location(button, file, 86, 10, 2383);
    			attr_dev(div, "class", "column svelte-1yop23t");
    			add_location(div, file, 85, 8, 2352);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(button, t0);
    			append_dev(div, t1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", click_handler, false, false, false),
    					listen_dev(button, "contextmenu", prevent_default(contextmenu_handler), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*visited, flagged*/ 6 && t0_value !== (t0_value = /*getCellContent*/ ctx[9](/*visited*/ ctx[1], /*flagged*/ ctx[2], /*i*/ ctx[15], /*j*/ ctx[18]) + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*visited, state*/ 18 && button_disabled_value !== (button_disabled_value = /*notClickable*/ ctx[8](/*visited*/ ctx[1], /*state*/ ctx[4], /*i*/ ctx[15], /*j*/ ctx[18]))) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}

    			if (dirty & /*visited, content, flagged, state*/ 23 && button_style_value !== (button_style_value = "background-color:" + /*getBackgroundColor*/ ctx[6](/*visited*/ ctx[1], /*i*/ ctx[15], /*j*/ ctx[18]) + ";\n              color:" + getColorForValue(/*value*/ ctx[16]) + ";\n              " + /*getCursorStyle*/ ctx[7](/*visited*/ ctx[1], /*flagged*/ ctx[2], /*state*/ ctx[4], /*i*/ ctx[15], /*j*/ ctx[18]))) {
    				attr_dev(button, "style", button_style_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(85:6) {#each row as value, j}",
    		ctx
    	});

    	return block;
    }

    // (84:4) {#each content as row, i}
    function create_each_block(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*row*/ ctx[13];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*notClickable, visited, state, getBackgroundColor, getColorForValue, content, getCursorStyle, flagged, selectCell, BoardInput, getCellContent*/ 1015) {
    				each_value_1 = /*row*/ ctx[13];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(84:4) {#each content as row, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let div;
    	let each_value = /*content*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "id", "board");
    			attr_dev(div, "data-cy", "board");
    			attr_dev(div, "class", "grid svelte-1yop23t");
    			set_style(div, "width", width + "px");
    			set_style(div, "grid-template-columns", repeatValueWithSuffix(/*size*/ ctx[3], width / /*size*/ ctx[3], "px"));
    			set_style(div, "grid-template-rows", repeatValueWithSuffix(/*size*/ ctx[3], width / /*size*/ ctx[3], "px"));
    			add_location(div, file, 75, 2, 2035);
    			add_location(main, file, 74, 0, 2026);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*content, notClickable, visited, state, getBackgroundColor, getColorForValue, getCursorStyle, flagged, selectCell, BoardInput, getCellContent*/ 1015) {
    				each_value = /*content*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*size*/ 8) {
    				set_style(div, "grid-template-columns", repeatValueWithSuffix(/*size*/ ctx[3], width / /*size*/ ctx[3], "px"));
    			}

    			if (dirty & /*size*/ 8) {
    				set_style(div, "grid-template-rows", repeatValueWithSuffix(/*size*/ ctx[3], width / /*size*/ ctx[3], "px"));
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const width = 375;

    function repeatValueWithSuffix(times, value, suffix) {
    	if (times < 0) {
    		return;
    	}

    	let finalStyle = "";
    	let counter = 0;

    	while (counter !== times) {
    		finalStyle += `${value}${suffix} `;
    		counter++;
    	}

    	return finalStyle;
    }

    function getColorForValue(value) {
    	switch (value) {
    		case 1:
    			return "blue";
    		case 2:
    			return "green";
    		case 3:
    			return "red";
    		case 4:
    			return "purple";
    		case 5:
    			return "maroon";
    		case 6:
    			return "turquoise";
    		case 7:
    			return "black";
    		case 8:
    			return "grey";
    	}
    }

    function instance($$self, $$props, $$invalidate) {
    	let content;
    	let visited;
    	let flagged;
    	let size;
    	let state;
    	let $board;
    	validate_store(board, "board");
    	component_subscribe($$self, board, $$value => $$invalidate(10, $board = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Board", slots, []);
    	

    	function selectCell(inputMode, i, j) {
    		board.set(getBoardAfterPlayerMove(inputMode, $board, i, j));
    	}

    	function getBackgroundColor(visited, row, col) {
    		const even = (row + col) % 2 == 0;

    		if (visited[row][col]) {
    			return even ? "#d4c18e" : "#cfbb86";
    		}

    		return even ? "#9cd14f" : "#95c74c";
    	}

    	function getCursorStyle(visited, flagged, state, row, col) {
    		return notClickable(visited, state, row, col) || flagged[row][col]
    		? ""
    		: "cursor: pointer;";
    	}

    	function notClickable(visited, state, row, col) {
    		return visited[row][col] || !isPlayingState(state);
    	}

    	function getCellContent(visited, flagged, row, col) {
    		const value = content[row][col];

    		if (visited[row][col] && value !== CellType$1.EMPTY) {
    			if (value === CellType$1.BOMB) {
    				return "💣";
    			}

    			return value;
    		}

    		return flagged[row][col] ? "⛳️" : "";
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Board> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (i, j) => selectCell(BoardInput$1.REVEAL, i, j);
    	const contextmenu_handler = (i, j) => selectCell(BoardInput$1.FLAG, i, j);

    	$$self.$capture_state = () => ({
    		isPlayingState,
    		BoardInput: BoardInput$1,
    		getBoardAfterPlayerMove,
    		CellType: CellType$1,
    		board,
    		width,
    		selectCell,
    		repeatValueWithSuffix,
    		getBackgroundColor,
    		getCursorStyle,
    		notClickable,
    		getCellContent,
    		getColorForValue,
    		content,
    		$board,
    		visited,
    		flagged,
    		size,
    		state
    	});

    	$$self.$inject_state = $$props => {
    		if ("content" in $$props) $$invalidate(0, content = $$props.content);
    		if ("visited" in $$props) $$invalidate(1, visited = $$props.visited);
    		if ("flagged" in $$props) $$invalidate(2, flagged = $$props.flagged);
    		if ("size" in $$props) $$invalidate(3, size = $$props.size);
    		if ("state" in $$props) $$invalidate(4, state = $$props.state);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$board*/ 1024) {
    			 $$invalidate(0, content = $board.content);
    		}

    		if ($$self.$$.dirty & /*$board*/ 1024) {
    			 $$invalidate(1, visited = $board.visited);
    		}

    		if ($$self.$$.dirty & /*$board*/ 1024) {
    			 $$invalidate(2, flagged = $board.flagged);
    		}

    		if ($$self.$$.dirty & /*$board*/ 1024) {
    			 $$invalidate(3, size = $board.size);
    		}

    		if ($$self.$$.dirty & /*$board*/ 1024) {
    			 $$invalidate(4, state = $board.state);
    		}
    	};

    	return [
    		content,
    		visited,
    		flagged,
    		size,
    		state,
    		selectCell,
    		getBackgroundColor,
    		getCursorStyle,
    		notClickable,
    		getCellContent,
    		$board,
    		click_handler,
    		contextmenu_handler
    	];
    }

    class Board$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Board",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/LevelPicker.svelte generated by Svelte v3.31.2 */
    const file$1 = "src/LevelPicker.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (18:4) {#each levels as level}
    function create_each_block$1(ctx) {
    	let option;
    	let t0_value = /*level*/ ctx[4].text + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = ctx[4];
    			option.value = option.__value;
    			add_location(option, file$1, 18, 6, 556);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(18:4) {#each levels as level}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let main;
    	let select;
    	let mounted;
    	let dispose;
    	let each_value = /*levels*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(select, "id", "level-picker");
    			attr_dev(select, "data-cy", "level-picker");
    			attr_dev(select, "class", "svelte-1gijwun");
    			if (/*selected*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[3].call(select));
    			add_location(select, file$1, 16, 2, 426);
    			attr_dev(main, "class", "svelte-1gijwun");
    			add_location(main, file$1, 14, 0, 375);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*selected*/ ctx[0]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler*/ ctx[3]),
    					listen_dev(select, "change", /*changeLevel*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*levels*/ 2) {
    				each_value = /*levels*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*selected, levels*/ 3) {
    				select_option(select, /*selected*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LevelPicker", slots, []);

    	let levels = [
    		{ id: Level$1.EASY, text: `Easy` },
    		{ id: Level$1.MEDIUM, text: `Medium` },
    		{ id: Level$1.HARD, text: `Hard` }
    	];

    	let selected;

    	function changeLevel() {
    		board.set(createBoard(selected.id));
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LevelPicker> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		selected = select_value(this);
    		$$invalidate(0, selected);
    		$$invalidate(1, levels);
    	}

    	$$self.$capture_state = () => ({
    		createBoard,
    		Level: Level$1,
    		board,
    		levels,
    		selected,
    		changeLevel
    	});

    	$$self.$inject_state = $$props => {
    		if ("levels" in $$props) $$invalidate(1, levels = $$props.levels);
    		if ("selected" in $$props) $$invalidate(0, selected = $$props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selected, levels, changeLevel, select_change_handler];
    }

    class LevelPicker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LevelPicker",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/ResetButton.svelte generated by Svelte v3.31.2 */
    const file$2 = "src/ResetButton.svelte";

    function create_fragment$2(ctx) {
    	let main;
    	let button;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			button = element("button");
    			t = text(/*resetBtnText*/ ctx[0]);
    			attr_dev(button, "id", "reset-btn");
    			attr_dev(button, "data-cy", "reset-btn");
    			attr_dev(button, "class", "reset-btn svelte-isilkn");
    			add_location(button, file$2, 14, 2, 441);
    			attr_dev(main, "class", "svelte-isilkn");
    			add_location(main, file$2, 13, 0, 432);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, button);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*resetBoard*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*resetBtnText*/ 1) set_data_dev(t, /*resetBtnText*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let level;
    	let size;
    	let state;
    	let bombsNumber;
    	let resetBtnText;
    	let $board;
    	validate_store(board, "board");
    	component_subscribe($$self, board, $$value => $$invalidate(2, $board = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ResetButton", slots, []);

    	function resetBoard() {
    		board.set(createBoard(level, size, bombsNumber));
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ResetButton> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		isPlayingState,
    		createBoard,
    		board,
    		resetBoard,
    		level,
    		$board,
    		size,
    		state,
    		bombsNumber,
    		resetBtnText
    	});

    	$$self.$inject_state = $$props => {
    		if ("level" in $$props) level = $$props.level;
    		if ("size" in $$props) size = $$props.size;
    		if ("state" in $$props) $$invalidate(3, state = $$props.state);
    		if ("bombsNumber" in $$props) bombsNumber = $$props.bombsNumber;
    		if ("resetBtnText" in $$props) $$invalidate(0, resetBtnText = $$props.resetBtnText);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$board*/ 4) {
    			 level = $board.level;
    		}

    		if ($$self.$$.dirty & /*$board*/ 4) {
    			 size = $board.size;
    		}

    		if ($$self.$$.dirty & /*$board*/ 4) {
    			 $$invalidate(3, state = $board.state);
    		}

    		if ($$self.$$.dirty & /*$board*/ 4) {
    			 bombsNumber = $board.bombsNumber;
    		}

    		if ($$self.$$.dirty & /*state*/ 8) {
    			 $$invalidate(0, resetBtnText = isPlayingState(state) ? "Reset" : "Play again");
    		}
    	};

    	return [resetBtnText, resetBoard, $board, state];
    }

    class ResetButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ResetButton",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/Flags.svelte generated by Svelte v3.31.2 */
    const file$3 = "src/Flags.svelte";

    function create_fragment$3(ctx) {
    	let main;
    	let t0;
    	let t1_value = /*$board*/ ctx[0].availableFlags + "";
    	let t1;

    	const block = {
    		c: function create() {
    			main = element("main");
    			t0 = text("⛳️  ");
    			t1 = text(t1_value);
    			attr_dev(main, "data-cy", "remaining-flags");
    			attr_dev(main, "id", "remaining-flags");
    			attr_dev(main, "class", "svelte-1s0x51y");
    			add_location(main, file$3, 3, 0, 58);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, t0);
    			append_dev(main, t1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$board*/ 1 && t1_value !== (t1_value = /*$board*/ ctx[0].availableFlags + "")) set_data_dev(t1, t1_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $board;
    	validate_store(board, "board");
    	component_subscribe($$self, board, $$value => $$invalidate(0, $board = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Flags", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Flags> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ board, $board });
    	return [$board];
    }

    class Flags extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Flags",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/Timer.svelte generated by Svelte v3.31.2 */
    const file$4 = "src/Timer.svelte";

    function create_fragment$4(ctx) {
    	let main;
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			main = element("main");
    			t0 = text("⏳  ");
    			t1 = text(/*timeText*/ ctx[0]);
    			attr_dev(main, "id", "timer");
    			attr_dev(main, "data-cy", "timer");
    			attr_dev(main, "class", "svelte-1ublb4p");
    			add_location(main, file$4, 36, 0, 1001);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, t0);
    			append_dev(main, t1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*timeText*/ 1) set_data_dev(t1, /*timeText*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let state;
    	let timeText;
    	let $board;
    	validate_store(board, "board");
    	component_subscribe($$self, board, $$value => $$invalidate(5, $board = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Timer", slots, []);
    	let interval;
    	let elapsed = 0;
    	let startTime;

    	function formatTime(seconds, state) {
    		let s = seconds;

    		if (state === BoardState$1.INITIAL) {
    			s = 0;
    		}

    		if (s > 999) {
    			s = 999;
    		}

    		return s.toString().padStart(3, "0");
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Timer> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		isPlayingState,
    		BoardState: BoardState$1,
    		board,
    		interval,
    		elapsed,
    		startTime,
    		formatTime,
    		state,
    		$board,
    		timeText
    	});

    	$$self.$inject_state = $$props => {
    		if ("interval" in $$props) $$invalidate(1, interval = $$props.interval);
    		if ("elapsed" in $$props) $$invalidate(2, elapsed = $$props.elapsed);
    		if ("startTime" in $$props) $$invalidate(3, startTime = $$props.startTime);
    		if ("state" in $$props) $$invalidate(4, state = $$props.state);
    		if ("timeText" in $$props) $$invalidate(0, timeText = $$props.timeText);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$board*/ 32) {
    			 $$invalidate(4, state = $board.state);
    		}

    		if ($$self.$$.dirty & /*state, interval, startTime*/ 26) {
    			 {
    				if (state === BoardState$1.PLAYING) {
    					$$invalidate(3, startTime = new Date());
    					$$invalidate(2, elapsed = 0);

    					// when switching states very fast, can face situations where previous interval is not cleared
    					if (interval) {
    						clearInterval(interval);
    					}

    					$$invalidate(1, interval = setInterval(
    						() => {
    							$$invalidate(2, elapsed = Math.round((new Date().valueOf() - startTime.valueOf()) / 1000));
    						},
    						1000
    					));
    				} else if (!isPlayingState(state)) {
    					$$invalidate(1, interval = clearInterval(interval));
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*elapsed, state*/ 20) {
    			 $$invalidate(0, timeText = formatTime(elapsed, state));
    		}
    	};

    	return [timeText, interval, elapsed, startTime, state, $board];
    }

    class Timer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Timer",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/MenuRow.svelte generated by Svelte v3.31.2 */
    const file$5 = "src/MenuRow.svelte";

    function create_fragment$5(ctx) {
    	let main;
    	let flags;
    	let t0;
    	let timer;
    	let t1;
    	let levelpicker;
    	let t2;
    	let resetbutton;
    	let current;
    	flags = new Flags({ $$inline: true });
    	timer = new Timer({ $$inline: true });
    	levelpicker = new LevelPicker({ $$inline: true });
    	resetbutton = new ResetButton({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(flags.$$.fragment);
    			t0 = space();
    			create_component(timer.$$.fragment);
    			t1 = space();
    			create_component(levelpicker.$$.fragment);
    			t2 = space();
    			create_component(resetbutton.$$.fragment);
    			attr_dev(main, "class", "svelte-pzp026");
    			add_location(main, file$5, 6, 0, 197);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(flags, main, null);
    			append_dev(main, t0);
    			mount_component(timer, main, null);
    			append_dev(main, t1);
    			mount_component(levelpicker, main, null);
    			append_dev(main, t2);
    			mount_component(resetbutton, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(flags.$$.fragment, local);
    			transition_in(timer.$$.fragment, local);
    			transition_in(levelpicker.$$.fragment, local);
    			transition_in(resetbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(flags.$$.fragment, local);
    			transition_out(timer.$$.fragment, local);
    			transition_out(levelpicker.$$.fragment, local);
    			transition_out(resetbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(flags);
    			destroy_component(timer);
    			destroy_component(levelpicker);
    			destroy_component(resetbutton);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MenuRow", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MenuRow> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ LevelPicker, ResetButton, Flags, Timer });
    	return [];
    }

    class MenuRow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MenuRow",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/Commands.svelte generated by Svelte v3.31.2 */

    const file$6 = "src/Commands.svelte";

    function create_fragment$6(ctx) {
    	let main;
    	let h3;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h3 = element("h3");
    			h3.textContent = "Left click to reveal cell content or right click to flag / unflag";
    			attr_dev(h3, "data-cy", "commands-txt");
    			attr_dev(h3, "class", "svelte-1d82f3z");
    			add_location(h3, file$6, 1, 2, 9);
    			attr_dev(main, "class", "svelte-1d82f3z");
    			add_location(main, file$6, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Commands", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Commands> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Commands extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Commands",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/StateText.svelte generated by Svelte v3.31.2 */
    const file$7 = "src/StateText.svelte";

    // (11:2) {:else}
    function create_else_block(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Avoid the 💣💥";
    			attr_dev(h2, "id", "instructions");
    			attr_dev(h2, "data-cy", "instructions");
    			attr_dev(h2, "class", "svelte-bpnciz");
    			add_location(h2, file$7, 11, 4, 391);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(11:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (9:2) {#if !isPlayingState(state)}
    function create_if_block(ctx) {
    	let h2;
    	let t;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t = text(/*endGameText*/ ctx[1]);
    			attr_dev(h2, "id", "endgame-text");
    			attr_dev(h2, "data-cy", "endgame-text");
    			attr_dev(h2, "class", "svelte-bpnciz");
    			add_location(h2, file$7, 9, 4, 313);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*endGameText*/ 2) set_data_dev(t, /*endGameText*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(9:2) {#if !isPlayingState(state)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let main;
    	let show_if;

    	function select_block_type(ctx, dirty) {
    		if (show_if == null || dirty & /*state*/ 1) show_if = !!!isPlayingState(/*state*/ ctx[0]);
    		if (show_if) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx, -1);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if_block.c();
    			add_location(main, file$7, 7, 0, 271);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if_block.m(main, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx, dirty)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(main, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let state;
    	let endGameText;
    	let $board;
    	validate_store(board, "board");
    	component_subscribe($$self, board, $$value => $$invalidate(2, $board = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("StateText", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<StateText> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		isPlayingState,
    		BoardState: BoardState$1,
    		board,
    		state,
    		$board,
    		endGameText
    	});

    	$$self.$inject_state = $$props => {
    		if ("state" in $$props) $$invalidate(0, state = $$props.state);
    		if ("endGameText" in $$props) $$invalidate(1, endGameText = $$props.endGameText);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$board*/ 4) {
    			 $$invalidate(0, state = $board.state);
    		}

    		if ($$self.$$.dirty & /*state*/ 1) {
    			 $$invalidate(1, endGameText = state === BoardState$1.WON
    			? "You won! 🙌"
    			: "You lost.. 😫");
    		}
    	};

    	return [state, endGameText, $board];
    }

    class StateText extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "StateText",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/AboutFooter.svelte generated by Svelte v3.31.2 */

    const file$8 = "src/AboutFooter.svelte";

    function create_fragment$8(ctx) {
    	let footer;
    	let p;
    	let t0;
    	let a;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			p = element("p");
    			t0 = text("Check out the code on ");
    			a = element("a");
    			a.textContent = "GitHub";
    			attr_dev(a, "href", "https://github.com/Shaance/minesweeper");
    			add_location(a, file$8, 1, 28, 37);
    			add_location(p, file$8, 1, 2, 11);
    			add_location(footer, file$8, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, p);
    			append_dev(p, t0);
    			append_dev(p, a);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("AboutFooter", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AboutFooter> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class AboutFooter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AboutFooter",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.31.2 */
    const file$9 = "src/App.svelte";

    function create_fragment$9(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let statetext;
    	let t2;
    	let menurow;
    	let t3;
    	let br0;
    	let br1;
    	let t4;
    	let board;
    	let t5;
    	let commands;
    	let t6;
    	let aboutfooter;
    	let current;
    	statetext = new StateText({ $$inline: true });
    	menurow = new MenuRow({ $$inline: true });
    	board = new Board$1({ $$inline: true });
    	commands = new Commands({ $$inline: true });
    	aboutfooter = new AboutFooter({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "MineSweeper";
    			t1 = space();
    			create_component(statetext.$$.fragment);
    			t2 = space();
    			create_component(menurow.$$.fragment);
    			t3 = space();
    			br0 = element("br");
    			br1 = element("br");
    			t4 = space();
    			create_component(board.$$.fragment);
    			t5 = space();
    			create_component(commands.$$.fragment);
    			t6 = space();
    			create_component(aboutfooter.$$.fragment);
    			attr_dev(h1, "id", "title");
    			attr_dev(h1, "data-cy", "title");
    			attr_dev(h1, "class", "svelte-1oo2qga");
    			add_location(h1, file$9, 8, 2, 248);
    			add_location(br0, file$9, 11, 2, 328);
    			add_location(br1, file$9, 11, 8, 334);
    			attr_dev(main, "class", "svelte-1oo2qga");
    			add_location(main, file$9, 7, 0, 239);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			mount_component(statetext, main, null);
    			append_dev(main, t2);
    			mount_component(menurow, main, null);
    			append_dev(main, t3);
    			append_dev(main, br0);
    			append_dev(main, br1);
    			append_dev(main, t4);
    			mount_component(board, main, null);
    			append_dev(main, t5);
    			mount_component(commands, main, null);
    			append_dev(main, t6);
    			mount_component(aboutfooter, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(statetext.$$.fragment, local);
    			transition_in(menurow.$$.fragment, local);
    			transition_in(board.$$.fragment, local);
    			transition_in(commands.$$.fragment, local);
    			transition_in(aboutfooter.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(statetext.$$.fragment, local);
    			transition_out(menurow.$$.fragment, local);
    			transition_out(board.$$.fragment, local);
    			transition_out(commands.$$.fragment, local);
    			transition_out(aboutfooter.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(statetext);
    			destroy_component(menurow);
    			destroy_component(board);
    			destroy_component(commands);
    			destroy_component(aboutfooter);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Board: Board$1,
    		MenuRow,
    		Commands,
    		StateText,
    		AboutFooter
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
