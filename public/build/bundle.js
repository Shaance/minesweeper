
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

    var BoardInput;
    (function (BoardInput) {
        BoardInput["REVEAL"] = "REVEAL";
        BoardInput["FLAG"] = "FLAG";
    })(BoardInput || (BoardInput = {}));
    var BoardInput$1 = BoardInput;

    function coordinatesInBoard(x, y, boardContent) {
        return x >= 0 && y >= 0 && x < boardContent.length && y < boardContent[x].length;
    }
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
    function getDirectionsWithDiagonals() {
        return [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, -1], [1, -1], [-1, 1]];
    }
    function getDirections() {
        return [[0, 1], [1, 0], [0, -1], [-1, 0]];
    }

    var BoardState;
    (function (BoardState) {
        BoardState["INITIAL"] = "INITIAL";
        BoardState["PLAYING"] = "PLAYING";
        BoardState["WON"] = "WON";
        BoardState["LOST"] = "LOST";
    })(BoardState || (BoardState = {}));
    var BoardState$1 = BoardState;

    var CellType;
    (function (CellType) {
        CellType[CellType["BOMB"] = -1] = "BOMB";
        CellType[CellType["EMPTY"] = 0] = "EMPTY";
    })(CellType || (CellType = {}));
    var CellType$1 = CellType;

    const DEFAULT_SIZE = 8;
    const DEFAULT_BOMB_NUMBERS = 8;
    class Board {
        constructor(size, bombsNumber) {
            const actualSize = size && size > 0
                ? size
                : DEFAULT_SIZE;
            const actualBombsNumber = bombsNumber && bombsNumber > 0
                ? bombsNumber
                : DEFAULT_BOMB_NUMBERS;
            this.content = getBoardContent(actualSize, actualBombsNumber);
            this.visited = getBooleanMatrix(actualSize);
            this.flagged = getBooleanMatrix(actualSize);
            this.size = actualSize;
            this.bombsNumber = actualBombsNumber;
            this.state = BoardState$1.INITIAL;
            this.remainingNotVisited = actualSize * actualSize - actualBombsNumber;
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
        const board = placeBombs(getZeroesMatrix(size), bombPositions);
        return markAdjacentCells(board, bombPositions);
    }
    function getBombPositions(size, bombsNumber) {
        const bombPositions = new Set();
        while (bombPositions.size !== bombsNumber) {
            const randomPositions = generatePosition(size);
            bombPositions.add(String(randomPositions[0]) + String(randomPositions[1]));
        }
        const positionsArray = Array.from(bombPositions)
            .map((str) => [Number(str.charAt(0)), Number(str.charAt(1))]);
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
    function getZeroesMatrix(size) {
        return createMatrix(size, (matrix, idx) => matrix[idx].push(0));
    }
    function getBooleanMatrix(size) {
        return createMatrix(size, (matrix, idx) => matrix[idx].push(false));
    }

    function createBoard(size, bombNumber) {
        return new Board(size, bombNumber);
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
        const newBoard = createBoard(board.size, board.bombsNumber).withFlagged(board.flagged);
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
        if (board.visited[row][col] || board.flagged[row][col] || finishedState(board)) {
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
        const newBoard = board;
        newBoard.flagged[row][col] = !newBoard.flagged[row][col];
        return newBoard;
    }
    function finishedState(board) {
        return board.state === BoardState$1.LOST || board.state === BoardState$1.WON;
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

    /* src/Board.svelte generated by Svelte v3.31.2 */
    const file = "src/Board.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	child_ctx[18] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	child_ctx[21] = i;
    	return child_ctx;
    }

    // (115:2) {:else}
    function create_else_block(ctx) {
    	let h2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Avoid the 💣💥";
    			attr_dev(h2, "class", "svelte-vtmw7m");
    			add_location(h2, file, 115, 4, 2899);
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
    		source: "(115:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (113:2) {#if !isPlayingState(state)}
    function create_if_block(ctx) {
    	let h2;
    	let t;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t = text(/*endGameText*/ ctx[5]);
    			attr_dev(h2, "class", "svelte-vtmw7m");
    			add_location(h2, file, 113, 4, 2862);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*endGameText*/ 32) set_data_dev(t, /*endGameText*/ ctx[5]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(113:2) {#if !isPlayingState(state)}",
    		ctx
    	});

    	return block;
    }

    // (126:6) {#each row as value, j}
    function create_each_block_1(ctx) {
    	let div;
    	let button;
    	let t0_value = /*getCellContent*/ ctx[12](/*visited*/ ctx[2], /*flagged*/ ctx[3], /*i*/ ctx[18], /*j*/ ctx[21]) + "";
    	let t0;
    	let button_disabled_value;
    	let button_style_value;
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[14](/*i*/ ctx[18], /*j*/ ctx[21]);
    	}

    	function contextmenu_handler() {
    		return /*contextmenu_handler*/ ctx[15](/*i*/ ctx[18], /*j*/ ctx[21]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(button, "class", "cell-button svelte-vtmw7m");
    			button.disabled = button_disabled_value = /*notClickable*/ ctx[11](/*visited*/ ctx[2], /*state*/ ctx[0], /*i*/ ctx[18], /*j*/ ctx[21]);
    			attr_dev(button, "style", button_style_value = "background-color:" + /*getBackgroundColor*/ ctx[9](/*visited*/ ctx[2], /*i*/ ctx[18], /*j*/ ctx[21]) + ";\n              color:" + getColorForValue(/*value*/ ctx[19]) + ";\n              " + /*getCursorStyle*/ ctx[10](/*visited*/ ctx[2], /*flagged*/ ctx[3], /*state*/ ctx[0], /*i*/ ctx[18], /*j*/ ctx[21]));
    			add_location(button, file, 127, 12, 3356);
    			attr_dev(div, "class", "column svelte-vtmw7m");
    			add_location(div, file, 126, 8, 3323);
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
    			if (dirty & /*visited, flagged*/ 12 && t0_value !== (t0_value = /*getCellContent*/ ctx[12](/*visited*/ ctx[2], /*flagged*/ ctx[3], /*i*/ ctx[18], /*j*/ ctx[21]) + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*visited, state*/ 5 && button_disabled_value !== (button_disabled_value = /*notClickable*/ ctx[11](/*visited*/ ctx[2], /*state*/ ctx[0], /*i*/ ctx[18], /*j*/ ctx[21]))) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}

    			if (dirty & /*visited, content, flagged, state*/ 15 && button_style_value !== (button_style_value = "background-color:" + /*getBackgroundColor*/ ctx[9](/*visited*/ ctx[2], /*i*/ ctx[18], /*j*/ ctx[21]) + ";\n              color:" + getColorForValue(/*value*/ ctx[19]) + ";\n              " + /*getCursorStyle*/ ctx[10](/*visited*/ ctx[2], /*flagged*/ ctx[3], /*state*/ ctx[0], /*i*/ ctx[18], /*j*/ ctx[21]))) {
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
    		source: "(126:6) {#each row as value, j}",
    		ctx
    	});

    	return block;
    }

    // (125:4) {#each content as row, i}
    function create_each_block(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*row*/ ctx[16];
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
    			if (dirty & /*notClickable, visited, state, getBackgroundColor, getColorForValue, content, getCursorStyle, flagged, selectCell, BoardInput, getCellContent*/ 7951) {
    				each_value_1 = /*row*/ ctx[16];
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
    		source: "(125:4) {#each content as row, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let show_if;
    	let t0;
    	let button;
    	let t1;
    	let t2;
    	let br0;
    	let br1;
    	let t3;
    	let div;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (show_if == null || dirty & /*state*/ 1) show_if = !!!/*isPlayingState*/ ctx[6](/*state*/ ctx[0]);
    		if (show_if) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx, -1);
    	let if_block = current_block_type(ctx);
    	let each_value = /*content*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			if_block.c();
    			t0 = space();
    			button = element("button");
    			t1 = text(/*resetBtnText*/ ctx[4]);
    			t2 = space();
    			br0 = element("br");
    			br1 = element("br");
    			t3 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(button, "class", "reset-btn svelte-vtmw7m");
    			add_location(button, file, 117, 2, 2933);
    			add_location(br0, file, 118, 2, 3009);
    			add_location(br1, file, 118, 6, 3013);
    			attr_dev(div, "class", "grid svelte-vtmw7m");
    			set_style(div, "width", width + "px");
    			set_style(div, "grid-template-columns", repeatValueWithSuffix(DEFAULT_SIZE$1, width / DEFAULT_SIZE$1, "px"));
    			set_style(div, "grid-template-rows", repeatValueWithSuffix(DEFAULT_SIZE$1, width / DEFAULT_SIZE$1, "px"));
    			add_location(div, file, 119, 2, 3020);
    			add_location(main, file, 111, 0, 2820);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if_block.m(main, null);
    			append_dev(main, t0);
    			append_dev(main, button);
    			append_dev(button, t1);
    			append_dev(main, t2);
    			append_dev(main, br0);
    			append_dev(main, br1);
    			append_dev(main, t3);
    			append_dev(main, div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*resetBoard*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx, dirty)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(main, t0);
    				}
    			}

    			if (dirty & /*resetBtnText*/ 16) set_data_dev(t1, /*resetBtnText*/ ctx[4]);

    			if (dirty & /*content, notClickable, visited, state, getBackgroundColor, getColorForValue, getCursorStyle, flagged, selectCell, BoardInput, getCellContent*/ 7951) {
    				each_value = /*content*/ ctx[1];
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
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_block.d();
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
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

    const DEFAULT_SIZE$1 = 8;
    const DEFAULT_BOMBS_NUMBER = 11;
    const width = 500;

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
    	let state;
    	let resetBtnText;
    	let endGameText;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Board", slots, []);
    	let board = createBoard(DEFAULT_SIZE$1, DEFAULT_BOMBS_NUMBER);

    	function isPlayingState(state) {
    		return state === BoardState$1.INITIAL || state === BoardState$1.PLAYING;
    	}

    	function resetBoard() {
    		$$invalidate(13, board = createBoard(DEFAULT_SIZE$1, DEFAULT_BOMBS_NUMBER));
    	}

    	function selectCell(inputMode, i, j) {
    		$$invalidate(13, board = getBoardAfterPlayerMove(inputMode, board, i, j));
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
    		BoardInput: BoardInput$1,
    		createBoard,
    		getBoardAfterPlayerMove,
    		BoardState: BoardState$1,
    		CellType: CellType$1,
    		DEFAULT_SIZE: DEFAULT_SIZE$1,
    		DEFAULT_BOMBS_NUMBER,
    		width,
    		board,
    		isPlayingState,
    		resetBoard,
    		selectCell,
    		repeatValueWithSuffix,
    		getBackgroundColor,
    		getCursorStyle,
    		notClickable,
    		getCellContent,
    		getColorForValue,
    		content,
    		visited,
    		flagged,
    		state,
    		resetBtnText,
    		endGameText
    	});

    	$$self.$inject_state = $$props => {
    		if ("board" in $$props) $$invalidate(13, board = $$props.board);
    		if ("content" in $$props) $$invalidate(1, content = $$props.content);
    		if ("visited" in $$props) $$invalidate(2, visited = $$props.visited);
    		if ("flagged" in $$props) $$invalidate(3, flagged = $$props.flagged);
    		if ("state" in $$props) $$invalidate(0, state = $$props.state);
    		if ("resetBtnText" in $$props) $$invalidate(4, resetBtnText = $$props.resetBtnText);
    		if ("endGameText" in $$props) $$invalidate(5, endGameText = $$props.endGameText);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*board*/ 8192) {
    			 $$invalidate(1, content = board.content);
    		}

    		if ($$self.$$.dirty & /*board*/ 8192) {
    			 $$invalidate(2, visited = board.visited);
    		}

    		if ($$self.$$.dirty & /*board*/ 8192) {
    			 $$invalidate(3, flagged = board.flagged);
    		}

    		if ($$self.$$.dirty & /*board*/ 8192) {
    			 $$invalidate(0, state = board.state);
    		}

    		if ($$self.$$.dirty & /*state*/ 1) {
    			 $$invalidate(4, resetBtnText = isPlayingState(state) ? "Reset" : "Play again");
    		}

    		if ($$self.$$.dirty & /*state*/ 1) {
    			 $$invalidate(5, endGameText = state === BoardState$1.WON
    			? "You won! 🙌"
    			: "You lost.. 😫");
    		}
    	};

    	return [
    		state,
    		content,
    		visited,
    		flagged,
    		resetBtnText,
    		endGameText,
    		isPlayingState,
    		resetBoard,
    		selectCell,
    		getBackgroundColor,
    		getCursorStyle,
    		notClickable,
    		getCellContent,
    		board,
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

    /* src/Commands.svelte generated by Svelte v3.31.2 */

    const file$1 = "src/Commands.svelte";

    function create_fragment$1(ctx) {
    	let main;
    	let h3;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h3 = element("h3");
    			h3.textContent = "Use left click to reveal cell content or right click to flag/unflag";
    			attr_dev(h3, "class", "svelte-h71jex");
    			add_location(h3, file$1, 16, 1, 177);
    			attr_dev(main, "class", "svelte-h71jex");
    			add_location(main, file$1, 15, 0, 169);
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
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
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Commands",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.31.2 */
    const file$2 = "src/App.svelte";

    function create_fragment$2(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let board;
    	let t2;
    	let commands;
    	let current;
    	board = new Board$1({ $$inline: true });
    	commands = new Commands({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "MineSweeper";
    			t1 = space();
    			create_component(board.$$.fragment);
    			t2 = space();
    			create_component(commands.$$.fragment);
    			attr_dev(h1, "class", "svelte-1tky8bj");
    			add_location(h1, file$2, 5, 1, 115);
    			attr_dev(main, "class", "svelte-1tky8bj");
    			add_location(main, file$2, 4, 0, 107);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			mount_component(board, main, null);
    			append_dev(main, t2);
    			mount_component(commands, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(board.$$.fragment, local);
    			transition_in(commands.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(board.$$.fragment, local);
    			transition_out(commands.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(board);
    			destroy_component(commands);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Board: Board$1, Commands });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
