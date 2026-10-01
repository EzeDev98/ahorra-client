// Stand-in for the missing obligations endpoints. Same function signatures as the real ones; data stays on this device.
const KEY = 'ahorra.standin.obligations';

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Storage unavailable: changes last until the page closes only.
  }
  return list;
}

let memory = null;
const load = () => (memory ??= read());
const save = (list) => {
  memory = write(list);
};

// Ids must stay unique even when several are created in the same millisecond.
let lastId = 0;
const nextId = () => (lastId = Math.max(Date.now(), lastId + 1));

export const obligationsStandIn = {
  list: async () => load().map((item) => ({ ...item })),

  create: async ({ name, amount, cadence }) => {
    const item = { id: nextId(), name, amount, cadence, active: true };
    save([...load(), item]);
    return { ...item };
  },

  update: async (id, { name, amount, cadence, active }) => {
    const list = load();
    const index = list.findIndex((item) => String(item.id) === String(id));
    if (index === -1) throw Object.assign(new Error('Obligation not found'), { status: 404, isNotFound: true });
    const item = { ...list[index], name, amount, cadence, active };
    save(list.map((entry, i) => (i === index ? item : entry)));
    return { ...item };
  },

  remove: async (id) => {
    save(load().filter((item) => String(item.id) !== String(id)));
  },
};
