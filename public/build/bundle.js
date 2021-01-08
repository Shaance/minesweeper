
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
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
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
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
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
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
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

    var BoardInput;
    (function (BoardInput) {
        BoardInput["REVEAL"] = "REVEAL";
        BoardInput["FLAG"] = "FLAG";
    })(BoardInput || (BoardInput = {}));

    // import { readlineSync, writeToStandardOutput } from './StandardIOHelper';
    function createBoard(size, bombNumber) {
        return new Board(size, bombNumber);
    }
    // async function printAndGetNumberInput(message: string): Promise<number> {
    //   const userInput = await printAndGetInput(message, isNumber, 'Not an number, try again.');
    //   return Number.parseInt(userInput, 10);
    // }
    // async function printAndGetInputMode(message: string): Promise<BoardInput> {
    //   const errMessage = 'Wrong input. Valid inputs are F for flag mode or R as reveal mode.';
    //   const validInput = (str: string) => str && (str.toUpperCase() === 'F' || str.toUpperCase() === 'R');
    //   const userInput = await printAndGetInput(message, validInput, errMessage);
    //   if (userInput.toUpperCase() === 'F') {
    //     return BoardInput.FLAG;
    //   }
    //   return BoardInput.REVEAL;
    // }
    // async function printAndGetInput(message: string, predicate: Predicate<string>, errMessage: string): Promise<string> {
    //   writeToStandardOutput(message);
    //   const userInput = await readlineSync();
    //   if (predicate(userInput)) {
    //     return userInput;
    //   }
    //   writeToStandardOutput(errMessage);
    //   return printAndGetInput(message, predicate, errMessage);
    // }
    // async function askCoordinates(): Promise<number[]> {
    //   const row = await printAndGetNumberInput('Row: ');
    //   const col = await printAndGetNumberInput('Col: ');
    //   return [row - 1, col - 1];
    // }

    /* src/App.svelte generated by Svelte v3.31.2 */
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (22:2) {#each row as value, j}
    function create_each_block_1(ctx) {
    	let p;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5_value = /*value*/ ctx[8] + "";
    	let t5;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("Row ");
    			t1 = text(/*i*/ ctx[7]);
    			t2 = text(", Column ");
    			t3 = text(/*j*/ ctx[10]);
    			t4 = text(", value ");
    			t5 = text(t5_value);
    			add_location(p, file, 22, 3, 509);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(p, t3);
    			append_dev(p, t4);
    			append_dev(p, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*content*/ 1 && t5_value !== (t5_value = /*value*/ ctx[8] + "")) set_data_dev(t5, t5_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(22:2) {#each row as value, j}",
    		ctx
    	});

    	return block;
    }

    // (21:1) {#each content as row, i}
    function create_each_block(ctx) {
    	let t;
    	let br;
    	let each_value_1 = /*row*/ ctx[5];
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

    			t = space();
    			br = element("br");
    			add_location(br, file, 24, 1, 563);
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			insert_dev(target, br, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*content*/ 1) {
    				each_value_1 = /*row*/ ctx[5];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(t.parentNode, t);
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
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(br);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(21:1) {#each content as row, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let button;
    	let t3;
    	let mounted;
    	let dispose;
    	let each_value = /*content*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Hello Boss!";
    			t1 = space();
    			button = element("button");
    			button.textContent = "Reset board";
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "svelte-1tky8bj");
    			add_location(h1, file, 16, 1, 374);
    			add_location(button, file, 17, 1, 396);
    			attr_dev(main, "class", "svelte-1tky8bj");
    			add_location(main, file, 15, 0, 366);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, button);
    			append_dev(main, t3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(main, null);
    			}

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleClick*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*content*/ 1) {
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
    						each_blocks[i].m(main, null);
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

    function instance($$self, $$props, $$invalidate) {
    	let content;
    	let visited;
    	let flagged;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	
    	let board;

    	onMount(() => {
    		$$invalidate(2, board = createBoard(5, 5));
    	});

    	function handleClick() {
    		$$invalidate(2, board = createBoard(5, 5));
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		createBoard,
    		board,
    		handleClick,
    		content,
    		visited,
    		flagged
    	});

    	$$self.$inject_state = $$props => {
    		if ("board" in $$props) $$invalidate(2, board = $$props.board);
    		if ("content" in $$props) $$invalidate(0, content = $$props.content);
    		if ("visited" in $$props) visited = $$props.visited;
    		if ("flagged" in $$props) flagged = $$props.flagged;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*board*/ 4) {
    			 $$invalidate(0, content = board ? board.content : []);
    		}

    		if ($$self.$$.dirty & /*board*/ 4) {
    			 visited = board ? board.visited : [];
    		}

    		if ($$self.$$.dirty & /*board*/ 4) {
    			 flagged = board ? board.flagged : [];
    		}
    	};

    	return [content, handleClick, board];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
