export default class ArrayMap<Key extends string | number, Value> extends Map<Key, Value[]> {
  append(key: Key, value: Value): void {
    const existing = this.get(key);
    if (existing) {
      existing.push(value);
    } else {
      this.set(key, [value]);
    }
  }
}
