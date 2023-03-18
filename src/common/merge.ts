const plainObjectString = Object.toString()

function isObject(value: any): value is object {
  return value !== null && typeof value === 'object'
}

function isPlainObject(value: object): value is object {
  if (!isObject(value)) return false
  const proto = Object.getPrototypeOf(value)
  if (proto == null) return true
  return proto.constructor?.toString() === plainObjectString
}

function concat<T>(a: Iterable<T>, b: Iterable<T>): Iterable<T>
function concat<A, B>(a: Iterable<A>, b: Iterable<B>): Iterable<A | B>
function* concat<A, B>(a: Iterable<A>, b: Iterable<B>): Iterable<A | B> {
  yield* a
  yield* b
}

function doMergeReplace<T extends object>(target: T, obj: Partial<T>): T {
  for (const k of new Set(concat(Reflect.ownKeys(target), Reflect.ownKeys(obj)))) {
    if (k in obj) (target as any)[k] = (obj as any)[k]
    else delete (target as any)[k]
  }
  return target
}

function doMergeDeep<T extends object>(target: T, obj: Partial<T>): T {
  obj = Object.assign({}, obj)
  for (const k of Reflect.ownKeys(obj)) {
    const v = (obj as any)[k]
    if (isPlainObject(v)) {
      const t = (target as any)[k]
      if (isPlainObject(t)) {
        if (t !== v) {
          doMergeDeep(t, v)
        } else {
          ;(target as any)[k] = doMergeDeep({}, v)
        }
      } else {
        ;(target as any)[k] = doMergeDeep({}, v)
      }
    } else {
      ;(target as any)[k] = v
    }
  }
  return target
}

/** Merge object content to target */
export function merge<T extends object>(target: T, obj: Partial<T>, mode?: boolean | 'replace' | 'shallow' | 'deep') {
  if (obj === target) return target
  if (mode === true || mode === 'replace') {
    doMergeReplace(target, obj)
  } else if (mode === 'shallow') {
    Object.assign(target, obj)
  } else if (mode == null || mode === false || mode === 'deep') {
    doMergeDeep(target, obj)
  } else {
    throw new TypeError(`Unknow merge mode ${JSON.stringify(mode)}`)
  }
  return target
}
