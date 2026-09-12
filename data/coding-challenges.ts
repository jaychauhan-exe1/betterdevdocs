import { CategoryType } from "./topics";

export type CodingDifficulty = "Easy" | "Medium" | "Hard";

export interface TestCase {
  input: string; // JavaScript code to evaluate or pass to function
  expectedOutput: string;
  description: string;
}

export interface CodingChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: CodingDifficulty;
  category: CategoryType;
  roles: string[]; // e.g. ["frontend", "backend", "fullstack", "data-engineer", "data-analytics", "devops-architect"]
  starterCode: string;
  testCases: TestCase[];
  solution: string;
  hints: string[];
  points: number;
}

export const CODING_CHALLENGES: CodingChallenge[] = [
  // ==========================================
  // EASY (10 Questions - 2 pts each)
  // ==========================================
  {
    id: "two-sum",
    title: "Two Sum",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target` as an array `[index1, index2]`. You may assume that each input would have exactly one solution, and you may not use the same element twice. Return the indices sorted in ascending order.",
    difficulty: "Easy",
    category: "DSA",
    roles: ["frontend", "backend", "fullstack", "data-engineer", "data-analytics", "devops-architect"],
    starterCode: `function twoSum(nums, target) {
  // Write your code here
  
}`,
    testCases: [
      {
        input: "twoSum([2, 7, 11, 15], 9)",
        expectedOutput: "[0,1]",
        description: "Standard case: nums = [2, 7, 11, 15], target = 9"
      },
      {
        input: "twoSum([3, 2, 4], 6)",
        expectedOutput: "[1,2]",
        description: "Unsorted array: nums = [3, 2, 4], target = 6"
      },
      {
        input: "twoSum([3, 3], 6)",
        expectedOutput: "[0,1]",
        description: "Duplicate numbers: nums = [3, 3], target = 6"
      }
    ],
    solution: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    hints: [
      "Try using a Hash Map to store previously seen numbers and their indices.",
      "For each element x, look up if (target - x) exists in your map in O(1) time."
    ],
    points: 2
  },
  {
    id: "array-filter-polyfill",
    title: "Array.prototype.filter Polyfill",
    description: "Implement a function `myFilter(array, callback)` that behaves identically to standard `Array.prototype.filter()`. It should create a new array with all elements that pass the test implemented by the provided callback function `callback(element, index, array)`.",
    difficulty: "Easy",
    category: "JAVASCRIPT",
    roles: ["frontend", "fullstack"],
    starterCode: `function myFilter(array, callback) {
  // Write your code here
  
}`,
    testCases: [
      {
        input: "myFilter([1, 2, 3, 4, 5], x => x % 2 === 0)",
        expectedOutput: "[2,4]",
        description: "Filter even numbers"
      },
      {
        input: "myFilter(['apple', 'banana', 'kiwi'], (item, idx) => item.length > 4)",
        expectedOutput: "[\"apple\",\"banana\"]",
        description: "Filter strings by length"
      },
      {
        input: "myFilter([10, 20, 30], (val, i) => i > 0)",
        expectedOutput: "[20,30]",
        description: "Filter using element index parameter"
      }
    ],
    solution: `function myFilter(array, callback) {
  const result = [];
  for (let i = 0; i < array.length; i++) {
    if (callback(array[i], i, array)) {
      result.push(array[i]);
    }
  }
  return result;
}`,
    hints: [
      "Iterate over the array using a standard loop.",
      "Pass element, index, and the original array into the callback."
    ],
    points: 2
  },
  {
    id: "count-vowels-consonants",
    title: "Count Vowels & Consonants",
    description: "Write a function `countVowelsAndConsonants(str)` that accepts a string and returns an object `{ vowels: number, consonants: number }`. Ignore spaces, numbers, punctuation, and casing (treat 'A' and 'a' as vowels).",
    difficulty: "Easy",
    category: "JAVASCRIPT",
    roles: ["frontend", "fullstack"],
    starterCode: `function countVowelsAndConsonants(str) {
  // Write your code here
  
}`,
    testCases: [
      {
        input: "countVowelsAndConsonants('Hello World!')",
        expectedOutput: "{\"vowels\":3,\"consonants\":7}",
        description: "'Hello World!' -> 3 vowels (e, o, o), 7 consonants (h, l, l, w, r, l, d)"
      },
      {
        input: "countVowelsAndConsonants('DevDocs 2026')",
        expectedOutput: "{\"vowels\":2,\"consonants\":5}",
        description: "'DevDocs 2026' -> 2 vowels (e, o), 5 consonants (d, v, d, c, s)"
      }
    ],
    solution: `function countVowelsAndConsonants(str) {
  const vowelsSet = new Set(['a', 'e', 'i', 'o', 'u']);
  let vowels = 0;
  let consonants = 0;
  
  for (const char of str.toLowerCase()) {
    if (char >= 'a' && char <= 'z') {
      if (vowelsSet.has(char)) {
        vowels++;
      } else {
        consonants++;
      }
    }
  }
  return { vowels, consonants };
}`,
    hints: [
      "Convert the string to lowercase first.",
      "Check if a character is a letter between 'a' and 'z' before categorizing."
    ],
    points: 2
  },
  {
    id: "remove-duplicates-sorted",
    title: "Remove Duplicates from Sorted Array",
    description: "Given a sorted array of numbers `nums`, remove the duplicates in-place such that each unique element appears only once. Return the resulting array of unique values.",
    difficulty: "Easy",
    category: "DSA",
    roles: ["frontend", "backend", "fullstack", "data-engineer", "data-analytics", "devops-architect"],
    starterCode: `function removeDuplicates(nums) {
  // Write your code here
  
}`,
    testCases: [
      {
        input: "removeDuplicates([1, 1, 2])",
        expectedOutput: "[1,2]",
        description: "[1, 1, 2] -> [1, 2]"
      },
      {
        input: "removeDuplicates([0,0,1,1,1,2,2,3,3,4])",
        expectedOutput: "[0,1,2,3,4]",
        description: "[0,0,1,1,1,2,2,3,3,4] -> [0,1,2,3,4]"
      }
    ],
    solution: `function removeDuplicates(nums) {
  if (nums.length === 0) return [];
  let k = 1;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] !== nums[i - 1]) {
      nums[k] = nums[i];
      k++;
    }
  }
  return nums.slice(0, k);
}`,
    hints: [
      "Since the array is sorted, duplicates are adjacent.",
      "Use a two-pointer approach to overwrite duplicates."
    ],
    points: 2
  },
  {
    id: "flatten-array-shallow",
    title: "Flatten Array (1 Level)",
    description: "Implement a function `flatten(arr)` that flattens a nested array by 1 level depth, equivalent to `arr.flat(1)` without using built-in `.flat()`.",
    difficulty: "Easy",
    category: "JAVASCRIPT",
    roles: ["frontend", "fullstack"],
    starterCode: `function flatten(arr) {
  // Write your code here
  
}`,
    testCases: [
      {
        input: "flatten([1, [2, 3], 4, [5]])",
        expectedOutput: "[1,2,3,4,5]",
        description: "[1, [2, 3], 4, [5]] -> [1, 2, 3, 4, 5]"
      },
      {
        input: "flatten([1, [2, [3, 4]], 5])",
        expectedOutput: "[1,2,[3,4],5]",
        description: "[1, [2, [3, 4]], 5] -> [1, 2, [3, 4], 5] (1 level)"
      }
    ],
    solution: `function flatten(arr) {
  const result = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      result.push(...item);
    } else {
      result.push(item);
    }
  }
  return result;
}`,
    hints: [
      "Iterate over items and check `Array.isArray(item)`.",
      "Use `result.push(...item)` or `concat` to unwrap 1 level."
    ],
    points: 2
  },
  {
    id: "http-query-string-parser",
    title: "HTTP Query String Parser",
    description: "Write a function `parseQueryString(url)` that takes a URL string or query string (e.g. `\"https://devdocs.io/search?q=react&page=2&sort=desc\"` or `\"q=react&page=2\"`) and parses the query parameters into a key-value object. Auto-convert numeric string values to numbers.",
    difficulty: "Easy",
    category: "HTTP",
    roles: ["frontend", "backend", "fullstack", "devops-architect"],
    starterCode: `function parseQueryString(url) {
  // Write your code here
  
}`,
    testCases: [
      {
        input: "parseQueryString('https://api.devdocs.com/topics?role=frontend&limit=10')",
        expectedOutput: "{\"role\":\"frontend\",\"limit\":10}",
        description: "Parse full URL with string and numeric param"
      },
      {
        input: "parseQueryString('active=true&count=5')",
        expectedOutput: "{\"active\":\"true\",\"count\":5}",
        description: "Parse query parameters directly"
      }
    ],
    solution: `function parseQueryString(url) {
  const queryString = url.includes('?') ? url.split('?')[1] : url;
  if (!queryString) return {};
  const result = {};
  const pairs = queryString.split('&');
  for (const pair of pairs) {
    if (!pair) continue;
    const [rawKey, rawVal] = pair.split('=');
    const key = decodeURIComponent(rawKey);
    const val = rawVal !== undefined ? decodeURIComponent(rawVal) : '';
    const num = Number(val);
    result[key] = !isNaN(num) && val.trim() !== '' ? num : val;
  }
  return result;
}`,
    hints: [
      "Extract the substring after '?' if present.",
      "Split by '&' to get key-value pairs, then split by '='.",
      "Convert numeric values using `Number()`."
    ],
    points: 2
  },
  {
    id: "sql-where-clause-filter",
    title: "SQL WHERE Clause Filter Engine",
    description: "Write a function `filterRows(rows, condition)` that simulates an in-memory SQL `WHERE` clause. `rows` is an array of objects. `condition` is an object specifying column equals value requirements (e.g., `{ role: 'frontend', level: 2 }`). Return only rows matching all conditions.",
    difficulty: "Easy",
    category: "MYSQL",
    roles: ["data-engineer", "data-analytics", "backend", "fullstack"],
    starterCode: `function filterRows(rows, condition) {
  // Write your code here
  
}`,
    testCases: [
      {
        input: "filterRows([{id: 1, name: 'Alice', role: 'frontend'}, {id: 2, name: 'Bob', role: 'backend'}, {id: 3, name: 'Charlie', role: 'frontend'}], {role: 'frontend'})",
        expectedOutput: "[{\"id\":1,\"name\":\"Alice\",\"role\":\"frontend\"},{\"id\":3,\"name\":\"Charlie\",\"role\":\"frontend\"}]",
        description: "Filter by single column match"
      },
      {
        input: "filterRows([{id: 1, dept: 'Engineering', active: true}, {id: 2, dept: 'Engineering', active: false}], {dept: 'Engineering', active: true})",
        expectedOutput: "[{\"id\":1,\"dept\":\"Engineering\",\"active\":true}]",
        description: "Filter by multiple conditions"
      }
    ],
    solution: `function filterRows(rows, condition) {
  const keys = Object.keys(condition);
  return rows.filter(row => {
    return keys.every(key => row[key] === condition[key]);
  });
}`,
    hints: [
      "Use `Array.prototype.filter` on the rows.",
      "Check `Object.keys(condition).every(...)` to ensure all fields match."
    ],
    points: 2
  },
  {
    id: "simple-event-emitter",
    title: "Simple Event Emitter",
    description: "Create an `EventEmitter` class with `on(eventName, listener)` and `emit(eventName, ...args)` methods. `on` subscribes a callback, and `emit` invokes all subscribed callbacks with the passed arguments.",
    difficulty: "Easy",
    category: "JAVASCRIPT",
    roles: ["frontend", "backend", "fullstack"],
    starterCode: `class EventEmitter {
  constructor() {
    // Initialize state
  }

  on(eventName, listener) {
    // Add listener
  }

  emit(eventName, ...args) {
    // Execute listeners
  }
}`,
    testCases: [
      {
        input: `(() => {
          const ee = new EventEmitter();
          let count = 0;
          ee.on('tick', val => count += val);
          ee.emit('tick', 5);
          ee.emit('tick', 10);
          return count;
        })()`,
        expectedOutput: "15",
        description: "Emit events to single listener"
      },
      {
        input: `(() => {
          const ee = new EventEmitter();
          const log = [];
          ee.on('greet', name => log.push('Hello ' + name));
          ee.on('greet', name => log.push('Bye ' + name));
          ee.emit('greet', 'DevDocs');
          return log;
        })()`,
        expectedOutput: "[\"Hello DevDocs\",\"Bye DevDocs\"]",
        description: "Multiple listeners on same event"
      }
    ],
    solution: `class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(eventName, listener) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(listener);
  }

  emit(eventName, ...args) {
    if (!this.events[eventName]) return;
    for (const listener of this.events[eventName]) {
      listener(...args);
    }
  }
}`,
    hints: [
      "Store event listeners in an object where keys are event names and values are arrays of functions.",
      "Iterate over the array of listener functions when `emit` is called."
    ],
    points: 2
  },
  {
    id: "palindrome-anagram-check",
    title: "Palindrome & Anagram Check",
    description: "Implement `isAnagram(s1, s2)` that returns `true` if `s1` and `s2` are valid anagrams (contain exact same characters with exact same frequencies ignoring case and non-alphanumeric characters).",
    difficulty: "Easy",
    category: "DSA",
    roles: ["frontend", "backend", "fullstack", "data-engineer", "data-analytics", "devops-architect"],
    starterCode: `function isAnagram(s1, s2) {
  // Write your code here
  
}`,
    testCases: [
      {
        input: "isAnagram('listen', 'silent')",
        expectedOutput: "true",
        description: "'listen' vs 'silent' -> true"
      },
      {
        input: "isAnagram('A decimal point', 'Im a dot in place')",
        expectedOutput: "true",
        description: "Complex sentence anagrams with spaces"
      },
      {
        input: "isAnagram('rat', 'car')",
        expectedOutput: "false",
        description: "'rat' vs 'car' -> false"
      }
    ],
    solution: `function isAnagram(s1, s2) {
  const clean = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const c1 = clean(s1);
  const c2 = clean(s2);
  if (c1.length !== c2.length) return false;
  const count = {};
  for (const char of c1) {
    count[char] = (count[char] || 0) + 1;
  }
  for (const char of c2) {
    if (!count[char]) return false;
    count[char]--;
  }
  return true;
}`,
    hints: [
      "Sanitize both strings by keeping only lowercase alphanumeric characters.",
      "Use a character frequency map to count occurrences."
    ],
    points: 2
  },
  {
    id: "capitalize-slugify",
    title: "Capitalize Title & Slugify",
    description: "Write a function `slugify(title)` that transforms a article title string into a web-friendly URL slug: lowercase, replace spaces & special characters with hyphens `-`, and strip duplicate leading/trailing hyphens.",
    difficulty: "Easy",
    category: "JAVASCRIPT",
    roles: ["frontend", "fullstack"],
    starterCode: `function slugify(title) {
  // Write your code here
  
}`,
    testCases: [
      {
        input: "slugify('Mastering React 19 & Next.js!')",
        expectedOutput: "\"mastering-react-19-next-js\"",
        description: "'Mastering React 19 & Next.js!' -> 'mastering-react-19-next-js'"
      },
      {
        input: "slugify('  Hello---World  ')",
        expectedOutput: "\"hello-world\"",
        description: "Clean up trailing spaces and multiple dashes"
      }
    ],
    solution: `function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}`,
    hints: [
      "Use `.toLowerCase()` and `.trim()`.",
      "Replace non-alphanumeric characters with `-` using regex `/[^a-z0-9]+/g`."
    ],
    points: 2
  },

  // ==========================================
  // MEDIUM (10 Questions - 3 pts each)
  // ==========================================
  {
    id: "debounce-function",
    title: "Debounce Function",
    description: "Implement a `debounce(fn, delay)` function. It delays invoking `fn` until after `delay` milliseconds have elapsed since the last time the debounced function was invoked. The debounced function must return a promise that resolves with the return value of `fn`.",
    difficulty: "Medium",
    category: "JAVASCRIPT",
    roles: ["frontend", "fullstack"],
    starterCode: `function debounce(fn, delay) {
  // Write your code here
  
}`,
    testCases: [
      {
        input: `async () => {
          let count = 0;
          const inc = debounce(val => { count += val; return count; }, 50);
          inc(1);
          inc(2);
          const p3 = inc(3);
          await new Promise(r => setTimeout(r, 80));
          const res = await p3;
          return { count, res };
        }()`,
        expectedOutput: "{\"count\":3,\"res\":3}",
        description: "Debounce consecutive calls to execute only final invocation"
      }
    ],
    solution: `function debounce(fn, delay) {
  let timer = null;
  let resolvers = [];

  return function (...args) {
    return new Promise((resolve) => {
      resolvers.push(resolve);
      if (timer) clearTimeout(timer);

      timer = setTimeout(() => {
        const result = fn.apply(this, args);
        resolvers.forEach(r => r(result));
        resolvers = [];
        timer = null;
      }, delay);
    });
  };
}`,
    hints: [
      "Keep track of active `timer` using `setTimeout` and `clearTimeout`.",
      "Store resolvers in an array to resolve all pending caller Promises when executed."
    ],
    points: 3
  },
  {
    id: "throttle-function",
    title: "Throttle Function",
    description: "Implement a `throttle(fn, interval)` function that ensures `fn` is called at most once per `interval` milliseconds. Subsequent calls during the wait window should be ignored or queued for the trailing edge.",
    difficulty: "Medium",
    category: "JAVASCRIPT",
    roles: ["frontend", "fullstack"],
    starterCode: `function throttle(fn, interval) {
  // Write your code here
  
}`,
    testCases: [
      {
        input: `(() => {
          let calls = 0;
          const throttled = throttle(() => calls++, 100);
          throttled();
          throttled();
          throttled();
          return calls;
        })()`,
        expectedOutput: "1",
        description: "Immediate first call, suppress rapid repeat calls"
      }
    ],
    solution: `function throttle(fn, interval) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= interval) {
      lastCall = now;
      return fn.apply(this, args);
    }
  };
}`,
    hints: [
      "Compare `Date.now()` with `lastCall` timestamp.",
      "Only execute `fn` if `now - lastCall >= interval`."
    ],
    points: 3
  },
  {
    id: "deep-clone-object",
    title: "Deep Clone Object",
    description: "Implement a function `deepClone(value)` that creates a deep copy of any nested JavaScript object/array structure. Handle primitive types, Arrays, Objects, Dates, and RegExp instances without using `structuredClone` or `JSON.parse`.",
    difficulty: "Medium",
    category: "JAVASCRIPT",
    roles: ["frontend", "backend", "fullstack"],
    starterCode: `function deepClone(value) {
  // Write your code here
  
}`,
    testCases: [
      {
        input: `(() => {
          const obj = { a: 1, b: { c: 2, d: [3, 4] }, date: new Date(1700000000000) };
          const clone = deepClone(obj);
          clone.b.c = 99;
          clone.b.d.push(5);
          return { originalC: obj.b.c, cloneC: clone.b.c, len: clone.b.d.length, isDate: clone.date instanceof Date };
        })()`,
        expectedOutput: "{\"originalC\":2,\"cloneC\":99,\"len\":3,\"isDate\":true}",
        description: "Deep copy nested objects, arrays, and Date objects without mutating original"
      }
    ],
    solution: `function deepClone(value) {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (value instanceof Date) {
    return new Date(value.getTime());
  }
  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags);
  }
  if (Array.isArray(value)) {
    return value.map(item => deepClone(item));
  }
  const clonedObj = {};
  for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      clonedObj[key] = deepClone(value[key]);
    }
  }
  return clonedObj;
}`,
    hints: [
      "Return primitives as-is.",
      "Check `value instanceof Date` and `value instanceof RegExp`.",
      "Recursively call `deepClone` for array items and object keys."
    ],
    points: 3
  },
  {
    id: "promise-all-polyfill",
    title: "Promise.all Polyfill",
    description: "Implement `promiseAll(promises)` which takes an array of Promises (or values) and returns a new Promise that resolves to an array of all resolved values, maintaining order. If any promise rejects, the returned Promise immediately rejects with that error.",
    difficulty: "Medium",
    category: "JAVASCRIPT",
    roles: ["frontend", "backend", "fullstack"],
    starterCode: `function promiseAll(promises) {
  // Write your code here
  
}`,
    testCases: [
      {
        input: `async () => {
          const p1 = Promise.resolve(10);
          const p2 = new Promise(r => setTimeout(() => r(20), 20));
          const p3 = 30;
          return await promiseAll([p1, p2, p3]);
        }()`,
        expectedOutput: "[10,20,30]",
        description: "Resolve mixed promises and values in exact array index order"
      },
      {
        input: `async () => {
          try {
            await promiseAll([Promise.resolve(1), Promise.reject('ERR'), Promise.resolve(3)]);
            return 'SUCCESS';
          } catch(e) {
            return 'REJECTED: ' + e;
          }
        }()`,
        expectedOutput: "\"REJECTED: ERR\"",
        description: "Immediate rejection if any promise fails"
      }
    ],
    solution: `function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('Argument must be an array'));
    }
    if (promises.length === 0) {
      return resolve([]);
    }

    const results = new Array(promises.length);
    let completedCount = 0;

    promises.forEach((item, index) => {
      Promise.resolve(item)
        .then(value => {
          results[index] = value;
          completedCount++;
          if (completedCount === promises.length) {
            resolve(results);
          }
        })
        .catch(err => {
          reject(err);
        });
    });
  });
}`,
    hints: [
      "Wrap each item in `Promise.resolve(item)` to support plain values.",
      "Track `completedCount` and populate `results[index]` to preserve exact order."
    ],
    points: 3
  },
  {
    id: "lru-cache-impl",
    title: "LRU Cache (Least Recently Used)",
    description: "Design a data structure for a Least Recently Used (LRU) Cache. Implement `LRUCache` class with `capacity`, `get(key)`, and `put(key, value)` methods in O(1) time complexity. When capacity is exceeded, invalidate the least recently accessed item before inserting.",
    difficulty: "Medium",
    category: "REDIS",
    roles: ["backend", "data-engineer", "fullstack", "devops-architect"],
    starterCode: `class LRUCache {
  constructor(capacity) {
    // Write your constructor here
  }

  get(key) {
    // Return value or -1 if not found
  }

  put(key, value) {
    // Put key-value, eviction if full
  }
}`,
    testCases: [
      {
        input: `(() => {
          const lru = new LRUCache(2);
          lru.put(1, 1);
          lru.put(2, 2);
          const g1 = lru.get(1); // returns 1, makes key 1 recently used
          lru.put(3, 3); // evicts key 2
          const g2 = lru.get(2); // returns -1 (evicted)
          const g3 = lru.get(3); // returns 3
          return [g1, g2, g3];
        })()`,
        expectedOutput: "[1,-1,3]",
        description: "LRU Eviction order verification: [1, -1, 3]"
      }
    ],
    solution: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return -1;
    const val = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }
}`,
    hints: [
      "JavaScript `Map` maintains key insertion order.",
      "On `get(key)` or update, delete and re-insert key to move it to the end (most recent).",
      "On `put(key)` when full, delete `map.keys().next().value` (first/oldest item)."
    ],
    points: 3
  },
  {
    id: "middleware-pipeline-processor",
    title: "Middleware Pipeline Processor",
    description: "Implement a `MiddlewareRunner` class inspired by Express/Koa middleware. It supports `.use(fn)` where `fn(ctx, next)` can execute async logic and invoke `await next()` to delegate to the next middleware in the pipeline.",
    difficulty: "Medium",
    category: "NODE",
    roles: ["backend", "fullstack", "devops-architect"],
    starterCode: `class MiddlewareRunner {
  constructor() {
    this.middlewares = [];
  }

  use(fn) {
    // Add middleware
  }

  async run(ctx) {
    // Execute middleware chain
  }
}`,
    testCases: [
      {
        input: `async () => {
          const app = new MiddlewareRunner();
          const log = [];
          app.use(async (ctx, next) => {
            log.push('m1 start');
            await next();
            log.push('m1 end');
          });
          app.use(async (ctx, next) => {
            log.push('m2 start: ' + ctx.user);
            await next();
          });
          await app.run({ user: 'Alice' });
          return log;
        }()`,
        expectedOutput: "[\"m1 start\",\"m2 start: Alice\",\"m1 end\"]",
        description: "Onion-model middleware execution order"
      }
    ],
    solution: `class MiddlewareRunner {
  constructor() {
    this.middlewares = [];
  }

  use(fn) {
    this.middlewares.push(fn);
    return this;
  }

  async run(ctx) {
    const dispatch = async (index) => {
      if (index >= this.middlewares.length) return;
      const middleware = this.middlewares[index];
      await middleware(ctx, () => dispatch(index + 1));
    };
    await dispatch(0);
    return ctx;
  }
}`,
    hints: [
      "Use recursive dispatch function `dispatch(index)`.",
      "Pass `() => dispatch(index + 1)` as the `next` function parameter."
    ],
    points: 3
  },
  {
    id: "curry-function",
    title: "Curry Function",
    description: "Implement a `curry(fn)` function that transforms a multi-argument function into a curried function. When invoked with fewer arguments than required by `fn.length`, it returns a new function expecting the remaining arguments.",
    difficulty: "Medium",
    category: "JAVASCRIPT",
    roles: ["frontend", "fullstack"],
    starterCode: `function curry(fn) {
  // Write your code here
  
}`,
    testCases: [
      {
        input: `(() => {
          const add = (a, b, c) => a + b + c;
          const curriedAdd = curry(add);
          return [
            curriedAdd(1)(2)(3),
            curriedAdd(1, 2)(3),
            curriedAdd(1)(2, 3)
          ];
        })()`,
        expectedOutput: "[6,6,6]",
        description: "Curried calls with varied argument groupings: [6, 6, 6]"
      }
    ],
    solution: `function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function (...nextArgs) {
      return curried.apply(this, args.concat(nextArgs));
    };
  };
}`,
    hints: [
      "Check if `args.length >= fn.length`.",
      "If true, execute `fn`. Otherwise, return a function that collects `nextArgs` and recurses."
    ],
    points: 3
  },
  {
    id: "sql-group-by-aggregate",
    title: "SQL GROUP BY & Aggregate Engine",
    description: "Write a function `groupByAggregate(rows, groupKey, aggField, aggFunc)` that simulates SQL `GROUP BY`. `aggFunc` can be `'SUM'`, `'AVG'`, `'COUNT'`, or `'MAX'`. Returns an array of objects `{ [groupKey]: val, [aggFunc.toLowerCase()]: result }`.",
    difficulty: "Medium",
    category: "MYSQL",
    roles: ["data-engineer", "data-analytics", "backend", "fullstack"],
    starterCode: `function groupByAggregate(rows, groupKey, aggField, aggFunc) {
  // Write your code here
  
}`,
    testCases: [
      {
        input: `groupByAggregate([
          { dept: 'Engineering', salary: 100 },
          { dept: 'Engineering', salary: 200 },
          { dept: 'Sales', salary: 150 }
        ], 'dept', 'salary', 'SUM')`,
        expectedOutput: "[{\"dept\":\"Engineering\",\"sum\":300},{\"dept\":\"Sales\",\"sum\":150}]",
        description: "Group by department with SUM of salaries"
      },
      {
        input: `groupByAggregate([
          { role: 'FE', score: 80 },
          { role: 'FE', score: 100 },
          { role: 'BE', score: 90 }
        ], 'role', 'score', 'AVG')`,
        expectedOutput: "[{\"role\":\"FE\",\"avg\":90},{\"role\":\"BE\",\"avg\":90}]",
        description: "Group by role with AVG score"
      }
    ],
    solution: `function groupByAggregate(rows, groupKey, aggField, aggFunc) {
  const groups = new Map();

  for (const row of rows) {
    const keyVal = row[groupKey];
    if (!groups.has(keyVal)) {
      groups.set(keyVal, []);
    }
    groups.get(keyVal).push(row[aggField]);
  }

  const funcName = aggFunc.toLowerCase();
  const results = [];

  for (const [keyVal, values] of groups.entries()) {
    let calcVal = 0;
    if (aggFunc === 'SUM') {
      calcVal = values.reduce((a, b) => a + b, 0);
    } else if (aggFunc === 'AVG') {
      calcVal = values.reduce((a, b) => a + b, 0) / values.length;
    } else if (aggFunc === 'COUNT') {
      calcVal = values.length;
    } else if (aggFunc === 'MAX') {
      calcVal = Math.max(...values);
    }

    results.push({
      [groupKey]: keyVal,
      [funcName]: calcVal
    });
  }

  return results;
}`,
    hints: [
      "Group rows by `groupKey` into a Map of arrays.",
      "Iterate over entries and compute aggregate according to `aggFunc`."
    ],
    points: 3
  },
  {
    id: "event-emitter-with-once",
    title: "Event Emitter with `once` and `off`",
    description: "Extend the event emitter pattern. Implement `AdvancedEventEmitter` with `on`, `once(eventName, listener)` (auto-unsubscribes after 1 trigger), and `off(eventName, listener)` (unsubscribes a specific listener).",
    difficulty: "Medium",
    category: "REACT",
    roles: ["frontend", "fullstack"],
    starterCode: `class AdvancedEventEmitter {
  constructor() {
    this.listeners = {};
  }

  on(eventName, listener) {
    // Subscribe
  }

  once(eventName, listener) {
    // Subscribe once
  }

  off(eventName, listener) {
    // Unsubscribe
  }

  emit(eventName, ...args) {
    // Emit
  }
}`,
    testCases: [
      {
        input: `(() => {
          const ee = new AdvancedEventEmitter();
          let count = 0;
          const fn = () => count++;
          ee.once('click', fn);
          ee.emit('click');
          ee.emit('click');
          return count;
        })()`,
        expectedOutput: "1",
        description: "`once` fires listener only on first emit"
      },
      {
        input: `(() => {
          const ee = new AdvancedEventEmitter();
          let count = 0;
          const fn = val => count += val;
          ee.on('add', fn);
          ee.emit('add', 5);
          ee.off('add', fn);
          ee.emit('add', 10);
          return count;
        })()`,
        expectedOutput: "5",
        description: "`off` removes listener successfully"
      }
    ],
    solution: `class AdvancedEventEmitter {
  constructor() {
    this.listeners = {};
  }

  on(eventName, listener) {
    if (!this.listeners[eventName]) this.listeners[eventName] = [];
    this.listeners[eventName].push(listener);
  }

  once(eventName, listener) {
    const wrapper = (...args) => {
      this.off(eventName, wrapper);
      listener(...args);
    };
    wrapper.original = listener;
    this.on(eventName, wrapper);
  }

  off(eventName, listener) {
    if (!this.listeners[eventName]) return;
    this.listeners[eventName] = this.listeners[eventName].filter(
      l => l !== listener && l.original !== listener
    );
  }

  emit(eventName, ...args) {
    if (!this.listeners[eventName]) return;
    const copy = [...this.listeners[eventName]];
    for (const listener of copy) {
      listener(...args);
    }
  }
}`,
    hints: [
      "For `once`, wrap `listener` in a function that unsubscribes itself via `off` before calling `listener`.",
      "Store a reference `wrapper.original = listener` so `off` can identify wrapped once-listeners."
    ],
    points: 3
  },
  {
    id: "memoize-with-ttl",
    title: "Memoize with Expiration (TTL)",
    description: "Implement `memoizeWithTTL(fn, ttlMs)` that caches function call results based on arguments. Cached results remain valid for `ttlMs` milliseconds. After `ttlMs`, a new call re-executes `fn` and updates the cache.",
    difficulty: "Medium",
    category: "REDIS",
    roles: ["backend", "fullstack", "devops-architect"],
    starterCode: `function memoizeWithTTL(fn, ttlMs) {
  // Write your code here
  
}`,
    testCases: [
      {
        input: `async () => {
          let calls = 0;
          const memoized = memoizeWithTTL(x => { calls++; return x * 2; }, 50);
          const r1 = memoized(5);
          const r2 = memoized(5);
          await new Promise(r => setTimeout(r, 60));
          const r3 = memoized(5);
          return { r1, r2, r3, calls };
        }()`,
        expectedOutput: "{\"r1\":10,\"r2\":10,\"r3\":10,\"calls\":2}",
        description: "Uses cached result before TTL expires, re-evaluates after TTL"
      }
    ],
    solution: `function memoizeWithTTL(fn, ttlMs) {
  const cache = new Map();

  return function (...args) {
    const key = JSON.stringify(args);
    const now = Date.now();

    if (cache.has(key)) {
      const { value, expiry } = cache.get(key);
      if (now < expiry) {
        return value;
      }
    }

    const value = fn.apply(this, args);
    cache.set(key, { value, expiry: now + ttlMs });
    return value;
  };
}`,
    hints: [
      "Use `JSON.stringify(args)` as cache key.",
      "Store `{ value, expiry: Date.now() + ttlMs }` in a Map."
    ],
    points: 3
  },

  // ==========================================
  // HARD (10 Questions - 4 pts each)
  // ==========================================
  {
    id: "promise-from-scratch",
    title: "Promise from Scratch (A+ Spec)",
    description: "Implement a lightweight `MyPromise` class supporting states `'pending'`, `'fulfilled'`, `'rejected'`, chaining via `.then(onFulfilled, onRejected)`, and `.catch(onRejected)`. Asynchronous callback execution should handle resolution of returned promises.",
    difficulty: "Hard",
    category: "JAVASCRIPT",
    roles: ["frontend", "backend", "fullstack"],
    starterCode: `class MyPromise {
  constructor(executor) {
    // Write constructor
  }

  then(onFulfilled, onRejected) {
    // Implement chaining
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }
}`,
    testCases: [
      {
        input: `async () => {
          return new Promise(resolve => {
            new MyPromise((res, rej) => {
              setTimeout(() => res(42), 20);
            })
            .then(val => val * 2)
            .then(val => resolve(val));
          });
        }()`,
        expectedOutput: "84",
        description: "Async resolution with chaining: 42 * 2 = 84"
      },
      {
        input: `async () => {
          return new Promise(resolve => {
            new MyPromise((res, rej) => {
              rej('FAIL');
            })
            .catch(err => resolve('CAUGHT: ' + err));
          });
        }()`,
        expectedOutput: "\"CAUGHT: FAIL\"",
        description: "Rejection handling via .catch()"
      }
    ],
    solution: `class MyPromise {
  constructor(executor) {
    this.state = 'pending';
    this.value = undefined;
    this.handlers = [];

    const resolve = (result) => {
      if (this.state !== 'pending') return;
      if (result && typeof result.then === 'function') {
        return result.then(resolve, reject);
      }
      this.state = 'fulfilled';
      this.value = result;
      this.executeHandlers();
    };

    const reject = (reason) => {
      if (this.state !== 'pending') return;
      this.state = 'rejected';
      this.value = reason;
      this.executeHandlers();
    };

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  executeHandlers() {
    if (this.state === 'pending') return;
    queueMicrotask(() => {
      this.handlers.forEach(h => {
        if (this.state === 'fulfilled') {
          if (typeof h.onFulfilled === 'function') {
            try {
              const res = h.onFulfilled(this.value);
              h.resolve(res);
            } catch (err) {
              h.reject(err);
            }
          } else {
            h.resolve(this.value);
          }
        } else if (this.state === 'rejected') {
          if (typeof h.onRejected === 'function') {
            try {
              const res = h.onRejected(this.value);
              h.resolve(res);
            } catch (err) {
              h.reject(err);
            }
          } else {
            h.reject(this.value);
          }
        }
      });
      this.handlers = [];
    });
  }

  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      this.handlers.push({ onFulfilled, onRejected, resolve, reject });
      this.executeHandlers();
    });
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }
}`,
    hints: [
      "Maintain state `'pending'`, `'fulfilled'`, `'rejected'`.",
      "Store pending handlers in an array and execute using `queueMicrotask` on resolution."
    ],
    points: 4
  },
  {
    id: "virtual-dom-diff",
    title: "Virtual DOM Diff Algorithm",
    description: "Implement `diff(oldTree, newTree)` that compares two Virtual DOM node objects `{ type, props, children }` and returns an array of patch operations (`'CREATE'`, `'REMOVE'`, `'REPLACE'`, `'UPDATE_PROPS'`).",
    difficulty: "Hard",
    category: "REACT",
    roles: ["frontend", "fullstack"],
    starterCode: `function diff(oldTree, newTree) {
  // Write your code here
  
}`,
    testCases: [
      {
        input: `diff(
          { type: 'div', props: { id: 'a' }, children: ['hello'] },
          { type: 'div', props: { id: 'b' }, children: ['hello'] }
        )`,
        expectedOutput: "[{\"type\":\"UPDATE_PROPS\",\"props\":{\"id\":\"b\"}}]",
        description: "Diff updated props: id changed from 'a' to 'b'"
      },
      {
        input: `diff(
          { type: 'div', props: {}, children: [] },
          { type: 'span', props: {}, children: [] }
        )`,
        expectedOutput: "[{\"type\":\"REPLACE\",\"node\":{\"type\":\"span\",\"props\":{},\"children\":[]}}]",
        description: "Replace node when node type changes from 'div' to 'span'"
      }
    ],
    solution: `function diff(oldTree, newTree) {
  const patches = [];
  if (!oldTree && newTree) {
    return [{ type: 'CREATE', node: newTree }];
  }
  if (oldTree && !newTree) {
    return [{ type: 'REMOVE' }];
  }
  if (typeof oldTree !== typeof newTree || oldTree.type !== newTree.type) {
    return [{ type: 'REPLACE', node: newTree }];
  }
  if (typeof oldTree === 'string' || typeof oldTree === 'number') {
    if (oldTree !== newTree) {
      return [{ type: 'REPLACE', node: newTree }];
    }
    return [];
  }

  // Compare props
  const propDiff = {};
  let hasPropChanges = false;
  for (const k in newTree.props) {
    if (oldTree.props[k] !== newTree.props[k]) {
      propDiff[k] = newTree.props[k];
      hasPropChanges = true;
    }
  }
  if (hasPropChanges) {
    patches.push({ type: 'UPDATE_PROPS', props: propDiff });
  }
  return patches;
}`,
    hints: [
      "Compare `oldTree` and `newTree` types.",
      "If node types differ, emit a `'REPLACE'` patch.",
      "If props differ, emit an `'UPDATE_PROPS'` patch object."
    ],
    points: 4
  },
  {
    id: "mini-react-usestate",
    title: "Mini React useState & useEffect",
    description: "Build a tiny React-like state manager function `createMiniReact()`. It returns `{ useState(initialValue), useEffect(callback, deps), render(Component) }` supporting functional component state persistence across re-renders.",
    difficulty: "Hard",
    category: "REACT",
    roles: ["frontend", "fullstack"],
    starterCode: `function createMiniReact() {
  // Write your mini React implementation
  
}`,
    testCases: [
      {
        input: `(() => {
          const React = createMiniReact();
          let renderLogs = [];

          function Counter() {
            const [count, setCount] = React.useState(0);
            renderLogs.push(count);
            return { count, increment: () => setCount(count + 1) };
          }

          const comp1 = React.render(Counter);
          comp1.increment();
          const comp2 = React.render(Counter);
          return renderLogs;
        })()`,
        expectedOutput: "[0,1]",
        description: "State persistence across mini React re-renders: [0, 1]"
      }
    ],
    solution: `function createMiniReact() {
  let states = [];
  let stateIdx = 0;

  function useState(initialValue) {
    const currentIndex = stateIdx;
    if (states[currentIndex] === undefined) {
      states[currentIndex] = initialValue;
    }
    const setState = (newValue) => {
      states[currentIndex] = newValue;
    };
    const stateVal = states[currentIndex];
    stateIdx++;
    return [stateVal, setState];
  }

  function render(Component) {
    stateIdx = 0; // reset index before render
    return Component();
  }

  return { useState, render };
}`,
    hints: [
      "Maintain a `states` array and a pointer `stateIdx`.",
      "Reset `stateIdx = 0` prior to calling `Component()` during `render()`."
    ],
    points: 4
  },
  {
    id: "async-task-queue-concurrency",
    title: "Async Task Queue with Concurrency Limit",
    description: "Implement a `TaskQueue(concurrency)` class. Tasks are asynchronous functions returning Promises. `.push(taskFn)` queues tasks and executes them up to `concurrency` in parallel. Returns a Promise resolving when the task finishes.",
    difficulty: "Hard",
    category: "NODE",
    roles: ["backend", "fullstack", "devops-architect"],
    starterCode: `class TaskQueue {
  constructor(concurrency) {
    // Write constructor
  }

  push(taskFn) {
    // Queue and execute with limit
  }
}`,
    testCases: [
      {
        input: `async () => {
          const queue = new TaskQueue(2);
          let running = 0;
          let maxRunning = 0;

          const makeTask = (delay, val) => () => new Promise(res => {
            running++;
            maxRunning = Math.max(maxRunning, running);
            setTimeout(() => {
              running--;
              res(val);
            }, delay);
          });

          const p1 = queue.push(makeTask(40, 'A'));
          const p2 = queue.push(makeTask(40, 'B'));
          const p3 = queue.push(makeTask(40, 'C'));

          const results = await Promise.all([p1, p2, p3]);
          return { results, maxRunning };
        }()`,
        expectedOutput: "{\"results\":[\"A\",\"B\",\"C\"],\"maxRunning\":2}",
        description: "Executes 3 tasks concurrently limited to max 2 at a time"
      }
    ],
    solution: `class TaskQueue {
  constructor(concurrency) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  push(taskFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ taskFn, resolve, reject });
      this.next();
    });
  }

  next() {
    while (this.running < this.concurrency && this.queue.length > 0) {
      const { taskFn, resolve, reject } = this.queue.shift();
      this.running++;
      Promise.resolve()
        .then(() => taskFn())
        .then(res => resolve(res))
        .catch(err => reject(err))
        .finally(() => {
          this.running--;
          this.next();
        });
    }
  }
}`,
    hints: [
      "Maintain `running` count and a pending `queue` array.",
      "In `next()`, while `running < concurrency`, shift item from `queue` and execute, decrementing `running` in `.finally()`."
    ],
    points: 4
  },
  {
    id: "rate-limiter-token-bucket",
    title: "Rate Limiter (Token Bucket)",
    description: "Implement a `TokenBucket(capacity, refillRatePerSec)` rate limiter class. `tryConsume(tokens)` consumes tokens if available and returns `true`, or returns `false` if insufficient tokens exist. Tokens dynamically refill based on elapsed time.",
    difficulty: "Hard",
    category: "SYSTEM DESIGN",
    roles: ["backend", "devops-architect", "fullstack"],
    starterCode: `class TokenBucket {
  constructor(capacity, refillRatePerSec) {
    // Write constructor
  }

  tryConsume(tokens = 1) {
    // Try to consume tokens
  }
}`,
    testCases: [
      {
        input: `async () => {
          const bucket = new TokenBucket(3, 10); // cap 3, 10 tokens/sec
          const c1 = bucket.tryConsume(2); // true (1 left)
          const c2 = bucket.tryConsume(2); // false (only 1 left)
          await new Promise(r => setTimeout(r, 150)); // refills ~1.5 tokens -> total ~2.5
          const c3 = bucket.tryConsume(2); // true
          return [c1, c2, c3];
        }()`,
        expectedOutput: "[true,false,true]",
        description: "Token bucket consumption and dynamic time refill check: [true, false, true]"
      }
    ],
    solution: `class TokenBucket {
  constructor(capacity, refillRatePerSec) {
    this.capacity = capacity;
    this.refillRatePerSec = refillRatePerSec;
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  refill() {
    const now = Date.now();
    const elapsedSec = (now - this.lastRefill) / 1000;
    const addedTokens = elapsedSec * this.refillRatePerSec;
    this.tokens = Math.min(this.capacity, this.tokens + addedTokens);
    this.lastRefill = now;
  }

  tryConsume(tokens = 1) {
    this.refill();
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }
}`,
    hints: [
      "Calculate elapsed time since `lastRefill`.",
      "`tokens = Math.min(capacity, tokens + elapsedSec * refillRatePerSec)` before trying to consume."
    ],
    points: 4
  },
  {
    id: "circuit-breaker-pattern",
    title: "Circuit Breaker Pattern",
    description: "Implement a `CircuitBreaker(fn, failureThreshold, resetTimeoutMs)` microservice state machine with states `'CLOSED'`, `'OPEN'`, and `'HALF_OPEN'`. Trips to `'OPEN'` after consecutive failures, auto-recovers to `'HALF_OPEN'` after `resetTimeoutMs`.",
    difficulty: "Hard",
    category: "SYSTEM DESIGN",
    roles: ["backend", "devops-architect", "fullstack"],
    starterCode: `class CircuitBreaker {
  constructor(fn, failureThreshold = 2, resetTimeoutMs = 100) {
    // Write constructor
  }

  async execute(...args) {
    // Execute function with state checks
  }
}`,
    testCases: [
      {
        input: `async () => {
          let fail = true;
          const unstableFn = async () => { if (fail) throw new Error('ERR'); return 'OK'; };
          const cb = new CircuitBreaker(unstableFn, 2, 50);

          try { await cb.execute(); } catch(e) {}
          try { await cb.execute(); } catch(e) {}
          
          // Circuit should now be OPEN
          let openErr = false;
          try { await cb.execute(); } catch(e) { openErr = e.message.includes('OPEN'); }

          await new Promise(r => setTimeout(r, 60)); // reset timeout passes -> HALF_OPEN
          fail = false;
          const recovered = await cb.execute(); // succeeds -> returns to CLOSED

          return { openErr, recovered };
        }()`,
        expectedOutput: "{\"openErr\":true,\"recovered\":\"OK\"}",
        description: "Trips to OPEN on failures, resets after timeout and recovers"
      }
    ],
    solution: `class CircuitBreaker {
  constructor(fn, failureThreshold = 2, resetTimeoutMs = 100) {
    this.fn = fn;
    this.failureThreshold = failureThreshold;
    this.resetTimeoutMs = resetTimeoutMs;
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.nextAttempt = Date.now();
  }

  async execute(...args) {
    if (this.state === 'OPEN') {
      if (Date.now() > this.nextAttempt) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit Breaker is OPEN');
      }
    }

    try {
      const result = await this.fn(...args);
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeoutMs;
    }
  }
}`,
    hints: [
      "If state is `'OPEN'`, check if `Date.now() > nextAttempt` to transition to `'HALF_OPEN'`.",
      "If call succeeds in `'HALF_OPEN'`, reset `failureCount = 0` and state to `'CLOSED'`."
    ],
    points: 4
  },
  {
    id: "consistent-hashing-ring",
    title: "Consistent Hashing Ring",
    description: "Implement a `ConsistentHashRing(virtualNodes = 3)` class for distributed cache routing. Supports `addNode(nodeId)`, `removeNode(nodeId)`, and `getNode(key)` to map cache keys to the closest node on a ring.",
    difficulty: "Hard",
    category: "SYSTEM DESIGN",
    roles: ["backend", "devops-architect", "fullstack"],
    starterCode: `class ConsistentHashRing {
  constructor(virtualNodes = 3) {
    // Write constructor
  }

  addNode(nodeId) {
    // Add virtual nodes
  }

  removeNode(nodeId) {
    // Remove virtual nodes
  }

  getNode(key) {
    // Get assigned node
  }
}`,
    testCases: [
      {
        input: `(() => {
          const ring = new ConsistentHashRing(3);
          ring.addNode('nodeA');
          ring.addNode('nodeB');
          const n1 = ring.getNode('user_101');
          const n2 = ring.getNode('user_102');
          return typeof n1 === 'string' && typeof n2 === 'string';
        })()`,
        expectedOutput: "true",
        description: "Maps keys deterministically to available nodes"
      }
    ],
    solution: `class ConsistentHashRing {
  constructor(virtualNodes = 3) {
    this.virtualNodes = virtualNodes;
    this.ring = new Map();
    this.sortedKeys = [];
  }

  hash(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return hash >>> 0;
  }

  addNode(nodeId) {
    for (let i = 0; i < this.virtualNodes; i++) {
      const vNodeKey = \`\${nodeId}-vnode-\${i}\`;
      const hashVal = this.hash(vNodeKey);
      this.ring.set(hashVal, nodeId);
    }
    this.updateSortedKeys();
  }

  removeNode(nodeId) {
    for (let i = 0; i < this.virtualNodes; i++) {
      const vNodeKey = \`\${nodeId}-vnode-\${i}\`;
      const hashVal = this.hash(vNodeKey);
      this.ring.delete(hashVal);
    }
    this.updateSortedKeys();
  }

  updateSortedKeys() {
    this.sortedKeys = Array.from(this.ring.keys()).sort((a, b) => a - b);
  }

  getNode(key) {
    if (this.sortedKeys.length === 0) return null;
    const hashVal = this.hash(key);
    for (const nodeHash of this.sortedKeys) {
      if (hashVal <= nodeHash) {
        return this.ring.get(nodeHash);
      }
    }
    return this.ring.get(this.sortedKeys[0]); // Wrap around
  }
}`,
    hints: [
      "Use a simple hash function (like djb2) to get numeric hashes.",
      "Sort hash keys of virtual nodes and find the first hash `>= keyHash`."
    ],
    points: 4
  },
  {
    id: "sql-inner-left-join",
    title: "SQL Inner & Left JOIN Engine",
    description: "Write `joinTables(tableA, tableB, keyA, keyB, type = 'INNER')` that performs in-memory SQL JOINs. Supports `type = 'INNER'` or `type = 'LEFT'`. Combines matching records into a single merged object.",
    difficulty: "Hard",
    category: "MYSQL",
    roles: ["data-engineer", "data-analytics", "backend", "fullstack"],
    starterCode: `function joinTables(tableA, tableB, keyA, keyB, type = 'INNER') {
  // Write your code here
  
}`,
    testCases: [
      {
        input: `joinTables(
          [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }],
          [{ userId: 1, score: 95 }],
          'id', 'userId', 'INNER'
        )`,
        expectedOutput: "[{\"id\":1,\"name\":\"Alice\",\"userId\":1,\"score\":95}]",
        description: "INNER JOIN matching records on foreign key"
      },
      {
        input: `joinTables(
          [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }],
          [{ userId: 1, score: 95 }],
          'id', 'userId', 'LEFT'
        )`,
        expectedOutput: "[{\"id\":1,\"name\":\"Alice\",\"userId\":1,\"score\":95},{\"id\":2,\"name\":\"Bob\",\"userId\":null,\"score\":null}]",
        description: "LEFT JOIN keeping unmatched row with null attributes"
      }
    ],
    solution: `function joinTables(tableA, tableB, keyA, keyB, type = 'INNER') {
  const mapB = new Map();
  for (const rowB of tableB) {
    const val = rowB[keyB];
    if (!mapB.has(val)) mapB.set(val, []);
    mapB.get(val).push(rowB);
  }

  const results = [];
  const keysB = tableB.length > 0 ? Object.keys(tableB[0]) : [];

  for (const rowA of tableA) {
    const valA = rowA[keyA];
    const matchesB = mapB.get(valA);

    if (matchesB && matchesB.length > 0) {
      for (const rowB of matchesB) {
        results.push({ ...rowA, ...rowB });
      }
    } else if (type === 'LEFT') {
      const nullB = {};
      for (const k of keysB) nullB[k] = null;
      results.push({ ...rowA, ...nullB });
    }
  }

  return results;
}`,
    hints: [
      "Index `tableB` into a Map by `keyB` for fast lookup.",
      "Iterate over `tableA` and merge objects. If `type === 'LEFT'` and no match, set `tableB` keys to `null`."
    ],
    points: 4
  },
  {
    id: "json-stringify-deep-equal",
    title: "JSON.stringify & Deep Equal",
    description: "Write `deepEqual(a, b)` that performs a strict recursive deep equality check across objects, arrays, primitives, Dates, and RegExps.",
    difficulty: "Hard",
    category: "JAVASCRIPT",
    roles: ["frontend", "backend", "fullstack"],
    starterCode: `function deepEqual(a, b) {
  // Write your code here
  
}`,
    testCases: [
      {
        input: "deepEqual({ a: [1, 2], b: { c: true } }, { a: [1, 2], b: { c: true } })",
        expectedOutput: "true",
        description: "Deep equal on identical nested structure"
      },
      {
        input: "deepEqual({ a: [1, 2] }, { a: [1, 3] })",
        expectedOutput: "false",
        description: "Returns false when array values differ"
      }
    ],
    solution: `function deepEqual(a, b) {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    return false;
  }
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }
  if (a instanceof RegExp && b instanceof RegExp) {
    return a.toString() === b.toString();
  }
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key) || !deepEqual(a[key], b[key])) {
      return false;
    }
  }
  return true;
}`,
    hints: [
      "Check strict equality `a === b` first.",
      "Ensure key counts match `Object.keys(a).length === Object.keys(b).length` and recurse."
    ],
    points: 4
  },
  {
    id: "trie-prefix-tree",
    title: "Trie Prefix Tree & Autocomplete",
    description: "Implement a `Trie` class with `insert(word)`, `search(word)`, and `startsWith(prefix)` methods for efficient string prefix search and search engines.",
    difficulty: "Hard",
    category: "DSA",
    roles: ["frontend", "backend", "fullstack", "data-engineer", "data-analytics", "devops-architect"],
    starterCode: `class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    // Insert word
  }

  search(word) {
    // Search exact word
  }

  startsWith(prefix) {
    // Search prefix
  }
}`,
    testCases: [
      {
        input: `(() => {
          const trie = new Trie();
          trie.insert('apple');
          const s1 = trie.search('apple'); // true
          const s2 = trie.search('app'); // false
          const p1 = trie.startsWith('app'); // true
          trie.insert('app');
          const s3 = trie.search('app'); // true
          return [s1, s2, p1, s3];
        })()`,
        expectedOutput: "[true,false,true,true]",
        description: "Trie search and prefix lookup: [true, false, true, true]"
      }
    ],
    solution: `class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let node = this.root;
    for (const char of word) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.isEnd = true;
  }

  search(word) {
    let node = this.root;
    for (const char of word) {
      if (!node.children[char]) return false;
      node = node.children[char];
    }
    return node.isEnd;
  }

  startsWith(prefix) {
    let node = this.root;
    for (const char of prefix) {
      if (!node.children[char]) return false;
      node = node.children[char];
    }
    return true;
  }
}`,
    hints: [
      "Store children as an object mapping char -> TrieNode.",
      "Set `node.isEnd = true` on the final character node."
    ],
    points: 4
  }
];
