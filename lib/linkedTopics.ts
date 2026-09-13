/**
 * LINKED_TOPICS_MAP
 * Maps related topic IDs across domains (e.g., JavaScript Arrays <-> DSA Arrays).
 * When a topic in a linked group is marked as completed or uncompleted,
 * all counterpart topics in that group automatically reflect the same completion state.
 */
export const LINKED_TOPICS_MAP: Record<string, string[]> = {
  // Arrays
  "js-arrays": ["dsa-arrays", "datastructures-and-algorithms-lxy3erxj-d3zksaxibupv"],
  "dsa-arrays": ["js-arrays", "datastructures-and-algorithms-lxy3erxj-d3zksaxibupv"],
  "datastructures-and-algorithms-lxy3erxj-d3zksaxibupv": ["js-arrays", "dsa-arrays"],

  // Strings
  "js-strings": ["dsa-strings"],
  "dsa-strings": ["js-strings"],

  // Hash Maps & Sets
  "js-sets-maps": [
    "dsa-hash-maps",
    "dsa-sets",
    "datastructures-and-algorithms-ksy-8ubesdmix4fyl8tsu"
  ],
  "dsa-hash-maps": [
    "js-sets-maps",
    "dsa-sets",
    "datastructures-and-algorithms-ksy-8ubesdmix4fyl8tsu"
  ],
  "dsa-sets": [
    "js-sets-maps",
    "dsa-hash-maps",
    "datastructures-and-algorithms-ksy-8ubesdmix4fyl8tsu"
  ],
  "datastructures-and-algorithms-ksy-8ubesdmix4fyl8tsu": [
    "js-sets-maps",
    "dsa-hash-maps",
    "dsa-sets"
  ],

  // Linked Lists
  "dsa-linked-list": ["datastructures-and-algorithms-bru9u8peaq1tmkygjijyi"],
  "datastructures-and-algorithms-bru9u8peaq1tmkygjijyi": ["dsa-linked-list"],

  // Stacks
  "dsa-stack": ["datastructures-and-algorithms-jvkrykgny140flquf2fck"],
  "datastructures-and-algorithms-jvkrykgny140flquf2fck": ["dsa-stack"],

  // Queues
  "sys-queue": ["datastructures-and-algorithms-v0phjc75jhme1z-f9zmck"],
  "datastructures-and-algorithms-v0phjc75jhme1z-f9zmck": ["sys-queue"],

  // Two Pointers
  "dsa-two-pointers": ["datastructures-and-algorithms-itvhuxbe9dr9jn5ga2jyy"],
  "datastructures-and-algorithms-itvhuxbe9dr9jn5ga2jyy": ["dsa-two-pointers"],

  // Sliding Window
  "dsa-sliding-window": ["datastructures-and-algorithms-gbhvr-ojrxv9i0e5eslwy"],
  "datastructures-and-algorithms-gbhvr-ojrxv9i0e5eslwy": ["dsa-sliding-window"],

  // Sorting
  "dsa-sorting": ["datastructures-and-algorithms-wzfkdkcbl8ea9dbkjfswa"],
  "datastructures-and-algorithms-wzfkdkcbl8ea9dbkjfswa": ["dsa-sorting"],

  // Trees & BFS / DFS
  "dsa-trees": ["datastructures-and-algorithms-r2jagzbx0qog-vtxby-mz"],
  "datastructures-and-algorithms-r2jagzbx0qog-vtxby-mz": ["dsa-trees"],
  "dsa-bfs": ["datastructures-and-algorithms-c7ldxjpv-5m-npkscxyub"],
  "datastructures-and-algorithms-c7ldxjpv-5m-npkscxyub": ["dsa-bfs"],
  "dsa-dfs": ["datastructures-and-algorithms-gr8kcoiaduxs8hdieagzy"],
  "datastructures-and-algorithms-gr8kcoiaduxs8hdieagzy": ["dsa-dfs"],

  // Rate Limiting
  "sec-rate-limiting": ["sys-rate-limiter"],
  "sys-rate-limiter": ["sec-rate-limiting"],

  // Caching
  "sys-caching": ["devops-r4xsy4tsju1m7cw66zuqj", "backend-kwtbevx-wxs8jmsaax3fe"],
  "devops-r4xsy4tsju1m7cw66zuqj": ["sys-caching", "backend-kwtbevx-wxs8jmsaax3fe"],
  "backend-kwtbevx-wxs8jmsaax3fe": ["sys-caching", "devops-r4xsy4tsju1m7cw66zuqj"],

  // Database Indexes
  "mysql-indexes": ["backend-y-xkhfe9yzhnix3eiwspl"],
  "backend-y-xkhfe9yzhnix3eiwspl": ["mysql-indexes"],

  // Database Scaling & Horizontal Scaling
  "sys-database-scaling": [
    "backend-95d9itpuz4s9rozn8kg9x",
    "sys-horizontal-scaling",
    "data-engineer-k-xsllwb0jk0dd1sw-mpr"
  ],
  "backend-95d9itpuz4s9rozn8kg9x": [
    "sys-database-scaling",
    "sys-horizontal-scaling",
    "data-engineer-k-xsllwb0jk0dd1sw-mpr"
  ],
  "sys-horizontal-scaling": [
    "sys-database-scaling",
    "backend-95d9itpuz4s9rozn8kg9x",
    "data-engineer-k-xsllwb0jk0dd1sw-mpr"
  ],
  "data-engineer-k-xsllwb0jk0dd1sw-mpr": [
    "sys-database-scaling",
    "backend-95d9itpuz4s9rozn8kg9x",
    "sys-horizontal-scaling"
  ],

  // Load Balancing
  "sys-load-balancing": ["devops-i8sd9mab-befurulrhxnq"],
  "devops-i8sd9mab-befurulrhxnq": ["sys-load-balancing"],

  // Web Security & XSS
  "sec-xss": ["rf-rdwbg3iui6ipgp0shvxtg"],
  "rf-rdwbg3iui6ipgp0shvxtg": ["sec-xss"],

  // JWT & Authentication
  "http-jwt": ["sec-jwt-security", "backend-0rgj7fthljzousquhnqgw"],
  "sec-jwt-security": ["http-jwt", "backend-0rgj7fthljzousquhnqgw"],
  "backend-0rgj7fthljzousquhnqgw": ["http-jwt", "sec-jwt-security"],

  // Docker & Containers
  "devops-p0acfnz413mskelhqcxr3": ["devops-cqhuflacv1lhbnmdy0gaz"],
  "devops-cqhuflacv1lhbnmdy0gaz": ["devops-p0acfnz413mskelhqcxr3"],
};

export function getLinkedTopicIds(topicId: string): string[] {
  return LINKED_TOPICS_MAP[topicId] || [];
}
